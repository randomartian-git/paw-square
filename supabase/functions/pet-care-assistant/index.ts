import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get allowed origins from environment or use Supabase URL as fallback
const getAllowedOrigins = (): string[] => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  // Allow the Lovable preview domains and the Supabase project domain
  const origins = [
    "https://lovable.dev",
    "https://www.lovable.dev",
  ];
  
  // Add project-specific preview URLs
  if (projectRef) {
    origins.push(`https://${projectRef}.lovable.app`);
    origins.push(`https://${projectRef}.supabase.co`);
  }
  
  // Add any custom domain from environment
  const customOrigin = Deno.env.get("ALLOWED_ORIGIN");
  if (customOrigin) {
    origins.push(customOrigin);
  }
  
  return origins;
};

const getCorsHeaders = (origin: string | null): Record<string, string> => {
  const allowedOrigins = getAllowedOrigins();
  
  // Check if the request origin is allowed
  const isAllowed = origin && (
    allowedOrigins.includes(origin) || 
    origin.endsWith(".lovable.app") || 
    origin.endsWith(".lovable.dev")
  );
  
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

const RATE_LIMIT_PER_HOUR = 20;

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Authentication required. Please sign in to use the AI assistant." }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with user's token
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the user using getClaims for JWT validation
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.log("JWT validation failed:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized. Please sign in again." }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = claimsData.claims.sub;
    if (!userId) {
      console.log("No user ID in token claims");
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check rate limiting (20 requests per hour)
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count, error: countError } = await supabaseClient
      .from("ai_usage")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", oneHourAgo);

    if (countError) {
      console.error("Error checking rate limit:", countError);
    } else if (count !== null && count >= RATE_LIMIT_PER_HOUR) {
      console.log(`Rate limit exceeded for user ${userId}: ${count} requests in last hour`);
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded. You can send up to 20 messages per hour. Please try again later." 
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Log this usage
    const { error: insertError } = await supabaseClient
      .from("ai_usage")
      .insert({ user_id: userId });

    if (insertError) {
      console.error("Error logging AI usage:", insertError);
      // Continue anyway - don't block the request due to logging failure
    }

    // Parse the request body
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a friendly and knowledgeable AI Pet Care Assistant for PawSquare, a community platform for pet lovers. Your role is to help users with:

1. Pet health questions (general guidance, not veterinary diagnosis)
2. Pet nutrition and diet advice
3. Training tips and behavioral guidance
4. Pet grooming and hygiene
5. Exercise and activity recommendations
6. Pet safety and emergency awareness

Guidelines:
- Always be warm, empathetic, and supportive
- For serious health concerns, always recommend consulting a veterinarian
- Provide practical, actionable advice
- Use simple language that pet owners can understand
- Share fun facts about pets when appropriate
- If you're unsure about something, say so and recommend professional consultation

Remember: You are not a replacement for professional veterinary care. For emergencies or serious health issues, always advise users to contact a veterinarian immediately.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Pet care assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
