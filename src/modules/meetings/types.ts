import {inferRouterOutputs} from "@trpc/server";

import type {AppRouter} from "@/trpc/routers/_app";


// For matching the types returned by the getOne method...

export type MeetingGetMany = inferRouterOutputs<AppRouter>["meetings"]["getMany"]["items"];

export type MeetingGetOne = inferRouterOutputs<AppRouter>["meetings"]["getOne"];

