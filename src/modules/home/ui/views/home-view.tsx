"use client";

import {authClient} from "@/lib/auth-client";
import {Button} from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const HomeView = () => {
    const {data : session} = authClient.useSession();
    const router = useRouter()

    if(!session){
        return (
            <p> Loading ....</p>
        )
    }

    // const {data} = useQuery(trpc.hello.queryOptions({
    //     text: "Antonio"
    // }))

    return (
        <div className = "flex flex-col p-4 gap-y-4">
            <p>Logged in as {session.user.name}</p>
            <Button onClick = {()=>authClient.signOut({
                fetchOptions : {onSuccess : () => router.push('/sign-in')}})}
            >
                SignOut
            </Button>
        </div>
        // <div className = "flex flex-col p-4 gap-y-4">
        //     {
        //         data?.greeting
        //     }
        // </div>
    )
}