import {ResponsiveDialog} from "@/components/responsive-dialog";
import { MeetingForm } from "./meeting-form";
import { useRouter } from "next/navigation";

interface NewMeetingDialogProps {
    open : boolean;
    onOpenChange : (open : boolean) => void;
};

export const NewMeetingtDialog = ({
    open,
    onOpenChange,
}: NewMeetingDialogProps) => {

    const router = useRouter()

    return(
        <ResponsiveDialog
            title = "New Meeting"
            description = "Create a new Meeting"
            open = {open}
            onOpenChange = {onOpenChange}
        >
            <MeetingForm
                onSuccess = {(id)=>{
                    onOpenChange(true)
                    router.push(`/meetings/${id}`)
                }}
                onCancel = {()=> onOpenChange(false)}
            />
        </ResponsiveDialog>
    )
}