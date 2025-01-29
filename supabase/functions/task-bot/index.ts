// mod.ts (Supabase Edge Function entrypoint)

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { corsHeaders } from "../_shared/cors.ts";
import { z } from "npm:zod";

// ------------------ LangGraph / LangChain imports ------------------
// ChatOpenAI: for your GPT-4 (or GPT-3.5) model
import { ChatOpenAI } from "@langchain/openai";

// MemorySaver: for storing conversation state across turns
import { MemorySaver } from "npm:@langchain/langgraph";

// createReactAgent: one-line helper to build a ReAct-style agent
import { createReactAgent } from "npm:@langchain/langgraph@0.2.41/prebuilt";

// HumanMessage: wraps user text
import { HumanMessage } from "npm:@langchain/core/messages";

// For custom tools. (StructuredTool is from langchain/tools)
import { StructuredTool } from "npm:langchain/tools";

// ------------------ Supabase Setup ------------------
// const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
// const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// or whichever key you want to use for insertion
const supabaseClient = createClient(supabaseUrl, supabaseKey, {
  global: { fetch },
});

const createTicketZodSchema = z.object({
  subject: z.string(),
  description: z.string().optional(),
  status: z.string().default("open").optional(),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium").optional(),
  topic: z.enum(["Support", "Billing", "Technical"]).optional(),
  type: z.enum(["Question", "Problem", "Feature Request"]).optional(),
  current_user: z.string().optional().describe("User ID for tracking conversation context"),
  company_id: z.string().optional().describe("Company ID for tracking conversation context")
});

/** -------------- STEP 2: DEFINE A CUSTOM TICKET CREATION TOOL -------------- **/

// We define a "StructuredTool" so that the LLM can pass
// structured arguments (JSON) that match the required schema.
// The name/description is how the LLM sees this tool.
class CreateTicketTool extends StructuredTool {
  name = "create_ticket";
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

  async _call(args: z.infer<typeof createTicketZodSchema>, runManager?: any) {
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

class updateTicketTool extends StructuredTool {
  name = "update_ticket";
  description = "Use this tool to update a ticket";
  schema = z.object({
    ticket_id: z.string(),
    status: z.string(),
  });
}

// ------------------ 2) Create your agent + memory once ------------------
const createTicketTool = new CreateTicketTool();

// LLM: GPT-4 or GPT-3.5
const llm = new ChatOpenAI({
  openAIApiKey: Deno.env.get("OPENAI_API_KEY")!,
  temperature: 0,
  modelName: "gpt-4",
});

// MemorySaver: stores conversation across multiple calls (by thread_id)
const agentCheckpointer = new MemorySaver();

// Build a simple ReAct agent in one line
const agent = createReactAgent({
  llm,
  tools: [createTicketTool],
  checkpointSaver: agentCheckpointer,
});

// ------------------ 3) The Edge Function Handler ------------------
serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, thread_id, current_user, company_id } = await req.json();
    console.log("messages:", messages);
    console.log("thread_id:", thread_id);
    console.log("current_user:", current_user);
    console.log("company_id:", company_id);
    if (!current_user) {
      throw new Error("current_user is required");
    }
    // SET GLOBAL CONTEXT
    (globalThis as any).ORIGINAL_THREAD_ID = thread_id;
    (globalThis as any).CURRENT_USER = current_user;
    (globalThis as any).CURRENT_COMPANY_ID = company_id;
    // Convert user strings to HumanMessage
    const humanMessages = messages.map(
      (m: string) => new HumanMessage(m),
    );

    // Invoke the agent with current_user in both places it might be needed
    const agentState = await agent.invoke(
      { 
        messages: humanMessages,
      },
      { 
        configurable: { 
          thread_id: thread_id || "defaultThread",
          current_user: current_user,
          company_id: company_id
        }
      }
    );

    // The final message from the agent is typically last in "messages"
    const finalMessages = agentState.messages;
    const finalResponse =
      finalMessages[finalMessages.length - 1].content || "";

    return new Response(
      JSON.stringify({ ok: true, response: finalResponse }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Error in task-bot:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});