import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, MessageCircle, Bookmark, Share2, Filter, 
  TrendingUp, Clock, Dog, Cat, Bird, Fish, Rabbit,
  Plus, Search, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import CreatePostDialog from "@/components/community/CreatePostDialog";
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
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  };
};

const petTypeIcons: Record<string, any> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  fish: Fish,
  rabbit: Rabbit,
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
  const [selectedPetType, setSelectedPetType] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "trending">("recent");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchUserInteractions();
    }
  }, [user, selectedPetType, selectedTopic, sortBy]);

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from("posts")
      .select("*")
      .order(sortBy === "trending" ? "likes_count" : "created_at", { ascending: false });

    if (selectedPetType) {
      query = query.eq("pet_type", selectedPetType);
    }
    if (selectedTopic) {
      query = query.eq("topic", selectedTopic);
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
    
    if (isLiked) {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", postId);
      setLikedPosts(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count - 1 } : p));
    } else {
      await supabase.from("likes").insert({ user_id: user.id, post_id: postId });
      setLikedPosts(prev => new Set([...prev, postId]));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p));
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Community <span className="text-gradient">Feed</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Connect with fellow pet parents, share experiences, and get advice from the community.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11"
                />
              </div>

              {/* Create Post Button */}
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="w-full bg-gradient-hero shadow-glow hover:shadow-elevated"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>

              {/* Sort */}
              <div className="bg-card rounded-xl p-4 border border-border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Sort By
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant={sortBy === "recent" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy("recent")}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Recent
                  </Button>
                  <Button
                    variant={sortBy === "trending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy("trending")}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Trending
                  </Button>
                </div>
              </div>

              {/* Pet Type Filter */}
              <div className="bg-card rounded-xl p-4 border border-border">
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
              <div className="bg-card rounded-xl p-4 border border-border">
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
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card rounded-xl p-6 border border-border animate-pulse">
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
                <Button onClick={() => setIsCreateOpen(true)} className="bg-gradient-hero">
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
      </main>

      <CreatePostDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPostCreated={fetchPosts}
      />
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
  const PetIcon = petTypeIcons[post.pet_type || ""] || Sparkles;
  
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-xl p-6 border border-border hover:border-primary/30 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={post.profiles?.avatar_url || undefined} />
          <AvatarFallback className="bg-gradient-hero text-primary-foreground">
            {post.profiles?.display_name?.[0]?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{post.profiles?.display_name || "Anonymous"}</p>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
      <p className="text-muted-foreground mb-4 line-clamp-3">{post.content}</p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span key={tag} className="text-sm text-primary">#{tag}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 pt-4 border-t border-border">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onLike}
          className={`flex items-center gap-2 transition-colors ${
            isLiked ? "text-accent" : "text-muted-foreground hover:text-accent"
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
          <span>{post.likes_count}</span>
        </motion.button>
        
        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments_count}</span>
        </button>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBookmark}
          className={`flex items-center gap-2 transition-colors ${
            isBookmarked ? "text-primary" : "text-muted-foreground hover:text-primary"
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
        </motion.button>
        
        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors ml-auto">
          <Share2 className="w-5 h-5" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </motion.article>
  );
};

export default Community;
