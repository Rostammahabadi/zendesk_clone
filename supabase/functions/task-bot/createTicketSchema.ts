import { z } from "npm:zod";

export const createTicketZodSchema = z.object({
  subject: z.string(),
  description: z.string().optional(),
  status: z.string().default("open").optional(),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium").optional(),
  topic: z.enum(["Support", "Billing", "Technical"]).optional(),
  type: z.enum(["Question", "Problem", "Feature Request"]).optional(),
  current_user: z.string().optional().describe("User ID for tracking conversation context"),
  company_id: z.string().optional().describe("Company ID for tracking conversation context")
});