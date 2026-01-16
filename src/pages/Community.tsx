import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { 
  MessageCircle, Bookmark, Share2, 
  TrendingUp, Clock, Dog, Cat, Bird, Fish, Rabbit,
  Plus, Search, Sparkles, ChevronUp, HelpCircle,
  MessageSquare, Lightbulb, Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LikeButton from "@/components/LikeButton";
import UserSearchPopover from "@/components/UserSearchPopover";
import { formatDistanceToNow } from "date-fns";

type Post = {
  id: string;
  title: string;
  content: string;
  category: string;
  pet_type: string | null;
  topic: string | null;
  tags: string[] | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  image_url: string | null;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  };
};

export type ForumCategory = "all" | "questions" | "discussions" | "tips" | "showcase";

const petTypeIcons: Record<string, any> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  fish: Fish,
  rabbit: Rabbit,
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "questions": case "question": return HelpCircle;
    case "discussions": case "discussion": return MessageSquare;
    case "tips": case "tip": return Lightbulb;
    case "showcase": case "photo": return Image;
    default: return MessageSquare;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "questions": case "question": return "bg-tertiary/20 text-tertiary border-tertiary/30";
    case "discussions": case "discussion": return "bg-accent/20 text-accent border-accent/30";
    case "tips": case "tip": return "bg-quaternary/20 text-quaternary border-quaternary/30";
    case "showcase": case "photo": return "bg-primary/20 text-primary border-primary/30";
    default: return "bg-muted text-muted-foreground";
  }
};

const topicColors: Record<string, string> = {
  health: "bg-red-500/20 text-red-400",
  training: "bg-blue-500/20 text-blue-400",
  food: "bg-orange-500/20 text-orange-400",
  adoption: "bg-green-500/20 text-green-400",
  emergencies: "bg-destructive/20 text-destructive",
  general: "bg-muted text-muted-foreground",
};

const Community = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory>("all");
  const [selectedPetType, setSelectedPetType] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot");
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchUserInteractions();
    }
  }, [user, selectedCategory, selectedPetType, selectedTopic, sortBy]);

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase.from("posts").select("*");

    // Apply category filter
    if (selectedCategory !== "all") {
      const categoryMap: Record<string, string[]> = {
        questions: ["questions", "question"],
        discussions: ["discussions", "discussion"],
        tips: ["tips", "tip"],
        showcase: ["showcase", "photo"],
      };
      query = query.in("category", categoryMap[selectedCategory] || [selectedCategory]);
    }

    if (selectedPetType) {
      query = query.eq("pet_type", selectedPetType);
    }
    if (selectedTopic) {
      query = query.eq("topic", selectedTopic);
    }

    // Sort
    if (sortBy === "new") {
      query = query.order("created_at", { ascending: false });
    } else if (sortBy === "top") {
      query = query.order("likes_count", { ascending: false });
    } else {
      // Hot: combination of likes + comments + recency
      query = query.order("likes_count", { ascending: false });
    }

    const { data, error } = await query.limit(50);
    
    if (data) {
      // Fetch profiles separately
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);
      
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
      const postsWithProfiles = data.map(post => ({
        ...post,
        profiles: profilesMap.get(post.user_id) || null,
      }));
      setPosts(postsWithProfiles as Post[]);
    }
    if (error) {
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const fetchUserInteractions = async () => {
    if (!user) return;

    const [likesRes, bookmarksRes] = await Promise.all([
      supabase.from("likes").select("post_id").eq("user_id", user.id).not("post_id", "is", null),
      supabase.from("bookmarks").select("post_id").eq("user_id", user.id),
    ]);

    if (likesRes.data) {
      setLikedPosts(new Set(likesRes.data.map(l => l.post_id!)));
    }
    if (bookmarksRes.data) {
      setBookmarkedPosts(new Set(bookmarksRes.data.map(b => b.post_id)));
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return;
    }

    const isLiked = likedPosts.has(postId);
    const currentPost = posts.find(p => p.id === postId);
    if (!currentPost) return;
    
    const newLikesCount = isLiked ? currentPost.likes_count - 1 : currentPost.likes_count + 1;
    
    if (isLiked) {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", postId);
      await supabase.from("posts").update({ likes_count: newLikesCount }).eq("id", postId);
      setLikedPosts(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: newLikesCount } : p));
    } else {
      await supabase.from("likes").insert({ user_id: user.id, post_id: postId });
      await supabase.from("posts").update({ likes_count: newLikesCount }).eq("id", postId);
      setLikedPosts(prev => new Set([...prev, postId]));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: newLikesCount } : p));
    }
  };

  const handleBookmark = async (postId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to bookmark posts",
        variant: "destructive",
      });
      return;
    }

    const isBookmarked = bookmarkedPosts.has(postId);
    
    if (isBookmarked) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("post_id", postId);
      setBookmarkedPosts(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, post_id: postId });
      setBookmarkedPosts(prev => new Set([...prev, postId]));
      toast({
        title: "Post saved!",
        description: "You can find it in your profile",
      });
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const petTypes = ["dog", "cat", "bird", "fish", "rabbit", "other"];
  const topics = ["health", "training", "food", "adoption", "emergencies", "general"];
  const categories: { id: ForumCategory; label: string; icon: any }[] = [
    { id: "all", label: "All Posts", icon: MessageSquare },
    { id: "questions", label: "Questions", icon: HelpCircle },
    { id: "discussions", label: "Discussions", icon: MessageCircle },
    { id: "tips", label: "Tips & Advice", icon: Lightbulb },
    { id: "showcase", label: "Showcase", icon: Image },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -15, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-40 left-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
        />
      </div>

      <main className="relative pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-accent to-tertiary bg-clip-text text-transparent">
                Community
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ask questions, share experiences, and connect with fellow pet parents
            </p>
          </motion.div>

          {/* Create Post Button - Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="md:hidden mb-6"
          >
            <Button 
              onClick={() => navigate("/create-post")}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Post
            </Button>
          </motion.div>

          {/* Main Content */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="md:w-72 lg:w-80 shrink-0"
            >
              <div className="sticky top-24 space-y-6">
                {/* Search Posts */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11"
                  />
                </div>

                {/* Search Users */}
                <UserSearchPopover />

                {/* Create Post Button - Desktop */}
                <Button
                  onClick={() => navigate("/create-post")}
                  className="hidden md:flex w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Post
                </Button>

                {/* Categories */}
                <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-4">
                  <h3 className="font-semibold mb-3">Categories</h3>
                  <div className="space-y-1">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            selectedCategory === cat.id
                              ? "bg-primary/20 text-primary"
                              : "hover:bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pet Type Filter */}
                <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-4">
                  <h3 className="font-semibold mb-3">Pet Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {petTypes.map((type) => {
                      const Icon = petTypeIcons[type] || Sparkles;
                      return (
                        <Button
                          key={type}
                          variant={selectedPetType === type ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedPetType(selectedPetType === type ? null : type)}
                          className="capitalize"
                        >
                          <Icon className="w-4 h-4 mr-1" />
                          {type}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Topic Filter */}
                <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-4">
                  <h3 className="font-semibold mb-3">Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {topics.map((topic) => (
                      <Badge
                        key={topic}
                        variant={selectedTopic === topic ? "default" : "outline"}
                        className={`cursor-pointer capitalize ${selectedTopic === topic ? "" : topicColors[topic]}`}
                        onClick={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>

            {/* Posts Feed */}
            <div className="flex-1">
              {/* Sort Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between mb-6 bg-card/30 backdrop-blur-sm rounded-xl border border-border/50 p-4"
              >
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{filteredPosts.length}</span> posts
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSortBy("hot")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === "hot" ? "bg-primary/20 text-primary" : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    🔥 Hot
                  </button>
                  <button 
                    onClick={() => setSortBy("new")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === "new" ? "bg-primary/20 text-primary" : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <Clock className="w-4 h-4 inline mr-1" />
                    New
                  </button>
                  <button 
                    onClick={() => setSortBy("top")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === "top" ? "bg-primary/20 text-primary" : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    Top
                  </button>
                </div>
              </motion.div>

              {/* Posts */}
              <div className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-card/50 rounded-xl p-6 border border-border/50 animate-pulse">
                        <div className="flex gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-muted" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-1/4" />
                            <div className="h-3 bg-muted rounded w-1/6" />
                          </div>
                        </div>
                        <div className="h-5 bg-muted rounded w-3/4 mb-3" />
                        <div className="h-20 bg-muted rounded" />
                      </div>
                    ))}
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <MessageCircle className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground mb-4">Be the first to share something with the community!</p>
                    <Button onClick={() => navigate("/create-post")} className="bg-gradient-to-r from-primary to-accent">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Post
                    </Button>
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {filteredPosts.map((post, index) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        index={index}
                        isLiked={likedPosts.has(post.id)}
                        isBookmarked={bookmarkedPosts.has(post.id)}
                        onLike={() => handleLike(post.id)}
                        onBookmark={() => handleBookmark(post.id)}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

interface PostCardProps {
  post: Post;
  index: number;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
}

const PostCard = ({ post, index, isLiked, isBookmarked, onLike, onBookmark }: PostCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const navigate = useNavigate();
  const { toast } = useToast();
  const PetIcon = petTypeIcons[post.pet_type || ""] || Sparkles;
  const CategoryIcon = getCategoryIcon(post.category);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleOpenPost = () => {
    navigate(`/post/${post.id}`);
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${post.user_id}`);
  };
  
  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={handleOpenPost}
      className="group bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-200 cursor-pointer"
    >
      <div className="flex gap-4">
        {/* Vote Section */}
        <div className="hidden sm:flex flex-col items-center gap-1">
          <LikeButton
            isLiked={isLiked}
            likesCount={post.likes_count}
            onLike={onLike}
            showCount={true}
            size="md"
            className="p-2 rounded-lg"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="outline" className={getCategoryColor(post.category)}>
              <CategoryIcon className="w-3 h-3 mr-1" />
              {post.category}
            </Badge>
            {post.pet_type && (
              <Badge variant="outline" className="capitalize">
                <PetIcon className="w-3 h-3 mr-1" />
                {post.pet_type}
              </Badge>
            )}
            {post.topic && (
              <Badge className={topicColors[post.topic] || ""}>
                {post.topic}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
            {post.title}
          </h3>

          {/* Post Image */}
          {post.image_url && (
            <div className="mb-4 -mx-2 sm:mx-0">
              <img 
                src={post.image_url} 
                alt={post.title}
                className="w-full max-h-64 object-cover rounded-xl"
              />
            </div>
          )}

          {/* Content Preview */}
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {post.content}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span key={tag} className="text-sm text-primary">#{tag}</span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Author */}
            <div className="flex items-center gap-3" onClick={handleAuthorClick}>
              <Avatar className="w-8 h-8 border-2 border-primary/30 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                <AvatarImage src={post.profiles?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {post.profiles?.display_name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors">
                  {post.profiles?.display_name || "Anonymous"}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-muted-foreground">
              <button 
                onClick={(e) => { e.stopPropagation(); handleOpenPost(); }}
                className="flex items-center gap-1 text-sm hover:text-accent transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {post.comments_count}
              </button>
              <button onClick={handleShare} className="p-1 rounded hover:text-primary transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onBookmark(); }}
                className={`p-1 rounded transition-colors ${
                  isBookmarked ? "text-quaternary" : "hover:text-quaternary"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default Community;