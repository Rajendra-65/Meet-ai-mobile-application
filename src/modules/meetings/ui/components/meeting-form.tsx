import { useTRPC } from "@/trpc/client";
import { MeetingGetOne } from "../../types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { meetingsInsertSchema } from "../../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GeneratedAvatar } from "@/components/generated-avatar";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { toast } from "sonner";
import { useState } from "react";
import { CommandSelect } from "@/components/command-select";
import { NewAgentDialog } from "@/modules/agents/ui/components/new-agent-dialog";

interface MeetingFormProps {
    onSuccess?: (id: string) => void;
    onCancel?: () => void;
    initialValues?: MeetingGetOne;
}

export const MeetingForm = ({
    onSuccess,
    onCancel,
    initialValues,
}: MeetingFormProps) => {
    const trpc = useTRPC();
    // const router = useRouter();
    const queryClient = useQueryClient();

    const [open, setOpen] = useState(false)
    const [openNewAgentDialog, setNewOpenAgentDialog] = useState(false)
    const [agentSearch, setAgentSearch] = useState("");

    const agents = useQuery(
        trpc.agents.getMany.queryOptions({
            pageSize: 100,
            search: agentSearch
        })
    )

    const createMeeting = useMutation(
        trpc.meetings.create.mutationOptions({
            onSuccess: async (data) => {
                await queryClient.invalidateQueries(
                    trpc.meetings.getMany.queryOptions({}),
                );
                // Invalidate free tier
                onSuccess?.(data.id);
            },
            onError: (error) => {
                toast.error(error.message)
                // eroror code is forbidden then redirect to "/upgrade"
            }
        })
    )

    const updateMeeting = useMutation(
        trpc.meetings.update.mutationOptions({
            onSuccess: async (data) => {
                await queryClient.invalidateQueries(
                    trpc.meetings.getMany.queryOptions({}),
                );

                if (initialValues?.id) {
                    await queryClient.invalidateQueries(
                        trpc.meetings.getOne.queryOptions({
                            id: initialValues.id
                        })
                    )
                }

                onSuccess?.(data?.id);
            },
            onError: (error) => {
                toast.error(error.message)
                // eroror code is forbidden then redirect to "/upgrade"
            }
        })
    )

    const form = useForm<z.infer<typeof meetingsInsertSchema>>({
        resolver: zodResolver(meetingsInsertSchema),
        defaultValues: {
            name: initialValues?.name ?? "",
            agentId: initialValues?.agentId ?? "",
        }
    })

    const isEdit = !!initialValues?.id
    const isPending = createMeeting.isPending || createMeeting.isPending

    const onSubmit = (values: z.infer<typeof meetingsInsertSchema>) => {
        if (isEdit) {
            updateMeeting.mutate({
                ...values,
                id: initialValues.id
            })
        } else {
            createMeeting.mutate(values)
        }
    }

    return (
        <>
            <NewAgentDialog open = {openNewAgentDialog} onOpenChange = {setNewOpenAgentDialog} />
            <Form {...form}>
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <GeneratedAvatar
                        seed={form.watch("name")}
                        variant="botttsNeutral"
                        className="border size-16"
                    />
                    <FormField
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="e.g Math Consultations"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="agentId"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Agent</FormLabel>
                                <FormControl>
                                    <CommandSelect
                                        open={open}
                                        onOpenChange={setOpen} // Control dropdown
                                        options={
                                            (agents.data?.items ?? []).map((agent) => ({
                                                id: agent.id,
                                                value: agent.id, // ensure you're using agent.id for agentId
                                                children: (
                                                    <div className="flex items-center gap-x-2">
                                                        <GeneratedAvatar
                                                            seed={agent.name}
                                                            variant="botttsNeutral"
                                                            className="border size-6"
                                                        />
                                                        <span>{agent.name}</span>
                                                    </div>
                                                ),
                                            }))
                                        }
                                        onSelect={(value) => {
                                            field.onChange(value); // set form field
                                            setOpen(false); // close dropdown
                                        }}
                                        onSearch={setAgentSearch}
                                        value={field.value}
                                        placeholder="Select Agent"
                                    />
                                </FormControl>
                                <FormDescription>
                                    Not Found what you&apos;re looking for ?
                                </FormDescription>
                                <Button
                                    type="button"
                                    className="text-white hover:underline"
                                    onClick={() => setNewOpenAgentDialog(true)}
                                >
                                    Create an Agent
                                </Button>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div
                        className="flex justify-between gap-x-2"
                    >
                        <Button
                            variant="ghost"
                            disabled={isPending}
                            type="button"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>

                        <Button disabled={isPending} type="submit">
                            {isEdit ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    )

}