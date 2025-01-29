// mod.ts (Supabase Edge Function entrypoint)

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

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
import { createTicketTool } from "./createTicketTool.ts";
import { updateTicketTool } from "./updateTicketTool.ts";
/** -------------- STEP 2: DEFINE A CUSTOM TICKET CREATION TOOL -------------- **/

// ------------------ 2) Create your agent + memory once ------------------
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
  tools: [createTicketTool, updateTicketTool],
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