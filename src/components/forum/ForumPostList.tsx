import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { 
  MessageSquare, 
  Heart, 
  Eye, 
  Clock,
  HelpCircle,
  Lightbulb,
  Image,
  ChevronUp,
  MessageCircle,
  Bookmark,
  Share2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { ForumCategory } from "@/pages/Community";

interface ForumPostListProps {
  selectedCategory: ForumCategory;
  sortBy?: "hot" | "new" | "top";
  onSortChange?: (sort: "hot" | "new" | "top") => void;
}

interface ForumPost {
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

const mockPosts = [
  {
    id: "1",
    category: "questions",
    title: "My golden retriever keeps scratching - any advice?",
    content: "He's been scratching his ears a lot lately. I've checked for fleas but can't find any. Has anyone experienced this? What could be the cause?",
    user_id: "mock-1",
    author: { display_name: "Sarah Mitchell", avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
    likes_count: 45,
    comments_count: 24,
    views: 234,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isHot: true,
    solved: false,
  },
  {
    id: "2",
    category: "discussions",
    title: "What's everyone's morning routine with their pets?",
    content: "I'm curious how other pet parents structure their mornings. My cat demands breakfast at 5am sharp! Would love to hear about your routines.",
    user_id: "mock-2",
    author: { display_name: "Mike Chen", avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
    likes_count: 123,
    comments_count: 67,
    views: 567,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isHot: true,
    solved: false,
  },
  {
    id: "3",
    category: "tips",
    title: "5 tricks to teach your dog this weekend",
    content: "After years of training dogs, I've compiled my top 5 easy tricks that any dog can learn in just a weekend. These are great for bonding!",
    user_id: "mock-3",
    author: { display_name: "Emma Wilson", avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" },
    likes_count: 312,
    comments_count: 89,
    views: 1245,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isHot: false,
    solved: false,
  },
  {
    id: "4",
    category: "showcase",
    title: "Meet Luna - my newly adopted shelter cat! 🐱",
    content: "After months of thinking about it, I finally adopted Luna from our local shelter. She's a 3-year-old tabby with the sweetest personality.",
    user_id: "mock-4",
    author: { display_name: "Alex Rivera", avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" },
    likes_count: 534,
    comments_count: 156,
    views: 2341,
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    isHot: true,
    solved: false,
  },
  {
    id: "5",
    category: "questions",
    title: "Best pet insurance options in 2024?",
    content: "Looking into getting pet insurance for my 2-year-old labrador. There are so many options out there. What do you all recommend?",
    user_id: "mock-5",
    author: { display_name: "Jordan Lee", avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
    likes_count: 78,
    comments_count: 43,
    views: 456,
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    isHot: false,
    solved: true,
  },
  {
    id: "6",
    category: "discussions",
    title: "Indoor vs outdoor cats - what's your take?",
    content: "This seems to be a hot topic in the cat community. I'm curious what everyone here thinks. My cat is indoor-only but sometimes I wonder...",
    user_id: "mock-6",
    author: { display_name: "Taylor Kim", avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" },
    likes_count: 167,
    comments_count: 203,
    views: 1890,
    created_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    isHot: true,
    solved: false,
  },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "questions": return HelpCircle;
    case "discussions": return MessageSquare;
    case "tips": return Lightbulb;
    case "showcase": return Image;
    default: return MessageSquare;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "questions": return "bg-tertiary/20 text-tertiary border-tertiary/30";
    case "discussions": return "bg-accent/20 text-accent border-accent/30";
    case "tips": return "bg-quaternary/20 text-quaternary border-quaternary/30";
    case "showcase": return "bg-primary/20 text-primary border-primary/30";
    default: return "bg-muted text-muted-foreground";
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "just now";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
};

const ForumPostCard = ({ post, index }: { post: typeof mockPosts[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(post.likes_count);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const CategoryIcon = getCategoryIcon(post.category);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: "Please sign in to like posts", variant: "destructive" });
      return;
    }
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: "Please sign in to save posts", variant: "destructive" });
      return;
    }
    setIsBookmarked(!isBookmarked);
    toast({ title: isBookmarked ? "Removed from saved" : "Post saved!" });
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard!" });
    } catch {
      toast({ title: "Failed to copy link", variant: "destructive" });
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
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      onClick={handleOpenPost}
      className="group bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-200 cursor-pointer"
    >
      <div className="flex gap-4">
        {/* Vote Section */}
        <div className="hidden sm:flex flex-col items-center gap-1">
          <button 
            onClick={handleLike}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isLiked 
                ? "bg-accent/20 text-accent" 
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <span className={`font-bold ${isLiked ? "text-accent" : "text-muted-foreground"}`}>
            {likes}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="outline" className={getCategoryColor(post.category)}>
              <CategoryIcon className="w-3 h-3 mr-1" />
              {post.category}
            </Badge>
            {post.isHot && (
              <Badge className="bg-gradient-to-r from-accent to-quaternary text-white border-0">
                🔥 Hot
              </Badge>
            )}
            {post.solved && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                ✓ Solved
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
            {post.title}
          </h3>

          {/* Content Preview */}
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {post.content}
          </p>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Author */}
            <div className="flex items-center gap-3" onClick={handleAuthorClick}>
              <Avatar className="w-8 h-8 border-2 border-primary/30 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                <AvatarImage src={post.author?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {post.author?.display_name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors">
                  {post.author?.display_name || "Anonymous"}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(post.created_at)}
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
              <span className="flex items-center gap-1 text-sm">
                <Eye className="w-4 h-4" />
                {post.views}
              </span>
              <button onClick={handleShare} className="p-1 rounded hover:text-primary transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button 
                onClick={handleBookmark}
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

const ForumPostList = ({ selectedCategory, sortBy = "hot", onSortChange }: ForumPostListProps) => {
  const containerRef = useRef(null);
  const [displayedPosts, setDisplayedPosts] = useState(6);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  // Filter and sort posts
  const getFilteredAndSortedPosts = () => {
    let filtered = selectedCategory === "all" 
      ? mockPosts 
      : mockPosts.filter(post => post.category === selectedCategory);

    switch (sortBy) {
      case "new":
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case "top":
        return filtered.sort((a, b) => b.likes_count - a.likes_count);
      case "hot":
      default:
        return filtered.sort((a, b) => {
          const scoreA = a.likes_count + a.comments_count * 2 + (a.isHot ? 100 : 0);
          const scoreB = b.likes_count + b.comments_count * 2 + (b.isHot ? 100 : 0);
          return scoreB - scoreA;
        });
    }
  };

  const filteredPosts = getFilteredAndSortedPosts();
  const visiblePosts = filteredPosts.slice(0, displayedPosts);

  const handleLoadMore = () => {
    setDisplayedPosts(prev => Math.min(prev + 6, filteredPosts.length));
  };

  return (
    <div ref={containerRef} className="flex-1 relative">
      {/* Floating background element */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute -right-20 top-40 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none"
      />

      {/* Sort/Filter Bar */}
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
            onClick={() => onSortChange?.("hot")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sortBy === "hot" ? "bg-primary/20 text-primary" : "hover:bg-muted text-muted-foreground"
            }`}
          >
            Hot
          </button>
          <button 
            onClick={() => onSortChange?.("new")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sortBy === "new" ? "bg-primary/20 text-primary" : "hover:bg-muted text-muted-foreground"
            }`}
          >
            New
          </button>
          <button 
            onClick={() => onSortChange?.("top")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sortBy === "top" ? "bg-primary/20 text-primary" : "hover:bg-muted text-muted-foreground"
            }`}
          >
            Top
          </button>
        </div>
      </motion.div>

      {/* Posts */}
      <div className="space-y-4">
        {visiblePosts.map((post, index) => (
          <ForumPostCard 
            key={post.id} 
            post={post} 
            index={index} 
          />
        ))}
      </div>

      {/* Load More */}
      {displayedPosts < filteredPosts.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <button 
            onClick={handleLoadMore}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-foreground font-medium hover:from-primary/30 hover:to-accent/30 transition-all duration-200"
          >
            Load More Posts
          </button>
        </motion.div>
      )}

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-display font-semibold text-xl text-foreground mb-2">
            No posts yet
          </h3>
          <p className="text-muted-foreground">
            Be the first to start a conversation in this category!
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ForumPostList;
