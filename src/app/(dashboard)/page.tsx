import React from 'react';
import { headers } from 'next/headers';
import { HomeView } from '@/modules/home/ui/views/home-view'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/modules/dashboard/ui/components/dashboard-sidebar';

const page = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <>
      <DashboardSidebar />
      <HomeView />
    </>
  )
}

export default page
