import { db } from "@/db";
import { and, count, desc, eq, getTableColumns, ilike } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { TRPCError } from "@trpc/server";
import { meetings } from "@/db/schema";
import { meetingsInsertSchema, meetingsUpdateSchema } from "../schema";

export const meetingsRouter = createTRPCRouter({
    update: protectedProcedure
        .input(meetingsUpdateSchema)
        .mutation(async ({ ctx, input }) => {
            const [updatedAgent] = await db
                .update(meetings)
                .set(input)
                .where(
                    and(
                        eq(meetings.id, input.id),
                        eq(meetings.userId, ctx.auth.user.id)
                    )
                )
                .returning()

            if (!updatedAgent) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "AGENT not found"
                })
            }
        }),
    create: protectedProcedure
        .input(meetingsInsertSchema)
        .mutation(async ({ input, ctx }) => {
            const [createdMeeting] = await db
                .insert(meetings)
                .values({
                    ...input,
                    userId: ctx.auth.user.id,
                })
                .returning();

            // ToDO : Create stream call,upsert stream useers

            return createdMeeting;
        }),
    getOne: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const [existingAgent] = await db
                .select({
                    ...getTableColumns(meetings),
                })
                .from(meetings)
                .where(
                    and(
                        eq(meetings.id, input.id),
                        eq(meetings.userId, ctx.auth.user.id)
                    )
                )

            if (!existingAgent) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Meetings not found"
                })
            }

            return existingAgent;
        }),
    getMany: protectedProcedure
        .input(z.object({
            page: z.number().default(DEFAULT_PAGE),
            pageSize: z
                .number()
                .min(MIN_PAGE_SIZE)
                .max(MAX_PAGE_SIZE)
                .default(DEFAULT_PAGE_SIZE),
            search: z.string().nullish()
        })
        )
        .query(async ({ ctx, input }) => {
            const { search, page, pageSize } = input;

            const data = await db.select({
                ...getTableColumns(meetings)
            })
                .from(meetings)
                .where(
                    and(
                        eq(meetings.userId, ctx.auth.user.id),
                        search ? ilike(meetings.name, `%${input.search}%`) : undefined
                    )
                )
                .orderBy(
                    desc(meetings.createdAt), desc(meetings.id)
                )
                .limit(pageSize)
                .offset((page - 1) * pageSize)

            const [totalCount] = await db
                .select({
                    count: count()
                })
                .from(meetings)
                .where(
                    and(
                        eq(meetings.userId, ctx.auth.user.id),
                        search ? ilike(meetings.name, `%${search}%`) : undefined,
                    )
                );

            const totalPages = Math.ceil(totalCount.count / pageSize);


            return {
                items: data,
                total: totalCount.count,
                totalPages,
            };
        }),
})
