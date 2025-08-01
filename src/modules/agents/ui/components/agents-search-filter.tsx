import {SearchIcon} from "lucide-react";

import {Input} from "@/components/ui/input";

import { useAgentsFilters } from "../../hooks/use-agents-filters";
import { useState } from "react";

export const SearchFilter = () => {
    const [filters,setFilters] = useAgentsFilters();
    const [isDialogOpen , setisDialogOpen] = useState(false)
    return(
        <div className = "relative">
            <Input
                placeholder = "Filter by name"
                className = "h-9 bg-white w-[200] pl-7"
                value = {filters.search}
                onChange = {
                    (e) => setFilters({
                        search : e.target.value
                    })
                }
            />
            <SearchIcon 
                className = "size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
        </div>
    )
}