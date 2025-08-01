"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";
import { useRouter } from "next/navigation";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { Datapagination } from "@/modules/agents/ui/components/data-pagination";


export const MeetingsView = () => {
    const trpc = useTRPC();
    const router = useRouter();
    const [filters, setFilters] = useMeetingsFilters()
    const { data } = useSuspenseQuery(trpc.meetings.getMany.queryOptions({
        ...filters
    }))

    return (
        <div
            className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4"
        >
            <DataTable
                data={data.items}
                columns={columns}
                onRowClick={(row) => router.push(`/meetings/${row.id}`)}
            />
            <Datapagination
                page={filters.page}
                totalPages={data.totalPages}
                onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
            />

            {
                data.items.length === 0 && (
                    <EmptyState
                        title="Create your first meeting"
                        description="Create an meeting to join your meetings. Each meeting will follow your instructions and can interact with pariticipants during the call."
                    />

                )
            }
        </div>
    )

}