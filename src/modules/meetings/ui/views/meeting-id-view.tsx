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
            onSuccess : () => {
                queryClient.invalidateQueries(
                    trpc.meetings.getMany.queryOptions({

                    })
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
                    JSON.stringify(data,null,2)
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