import { db } from "@/db";
import {createTRPCRouter, baseProcedure} from "@/trpc/init";
import { agents } from "@/db/schema";

export const agentsRouter = createTRPCRouter({
    getMany : baseProcedure . query(async () => {
        const data = await db
            .select()
            .from(agents)
        
        await new Promise((resolve)=> setTimeout(resolve,5000))

        return data;
    })
})