import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { ChevronRightIcon, MoreVerticalIcon, TrashIcon,  PencilIcon } from "lucide-react";
import Link from "next/link";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";

interface Props {
    agentId : string,
    agentName : string,
    onEdit : () => void,
    onRemove : () => void
}

export const AgentIdViewHeader = ({
    agentId,
    agentName,
    onEdit,
    onRemove
}:Props) => {
    return(
        <div className = "flex items-center justify-between">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink
                            asChild
                            className = "font-medium text-xl"
                        >
                            <Link href = "/agents">
                                My Agents
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className = "text-foreground tex-xl font-medium [&>svg]:size-4">
                        <ChevronRightIcon/>
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild className = "Font-medium text-xl text-foreground">
                            <Link href = {`/agents/${agentId}`}>
                                {
                                    agentName
                                }
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <DropdownMenu
                modal = {false}
            >
                <DropdownMenuTrigger asChild>
                    <Button variant = "ghost">
                        <MoreVerticalIcon/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align = "end">
                    <DropdownMenuItem 
                        onClick = {onEdit}
                        className = "flex "
                    >
                        <PencilIcon className = "size-4 text-black mt-1"/>
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick = {onRemove}
                        className = "flex"
                    >
                        <TrashIcon className = "size-4 text-black mt-1"/>
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}