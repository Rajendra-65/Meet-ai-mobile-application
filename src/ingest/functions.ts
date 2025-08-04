import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "meet-ai-2" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);