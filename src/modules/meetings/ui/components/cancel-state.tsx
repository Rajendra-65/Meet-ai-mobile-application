import { EmptyState } from "@/components/empty-state"

export const CancelState = () => {
    return(
        <div className = "bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
            <EmptyState
                image = "/meet-ai-assets/upcoming.svg"
                title = "Not started Yet"
                description = "once you start this meeting, a summary will appear here"
            />
            
        </div>
    )
}