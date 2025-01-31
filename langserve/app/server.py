#!/usr/bin/env python
"""Example LangChain server exposes and agent that has conversation history.

In this example, the history is stored entirely on the client's side.

Please see other examples in LangServe on how to use RunnableWithHistory x`to
store history on the server side.

Relevant LangChain documentation:

* Creating a custom agent: https://python.langchain.com/docs/modules/agents/how_to/custom_agent
* Streaming with agents: https://python.langchain.com/docs/modules/agents/how_to/streaming#custom-streaming-with-events
* General streaming documentation: https://python.langchain.com/docs/expression_language/streaming
* Message History: https://python.langchain.com/docs/expression_language/how_to/message_history

**ATTENTION**
1. To support streaming individual tokens you will need to use the astream events
   endpoint rather than the streaming endpoint.
2. This example does not truncate message history, so it will crash if you
   send too many messages (exceed token length).
3. The playground at the moment does not render agent output well! If you want to
   use the playground you need to customize it's output server side using astream
   events by wrapping it within another runnable.
4. See the client notebook it has an example of how to use stream_events client side!
"""  # noqa: E501
from typing import Any, List, Union, Dict, Optional

from fastapi import FastAPI, HTTPException
from langchain.agents import AgentExecutor
from langchain.agents.format_scratchpad.openai_tools import (
    format_to_openai_tool_messages,
)
from langchain_core.utils.function_calling import convert_to_openai_tool
from langchain.agents.output_parsers.openai_tools import OpenAIToolsAgentOutputParser
from langchain.schema.messages import AIMessage, FunctionMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.tools import tool
from langchain_core.utils.function_calling import format_tool_to_openai_tool
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from langsmith import traceable
from supabase import create_client, Client
import os
from langchain_community.embeddings import OpenAIEmbeddings


from pinecone import Pinecone
# from langchain.vectorstores import Pinecone as PineconeVectorStore
from langchain.embeddings.openai import OpenAIEmbeddings

from langserve import add_routes
# Initialize Supabase client
supabase: Client = create_client(
    os.environ.get("SUPABASE_URL", ""),
    os.environ.get("SUPABASE_KEY", "")
)

pc = Pinecone(
  api_key=os.environ.get("PINECONE_API_KEY")
)

# Initialize embeddings
embeddings = OpenAIEmbeddings()

# Initialize Pinecone vector store
lcd_index = pc.Index("medicare-info")

MEDICARE_SYSTEM_PROMPT = """
You are a helpful Medicare coverage assistant. Your audience is everyday people,
not medical professionals. They want a simple overview of whether or not something
is covered, or how coverage restrictions work. They do NOT need specific codes or
documentation requirements.

[... rest of your system prompt ...]
"""

@tool
@traceable
def update_ticket(
    ticket_id: str,
    subject: Optional[str] = None,
    description: Optional[str] = None,
    priority: Optional[str] = None,
    topic: Optional[str] = None,
    type: Optional[str] = None,
    metadata: Optional[Dict] = None,
) -> Dict:
    """Updates a ticket in Supabase.
    Args:
        ticket_id: The ID of the ticket to update (required)
        subject: New subject/title of the ticket
        description: New description of the ticket
        priority: New priority (Low, Medium, High)
        topic: New topic of the ticket
        type: New type of ticket
        metadata: Additional metadata
    """
    if not ticket_id:
        raise ValueError("ticket_id is required")
    
    # Build update data with only provided fields
    update_data = {}
    if subject is not None:
        update_data["subject"] = subject
    if description is not None:
        update_data["description"] = description
    if priority is not None:
        update_data["priority"] = priority
    if topic is not None:
        update_data["topic"] = topic
    if type is not None:
        update_data["type"] = type
    if metadata is not None:
        update_data["metadata"] = metadata
    
    print("Updating ticket:", ticket_id)
    print("Update data:", update_data)
    
    response = supabase.table("tickets").update(update_data).eq("id", ticket_id).execute()
    if not response.data:
        raise Exception(f"Failed to update ticket: {response.error}")
        
    return response.data[0]

@tool
@traceable
def create_ticket(
    subject: str,
    description: Optional[str] = None,
    priority: str = "medium",
    company_id: str = None,  # We expect the LLM to fill this
    created_by: str = None,  # We expect the LLM to fill this
    assigned_to: Optional[str] = None,  # UUID
    topic: Optional[str] = None,
    type: Optional[str] = None,
) -> Dict:
    """Creates a ticket in Supabase. 
    Args:
        subject: The title/subject of the ticket (required)
        description: Detailed description of the ticket (optional)
        priority: Ticket priority (Low, Medium, High), defaults to Medium
        company_id: Company UUID (required)
        created_by: User UUID of ticket creator (required)
        assigned_to: User UUID of assignee (optional)
        topic: Topic of the ticket (optional)
        type: Type of ticket (optional)
    Returns:
        The created ticket data
    """
    print("running create_ticket")
    print("company_id:", company_id)
    print("created_by:", created_by)
    if not company_id or not created_by:
        raise ValueError("company_id and created_by are required fields")

    ticket_data = {
        "subject": subject,
        "description": description,
        "priority": priority,
        "company_id": company_id,
        "created_by": created_by,
        "status": "open",  # Default value
    }

    print(ticket_data)

    # Add optional fields only if they have values
    if assigned_to:
        ticket_data["assigned_to"] = assigned_to
    if topic:
        ticket_data["topic"] = topic
    if type:
        ticket_data["type"] = type
    
    response = supabase.table("tickets").insert(ticket_data).execute()
    print("response:", response)
    print("response.data:", response.data)  # The inserted rows (or None)
    if not response.data:
        raise Exception(f"Failed to create ticket: {response.error}")
        
    return response.data[0]

@tool
@traceable
def send_message(
    ticket_id: str = None,
    body: str = None,
    user_id: str = None,
) -> Dict:
    """Sends a message in a ticket thread.
    Args:
        ticket_id: The ID of the ticket to send message to (required)
        body: The message content (required)
        user_id: User UUID of message sender (will use current user if not provided)
    """
    print("ticket_id:", ticket_id)
    print("body:", body)
    print("user_id:", user_id)
    if not ticket_id or not body:
        raise ValueError("ticket_id and body are required")

    if not user_id:
        raise ValueError("sender_id is required (either directly or from config)")

    message_data = {
        "ticket_id": ticket_id,
        "sender_id": user_id,
        "message_type": "public",
        "body": body.strip()
    }
    
    print("Sending message:", message_data)
    
    response = supabase.table("ticket_messages").insert(message_data).execute()
    if not response.data:
        raise Exception(f"Failed to send message: {response.error}")
        
    return response.data[0]

# We need to set streaming=True on the LLM to support streaming individual tokens.
# Tokens will be available when using the stream_log / stream events endpoints,
# but not when using the stream endpoint since the stream implementation for agent
# streams action observation pairs not individual tokens.
# See the client notebook that shows how to use the stream events endpoint.
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0, streaming=True)

tools = [create_ticket, update_ticket, send_message]


llm_with_tools = llm.bind(tools=[convert_to_openai_tool(tool) for tool in tools])

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            # This is the key part: instruct the LLM to use user_id & company_id
            """You are a powerful support assistant. 
            
            - The user_id is {user_id}. 
            - The company_id is {company_id}.
            - Additional user metadata: {metadata}.

            You can create tickets by calling the create_ticket function. 
            Whenever you call create_ticket, please ensure:
              - company_id is set to {company_id}
              - created_by is set to {user_id}
              - (Optionally) pass metadata={metadata} if relevant

            You can also update tickets by calling the update_ticket function.
            Whenever you call update_ticket, please ensure:
              - ticket_id is set to {ticket_id}
              - company_id is set to {company_id}
              - created_by is set to {user_id}
              - (Optionally) pass metadata={metadata} if relevant

             Whenever the user says something like "Send a message in this ticket and say X",
            you must call the send_message function **with arguments**:
              - ticket_id={ticket_id}
              - user_id={user_id}
              - body=X

            Example:
              send_message(
                  ticket_id="{ticket_id}",
                  body="This is awesome",
                  user_id="{user_id}"
              )
            """
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)
agent = (
    {
        "input": lambda x: x["input"],
        "agent_scratchpad": lambda x: format_to_openai_tool_messages(
            x["intermediate_steps"]
        ),
        "chat_history": lambda x: x["chat_history"][-10:],
        # Store metadata in the agent's config
        "user_id": lambda x: x.get("user_id"),
        "company_id": lambda x: x.get("company_id"),
        "metadata": lambda x: x.get("metadata", {}),
        "ticket_id": lambda x: x.get("ticket_id"),
    }
    | prompt
    # | prompt_trimmer # See comment above.
    | llm_with_tools
    | OpenAIToolsAgentOutputParser()
)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)


app = FastAPI(
    title="LangChain Server",
    version="1.0",
    description="Spin up a simple api server using LangChain's Runnable interfaces",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
# We need to add these input/output schemas because the current AgentExecutor
# is lacking in schemas.
class Input(BaseModel):
    input: str
    # The field extra defines a chat widget.
    # Please see documentation about widgets in the main README.
    # The widget is used in the playground.
    # Keep in mind that playground support for agents is not great at the moment.
    # To get a better experience, you'll need to customize the streaming output
    # for now.
    chat_history: List[Union[HumanMessage, AIMessage, FunctionMessage]] = Field(
        ...,
        extra={"widget": {"type": "chat", "input": "input", "output": "output"}},
    )
    user_id: Optional[str] = None
    company_id: Optional[str] = None
    metadata: Optional[Dict] = None
    ticket_id: Optional[str] = None


class Output(BaseModel):
    output: Any


# Adds routes to the app for using the chain under:
# /invoke
# /batch
# /stream
# /stream_events
add_routes(
    app,
    agent_executor.with_types(input_type=Input, output_type=Output).with_config(
        {"run_name": "agent"}
    ),
)

class MedicareInput(BaseModel):
    question: str

class MedicareOutput(BaseModel):
    answer: str

def build_context(lcd_chunks: List[str]) -> str:
    return "\n\n".join(f"LCD CHUNK {i+1}:\n{chunk}" 
                      for i, chunk in enumerate(lcd_chunks))

from langchain_core.output_parsers import StrOutputParser

@app.post("/query-medicare")
async def medicare_query(input_data: MedicareInput):
    try:
        # First get the embedding for the question
        query_embedding = embeddings.embed_query(input_data.question)
        
        # Get relevant documents from Pinecone using keyword arguments
        docs = lcd_index.query(
            vector=query_embedding,
            top_k=3,
            filter={"status": "A"},
            include_metadata=True
        )
        
        # Build context from documents
        lcd_chunks = [match.metadata.get("chunk_text", "") for match in docs.matches]
        context = build_context(lcd_chunks)
        
        # Create the chat prompt
        prompt = ChatPromptTemplate.from_messages([
            ("system", MEDICARE_SYSTEM_PROMPT),
            ("human", """
            CONTEXT:
            {context}
            
            QUESTION:
            {question}
            """)
        ])
        
        # Create the chain with StrOutputParser instead of OpenAIToolsAgentOutputParser
        chain = prompt | ChatOpenAI(temperature=0.2) | StrOutputParser()
        
        # Get response
        response = chain.invoke({
            "context": context,
            "question": input_data.question
        })
        
        return MedicareOutput(answer=response)  # response is already a string
        
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)