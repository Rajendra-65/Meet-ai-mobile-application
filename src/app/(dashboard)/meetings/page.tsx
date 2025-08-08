import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { auth } from '@/lib/auth';
import { loadSearchParams } from '@/modules/agents/params';
import type { SearchParams } from 'nuqs';
import { MeetingsListHeader } from '@/modules/meetings/ui/components/meetings-list-header';
import { MeetingsView } from '@/modules/meetings/ui/views/meetings-view'
import { getQueryClient, trpc } from '@/trpc/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary';

interface Props {
  searchParams : Promise <SearchParams>
}

const page = async ({searchParams} : Props) => {

  const filters = await loadSearchParams(searchParams);

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/sign-in")
  }

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(
    trpc.meetings.getMany.queryOptions({
      ...filters
    })
  )

  return (
    <>
      <MeetingsListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<MeetingsViewLoading />}>
          <ErrorBoundary fallback={<MeetingsViewLoading />}>
            <MeetingsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>

  )
}

export default page


export const MeetingsViewLoading = () => {
  return (
    <LoadingState
      title="Loading Meetings"
      description="This may take a few seconds"
    />
  )
}

export const MeetingsViewError = () => {
  return (
    <ErrorState
      title="Error loading Meetings"
      description=" Something went wrong"
    />
  )
}