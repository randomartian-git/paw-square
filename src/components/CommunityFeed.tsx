import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, PawPrint } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

const initialPosts: Post[] = [
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
];

const accentStyles: Record<string, { ring: string; bg: string; glow: string }> = {
  primary: { ring: "ring-primary/40", bg: "bg-primary", glow: "shadow-glow" },
  accent: { ring: "ring-accent/40", bg: "bg-accent", glow: "shadow-glow-accent" },
  tertiary: { ring: "ring-tertiary/40", bg: "bg-tertiary", glow: "shadow-glow-tertiary" },
};

const PostCard = ({ post, onLike, index }: { post: Post; onLike: (id: number) => void; index: number }) => {
  const accent = accentStyles[post.accentColor] || accentStyles.primary;
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });
  
  // Alternate entrance directions
  const isEven = index % 2 === 0;
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: isEven ? -50 : 50, y: 30 }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`bg-card/80 backdrop-blur-sm rounded-2xl shadow-soft border border-border overflow-hidden hover:shadow-elevated transition-all hover:${accent.glow}`}
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
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
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
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.15 }}
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-2 font-medium transition-colors ${
              post.isLiked ? "text-accent" : "text-muted-foreground hover:text-accent"
            }`}
          >
            <Heart className={`w-5 h-5 ${post.isLiked ? "fill-accent" : ""}`} />
            <span>{post.likes}</span>
          </motion.button>
          <button className="flex items-center gap-2 text-muted-foreground hover:text-tertiary transition-colors font-medium">
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments}</span>
          </button>
        </div>
        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium">
          <Share2 className="w-5 h-5" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </motion.div>
  );
};

const CommunityFeed = () => {
  const [posts, setPosts] = useState(initialPosts);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-60, 60]);
  const x1 = useTransform(scrollYProgress, [0, 1], [40, -40]);

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

  return (
    <section id="community" className="py-20 relative overflow-hidden" ref={containerRef}>
      {/* Animated background decorations */}
      <motion.div 
        className="absolute top-1/4 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl"
        style={{ y: y1, x: x1 }}
      />
      <motion.div 
        className="absolute bottom-1/4 left-0 w-72 h-72 bg-tertiary/10 rounded-full blur-3xl"
        style={{ y: y2 }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/3 w-48 h-48 bg-primary/5 rounded-full blur-3xl"
        style={{ y: y1 }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Community <span className="text-gradient">Feed</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See what pet parents are sharing, get inspired, and join the conversation
          </p>
        </motion.div>

        {/* Create Post Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20, x: -30 }}
          animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-soft border border-border p-4 flex items-center gap-4">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <PawPrint className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-muted/50 rounded-xl px-4 py-3 text-muted-foreground cursor-pointer hover:bg-muted/70 transition-colors border border-border/50">
              Share something with the community...
            </div>
            <Button className="bg-gradient-hero shadow-glow hidden sm:flex hover:shadow-elevated transition-shadow">
              Post
            </Button>
          </div>
        </motion.div>

        {/* Posts Grid */}
        <div className="max-w-2xl mx-auto space-y-6">
          {posts.map((post, index) => (
            <PostCard key={post.id} post={post} onLike={handleLike} index={index} />
          ))}
        </div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Button variant="outline" size="lg" className="font-semibold border-2 hover:border-primary hover:text-primary hover:shadow-glow transition-all">
            Load More Posts
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunityFeed;
