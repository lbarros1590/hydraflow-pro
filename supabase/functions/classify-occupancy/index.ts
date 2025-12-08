/**
 * Edge Function: Classify Occupancy using AI
 * Uses Lovable AI to suggest NTCB classification based on activity description
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// NTCB divisions reference for AI context
const DIVISIONS_REFERENCE = `
NTCB Divisions for Fire Safety Classification in Brazil (Mato Grosso):

GROUP A - RESIDENTIAL:
A-1: Single family housing (300 MJ/m²)
A-2: Multi-family housing/apartments (300 MJ/m²)
A-3: Collective housing/boarding houses (400 MJ/m²)

GROUP B - LODGING:
B-1: Hotels (500 MJ/m²)
B-2: Apartment hotels (400 MJ/m²)

GROUP C - COMMERCIAL:
C-1: Low fire load commerce (200 MJ/m²)
C-2: General commerce/retail stores (600 MJ/m²)
C-3: Shopping centers/malls (800 MJ/m²)

GROUP D - PROFESSIONAL SERVICES:
D-1: Offices/professional services (700 MJ/m²)
D-2: Banks (300 MJ/m²)
D-3: Repair services (500 MJ/m²)
D-4: Laboratories (500 MJ/m²)

GROUP E - EDUCATIONAL:
E-1: Schools (300 MJ/m²)
E-2: Special schools (300 MJ/m²)
E-3: Gyms/physical culture (200 MJ/m²)
E-4: Training centers (400 MJ/m²)
E-5: Preschools/daycare (300 MJ/m²)
E-6: Special needs schools (300 MJ/m²)

GROUP F - PUBLIC ASSEMBLY:
F-1: Museums/libraries (500 MJ/m²)
F-2: Religious temples (300 MJ/m²)
F-3: Sports centers (200 MJ/m²)
F-4: Stations/terminals (300 MJ/m²)
F-5: Theaters/cinemas (400 MJ/m²)
F-6: Social clubs (400 MJ/m²)
F-7: Temporary structures (200 MJ/m²)
F-8: Restaurants/food service (300 MJ/m²)
F-9: Public recreation (200 MJ/m²)
F-10: Exhibitions (300 MJ/m²)
F-11: Nightclubs/event venues (400 MJ/m²)

GROUP G - AUTOMOTIVE:
G-1: Automatic parking (200 MJ/m²)
G-2: Collective parking (200 MJ/m²)
G-3: Gas stations (800 MJ/m²)
G-4: Auto repair shops (500 MJ/m²)
G-5: Hangars (800 MJ/m²)

GROUP H - HEALTH & INSTITUTIONAL:
H-1: Veterinary (300 MJ/m²)
H-2: Nursing homes (300 MJ/m²)
H-3: Hospitals (300 MJ/m²)
H-4: Clinics/dental offices (400 MJ/m²)
H-5: Prisons (300 MJ/m²)
H-6: Medical clinics (300 MJ/m²)

GROUP I - INDUSTRIAL:
I-1: Low risk industrial (200 MJ/m²)
I-2: Medium risk industrial (800 MJ/m²)
I-3: High risk industrial (2000 MJ/m²)

GROUP J - STORAGE:
J-1: Non-combustible storage (50 MJ/m²)
J-2: Low fire load storage (200 MJ/m²)
J-3: Medium fire load storage (800 MJ/m²)
J-4: High fire load storage (2000 MJ/m²)

GROUP L - EXPLOSIVES:
L-1: Explosives commerce (500 MJ/m²)
L-2: Explosives industry (1000 MJ/m²)
L-3: Explosives storage (1000 MJ/m²)

GROUP M - SPECIAL:
M-1: Tunnels (300 MJ/m²)
M-3: Telecommunications (600 MJ/m²)
M-4: Under construction (500 MJ/m²)
M-5: Silos (800 MJ/m²)
M-8: Solar/wind parks (100 MJ/m²)
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description } = await req.json();

    if (!description || typeof description !== 'string') {
      return new Response(
        JSON.stringify({ error: "Description is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert in Brazilian fire safety regulations (NTCB - Normas Técnicas do Corpo de Bombeiros) for Mato Grosso state. 
Your task is to classify commercial/industrial activities according to NTCB divisions.

${DIVISIONS_REFERENCE}

Based on the user's description, you must:
1. Identify the most appropriate NTCB division code
2. Provide the typical fire load in MJ/m²
3. Suggest a CNAE code if applicable

IMPORTANT: Always respond in valid JSON format with these exact fields:
{
  "division": "X-N",
  "divisionName": "Name of the division",
  "fireLoad": 500,
  "cnae": "00.00-0",
  "description": "Brief description of why this classification was chosen",
  "confidence": "high" | "medium" | "low"
}`
          },
          {
            role: "user",
            content: `Classify this activity: ${description}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "classify_ntcb",
              description: "Classify an activity according to NTCB fire safety regulations",
              parameters: {
                type: "object",
                properties: {
                  division: { type: "string", description: "NTCB division code (e.g., C-2, I-2)" },
                  divisionName: { type: "string", description: "Name of the division in Portuguese" },
                  fireLoad: { type: "number", description: "Fire load in MJ/m²" },
                  cnae: { type: "string", description: "CNAE code if applicable" },
                  description: { type: "string", description: "Brief justification in Portuguese" },
                  confidence: { type: "string", enum: ["high", "medium", "low"] }
                },
                required: ["division", "divisionName", "fireLoad", "description", "confidence"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "classify_ntcb" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback: try to extract from content
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        const result = JSON.parse(content);
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch {
        console.error("Failed to parse AI response:", content);
      }
    }

    throw new Error("Failed to get classification from AI");

  } catch (error) {
    console.error("classify-occupancy error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
