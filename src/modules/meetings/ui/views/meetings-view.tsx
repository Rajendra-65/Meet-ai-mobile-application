"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";
export const MeetingsView = () => {
    const trpc = useTRPC();
    const {data} = useSuspenseQuery(trpc.meetings.getMany.queryOptions({}))
    console.log(data)
    return (
        <div
            className = "flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4"
        >
            <DataTable
                data = {data.items}
                columns = {columns}
            />
            {
                data.items.length === 0 && (
                    <EmptyState
                        title = "Create your first meeting"
                        description = "Create an meeting to join your meetings. Each meeting will follow your instructions and can interact with pariticipants during the call."
                    />

                )
            }
        </div>
    )

}