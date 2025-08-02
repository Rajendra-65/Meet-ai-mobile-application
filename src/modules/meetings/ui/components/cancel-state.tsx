import { EmptyState } from "@/components/empty-state"

export const CancelState = () => {
    return(
        <div className = "bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
            <EmptyState
                image = "/meet-ai-assets/cancelled.svg"
                title = "You cancelled the meeting"
                description = "As you cancelled the meeting we can't show you any summary..!!"
            />
            
        </div>
    )
}