import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pet-care-assistant`;

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessages: Message[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("Please sign in to use the AI assistant");
    }

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (!resp.ok) {
      const error = await resp.json();
      throw new Error(error.error || "Failed to get response");
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => 
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to use the AI Pet Care Assistant.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      await streamChat(newMessages);
    } catch (error) {
      console.error("Chat error:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to get response";
      
      if (errorMessage.includes("Rate limit exceeded")) {
        toast({
          title: "Rate Limit Reached",
          description: "You've reached the hourly limit (20 messages). Please try again later.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("sign in") || errorMessage.includes("Authentication")) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use the AI assistant.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col pt-16">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-accent p-6">
          <div className="container mx-auto max-w-4xl">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-foreground/20 rounded-full">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl text-primary-foreground">Pet Care Assistant</h1>
                <p className="text-primary-foreground/80">AI-powered pet health advice</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 container mx-auto max-w-4xl flex flex-col">
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Bot className="w-10 h-10 text-primary" />
                </div>
                <h2 className="font-semibold text-xl text-foreground mb-3">Hi there! 👋</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  I'm your AI Pet Care Assistant. Ask me anything about pet health, nutrition, training, or care!
                </p>
                {!user && (
                  <p className="text-amber-600 dark:text-amber-400 mb-6">
                    Sign in to start chatting
                  </p>
                )}
                <div className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
                  {[
                    "What should I feed my puppy?",
                    "How often should I groom my cat?",
                    "Tips for training a new pet",
                    "Common health issues in dogs",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      disabled={!user}
                      className="text-sm px-4 py-2 rounded-full bg-muted hover:bg-muted/80 transition-colors text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      msg.role === "user" 
                        ? "bg-primary/20" 
                        : "bg-gradient-to-br from-primary to-accent"
                    }`}>
                      {msg.role === "user" ? (
                        <User className="w-5 h-5 text-primary" />
                      ) : (
                        <Bot className="w-5 h-5 text-primary-foreground" />
                      )}
                    </div>
                    <div className={`max-w-[75%] p-4 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="bg-muted p-4 rounded-2xl rounded-tl-sm">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-6 border-t border-border bg-background">
            <div className="flex gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={user ? "Ask about pet care..." : "Sign in to chat..."}
                className="min-h-[52px] max-h-[160px] resize-none"
                rows={1}
                disabled={!user}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || !user}
                size="icon"
                className="shrink-0 h-[52px] w-[52px] bg-gradient-to-r from-primary to-accent"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              For emergencies, please consult a veterinarian
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
