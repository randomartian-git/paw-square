import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
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
  Bookmark
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ForumCategory } from "@/pages/Forum";

interface ForumPostListProps {
  selectedCategory: ForumCategory;
}

const posts = [
  {
    id: 1,
    category: "questions" as ForumCategory,
    title: "My golden retriever keeps scratching - any advice?",
    content: "He's been scratching his ears a lot lately. I've checked for fleas but can't find any. Has anyone experienced this? What could be the cause?",
    author: { name: "Sarah Mitchell", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", initials: "SM" },
    replies: 24,
    likes: 45,
    views: 234,
    timeAgo: "2 hours ago",
    isHot: true,
    solved: false,
  },
  {
    id: 2,
    category: "discussions" as ForumCategory,
    title: "What's everyone's morning routine with their pets?",
    content: "I'm curious how other pet parents structure their mornings. My cat demands breakfast at 5am sharp! Would love to hear about your routines and any tips for managing early wake-up calls.",
    author: { name: "Mike Chen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", initials: "MC" },
    replies: 67,
    likes: 123,
    views: 567,
    timeAgo: "5 hours ago",
    isHot: true,
    solved: false,
  },
  {
    id: 3,
    category: "tips" as ForumCategory,
    title: "5 tricks to teach your dog this weekend",
    content: "After years of training dogs, I've compiled my top 5 easy tricks that any dog can learn in just a weekend. These are great for bonding and mental stimulation!",
    author: { name: "Emma Wilson", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", initials: "EW" },
    replies: 89,
    likes: 312,
    views: 1245,
    timeAgo: "1 day ago",
    isHot: false,
    solved: false,
  },
  {
    id: 4,
    category: "showcase" as ForumCategory,
    title: "Meet Luna - my newly adopted shelter cat! 🐱",
    content: "After months of thinking about it, I finally adopted Luna from our local shelter. She's a 3-year-old tabby with the sweetest personality. So happy to give her a forever home!",
    author: { name: "Alex Rivera", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", initials: "AR" },
    replies: 156,
    likes: 534,
    views: 2341,
    timeAgo: "2 days ago",
    isHot: true,
    solved: false,
  },
  {
    id: 5,
    category: "questions" as ForumCategory,
    title: "Best pet insurance options in 2024?",
    content: "Looking into getting pet insurance for my 2-year-old labrador. There are so many options out there. What do you all recommend? What should I look for in coverage?",
    author: { name: "Jordan Lee", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100", initials: "JL" },
    replies: 43,
    likes: 78,
    views: 456,
    timeAgo: "3 days ago",
    isHot: false,
    solved: true,
  },
  {
    id: 6,
    category: "discussions" as ForumCategory,
    title: "Indoor vs outdoor cats - what's your take?",
    content: "This seems to be a hot topic in the cat community. I'm curious what everyone here thinks. My cat is indoor-only but sometimes I wonder if she's missing out...",
    author: { name: "Taylor Kim", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100", initials: "TK" },
    replies: 203,
    likes: 167,
    views: 1890,
    timeAgo: "4 days ago",
    isHot: true,
    solved: false,
  },
];

const getCategoryIcon = (category: ForumCategory) => {
  switch (category) {
    case "questions": return HelpCircle;
    case "discussions": return MessageSquare;
    case "tips": return Lightbulb;
    case "showcase": return Image;
    default: return MessageSquare;
  }
};

const getCategoryColor = (category: ForumCategory) => {
  switch (category) {
    case "questions": return "bg-tertiary/20 text-tertiary border-tertiary/30";
    case "discussions": return "bg-accent/20 text-accent border-accent/30";
    case "tips": return "bg-quaternary/20 text-quaternary border-quaternary/30";
    case "showcase": return "bg-primary/20 text-primary border-primary/30";
    default: return "bg-muted text-muted-foreground";
  }
};

const ForumPostCard = ({ post, index }: { post: typeof posts[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(post.likes);

  const CategoryIcon = getCategoryIcon(post.category);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30, x: index % 2 === 0 ? -20 : 20 }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
    >
      <div className="flex gap-4">
        {/* Vote Section */}
        <div className="hidden sm:flex flex-col items-center gap-1">
          <button 
            onClick={handleLike}
            className={`p-2 rounded-lg transition-all duration-300 ${
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
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8 border-2 border-primary/30">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {post.author.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{post.author.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.timeAgo}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-muted-foreground">
              <button className="flex items-center gap-1 text-sm hover:text-accent transition-colors">
                <MessageCircle className="w-4 h-4" />
                {post.replies}
              </button>
              <span className="flex items-center gap-1 text-sm">
                <Eye className="w-4 h-4" />
                {post.views}
              </span>
              <button 
                onClick={() => setIsBookmarked(!isBookmarked)}
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

const ForumPostList = ({ selectedCategory }: ForumPostListProps) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const filteredPosts = selectedCategory === "all" 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

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
        className="flex items-center justify-between mb-6 bg-card/30 backdrop-blur-sm rounded-xl border border-border/50 p-4"
      >
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">{filteredPosts.length}</span> posts
        </p>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-sm font-medium">
            Hot
          </button>
          <button className="px-3 py-1.5 rounded-lg hover:bg-muted text-muted-foreground text-sm font-medium transition-colors">
            New
          </button>
          <button className="px-3 py-1.5 rounded-lg hover:bg-muted text-muted-foreground text-sm font-medium transition-colors">
            Top
          </button>
        </div>
      </motion.div>

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post, index) => (
          <ForumPostCard key={post.id} post={post} index={index} />
        ))}
      </div>

      {/* Load More */}
      {filteredPosts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <button className="px-8 py-3 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-foreground font-medium hover:from-primary/30 hover:to-accent/30 transition-all duration-300">
            Load More Posts
          </button>
        </motion.div>
      )}

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
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
