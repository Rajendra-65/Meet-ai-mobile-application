"use client"

import { authClient } from "@/lib/auth-client";
import { LoaderIcon } from "lucide-react";
// import { generatedAvatarUri } from "@/lib/avatar";

interface Props  {
    meetingId : string;
    meetingName : string
}

export const CallProvider = ({meetingId,meetingName}: Props) => {
    const {data,isPending} = authClient.useSession();

    if(!data || isPending) {
        return(
            <div className = "flex h-screen items-center justify-center bg-radial from-sidebar-accent to-sidebar">
                <LoaderIcon 
                    className = "size-6 animate-spin text-white"
                />
            </div>
        )
    }

    return(
        <div>
            {meetingId}
            {meetingName}
        </div>
    )
}