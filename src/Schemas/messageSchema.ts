import { z } from 'zod';

export const MessageSchema = z.object({
    content: z
    .string()
    .min(10, {message: 'Characters must be at least 10 characters long!'})
    .max(300, {message: 'Characters can be at max 300 characters long!'})
})