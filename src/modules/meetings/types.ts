import {inferRouterOutputs} from "@trpc/server";

import type {AppRouter} from "@/trpc/routers/_app";


// For matching the types returned by the getOne method...

export type MeetingGetOne = inferRouterOutputs<AppRouter>["meetings"]["getOne"];

