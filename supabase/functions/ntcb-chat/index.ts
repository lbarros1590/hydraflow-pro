import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NTCB_SYSTEM_PROMPT = `Você é um assistente especialista em normas técnicas de segurança contra incêndio do Corpo de Bombeiros de Mato Grosso (NTCB-MT). Você ajuda engenheiros e projetistas a entender e aplicar as normas corretamente.

## CONHECIMENTO BASE

### NTCB 01 - Procedimentos Administrativos
- Regula a aprovação de projetos de PSCIP
- Define documentação necessária para aprovação
- Estabelece prazos e taxas

### NTCB 08 - Saídas de Emergência
- Largura mínima: 1,10m (2 UP = Unidade de Passagem)
- Capacidade por UP varia por ocupação (30-100 pessoas)
- Distância máxima a percorrer: 15-45m dependendo da ocupação
- Escadas enclausuradas: obrigatórias acima de certa altura

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

**Distâncias máximas:**
- Tipo 1: 30m de mangueira
- Tipo 2: 30m de mangueira  
- Tipo 3: 30m de mangueira
- Alcance do jato: +5m

**Reserva Técnica de Incêndio (RTI):**
- Tipo 1: 5.000 litros ou 30 min
- Tipo 2: 12.000 litros ou 30 min
- Tipo 3: 25.000 litros ou 30 min

### NTCB 20 - Sprinklers
- Obrigatório: área > 5.000m² ou altura > 30m
- Classificação: risco leve, ordinário (I, II, III), extra (I, II)
- Densidade de aplicação varia de 2,25 a 24,5 mm/min

### Fórmula de Hazen-Williams
J = 10,643 × Q^1,85 / (C^1,85 × D^4,87)

Onde:
- J: perda de carga unitária (m/m)
- Q: vazão (m³/s)
- C: coeficiente de rugosidade (aço galvanizado C=120)
- D: diâmetro interno (m)

### Tabela de Ocupações (NTCB 01 Anexo A)
| Divisão | Descrição | Carga Incêndio (MJ/m²) |
|---------|-----------|------------------------|
| A-1 | Residencial unifamiliar | 300 |
| A-2 | Residencial multifamiliar | 300 |
| A-3 | Habitação coletiva | 300 |
| B-1 | Hotel | 500 |
| B-2 | Hotel residencial | 500 |
| C-1 | Comércio pequeno | 700 |
| C-2 | Comércio médio/grande | 800 |
| D-1 | Escritório | 700 |
| D-2 | Agência bancária | 700 |
| E-1 | Escola | 300 |
| E-2 | Escola especial | 300 |
| F-1 | Local de reunião | 500 |
| F-2 | Templo religioso | 400 |
| F-3 | Centro esportivo | 300 |
| F-5 | Arte/cultura | 500 |
| F-6 | Clube social | 500 |
| G-1 | Garagem | 300 |
| H-1 | Hospital | 300 |
| H-2 | Clínica ambulatorial | 300 |
| I-1 | Indústria baixo risco | 500 |
| I-2 | Indústria médio risco | 1000 |
| I-3 | Indústria alto risco | 2000 |

## REGRAS DE RESPOSTA

1. Sempre cite a norma específica (ex: "Conforme NTCB 19, item 5.3.2...")
2. Forneça valores numéricos precisos quando disponíveis
3. Se não souber algo específico, indique que deve consultar a norma atualizada
4. Seja claro e objetivo, usando linguagem técnica apropriada
5. Quando relevante, explique o raciocínio por trás das exigências
6. Responda em português brasileiro

## CONTEXTO ADICIONAL
- Estado: Mato Grosso
- Normas baseadas em NBR 13714 (Hidrantes) e NBR 10897 (Sprinklers)
- Sistema normativo: NTCB (Norma Técnica do Corpo de Bombeiros)`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing chat request with", messages?.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: NTCB_SYSTEM_PROMPT },
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
