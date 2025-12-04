import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_SYSTEM_PROMPT = `Você é um assistente especialista em normas técnicas de segurança contra incêndio. Você ajuda engenheiros e projetistas a entender e aplicar as normas corretamente.

## REGRAS DE RESPOSTA
1. Sempre cite a norma específica quando disponível
2. Forneça valores numéricos precisos quando disponíveis
3. Se não souber algo específico, indique que deve consultar a norma atualizada
4. Seja claro e objetivo, usando linguagem técnica apropriada
5. Quando relevante, explique o raciocínio por trás das exigências
6. Responda em português brasileiro

## CONHECIMENTO BASE PADRÃO (NTCB-MT)

### NTCB 19 - Sistema de Hidrantes e Mangotinhos
**Classificação por RTI (Risco de Transmissão de Incêndio):**
- RTI ≤ 300 MJ/m²: Risco Baixo
- 300 < RTI ≤ 1200 MJ/m²: Risco Médio  
- RTI > 1200 MJ/m²: Risco Alto

**Tipos de Sistema:**
| Tipo | Vazão (L/min) | Pressão (mca) | Mangueira | Aplicação |
|------|---------------|---------------|-----------|-----------|
| 1    | 80            | 10            | 25mm      | Risco Baixo |
| 2    | 300           | 25            | 40mm      | Risco Médio |
| 3    | 600           | 40            | 65mm      | Risco Alto |

### Tabela de Ocupações
| Divisão | Descrição | Carga Incêndio (MJ/m²) |
|---------|-----------|------------------------|
| A-1 | Residencial unifamiliar | 300 |
| A-2 | Residencial multifamiliar | 300 |
| B-1 | Hotel | 500 |
| C-1 | Comércio pequeno | 700 |
| C-2 | Comércio médio/grande | 800 |
| D-1 | Escritório | 700 |
| E-1 | Escola | 300 |
| F-1 | Local de reunião | 500 |
| G-1 | Garagem | 300 |
| H-1 | Hospital | 300 |
| I-1 | Indústria baixo risco | 500 |
| I-2 | Indústria médio risco | 1000 |
| I-3 | Indústria alto risco | 2000 |`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, state_code, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build dynamic system prompt
    let systemPrompt = BASE_SYSTEM_PROMPT;

    // Fetch state-specific regulations if state_code provided
    if (state_code && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { data: regulations } = await supabase
          .from("state_regulations")
          .select("code, title, content_text")
          .eq("state_code", state_code)
          .not("content_text", "is", null);

        if (regulations && regulations.length > 0) {
          systemPrompt += `\n\n## NORMAS ESPECÍFICAS DO ESTADO ${state_code}\n\n`;
          for (const reg of regulations) {
            if (reg.content_text) {
              systemPrompt += `### ${reg.code} - ${reg.title}\n${reg.content_text}\n\n`;
            }
          }
        }

        console.log(`Loaded ${regulations?.length || 0} regulations for state ${state_code}`);
      } catch (dbError) {
        console.error("Error fetching regulations:", dbError);
      }
    }

    // Add additional context if provided
    if (context) {
      systemPrompt += `\n\n## CONTEXTO ATUAL\n${context}`;
    }

    console.log("Processing chat request with", messages?.length, "messages, state:", state_code);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos em Settings > Workspace > Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Erro ao processar requisição de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Streaming response from AI gateway");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
