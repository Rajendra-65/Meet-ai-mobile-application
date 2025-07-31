"use client";
import { Button } from "@/components/ui/button";
// import { DEFAULT_PAGE } from "@/constants";
import { PlusIcon } from "lucide-react";
import { NewMeetingtDialog } from "./new-meeting-dialog";
import { useState } from "react";

export const MeetingsListHeader = () => {

    const [isDialogOpen, setIsDialogOpen] = useState(false);


    return (
        <>
            <NewMeetingtDialog
                open = {isDialogOpen}
                onOpenChange = {setIsDialogOpen}
            />
                <div
                    className="py-4 px-4 md:px-8 flex flex-col gap-y-4"
                >
                    <div
                        className="flex items-center justify-between"
                    >
                        <h5 className="font-medium text-xl">
                            My Meeting
                        </h5>
                        <Button
                            onClick={
                                () => {setIsDialogOpen(true)}
                            }
                        >
                            <PlusIcon />
                            New Meeting
                        </Button>
                    </div>
                
                </div>
        </>

    )
}