import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Check, CheckCheck, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import TypingIndicator from "@/components/TypingIndicator";
import OnlineIndicator from "@/components/OnlineIndicator";
import EmojiPicker from "@/components/EmojiPicker";
import { usePresence } from "@/hooks/usePresence";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at: string | null;
};

type OtherUser = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
};

const Conversation = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { otherUserPresence, setTyping } = usePresence(conversationId, user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && conversationId) {
      fetchConversationData();

      // Subscribe to new messages
      const channel = supabase
        .channel(`conversation-${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          async (payload) => {
            const newMsg = payload.new as Message;
            setMessages((prev) => [...prev, newMsg]);
            
            // Mark message as read if it's from the other user
            if (newMsg.sender_id !== user.id && !newMsg.read_at) {
              await supabase
                .from("messages")
                .update({ read_at: new Date().toISOString() })
                .eq("id", newMsg.id);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            const updatedMsg = payload.new as Message;
            setMessages((prev) =>
              prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
            );
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, conversationId]);

  // Mark unread messages as read when viewing conversation
  useEffect(() => {
    if (user && conversationId && messages.length > 0) {
      const unreadMessages = messages.filter(
        (m) => m.sender_id !== user.id && !m.read_at
      );
      if (unreadMessages.length > 0) {
        supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .in("id", unreadMessages.map((m) => m.id))
          .then();
      }
    }
  }, [user, conversationId, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversationData = async () => {
    if (!user || !conversationId) return;
    setLoading(true);

    // Verify user is part of this conversation
    const { data: participantData } = await supabase
      .from("conversation_participants")
      .select("*")
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id)
      .single();

    if (!participantData) {
      toast.error("Conversation not found");
      navigate("/messages");
      return;
    }

    // Get other participant
    const { data: otherParticipantData } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", conversationId)
      .neq("user_id", user.id)
      .single();

    if (otherParticipantData) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .eq("user_id", otherParticipantData.user_id)
        .single();
      
      setOtherUser(profileData);
    }

    // Get messages
    const { data: messagesData } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    setMessages(messagesData || []);
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !conversationId) return;
    setSending(true);

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: newMessage.trim(),
    });

    if (error) {
      toast.error("Failed to send message");
      console.error(error);
    } else {
      setNewMessage("");
      // Update conversation's updated_at
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    }

    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-muted rounded-xl" />
            <div className="h-96 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-4 max-w-2xl flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border mb-4"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/messages")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={() => otherUser && navigate(`/profile/${otherUser.user_id}`)}
          >
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={otherUser?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  {otherUser?.display_name?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <OnlineIndicator
                isOnline={otherUserPresence?.isOnline ?? false}
                size="sm"
                className="absolute -bottom-0.5 -right-0.5"
              />
            </div>
            <div>
              <h2 className="font-semibold hover:text-primary transition-colors">
                {otherUser?.display_name || "Unknown User"}
              </h2>
              {otherUserPresence?.isOnline && (
                <span className="text-xs text-green-500">Online</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No messages yet. Say hello!
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwn = message.sender_id === user?.id;
              const isLastOwnMessage = isOwn && 
                messages.slice(index + 1).every(m => m.sender_id !== user?.id);
              
              const handleDeleteMessage = async (e: React.MouseEvent) => {
                e.stopPropagation();
                const { error } = await supabase
                  .from("messages")
                  .delete()
                  .eq("id", message.id);
                
                if (error) {
                  toast.error("Failed to delete message");
                } else {
                  setMessages(prev => prev.filter(m => m.id !== message.id));
                  toast.success("Message deleted");
                }
              };

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl relative ${
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    }`}
                  >
                    {/* Delete button for own messages */}
                    {isOwn && (
                      <button
                        onClick={handleDeleteMessage}
                        className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                        title="Delete message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : ""}`}>
                      <span
                        className={`text-xs ${
                          isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {formatDistanceToNow(new Date(message.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      {isOwn && isLastOwnMessage && (
                        message.read_at ? (
                          <CheckCheck className="w-3.5 h-3.5 text-primary-foreground/70" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-primary-foreground/70" />
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
          {otherUserPresence?.isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end gap-2 p-4 bg-card rounded-xl border border-border"
        >
          <EmojiPicker
            onEmojiSelect={(emoji) => setNewMessage((prev) => prev + emoji)}
          />
          <Textarea
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              setTyping(e.target.value.length > 0);
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => setTyping(false)}
            className="resize-none min-h-[44px] max-h-32"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-gradient-hero shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default Conversation;
