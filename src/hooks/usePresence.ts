import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

type PresenceState = {
  odaUserId: string;
  isTyping: boolean;
  lastSeen: string;
};

type UserPresence = {
  odaUserId: string;
  isOnline: boolean;
  isTyping: boolean;
};

export const usePresence = (conversationId: string | undefined, userId: string | undefined) => {
  const [otherUserPresence, setOtherUserPresence] = useState<UserPresence | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!conversationId || !userId) return;

    const channel = supabase.channel(`presence-${conversationId}`, {
      config: { presence: { key: userId } },
    });

    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceState>();
        console.log("[Presence] sync:", state);

        // Find the other user's presence
        const otherUsers = Object.entries(state).filter(([key]) => key !== userId);
        if (otherUsers.length > 0) {
          const [, presences] = otherUsers[0];
          const latestPresence = presences[presences.length - 1];
          setOtherUserPresence({
            odaUserId: latestPresence.odaUserId,
            isOnline: true,
            isTyping: latestPresence.isTyping,
          });
        } else {
          setOtherUserPresence(null);
        }
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("[Presence] join:", key, newPresences);
        if (key !== userId && newPresences.length > 0) {
          const presence = newPresences[0] as unknown as PresenceState;
          setOtherUserPresence({
            odaUserId: presence.odaUserId,
            isOnline: true,
            isTyping: presence.isTyping,
          });
        }
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        console.log("[Presence] leave:", key);
        if (key !== userId) {
          setOtherUserPresence((prev) =>
            prev ? { ...prev, isOnline: false, isTyping: false } : null
          );
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            odaUserId: userId,
            isTyping: false,
            lastSeen: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [conversationId, userId]);

  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (!channelRef.current || !userId) return;

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      await channelRef.current.track({
        odaUserId: userId,
        isTyping,
        lastSeen: new Date().toISOString(),
      });

      // Auto-reset typing after 3 seconds of no activity
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(async () => {
          if (channelRef.current) {
            await channelRef.current.track({
              odaUserId: userId,
              isTyping: false,
              lastSeen: new Date().toISOString(),
            });
          }
        }, 3000);
      }
    },
    [userId]
  );

  return { otherUserPresence, setTyping };
};

// Hook to track global online status for a list of user IDs
export const useOnlineUsers = (userIds: string[]) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (userIds.length === 0) return;

    const channel = supabase.channel("global-presence", {
      config: { presence: { key: "global" } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ odaUserId: string }>();
        const onlineSet = new Set<string>();
        Object.values(state).forEach((presences) => {
          presences.forEach((p) => {
            if (userIds.includes(p.odaUserId)) {
              onlineSet.add(p.odaUserId);
            }
          });
        });
        setOnlineUsers(onlineSet);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userIds.join(",")]);

  return onlineUsers;
};
