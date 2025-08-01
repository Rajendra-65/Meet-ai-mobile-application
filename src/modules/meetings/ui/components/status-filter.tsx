import React, { useState } from 'react'

import {
    CircleXIcon,
    CircleCheckIcon,
    ClockArrowUpIcon,
    VideoIcon,
    LoaderIcon,
} from "lucide-react";

import { CommandSelect } from '@/components/command-select';

import { MeetingStatus } from '../../types';

import { useMeetingsFilters } from '../../hooks/use-meetings-filters';

const options = [
    {
        id: MeetingStatus.Upcoming,
        value: MeetingStatus.Upcoming,
        children: (
            <div className="flex items-center ga-x-2 capitalize">
                <ClockArrowUpIcon />
                {
                    MeetingStatus.Upcoming
                }
            </div>
        )
    },
    {
        id: MeetingStatus.Completed,
        value: MeetingStatus.Completed,
        children: (
            <div className="flex items-center ga-x-2 capitalize">
                <CircleCheckIcon />
                {
                    MeetingStatus.Completed
                }
            </div>
        )
    },
    {
        id: MeetingStatus.Active,
        value: MeetingStatus.Active,
        children: (
            <div className="flex items-center ga-x-2 capitalize">
                <VideoIcon />
                {
                    MeetingStatus.Active
                }
            </div>
        )
    },
    {
       id: MeetingStatus.Processing,
       value: MeetingStatus.Processing,
       children: (
            <div className="flex items-center ga-x-2 capitalize">
                <LoaderIcon />
                {
                    MeetingStatus.Processing
                }
            </div>
        ) 
    },
    {
        id: MeetingStatus.Cancelled,
        value: MeetingStatus.Cancelled,
        children: (
            <div className="flex items-center ga-x-2 capitalize">
                <CircleXIcon />
                {
                    MeetingStatus.Cancelled
                }
            </div>
        )
    }
]

const StatusFilter = () => {

    const [filters , setFilter] = useMeetingsFilters();
    const [open,setOpen] = useState(false);

    return (
        <CommandSelect
            placeholder = "status"
            className = "h-9"
            options = {options}
            onSelect = {
                (value) => setFilter({
                    status : value as MeetingStatus
                })
            }
            value = {filters.status ?? ""}
            open = {open}
            onOpenChange = {setOpen}
        />

    )
}

export default StatusFilter
