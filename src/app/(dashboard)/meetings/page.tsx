import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { MeetingsView } from '@/modules/meetings/ui/views/meetings-view'
import { getQueryClient,trpc } from '@/trpc/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary';

const page = () => {
  const queryClient = getQueryClient();
  void  queryClient.prefetchQuery(
    trpc.meetings.getMany.queryOptions({})
  )
  return (
    <HydrationBoundary state = {dehydrate(queryClient)}>
      <Suspense fallback = {<MeetingsViewLoading/>}>
        <ErrorBoundary fallback = {<MeetingsViewLoading/>}>
          <MeetingsView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  )
}

export default page


export const MeetingsViewLoading = () => {
    return (
        <LoadingState
            title = "Loading Meetings"
            description = "This may take a few seconds"
        />
    )
}

export const MeetingsViewError = () => {
    return(
        <ErrorState
            title = "Error loading Meetings"
            description = " Something went wrong"
        />
    )
}