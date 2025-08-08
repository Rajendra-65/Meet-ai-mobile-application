import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useState } from "react";
import { 
    CommandGroup,
        CommandInput, 
        CommandItem, 
        CommandList, 
        CommandResponsiveDialog 
    } from "@/components/ui/command"
import { useTRPC } from "@/trpc/client";
// import { GeneratedAvatar } from "@/components/generated-avatar";
import { CommandEmpty } from "cmdk";

interface Props {
    open : boolean,
    setOpen: Dispatch<SetStateAction<boolean>>
}

export const DashboardCommand = ({open,setOpen}: Props) => {
    const router = useRouter();
    const [search, setSearch] = useState("");

    const trpc = useTRPC();
    const meetings = useQuery(
        trpc.meetings.getMany.queryOptions({
            search,
            pageSize : 100
        })
    );
    const agents = useQuery(
        trpc.agents.getMany.queryOptions({
            search,
            pageSize : 100
        })
    )
    return(
        <CommandResponsiveDialog
            shouldFilter = {false}
            open = {open}
            onOpenChange = {setOpen}
        >
            <CommandInput
                placeholder = "find a meeting or agent"
                value = {search}
                onValueChange = {(value) => setSearch(value)}
            />
            <CommandList>
                <CommandGroup heading = "Meetings">
                    <CommandEmpty>
                        <span className = "text-muted-foreground text-sm">
                            No meetings Found
                        </span>
                    </CommandEmpty>
                    {
                        meetings.data?.items.map((meeting) => (
                            <CommandItem
                                onSelect= {
                                    () => {
                                        router.push(`/meetings/${meeting.id}`)
                                        setOpen(false)
                                    }
                                }
                                key = {meeting.id}
                            >
                                {meeting.name}
                            </CommandItem>
                        ))
                    }
                </CommandGroup>
                <CommandGroup heading = "Agents">
                    <CommandEmpty>
                        <span className = "text-muted-foreground text-sm">
                            No agents Found
                        </span>
                    </CommandEmpty>
                    {
                        agents.data?.items.map((agent) => (
                            <CommandItem
                                onSelect= {
                                    () => {
                                        router.push(`/agents/${agent?.id}`)
                                        setOpen(false)
                                    }
                                }
                                key = {agent.id}
                            >
                                {agent.name}
                            </CommandItem>
                        ))
                    }
                </CommandGroup>
            </CommandList>
        </CommandResponsiveDialog>
    )
}