import {inferRouterOutputs} from "@trpc/server";

import type {AppRouter} from "@/trpc/routers/_app";


// For matching the types returned by the getOne method...
export type AgentGetMany = inferRouterOutputs<AppRouter>["agents"]["getMany"]["items"]
export type AgentGetOne = inferRouterOutputs<AppRouter>["agents"]["getOne"];

