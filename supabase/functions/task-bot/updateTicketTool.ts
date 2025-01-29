// mod.ts (Supabase Edge Function entrypoint)
import { z } from "npm:zod";
import { updateTicketZodSchema } from "./updateTicketSchema.ts";
import { supabaseClient } from "./supabaseClient.ts";
import { globalThis } from "npm:@langchain/core/globals";

// For custom tools. (StructuredTool is from langchain/tools)
import { StructuredTool } from "npm:langchain/tools";

export class UpdateTicketTool extends StructuredTool {
  name = "update_ticket";
  description = `
    Use this tool to update an existing ticket in the CRM. You MUST have a valid ticketId 
    (the user is on the ticket detail page). If you do NOT have a ticketId, politely 
    tell the user to navigate to the detail page by clicking on "Tickets" and selecting 
    the correct ticket. 
    You can update these fields: subject, description, status, priority, type, topic.
  `;

  // Bind the Zod schema
  schema = updateTicketZodSchema;

  async _call(args: z.infer<typeof updateTicketZodSchema>) {
    // 1) If ticketId is missing or empty, return a prompt
    if (!args.ticketId || !args.ticketId.trim()) {
      return `I haven’t received a ticketID. 
Please go to the ticket detail page by clicking 'Tickets' in the sidebar, 
then selecting the ticket you'd like to update.`;
    }
    

    // 2) Update in Supabase
    const ticketUpdateData: Record<string, any> = {};
    if (args.subject) ticketUpdateData.subject = args.subject;
    if (args.description) ticketUpdateData.description = args.description;
    if (args.status) ticketUpdateData.status = args.status;
    if (args.priority) ticketUpdateData.priority = args.priority;
    if (args.type) ticketUpdateData.type = args.type;
    if (args.topic) ticketUpdateData.topic = args.topic;

    if (Object.keys(ticketUpdateData).length === 0) {
      return `No fields to update. If you want to change something, 
please specify subject, description, status, priority, type, or topic.`;
    }

    // 3) Do the DB update
    const { error } = await supabaseClient
      .from("tickets")
      .update(ticketUpdateData)
      .eq("id", args.ticketId);

    if (error) {
      console.error("Error updating ticket:", error);
      return `Failed to update ticket: ${error.message}`;
    }

    return `Ticket updated successfully! Ticket ID: ${args.ticketId}`;
  }
}

export const updateTicketTool = new UpdateTicketTool();