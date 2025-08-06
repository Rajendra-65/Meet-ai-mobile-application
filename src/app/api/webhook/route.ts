import OpenAI from "openai"

import { and, eq, not } from "drizzle-orm";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import {
    MessageNewEvent,
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
import { generatedAvatarUri } from "@/lib/avatar";
import { streamChat } from "@/lib/stream-chat";

const openAIClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEYS!
})

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
                status: "Failed"
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
            name: "meetings/processing",
            data: {
                meetingId: updatedMeeting.id,
                transcriptUrl: updatedMeeting.transcriptUrl,
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
    } else if (eventType === "message.new") {
        const event = payload as MessageNewEvent;

        const userId = event.user?.id;
        const channelId = event.channel_id;
        const text = event.message?.text;

        console.log("New message event received:", { userId, channelId, text });

        if (!userId || !channelId || !text?.trim()) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const [existingMeeting] = await db
            .select()
            .from(meetings)
            .where(and(eq(meetings.id, channelId), eq(meetings.status, "completed")));

        if (!existingMeeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        const [existingAgent] = await db
            .select()
            .from(agents)
            .where(eq(agents.id, existingMeeting.agentId));

        if (!existingAgent) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        // ❌ Don't respond to messages sent by the agent
        if (userId === existingAgent.id) {
            return NextResponse.json({ message: "Ignored agent message" }, { status: 200 });
        }

        const instructions = `
You are an AI assistant helping the user revisit a recently completed meeting.
Below is a summary of the meeting:

${existingMeeting.summary}

Original instructions for you:

${existingAgent.instructions}

The user may ask questions about the meeting, request clarifications, or ask for follow-up actions.
Always base your responses on the summary above.

Also consider previous conversation context. Be helpful and concise.
If the summary doesn't answer the question, say so politely.
  `.trim();

        const channel = streamChat.channel("messaging", channelId);
        await channel.watch();

        const previousMessages = channel.state.messages
            .slice(-5)
            .filter((msg) => msg.text && msg.text.trim() !== "")
            .map<ChatCompletionMessageParam>((msg) => ({
                role: msg.user?.id === existingAgent.id ? "assistant" : "user",
                content: msg.text || "",
            }));

        const openAIResponse = await openAIClient.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: instructions },
                ...previousMessages,
                { role: "user", content: text },
            ],
        });

        const reply = openAIResponse.choices[0].message.content;

        if (!reply) {
            return NextResponse.json({ error: "No response from OpenAI" }, { status: 400 });
        }

        const avatarUrl = generatedAvatarUri({
            seed: existingAgent.name,
            variant: "botttsNeutral",
        });

        // ✅ Ensure agent is upserted BEFORE sending message
        await streamChat.upsertUser({
            id: existingAgent.id,
            name: existingAgent.name,
            image: avatarUrl,
        });

        await channel.sendMessage({
            text: reply,
            user: {
                id: existingAgent.id,
                name: existingAgent.name,
                image: avatarUrl,
            },
        });

        return NextResponse.json({ message: "AI response sent" }, { status: 200 });
    }


    // Default response for unknown/unhandled event types
    return NextResponse.json({ status: "Ok" });
}
