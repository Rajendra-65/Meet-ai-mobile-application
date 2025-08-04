import {inferRouterOutputs} from "@trpc/server";

import type {AppRouter} from "@/trpc/routers/_app";


// For matching the types returned by the getOne method...

export type MeetingGetMany = inferRouterOutputs<AppRouter>["meetings"]["getMany"]["items"];

export type MeetingGetOne = inferRouterOutputs<AppRouter>["meetings"]["getOne"];

export enum MeetingStatus {
    Upcoming = "upcoming",
    Active = "active",
    Completed = "completed",
    Processing = "processing",
    Cancelled = "cancelled"
}

export type StreamTranscriptItem = {
    speaker_id : string,
    type : string,
    text : string;
    star_ts : number;
    stop_ts : number
}