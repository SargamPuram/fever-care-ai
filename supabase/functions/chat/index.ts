import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Multilingual system prompts
    const systemPrompts: Record<string, string> = {
      en: "You are a medical AI assistant specializing in fever and infectious disease symptoms. Provide clear, empathetic advice. Always recommend seeking medical attention for severe symptoms (temperature above 103°F, difficulty breathing, severe pain). Keep responses concise and actionable. Ask follow-up questions to better understand the patient's condition.",
      hi: "आप बुखार और संक्रामक रोग लक्षणों में विशेषज्ञता रखने वाले चिकित्सा AI सहायक हैं। स्पष्ट, सहानुभूतिपूर्ण सलाह दें। गंभीर लक्षणों (103°F से अधिक तापमान, सांस लेने में कठिनाई, गंभीर दर्द) के लिए हमेशा चिकित्सा सहायता लेने की सलाह दें।",
      kn: "ನೀವು ಜ್ವರ ಮತ್ತು ಸಾಂಕ್ರಾಮಿಕ ರೋಗ ಲಕ್ಷಣಗಳಲ್ಲಿ ಪರಿಣತಿ ಹೊಂದಿರುವ ವೈದ್ಯಕೀಯ AI ಸಹಾಯಕರಾಗಿದ್ದೀರಿ. ಸ್ಪಷ್ಟ, ಸಹಾನುಭೂತಿಯ ಸಲಹೆಯನ್ನು ನೀಡಿ. ತೀವ್ರ ಲಕ್ಷಣಗಳಿಗೆ (103°F ಮೇಲೆ ತಾಪಮಾನ, ಉಸಿರಾಟದ ತೊಂದರೆ, ತೀವ್ರ ನೋವು) ಯಾವಾಗಲೂ ವೈದ್ಯಕೀಯ ಸಹಾಯ ಪಡೆಯಲು ಸೂಚಿಸಿ."
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompts[language] || systemPrompts.en },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    return new Response(JSON.stringify({ message: aiMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
