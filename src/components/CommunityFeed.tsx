import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, PawPrint } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  pet_type: string | null;
  author?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

const accentStyles = [
  { ring: "ring-primary/40", bg: "bg-primary" },
  { ring: "ring-accent/40", bg: "bg-accent" },
  { ring: "ring-tertiary/40", bg: "bg-tertiary" },
];

const PostCard = ({ post, index }: { post: Post; index: number }) => {
  const accent = accentStyles[index % accentStyles.length];
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard!" });
    } catch {
      toast({ title: "Failed to copy link", variant: "destructive" });
    }
  };
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-soft border border-border overflow-hidden hover:shadow-elevated transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/post/${post.id}`)}
    >
      {/* Post Header */}
      <div className="p-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className={`w-12 h-12 ring-2 ${accent.ring}`}>
            <AvatarImage src={post.author?.avatar_url || undefined} alt={post.author?.display_name || "User"} />
            <AvatarFallback className={accent.bg}>
              {post.author?.display_name?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-foreground">{post.author?.display_name || "Anonymous"}</h4>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <PawPrint className="w-3 h-3" />
              {post.pet_type || "Pet Lover"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
          <button 
            onClick={(e) => e.stopPropagation()}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-5 pb-4">
        <h3 className="font-semibold text-foreground mb-2">{post.title}</h3>
        <p className="text-foreground leading-relaxed line-clamp-3">{post.content}</p>
      </div>

      {/* Post Image */}
      {post.image_url && (
        <motion.div 
          className="relative aspect-video bg-muted overflow-hidden"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <img
            src={post.image_url}
            alt="Post"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/20 to-transparent" />
        </motion.div>
      )}

      {/* Post Actions */}
      <div className="p-4 flex items-center justify-between border-t border-border">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-medium text-muted-foreground">
            <Heart className="w-5 h-5" />
            <span>{post.likes_count}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments_count}</span>
          </div>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const navigate = useNavigate();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-60, 100]);
  const x1 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const x2 = useTransform(scrollYProgress, [0, 1], [-60, 60]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data: postsData, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) {
        console.error("Error fetching posts:", error);
        setLoading(false);
        return;
      }

      if (postsData && postsData.length > 0) {
        // Fetch author profiles
        const userIds = [...new Set(postsData.map(p => p.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", userIds);

        const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        const enrichedPosts = postsData.map(post => ({
          ...post,
          author: profilesMap.get(post.user_id) || { display_name: null, avatar_url: null },
        }));

        setPosts(enrichedPosts);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <section id="community" className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Community <span className="text-gradient">Feed</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See what pet parents are sharing, get inspired, and join the conversation
            </p>
          </div>
          <div className="max-w-2xl mx-auto space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section id="community" className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Community <span className="text-gradient">Feed</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              No posts yet. Be the first to share something with the community! 🐾
            </p>
            <Button 
              onClick={() => navigate("/community")}
              className="bg-gradient-hero"
            >
              Go to Community
            </Button>
          </div>
        </div>
      </section>
    );
  }

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
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
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
          {posts.slice(0, 3).map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
        </div>

        {/* See More */}
        <motion.div
          initial={{ opacity: 1 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Button 
            onClick={() => navigate("/community")}
            variant="outline" 
            size="lg" 
            className="font-semibold border-2 hover:border-primary hover:text-primary hover:shadow-glow transition-all"
          >
            See More Posts in Community
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunityFeed;
