import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Share2, Send, Clock, Bookmark, ArrowLeft, Trash2, Pencil, Check, X, Reply, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import Navbar from "@/components/Navbar";
import LikeButton from "@/components/LikeButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  replies?: Comment[];
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
  image_url: string | null;
  video_url: string | null;
  media_caption: string | null;
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
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

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

      // Build nested comment structure
      const commentsWithProfiles = data.map(c => ({
        ...c,
        profile: profileMap.get(c.user_id),
        isLiked: likedCommentIds.includes(c.id),
        replies: [] as Comment[]
      }));

      // Separate top-level comments and replies
      const topLevelComments: Comment[] = [];
      const repliesMap = new Map<string, Comment[]>();

      commentsWithProfiles.forEach(comment => {
        if (!comment.parent_id) {
          topLevelComments.push(comment);
        } else {
          const existing = repliesMap.get(comment.parent_id) || [];
          existing.push(comment);
          repliesMap.set(comment.parent_id, existing);
        }
      });

      // Attach replies to their parent comments
      topLevelComments.forEach(comment => {
        comment.replies = repliesMap.get(comment.id) || [];
      });

      setComments(topLevelComments);
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

    const newLikesCount = isLiked ? likesCount - 1 : likesCount + 1;

    if (isLiked) {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", post.id);
      await supabase.from("posts").update({ likes_count: newLikesCount }).eq("id", post.id);
      setLikesCount(newLikesCount);
    } else {
      await supabase.from("likes").insert({ user_id: user.id, post_id: post.id });
      await supabase.from("posts").update({ likes_count: newLikesCount }).eq("id", post.id);
      setLikesCount(newLikesCount);
      
      // Send notification to post owner (don't notify yourself)
      if (post.user_id !== user.id) {
        await supabase.from("notifications").insert({
          user_id: post.user_id,
          type: "like",
          from_user_id: user.id,
          post_id: post.id,
        });
      }
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

    // Check in top-level comments and their replies
    let comment: Comment | undefined;
    for (const c of comments) {
      if (c.id === commentId) {
        comment = c;
        break;
      }
      const reply = c.replies?.find(r => r.id === commentId);
      if (reply) {
        comment = reply;
        break;
      }
    }
    if (!comment) return;

    const newLikesCount = comment.isLiked ? comment.likes_count - 1 : comment.likes_count + 1;

    if (comment.isLiked) {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("comment_id", commentId);
    } else {
      await supabase.from("likes").insert({ user_id: user.id, comment_id: commentId });
    }
    
    // Update likes_count in database
    await supabase.from("comments").update({ likes_count: newLikesCount }).eq("id", commentId);

    // Update local state for both top-level comments and replies
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        return { ...c, isLiked: !c.isLiked, likes_count: newLikesCount };
      }
      if (c.replies) {
        return {
          ...c,
          replies: c.replies.map(r => 
            r.id === commentId 
              ? { ...r, isLiked: !r.isLiked, likes_count: newLikesCount }
              : r
          )
        };
      }
      return c;
    }));
  };

  const handleSubmitComment = async (parentId: string | null = null) => {
    if (!user) {
      toast({ title: "Please sign in to comment", variant: "destructive" });
      return;
    }
    if (!post) return;
    
    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;

    setIsSubmitting(true);
    const { error } = await supabase.from("comments").insert({
      post_id: post.id,
      user_id: user.id,
      content: content.trim(),
      parent_id: parentId
    });

    if (error) {
      toast({ title: "Error posting comment", description: error.message, variant: "destructive" });
    } else {
      toast({ title: parentId ? "Reply posted!" : "Comment posted!" });
      if (parentId) {
        setReplyContent("");
        setReplyingToId(null);
        // Auto-expand replies for this comment
        setExpandedReplies(prev => new Set([...prev, parentId]));
      } else {
        setNewComment("");
      }
      fetchComments();
    }
    setIsSubmitting(false);
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleDeletePost = async () => {
    if (!user || !post || user.id !== post.user_id) return;

    // Delete associated likes, comments, and bookmarks first
    await Promise.all([
      supabase.from("likes").delete().eq("post_id", post.id),
      supabase.from("bookmarks").delete().eq("post_id", post.id),
      supabase.from("comments").delete().eq("post_id", post.id),
    ]);

    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    
    if (error) {
      toast({ title: "Error deleting post", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Post deleted" });
      navigate("/community");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    
    // Delete associated likes first
    await supabase.from("likes").delete().eq("comment_id", commentId);
    
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    
    if (error) {
      toast({ title: "Error deleting comment", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Comment deleted" });
      setComments(prev => prev.filter(c => c.id !== commentId));
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent("");
  };

  const handleSaveComment = async (commentId: string) => {
    if (!user || !editingCommentContent.trim()) return;

    const { error } = await supabase
      .from("comments")
      .update({ content: editingCommentContent.trim() })
      .eq("id", commentId);

    if (error) {
      toast({ title: "Error updating comment", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Comment updated" });
      setComments(prev => prev.map(c => 
        c.id === commentId ? { ...c, content: editingCommentContent.trim() } : c
      ));
      setEditingCommentId(null);
      setEditingCommentContent("");
    }
  };

  const handleShare = async () => {
    if (!post) return;
    const url = `${window.location.origin}/post/${post.id}`;
    const shareData = {
      title: post.title,
      text: post.content.slice(0, 100) + (post.content.length > 100 ? "..." : ""),
      url
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied to clipboard!" });
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(url);
          toast({ title: "Link copied to clipboard!" });
        } catch {
          toast({ title: "Failed to share", variant: "destructive" });
        }
      }
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

            {/* Post Media (Image or Video) */}
            {(post.image_url || post.video_url) && (
              <div className="p-6 border-b border-border">
                {post.video_url ? (
                  <video 
                    src={post.video_url} 
                    controls
                    className="w-full max-h-[500px] object-contain rounded-xl bg-muted"
                  />
                ) : post.image_url && (
                  <img 
                    src={post.image_url} 
                    alt={post.title}
                    className="w-full max-h-[500px] object-contain rounded-xl bg-muted"
                  />
                )}
                {post.media_caption && (
                  <p className="mt-3 text-sm text-muted-foreground italic">{post.media_caption}</p>
                )}
              </div>
            )}

            {/* Post Content */}
            <div className="p-6 border-b border-border">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">{post.content}</p>
            </div>

            {/* Post Actions */}
            <div className="p-4 flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg">
                <LikeButton
                  isLiked={isLiked}
                  likesCount={likesCount}
                  onLike={handleLikePost}
                  size="md"
                />
              </div>

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

              {user?.id === post.user_id && (
                <>
                  <button 
                    onClick={() => navigate(`/edit-post/${post.id}`)}
                    className="px-4 py-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="px-4 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Post</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your post and all associated comments.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </motion.article>

          {/* Comments Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8"
          >
            <h2 className="text-xl font-semibold mb-6">
              Comments ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
            </h2>

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
                  onClick={() => handleSubmitComment(null)}
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
                <AnimatePresence>
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
                          
                          {/* Comment content or edit form */}
                          {editingCommentId === comment.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editingCommentContent}
                                onChange={(e) => setEditingCommentContent(e.target.value)}
                                className="min-h-[60px] resize-none"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveComment(comment.id)}
                                  disabled={!editingCommentContent.trim()}
                                  className="bg-gradient-to-r from-primary to-accent"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleCancelEditComment}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-foreground">{comment.content}</p>
                          )}
                          
                          <div className="flex items-center gap-3 mt-2">
                            <LikeButton
                              isLiked={comment.isLiked || false}
                              likesCount={comment.likes_count}
                              onLike={() => handleLikeComment(comment.id)}
                              size="sm"
                            />

                            {/* Reply button */}
                            <button
                              onClick={() => {
                                if (replyingToId === comment.id) {
                                  setReplyingToId(null);
                                  setReplyContent("");
                                } else {
                                  setReplyingToId(comment.id);
                                  setReplyContent("");
                                }
                              }}
                              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Reply className="w-4 h-4" />
                              Reply
                            </button>

                            {user?.id === comment.user_id && editingCommentId !== comment.id && (
                              <>
                                <button 
                                  onClick={() => handleEditComment(comment)}
                                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your comment.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteComment(comment.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </div>

                          {/* Reply input */}
                          {replyingToId === comment.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 flex gap-2"
                            >
                              <Textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply..."
                                className="min-h-[60px] resize-none text-sm"
                              />
                              <div className="flex flex-col gap-1">
                                <Button
                                  size="sm"
                                  onClick={() => handleSubmitComment(comment.id)}
                                  disabled={!replyContent.trim() || isSubmitting}
                                  className="bg-gradient-to-r from-primary to-accent"
                                >
                                  <Send className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setReplyingToId(null);
                                    setReplyContent("");
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </motion.div>
                          )}

                          {/* Show/Hide replies button */}
                          {comment.replies && comment.replies.length > 0 && (
                            <button
                              onClick={() => toggleReplies(comment.id)}
                              className="flex items-center gap-1 mt-3 text-sm text-primary hover:underline"
                            >
                              {expandedReplies.has(comment.id) ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  Hide {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  Show {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                                </>
                              )}
                            </button>
                          )}

                          {/* Nested replies */}
                          <AnimatePresence>
                            {expandedReplies.has(comment.id) && comment.replies && comment.replies.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 space-y-3 pl-4 border-l-2 border-border"
                              >
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="flex gap-2">
                                    <Avatar 
                                      className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                                      onClick={() => handleVisitProfile(reply.user_id)}
                                    >
                                      <AvatarImage src={reply.profile?.avatar_url || undefined} />
                                      <AvatarFallback className="bg-muted text-xs">
                                        {reply.profile?.display_name?.[0]?.toUpperCase() || "?"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <p 
                                          className="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
                                          onClick={() => handleVisitProfile(reply.user_id)}
                                        >
                                          {reply.profile?.display_name || "Anonymous"}
                                        </p>
                                        <span className="text-xs text-muted-foreground">
                                          {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                                        </span>
                                      </div>
                                      
                                      {editingCommentId === reply.id ? (
                                        <div className="space-y-2">
                                          <Textarea
                                            value={editingCommentContent}
                                            onChange={(e) => setEditingCommentContent(e.target.value)}
                                            className="min-h-[50px] resize-none text-sm"
                                          />
                                          <div className="flex gap-2">
                                            <Button
                                              size="sm"
                                              onClick={() => handleSaveComment(reply.id)}
                                              disabled={!editingCommentContent.trim()}
                                              className="bg-gradient-to-r from-primary to-accent h-7 text-xs"
                                            >
                                              <Check className="w-3 h-3 mr-1" />
                                              Save
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={handleCancelEditComment}
                                              className="h-7 text-xs"
                                            >
                                              Cancel
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-sm text-foreground">{reply.content}</p>
                                      )}
                                      
                                      <div className="flex items-center gap-3 mt-1">
                                        <LikeButton
                                          isLiked={reply.isLiked || false}
                                          likesCount={reply.likes_count}
                                          onLike={() => handleLikeComment(reply.id)}
                                          size="sm"
                                        />

                                        {user?.id === reply.user_id && editingCommentId !== reply.id && (
                                          <>
                                            <button 
                                              onClick={() => handleEditComment(reply)}
                                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                                            >
                                              <Pencil className="w-3 h-3" />
                                            </button>
                                            <AlertDialog>
                                              <AlertDialogTrigger asChild>
                                                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
                                                  <Trash2 className="w-3 h-3" />
                                                </button>
                                              </AlertDialogTrigger>
                                              <AlertDialogContent>
                                                <AlertDialogHeader>
                                                  <AlertDialogTitle>Delete Reply</AlertDialogTitle>
                                                  <AlertDialogDescription>
                                                    This action cannot be undone.
                                                  </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                  <AlertDialogAction onClick={() => handleDeleteComment(reply.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                    Delete
                                                  </AlertDialogAction>
                                                </AlertDialogFooter>
                                              </AlertDialogContent>
                                            </AlertDialog>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default PostDetail;