// For custom tools. (StructuredTool is from langchain/tools)
import { StructuredTool } from "npm:langchain/tools";
import { z } from "npm:zod";
import { createTicketZodSchema } from "./createTicketSchema.ts";
import { supabaseClient } from "./supabaseClient.ts";

export class CreateTicketTool extends StructuredTool {
  name = "create_ticket_tool";
  description = `
    Use this tool to create a ticket. Must use these fields:
    - subject (string)
    - description? (string)
    - status? (defaults to "open")
    - priority? (Low|Medium|High)
    - topic? (Support|Billing|Technical)
    - type? (Question|Problem|Feature Request)
  `;

  // JSON Schema restricting certain fields
  schema = createTicketZodSchema;

  async _call(args: z.infer<typeof createTicketZodSchema>) {
    const finalArgs = {
      ...args,
      current_user: (globalThis as any).CURRENT_USER ?? args.current_user,
      company_id: (globalThis as any).CURRENT_COMPANY_ID ?? args.company_id
    };

    console.log("finalArgs:", finalArgs);
    const { error } = await supabaseClient
      .from("tickets")
      .insert({
        subject: args.subject,
        description: args.description ?? null,
        status: args.status ?? "open",
        priority: args.priority ?? "Medium",
        company_id: finalArgs.company_id,
        created_by: finalArgs.current_user,
        topic: args.topic ?? null,
        type: args.type ?? null,
      });

    if (error) {
      console.error("Error inserting ticket:", error);
      return `Failed to create ticket: ${error.message}`;
    }
    return `Ticket created successfully! Subject: ${args.subject}`;
  }
}

export const createTicketTool = new CreateTicketTool();