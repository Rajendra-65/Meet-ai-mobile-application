import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server"
import { Suspense } from "react";
import {
    AgentsView,
    AgentsViewError,
    AgentsViewLoading
} from "@/modules/agents/ui/views/agents-view"
import { ErrorBoundary } from "react-error-boundary";
import { AgentsListHeader } from "@/modules/agents/ui/components/agents-list-header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { SearchParams } from "nuqs";
import { loadSearchParams } from "@/modules/agents/params";

interface Props {
    SearchParams : Promise<SearchParams>
}

const Page = async ({SearchParams} : Props) => {

    const filters = await loadSearchParams(SearchParams)

    const session = await auth.api.getSession({
        headers : await headers()
    })

    if(!session) {
        redirect("/sign-in")
    }

    const queryClient = getQueryClient();

    void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions({
        ...filters
    }));



    return (
        <>
            <AgentsListHeader/>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <Suspense
                    fallback={
                        <AgentsViewLoading />
                    }
                >
                    <ErrorBoundary
                        fallback={<AgentsViewError />}
                    >
                        <AgentsView />
                    </ErrorBoundary>
                </Suspense>
            </HydrationBoundary>
        </>
    )
}

export default Page