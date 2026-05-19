// c:\Users\sonbl\zapcheck\supabase\functions\analyze\index.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PROMPT_TEMPLATE = `Você é um assistente de análise de mensagens de WhatsApp para profissionais autônomos.
Analise a mensagem abaixo e retorne APENAS um objeto JSON válido, sem explicações, sem markdown, sem texto extra.

Campos obrigatórios do JSON:
- nome: string com o nome do remetente, ou null se não identificado
- telefone: string com o telefone, ou null se não mencionado
- categoria: exatamente um de: "novo_cliente", "pedido", "cobranca", "suporte", "outros"
- intencao: string curta descrevendo o que a pessoa quer
- valor_mencionado: número em BRL ou null se não mencionado
- urgencia: exatamente um de: "alta", "media", "baixa"
- precisa_followup: boolean indicando se precisa de resposta
- resumo: string de 1 a 2 frases resumindo a mensagem

Mensagem:
{{TEXTO}}`;

interface AnalyzeBody {
  texto: string;
}

interface ExtractedFields {
  nome: string | null;
  telefone: string | null;
  categoria: string;
  intencao: string;
  valor_mencionado: number | null;
  urgencia: string;
  precisa_followup: boolean;
  resumo: string;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function parseJsonFromAi(text: string): ExtractedFields {
  const trimmed = text.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  return JSON.parse(withoutFence) as ExtractedFields;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { texto } = (await req.json()) as AnalyzeBody;

    if (!texto || typeof texto !== "string" || !texto.trim()) {
      return jsonResponse({ error: "Campo 'texto' é obrigatório" }, 400);
    }

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    const supabaseUrl = Deno.env.get("PROJECT_URL");
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

    if (!anthropicKey || !supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Configuração do servidor incompleta" }, 500);
    }

    const prompt = PROMPT_TEMPLATE.replace("{{TEXTO}}", texto.trim());

    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiResponse.ok) {
      const errorBody = await aiResponse.text();
      console.error("Anthropic API error:", errorBody);
      return jsonResponse({ error: "Falha ao analisar mensagem com IA" }, 502);
    }

    const aiData = await aiResponse.json();
    const contentBlock = aiData.content?.find(
      (block: { type: string }) => block.type === "text",
    );
    const rawText = contentBlock?.text;

    if (!rawText) {
      return jsonResponse({ error: "Resposta da IA vazia" }, 502);
    }

    const extracted = parseJsonFromAi(rawText);

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase
      .from("messages")
      .insert({
        texto_original: texto.trim(),
        nome: extracted.nome,
        telefone: extracted.telefone,
        categoria: extracted.categoria,
        intencao: extracted.intencao,
        valor_mencionado: extracted.valor_mencionado,
        urgencia: extracted.urgencia,
        precisa_followup: extracted.precisa_followup,
        resumo: extracted.resumo,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return jsonResponse({ error: "Falha ao salvar mensagem" }, 500);
    }

    return jsonResponse(data);
  } catch (err) {
    console.error("Analyze function error:", err);
    return jsonResponse({ error: "Erro interno do servidor" }, 500);
  }
});
