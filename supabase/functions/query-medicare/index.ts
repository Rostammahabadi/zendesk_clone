import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "npm:@pinecone-database/pinecone";
import { corsHeaders } from '../_shared/cors.ts';
import { SystemMessage, HumanMessage } from "npm:@langchain/core@0.3.33/messages";
import { StringOutputParser } from "npm:@langchain/core@0.1.48/output_parsers";
import { ChatPromptTemplate } from "npm:@langchain/core@0.1.48/prompts";

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: Deno.env.get("OPENAI_API_KEY") || "",
});

const chatModel = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.2,
  openAIApiKey: Deno.env.get("OPENAI_API_KEY") || "",
});

const lcdPinecone = new Pinecone({
  apiKey: Deno.env.get("PINECONE_API_KEY") || "",
});

const articlesPinecone = new Pinecone({
  apiKey: Deno.env.get("ARTICLES_PINECONE_API_KEY") || "",
});

const lcdIndexName = "medicare-paragraphs";
const articlesIndexName = "article-index";

const lcdIndex = lcdPinecone.index(lcdIndexName, "https://medicare-info-frhvzj2.svc.aped-4627-b74a.pinecone.io");
const articlesIndex = articlesPinecone.index(articlesIndexName, "https://article-index-yhnte97.svc.aped-4627-b74a.pinecone.io");

async function embedText(text: string): Promise<number[]> {
  return await embeddings.embedQuery(text);
}

async function queryLcdIndex(question: string) {
  const qEmb = await embedText(question);
  const response = await lcdIndex.query({
    vector: qEmb,
    topK: 3,
    includeMetadata: true,
    filter: { status: "A" },
  });
  return response;
}

// async function queryArticleIndexById(articleIds: string[]) {
//   if (articleIds.length === 0) return [];

//   const dummyVector = new Array(1536).fill(0);
//   const filter = { article_id: { $in: articleIds } };

//   const resp = await articlesIndex.query({
//     vector: dummyVector,
//     topK: 50,
//     includeMetadata: true,
//     filter,
//   });
//   return resp.matches || [];
// }

// function buildContext(lcdChunks: string[], articleChunks: any[]) {
function buildContext(lcdChunks: string[]) {
  let lcdContextStr = "";
  lcdChunks.forEach((chunkText, i) => {
    lcdContextStr += `LCD CHUNK ${i + 1}:\n${chunkText}\n\n`;
  });

  // let articleContextStr = "";
  // articleChunks.forEach((amatch, j) => {
  //   const atext = (amatch.metadata?.chunk_text as string) || "";
  //   articleContextStr += `ARTICLE CHUNK ${j + 1}:\n${atext}\n\n`;
  // });

  // if (articleContextStr) {
  //   return `${lcdContextStr}\nARTICLE CONTEXT:\n${articleContextStr}`;
  // } else {
    return lcdContextStr;
  // }
}

const systemTemplate = `
You are a helpful Medicare coverage assistant. Your audience is everyday people,
not medical professionals. They want a simple overview of whether or not something
is covered, or how coverage restrictions work. They do NOT need specific codes or
documentation requirements.

Guidelines:
- Provide coverage information in clear, everyday language.
- Do NOT include CPT codes or technical billing references.
- Do NOT mention documentation requirements or how to bill for services.
- If uncertain, say so.
- Summarize coverage restrictions in plain English.
- Keep it brief, friendly, and easy to read.

Remember: Focus on the core coverage restrictions or limitations, not on codes or paperwork.
`;

const promptTemplate = ChatPromptTemplate.fromTemplate(`
CONTEXT:
{context}

QUESTION:
{question}
`);

async function askOpenai(question: string, context: string) {
  const formattedPrompt = await promptTemplate.format({
    context: context,
    question: question,
  });

  const chain = chatModel
    .pipe(new StringOutputParser());

  const response = await chain.invoke([
    new SystemMessage(systemTemplate),
    new HumanMessage(formattedPrompt),
  ]);

  if (!response) {
    throw new Error('Failed to get a valid response from OpenAI');
  }

  return response.trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { question } = body;

    const lcdResp = await queryLcdIndex(question);

    if (!lcdResp.matches) {
      return new Response(JSON.stringify({ error: "No LCD matches found." }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
      });
    }

    const lcdChunks: string[] = [];
    const articleIds: string[] = [];

    lcdResp.matches.forEach((match) => {
      const chunkText = (match.metadata?.chunk_text as string) || "";
      lcdChunks.push(chunkText);

      // const relatedDocs = match.metadata?.related_documents || [];
      // if (Array.isArray(relatedDocs)) {
      //   relatedDocs.forEach((docref) => {
      //     if (docref.startsWith("Article ")) {
      //       const artId = docref.replace("Article ", "").trim();
      //       articleIds.push(artId);
      //     }
      //   });
      // }
    });

    // const uniqueArticleIds = [...new Set(articleIds)];
    // const articleMatches = await queryArticleIndexById(uniqueArticleIds);
    // const contextStr = buildContext(lcdChunks, articleMatches);
    const contextStr = buildContext(lcdChunks);
    const finalAnswer = await askOpenai(question, contextStr);

    return new Response(
      JSON.stringify({ answer: finalAnswer }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    );
  }
});