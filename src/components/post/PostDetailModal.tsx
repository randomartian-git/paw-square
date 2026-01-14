import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, MessageCircle, Share2, Send, MoreHorizontal, Clock, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  likes_count: number;
  parent_id: string | null;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  isLiked?: boolean;
}

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  author?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
}

const PostDetailModal = ({ isOpen, onClose, post }: PostDetailModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && post) {
      fetchComments();
      checkUserInteractions();
      setLikesCount(post.likes_count);
    }
  }, [isOpen, post]);

  const fetchComments = async () => {
    if (!post) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });

    if (data) {
      // Fetch profiles for comments
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Check which comments user has liked
      let likedCommentIds: string[] = [];
      if (user) {
        const { data: likes } = await supabase
          .from("likes")
          .select("comment_id")
          .eq("user_id", user.id)
          .in("comment_id", data.map(c => c.id));
        likedCommentIds = likes?.map(l => l.comment_id).filter(Boolean) as string[] || [];
      }

      setComments(data.map(c => ({
        ...c,
        profile: profileMap.get(c.user_id),
        isLiked: likedCommentIds.includes(c.id)
      })));
    }
    setLoading(false);
  };

  const checkUserInteractions = async () => {
    if (!user || !post) return;

    const [likeRes, bookmarkRes] = await Promise.all([
      supabase.from("likes").select("id").eq("user_id", user.id).eq("post_id", post.id).maybeSingle(),
      supabase.from("bookmarks").select("id").eq("user_id", user.id).eq("post_id", post.id).maybeSingle()
    ]);

    setIsLiked(!!likeRes.data);
    setIsBookmarked(!!bookmarkRes.data);
  };

  const handleLikePost = async () => {
    if (!user) {
      toast({ title: "Please sign in to like posts", variant: "destructive" });
      return;
    }
    if (!post) return;

    if (isLiked) {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", post.id);
      setLikesCount(prev => prev - 1);
    } else {
      await supabase.from("likes").insert({ user_id: user.id, post_id: post.id });
      setLikesCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleBookmark = async () => {
    if (!user) {
      toast({ title: "Please sign in to save posts", variant: "destructive" });
      return;
    }
    if (!post) return;

    if (isBookmarked) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("post_id", post.id);
      toast({ title: "Post removed from saved" });
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, post_id: post.id });
      toast({ title: "Post saved!" });
    }
    setIsBookmarked(!isBookmarked);
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      toast({ title: "Please sign in to like comments", variant: "destructive" });
      return;
    }

    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    if (comment.isLiked) {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("comment_id", commentId);
    } else {
      await supabase.from("likes").insert({ user_id: user.id, comment_id: commentId });
    }

    setComments(prev => prev.map(c => 
      c.id === commentId 
        ? { ...c, isLiked: !c.isLiked, likes_count: c.isLiked ? c.likes_count - 1 : c.likes_count + 1 }
        : c
    ));
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast({ title: "Please sign in to comment", variant: "destructive" });
      return;
    }
    if (!post || !newComment.trim()) return;

    setIsSubmitting(true);
    const { error } = await supabase.from("comments").insert({
      post_id: post.id,
      user_id: user.id,
      content: newComment.trim()
    });

    if (error) {
      toast({ title: "Error posting comment", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Comment posted!" });
      setNewComment("");
      fetchComments();
    }
    setIsSubmitting(false);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/forum?post=${post?.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard!" });
    } catch {
      toast({ title: "Failed to copy link", variant: "destructive" });
    }
  };

  const handleVisitProfile = (userId: string) => {
    onClose();
    navigate(`/profile/${userId}`);
  };

  if (!post) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-2xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-display font-bold text-foreground truncate">{post.title}</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Post */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar 
                    className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => handleVisitProfile(post.user_id)}
                  >
                    <AvatarImage src={post.author?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/20">
                      {post.author?.display_name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p 
                      className="font-medium cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleVisitProfile(post.user_id)}
                    >
                      {post.author?.display_name || "Anonymous"}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <p className="text-foreground whitespace-pre-wrap mb-6">{post.content}</p>

                <div className="flex items-center gap-4">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLikePost}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isLiked ? "bg-accent/20 text-accent" : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                    <span>{likesCount}</span>
                  </motion.button>

                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span>{comments.length}</span>
                  </button>

                  <button 
                    onClick={handleShare}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleBookmark}
                    className={`ml-auto p-2 rounded-lg transition-colors ${
                      isBookmarked ? "text-quaternary" : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
                  </motion.button>
                </div>
              </div>

              {/* Comments */}
              <div className="p-6">
                <h3 className="font-semibold mb-4">Comments ({comments.length})</h3>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/4" />
                          <div className="h-3 bg-muted rounded w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to comment!</p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                      >
                        <Avatar 
                          className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                          onClick={() => handleVisitProfile(comment.user_id)}
                        >
                          <AvatarImage src={comment.profile?.avatar_url || undefined} />
                          <AvatarFallback className="bg-muted text-xs">
                            {comment.profile?.display_name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-muted/50 rounded-xl p-3">
                            <p 
                              className="font-medium text-sm cursor-pointer hover:text-primary transition-colors"
                              onClick={() => handleVisitProfile(comment.user_id)}
                            >
                              {comment.profile?.display_name || "Anonymous"}
                            </p>
                            <p className="text-foreground text-sm mt-1">{comment.content}</p>
                          </div>
                          <div className="flex items-center gap-4 mt-1 px-3">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleLikeComment(comment.id)}
                              className={`flex items-center gap-1 text-xs transition-colors ${
                                comment.isLiked ? "text-accent" : "text-muted-foreground hover:text-accent"
                              }`}
                            >
                              <Heart className={`w-3 h-3 ${comment.isLiked ? "fill-current" : ""}`} />
                              {comment.likes_count > 0 && comment.likes_count}
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t border-border bg-muted/30">
              <div className="flex gap-3">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={user ? "Write a comment..." : "Sign in to comment"}
                  className="min-h-[60px] resize-none"
                  disabled={!user}
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!user || !newComment.trim() || isSubmitting}
                  className="bg-gradient-to-r from-primary to-accent self-end"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PostDetailModal;
