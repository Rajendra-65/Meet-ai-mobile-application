import { authClient } from "@/lib/auth-client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export const DashboardUserButton = () => {
    const {data, isPending} = authClient.useSession();

    if(isPending || !data?.user){
        return null
    }

    return(
        <DropdownMenu>
            <DropdownMenuTrigger
                className = "rounded-lg border border-border/10 p-3 w-full flex items-center jusfify-between bg-white/5 hover:bg-white/10 overflow-hidden"
            >
                {
                    data.user.image ? (
                        <Avatar>
                            <AvatarImage 
                                src = {data.user.image}
                                className = "flex items-center ml-5"
                            />
                        </Avatar>
                    ) : null
                }
                </DropdownMenuTrigger>
        </DropdownMenu>
    )
}