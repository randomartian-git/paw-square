import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Send, Clock, Bookmark, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import Navbar from "@/components/Navbar";

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

const PostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
    }
  }, [postId]);

  useEffect(() => {
    if (post && user) {
      checkUserInteractions();
    }
  }, [post, user]);

  const fetchPost = async () => {
    if (!postId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .maybeSingle();

    if (error || !data) {
      setLoading(false);
      return;
    }

    // Fetch author profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", data.user_id)
      .maybeSingle();

    setPost({
      ...data,
      author: profile || undefined,
    });
    setLikesCount(data.likes_count);
    setLoading(false);
  };

  const fetchComments = async () => {
    if (!postId) return;
    setCommentsLoading(true);

    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (data) {
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

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
    setCommentsLoading(false);
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
    const url = `${window.location.origin}/post/${post?.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard!" });
    } catch {
      toast({ title: "Failed to copy link", variant: "destructive" });
    }
  };

  const handleVisitProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24">
          <div className="max-w-3xl mx-auto animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 text-center">
          <h1 className="text-2xl font-bold">Post not found</h1>
          <p className="text-muted-foreground mt-2">This post doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate("/community")} className="mt-6">
            Back to Community
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </motion.div>

          {/* Post */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border overflow-hidden"
          >
            {/* Post Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3 mb-4">
                <Avatar 
                  className="w-12 h-12 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  onClick={() => handleVisitProfile(post.user_id)}
                >
                  <AvatarImage src={post.author?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {post.author?.display_name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p 
                    className="font-semibold cursor-pointer hover:text-primary transition-colors"
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

              <Badge variant="outline" className="mb-3 capitalize">{post.category}</Badge>
              <h1 className="text-2xl font-display font-bold">{post.title}</h1>
            </div>

            {/* Post Content */}
            <div className="p-6 border-b border-border">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">{post.content}</p>
            </div>

            {/* Post Actions */}
            <div className="p-4 flex items-center gap-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLikePost}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isLiked ? "bg-accent/20 text-accent" : "hover:bg-muted text-muted-foreground"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                <span>{likesCount}</span>
              </motion.button>

              <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span>{comments.length}</span>
              </button>

              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleBookmark}
                className={`ml-auto px-4 py-2 rounded-lg transition-colors ${
                  isBookmarked ? "text-quaternary" : "hover:bg-muted text-muted-foreground"
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
              </motion.button>
            </div>
          </motion.article>

          {/* Comments Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8"
          >
            <h2 className="text-xl font-semibold mb-6">Comments ({comments.length})</h2>

            {/* Comment Input */}
            <div className="bg-card rounded-xl border border-border p-4 mb-6">
              <div className="flex gap-3">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={user ? "Write a comment..." : "Sign in to comment"}
                  className="min-h-[80px] resize-none"
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

            {/* Comments List */}
            {commentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-12 text-center">
                <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl border border-border p-4"
                  >
                    <div className="flex gap-3">
                      <Avatar 
                        className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                        onClick={() => handleVisitProfile(comment.user_id)}
                      >
                        <AvatarImage src={comment.profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-muted">
                          {comment.profile?.display_name?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p 
                            className="font-medium cursor-pointer hover:text-primary transition-colors"
                            onClick={() => handleVisitProfile(comment.user_id)}
                          >
                            {comment.profile?.display_name || "Anonymous"}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-foreground">{comment.content}</p>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleLikeComment(comment.id)}
                          className={`flex items-center gap-1 mt-2 text-sm transition-colors ${
                            comment.isLiked ? "text-accent" : "text-muted-foreground hover:text-accent"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${comment.isLiked ? "fill-current" : ""}`} />
                          {comment.likes_count > 0 && comment.likes_count}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default PostDetail;