import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type UserRole = "admin" | "moderator" | "user";

export const useModeration = () => {
  const { user } = useAuth();
  const [isModerator, setIsModerator] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setIsModerator(false);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (data && !error) {
        const roles = data.map((r) => r.role);
        setIsModerator(roles.includes("moderator") || roles.includes("admin"));
        setIsAdmin(roles.includes("admin"));
      }
      setLoading(false);
    };

    checkRole();
  }, [user]);

  const assignModeratorRole = async (targetUserId: string) => {
    if (!isModerator) return { success: false, error: "Not authorized" };

    const { error } = await supabase.from("user_roles").insert({
      user_id: targetUserId,
      role: "moderator" as UserRole,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const removeModeratorRole = async (targetUserId: string) => {
    if (!isModerator) return { success: false, error: "Not authorized" };

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", targetUserId)
      .eq("role", "moderator");

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const deletePostAsModerator = async (
    postId: string,
    postOwnerId: string,
    postTitle: string
  ) => {
    if (!user || !isModerator) return { success: false, error: "Not authorized" };

    // Delete the post
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    // Send notification to the post owner (if it's not the moderator's own post)
    if (postOwnerId !== user.id) {
      await supabase.from("notifications").insert({
        user_id: postOwnerId,
        type: "moderation",
        from_user_id: user.id,
        post_id: null,
      });
    }

    return { success: true };
  };

  const deleteCommentAsModerator = async (
    commentId: string,
    commentOwnerId: string,
    postId: string
  ) => {
    if (!user || !isModerator) return { success: false, error: "Not authorized" };

    // Delete the comment
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    // Update comment count on the post
    const { data: post } = await supabase
      .from("posts")
      .select("comments_count")
      .eq("id", postId)
      .single();

    if (post) {
      await supabase
        .from("posts")
        .update({ comments_count: Math.max(0, post.comments_count - 1) })
        .eq("id", postId);
    }

    // Send notification to the comment owner (if it's not the moderator's own comment)
    if (commentOwnerId !== user.id) {
      await supabase.from("notifications").insert({
        user_id: commentOwnerId,
        type: "moderation",
        from_user_id: user.id,
        post_id: postId,
      });
    }

    return { success: true };
  };

  const checkUserRole = async (targetUserId: string): Promise<UserRole[]> => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", targetUserId);

    return (data?.map((r) => r.role as UserRole) || []);
  };

  return {
    isModerator,
    isAdmin,
    loading,
    assignModeratorRole,
    removeModeratorRole,
    deletePostAsModerator,
    deleteCommentAsModerator,
    checkUserRole,
  };
};
