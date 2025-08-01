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
    MeetingId : string,
    MeetingName : string,
    onEdit : () => void,
    onRemove : () => void
}

export const MeetingIdViewHeader = ({
    MeetingId,
    MeetingName,
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
                            <Link href = "/meetings">
                                My Meetings
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className = "text-foreground tex-xl font-medium [&>svg]:size-4">
                        <ChevronRightIcon/>
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild className = "Font-medium text-xl text-foreground">
                            <Link href = {`/meetings/${MeetingId}`}>
                                {
                                    MeetingName
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
                        className = "flex cursor-pointer"
                    >
                        <PencilIcon className = "size-4 text-black mt-1"/>
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick = {onRemove}
                        className = "flex cursor-pointer"
                    >
                        <TrashIcon className = "size-4 text-black mt-1"/>
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}