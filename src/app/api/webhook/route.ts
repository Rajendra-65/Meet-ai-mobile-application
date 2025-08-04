import { and, eq, not } from "drizzle-orm";

import {
    CallEndedEvent,
    CallTranscriptionReadyEvent,
    CallRecordingReadyEvent,
    CallSessionParticipantLeftEvent,
    CallSessionStartedEvent,
} from "@stream-io/node-sdk";

import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { streamVideo } from "@/lib/stream-video";
import { inngest } from "@/ingest/client";

function verifySignaturewithSDK(body: string, signature: string): boolean {
    return streamVideo.verifyWebhook(body, signature);
}

interface BaseWebhookEvent {
    type?: string;
}

function isBaseWebhookEvent(obj: unknown): obj is BaseWebhookEvent {
    return typeof obj === "object" && obj !== null && "type" in obj;
}

export async function POST(req: NextRequest) {
    const signature = req.headers.get("x-signature");
    const apiKey = req.headers.get("x-api-key");

    if (!signature || !apiKey) {
        return NextResponse.json(
            { error: "Missing signature or API Key" },
            { status: 400 }
        );
    }

    const body = await req.text();

    if (!verifySignaturewithSDK(body, signature)) {
        return NextResponse.json(
            { error: "Invalid signature" },
            { status: 401 }
        );
    }

    let payload: unknown;
    try {
        payload = JSON.parse(body);
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON" },
            { status: 400 }
        );
    }

    const eventType = isBaseWebhookEvent(payload) ? payload.type : undefined;

    if (eventType === "call.session_started") {
        const event = payload as CallSessionStartedEvent;
        const meetingId = event.call.custom?.meetingId;

        if (!meetingId) {
            return NextResponse.json(
                { error: "Missing meetingId" },
                { status: 400 }
            );
        }

        const [existingMeeting] = await db
            .select()
            .from(meetings)
            .where(
                and(
                    eq(meetings.id, meetingId),
                    not(eq(meetings.status, "completed")),
                    not(eq(meetings.status, "active")),
                    not(eq(meetings.status, "cancelled")),
                    not(eq(meetings.status, "processing"))
                )
            );

        if (!existingMeeting) {
            return NextResponse.json(
                { error: "Meeting not found" },
                { status: 404 }
            );
        }

        await db
            .update(meetings)
            .set({
                status: "active",
                startedAt: new Date(),
            })
            .where(eq(meetings.id, existingMeeting.id));

        const [existingAgent] = await db
            .select()
            .from(agents)
            .where(eq(agents.id, existingMeeting.agentId));

        if (!existingAgent) {
            return NextResponse.json(
                { error: "Agent not found" },
                { status: 400 }
            );
        }

        const call = streamVideo.video.call("default", meetingId);

        try {
            const realtimeClient = await streamVideo.video.connectOpenAi({
                call,
                openAiApiKey: process.env.OPENAI_API_KEYS!,
                agentUserId: existingAgent.id,
            });

            await realtimeClient.updateSession({
                instructions: existingAgent.instructions,
            });

            return NextResponse.json({ status: "Ok" });
        } catch (e) {
            console.log(e)
            return NextResponse.json({
                status : "Failed"
            })
        }
    }

    else if (eventType === "call.session_participant_left") {
        const event = payload as CallSessionParticipantLeftEvent;
        const meetingId = event.call_cid.split(":")[1];

        if (!meetingId) {
            return NextResponse.json(
                { error: "Missing meetingId" },
                { status: 400 }
            );
        }

        const call = streamVideo.video.call("default", meetingId);

        await call.end();

        return NextResponse.json({ status: "Ok" });
    }

    else if (eventType === "call.session_ended") {
        const event = payload as CallEndedEvent;
        const meetingId = event.call.custom?.meetingId;

        if (!meetingId) {
            return NextResponse.json(
                { error: "Missing meetingId" },
                { status: 400 }
            );
        }

        await db
            .update(meetings)
            .set({
                status: "processing",
                endedAt: new Date(),
            })
            .where(
                and(
                    eq(meetings.id, meetingId),
                    eq(meetings.status, "active")
                )
            );

        return NextResponse.json({ status: "Ok" });
    }

    else if (eventType === "call.transcription_ready") {
        const event = payload as CallTranscriptionReadyEvent;
        const meetingId = event.call_cid.split(":")[1];

        const [updatedMeeting] = await db
            .update(meetings)
            .set({
                transcriptUrl: event.call_transcription.url,
            })
            .where(eq(meetings.id, meetingId))
            .returning();

        if (!updatedMeeting) {
            return NextResponse.json(
                { error: "Meeting not found" },
                { status: 404 }
            );
        }

        // Optionally enqueue background job

        await inngest.send({
            name : "meetings/processing",
            data : {
                meetingId : updatedMeeting.id,
                transcriptUrl : updatedMeeting.transcriptUrl,
            },
        })

        return NextResponse.json({ status: "Ok" });
    }

    else if (eventType === "call.recording_ready") {
        const event = payload as CallRecordingReadyEvent;
        const meetingId = event.call_cid.split(":")[1];

        await db
            .update(meetings)
            .set({
                recordingUrl: event.call_recording.url,
            })
            .where(eq(meetings.id, meetingId));

        return NextResponse.json({ status: "Ok" });
    }

    // Default response for unknown/unhandled event types
    return NextResponse.json({ status: "Ok" });
}
