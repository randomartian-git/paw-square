import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, PawPrint } from "lucide-react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import CreatePostModal from "@/components/forum/CreatePostModal";

interface Post {
  id: number;
  author: {
    name: string;
    avatar: string;
    petName: string;
    petType: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked: boolean;
  accentColor: string;
}

const allPosts: Post[] = [
  {
    id: 1,
    author: {
      name: "Sarah Mitchell",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      petName: "Max",
      petType: "Golden Retriever",
    },
    content: "Max just learned his 10th trick today! 🎉 So proud of this fluffy boy. Any suggestions for trick #11? We've mastered sit, stay, shake, roll over, play dead, spin, bow, high five, crawl, and speak!",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=400&fit=crop",
    likes: 234,
    comments: 45,
    timeAgo: "2 hours ago",
    isLiked: false,
    accentColor: "primary",
  },
  {
    id: 2,
    author: {
      name: "James Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      petName: "Luna",
      petType: "Tabby Cat",
    },
    content: "Does anyone else's cat absolutely REFUSE to use the expensive cat bed you bought? Luna prefers the cardboard box it came in. 📦😂 Cat parent struggles are real!",
    likes: 567,
    comments: 89,
    timeAgo: "4 hours ago",
    isLiked: true,
    accentColor: "accent",
  },
  {
    id: 3,
    author: {
      name: "Emma Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      petName: "Buddy",
      petType: "Beagle",
    },
    content: "Just adopted Buddy from the local shelter! He's a bit shy but already loves belly rubs. Any tips for helping a rescue dog adjust to their new home? 🏠❤️",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop",
    likes: 892,
    comments: 156,
    timeAgo: "6 hours ago",
    isLiked: false,
    accentColor: "tertiary",
  },
  {
    id: 4,
    author: {
      name: "Alex Kim",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      petName: "Whiskers",
      petType: "Persian Cat",
    },
    content: "Whiskers has discovered the joy of knocking things off tables. My favorite mug didn't survive. 😭 Anyone else dealing with a mischievous kitty?",
    likes: 423,
    comments: 67,
    timeAgo: "8 hours ago",
    isLiked: false,
    accentColor: "primary",
  },
  {
    id: 5,
    author: {
      name: "Maria Santos",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
      petName: "Rocky",
      petType: "German Shepherd",
    },
    content: "Morning hikes with Rocky are the best way to start the day! 🌄 He's such a good trail buddy.",
    image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=600&h=400&fit=crop",
    likes: 678,
    comments: 34,
    timeAgo: "12 hours ago",
    isLiked: true,
    accentColor: "accent",
  },
  {
    id: 6,
    author: {
      name: "David Park",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      petName: "Coco",
      petType: "Poodle",
    },
    content: "Coco just got her summer haircut! She seems so happy and is running around like crazy. Fresh trim energy is real! ✂️🐩",
    likes: 345,
    comments: 28,
    timeAgo: "1 day ago",
    isLiked: false,
    accentColor: "tertiary",
  },
];

const accentStyles: Record<string, { ring: string; bg: string; glow: string }> = {
  primary: { ring: "ring-primary/40", bg: "bg-primary", glow: "shadow-glow" },
  accent: { ring: "ring-accent/40", bg: "bg-accent", glow: "shadow-glow-accent" },
  tertiary: { ring: "ring-tertiary/40", bg: "bg-tertiary", glow: "shadow-glow-tertiary" },
};

const PostCard = ({ post, onLike, onShare, index }: { post: Post; onLike: (id: number) => void; onShare: (post: Post) => void; index: number }) => {
  const accent = accentStyles[post.accentColor] || accentStyles.primary;
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });
  const navigate = useNavigate();
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className={`bg-card/80 backdrop-blur-sm rounded-2xl shadow-soft border border-border overflow-hidden hover:shadow-elevated transition-all duration-300`}
    >
      {/* Post Header */}
      <div className="p-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className={`w-12 h-12 ring-2 ${accent.ring}`}>
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback className={accent.bg}>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-foreground">{post.author.name}</h4>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <PawPrint className="w-3 h-3" />
              {post.author.petName} • {post.author.petType}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
          <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-5 pb-4">
        <p className="text-foreground leading-relaxed">{post.content}</p>
      </div>

      {/* Post Image */}
      {post.image && (
        <motion.div 
          className="relative aspect-video bg-muted overflow-hidden"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <img
            src={post.image}
            alt="Post"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/20 to-transparent" />
        </motion.div>
      )}

      {/* Post Actions */}
      <div className="p-4 flex items-center justify-between border-t border-border">
        <div className="flex items-center gap-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-2 font-medium transition-colors ${
              post.isLiked ? "text-accent" : "text-muted-foreground hover:text-accent"
            }`}
          >
            <Heart className={`w-5 h-5 ${post.isLiked ? "fill-accent" : ""}`} />
            <span>{post.likes}</span>
          </motion.button>
          <button 
            onClick={() => navigate("/forum")}
            className="flex items-center gap-2 text-muted-foreground hover:text-tertiary transition-colors font-medium"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments}</span>
          </button>
        </div>
        <button 
          onClick={() => onShare(post)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
        >
          <Share2 className="w-5 h-5" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </motion.div>
  );
};

const CommunityFeed = () => {
  const [posts, setPosts] = useState(allPosts.slice(0, 3));
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loadedCount, setLoadedCount] = useState(3);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-60, 100]);
  const x1 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const x2 = useTransform(scrollYProgress, [0, 1], [-60, 60]);

  const handleLike = (id: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleShare = async (post: Post) => {
    const url = `${window.location.origin}/forum`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard!" });
    } catch {
      toast({ title: "Failed to copy link", variant: "destructive" });
    }
  };

  const handleLoadMore = () => {
    const newCount = Math.min(loadedCount + 3, allPosts.length);
    setPosts(allPosts.slice(0, newCount));
    setLoadedCount(newCount);
  };

  return (
    <section id="community" className="py-20 relative overflow-hidden" ref={containerRef}>
      {/* Animated background decorations */}
      <motion.div 
        className="absolute top-1/4 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl"
        style={{ y: y1, x: x1 }}
      />
      <motion.div 
        className="absolute bottom-1/4 left-0 w-72 h-72 bg-tertiary/10 rounded-full blur-3xl"
        style={{ y: y2, x: x2 }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/3 w-48 h-48 bg-primary/5 rounded-full blur-3xl"
        style={{ y: y1 }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Community <span className="text-gradient">Feed</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See what pet parents are sharing, get inspired, and join the conversation
          </p>
        </motion.div>


        {/* Posts Grid */}
        <div className="max-w-2xl mx-auto space-y-6">
          {posts.map((post, index) => (
            <PostCard key={post.id} post={post} onLike={handleLike} onShare={handleShare} index={index} />
          ))}
        </div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          {loadedCount < allPosts.length ? (
            <Button 
              onClick={handleLoadMore}
              variant="outline" 
              size="lg" 
              className="font-semibold border-2 hover:border-primary hover:text-primary hover:shadow-glow transition-all"
            >
              Load More Posts
            </Button>
          ) : (
            <Button 
              onClick={() => navigate("/community")}
              variant="outline" 
              size="lg" 
              className="font-semibold border-2 hover:border-primary hover:text-primary hover:shadow-glow transition-all"
            >
              See More Posts in Community
            </Button>
          )}
        </motion.div>
      </div>

      <CreatePostModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </section>
  );
};

export default CommunityFeed;
