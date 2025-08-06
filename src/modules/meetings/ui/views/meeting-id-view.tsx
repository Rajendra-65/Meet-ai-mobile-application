"use client";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { MeetingIdViewHeader } from "../components/meeting-id-view-header";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "../../hooks/use-confirm";
// import { useState } from "react";
import {UpdateMeetingtDialog} from "../components/update-meeting-dialog"
import { useState } from "react";
import { UpcomingState } from "../components/upcoming-state";
import { ActiveState } from "../components/active-state";
import { CancelState } from "../components/cancel-state";
import { ProcessingState } from "../components/processing-state";
import { CompletedState } from "../components/completed-state";

interface Props {
    meetingId: string
}

export const MeetingIdView = ({ meetingId }: Props) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const router = useRouter()

    const [updateMeetingDialogOpen, setUpdateMeetingDialogOpen] = useState(false);

    const [RemoveConfirmation , confirmRemove] = useConfirm({
        title : "Are you sure ?",
        description : "The following action will remove this meeting",
    });

    const { data } = useSuspenseQuery(
        trpc.meetings.getOne.queryOptions({
            id : meetingId
        })
    )

    const handleRemoveMeeting = async () => {
        const ok = await confirmRemove()

        if(!ok) return
        
        await removeMeetings.mutateAsync({
            id : meetingId
        })
    }

    const removeMeetings = useMutation(
        trpc.meetings.remove.mutationOptions({
            onSuccess :async () => {
                await queryClient.invalidateQueries(
                    trpc.meetings.getMany.queryOptions({

                    })
                )

                await queryClient.invalidateQueries(
                    trpc.premium.getFreeUsage.queryOptions(),
                )
                // Invalidate Freetier usage
                router.push("/meetings")
            },
            onError : (error) => {
                toast.error("Error in getting data")
                console.log(error)
            }
        })
    )

    const isActive = data.status === "active";
    const isUpcoming = data.status === "upcoming";
    const isCancelled = data.status === "cancelled";
    const isCompleted = data.status === "completed";
    const isProcessing = data.status === "processing";

    return (
        <>
            <RemoveConfirmation/>
            <UpdateMeetingtDialog
                open = {updateMeetingDialogOpen}
                onOpenChange = {setUpdateMeetingDialogOpen}
                initialValues = {data}
            />
            <div className="flex-1 py-4 md:px-8 flex flex-col gap-y-4">
                <MeetingIdViewHeader
                    MeetingId = {meetingId}
                    MeetingName = {data.name}
                    onEdit = {()=> setUpdateMeetingDialogOpen(true)}
                    onRemove = {handleRemoveMeeting}
                />
                {
                    isCancelled && <CancelState/>
                }
                {
                    isProcessing && <ProcessingState/>
                }
                {
                    isCompleted && <CompletedState data = {data}/>
                }
                {
                    isUpcoming && <UpcomingState
                        meetingId = {meetingId}
                        onCancelMeeting = {()=>{}}
                        isCancelling = {false}
                    />
                }
                {
                    isActive && <ActiveState
                        meetingId = {meetingId}
                    />
                }
                
            </div>
        </>
    )
}

export const MeetingIdViewLoading = () => {
    return (
        <LoadingState
            title="Loading Meetings"
            description="This may take a few seconds"
        />
    )
}

export const MeetingIdViewError = () => {
    return (
        <ErrorState
            title="Error loading Meetings"
            description=" Something went wrong"
        />
    )
}