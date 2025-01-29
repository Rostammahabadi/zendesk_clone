// updateTicketSchema.ts
import { z } from "npm:zod";

export const updateTicketZodSchema = z.object({
  ticketId: z.string().min(1, "ticketId is required"), // must be provided

  // The user can optionally update these fields:
  subject: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  type: z.enum(["Question", "Problem", "Feature Request"]).optional(),
  topic: z.enum(["Support", "Billing", "Technical"]).optional(),
});