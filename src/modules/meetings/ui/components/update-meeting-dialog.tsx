import {ResponsiveDialog} from "@/components/responsive-dialog";
import { MeetingForm } from "./meeting-form";
import { MeetingGetOne } from "../../types";

interface updateMeetingDialogProps {
    open : boolean;
    onOpenChange : (open : boolean) => void;
    initialValues : MeetingGetOne
};

export const UpdateMeetingtDialog = ({
    open,
    onOpenChange,
    initialValues
}: updateMeetingDialogProps) => {



    return(
        <ResponsiveDialog
            title = "Edit Meeting"
            description = "Edit Meeting details"
            open = {open}
            onOpenChange = {onOpenChange}
        >
            <MeetingForm
                onSuccess = {()=>{
                    onOpenChange(false)
                }}
                onCancel = {()=>onOpenChange(false)}
                initialValues = {initialValues}
            />
        </ResponsiveDialog>
    )
}