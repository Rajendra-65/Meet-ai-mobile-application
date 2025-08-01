"use client";
import { Button } from "@/components/ui/button";
// import { DEFAULT_PAGE } from "@/constants";
import { PlusIcon, XCircleIcon } from "lucide-react";
import { NewMeetingtDialog } from "./new-meeting-dialog";
import { useState } from "react";
import { MeetingsSearchFilter } from "./meetings-search-filter";
import StatusFilter from "./status-filter";
import { AgentIdFilter } from "./agent-id-filter";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DEFAULT_PAGE } from "@/constants";

export const MeetingsListHeader = () => {
    const [filters, setFilters] = useMeetingsFilters();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const isAnyFiltersModified =
        !!filters.status || !!filters.search || filters.agentId

    const onClearFilters = () => {
        setFilters({
            status: null,
            agentId: null,
            search: "",
            page: DEFAULT_PAGE,
        })
    }

    return (
        <>
            <NewMeetingtDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
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
                            () => { setIsDialogOpen(true) }
                        }
                    >
                        <PlusIcon />
                        New Meeting
                    </Button>
                </div>
                <ScrollArea>
                    <div className="flex items-center gap-x-2 p-1">
                        <MeetingsSearchFilter

                        />
                        <StatusFilter />
                        <AgentIdFilter />
                        {
                            isAnyFiltersModified && (
                                <Button
                                    variant="outline"
                                    onClick={onClearFilters}
                                >
                                    <XCircleIcon className="size-4" />
                                    Clear
                                </Button>
                            )
                        }
                        <ScrollBar 
                            orientation = "horizontal"
                        />
                    </div>
                </ScrollArea>
            </div>
        </>

    )
}