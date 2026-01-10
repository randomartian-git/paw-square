import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, PawPrint } from "lucide-react";
import { useState } from "react";
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
  },
];

const PostCard = ({ post, onLike }: { post: Post; onLike: (id: number) => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-2xl shadow-soft border border-border overflow-hidden hover:shadow-elevated transition-shadow"
    >
      {/* Post Header */}
      <div className="p-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 ring-2 ring-primary/20">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
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
        <div className="relative aspect-video bg-muted">
          <img
            src={post.image}
            alt="Post"
            className="w-full h-full object-cover"
          />
        </div>
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
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments}</span>
          </button>
        </div>
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
          <Share2 className="w-5 h-5" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </motion.div>
  );
};

const CommunityFeed = () => {
  const [posts, setPosts] = useState(initialPosts);

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
    <section id="community" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="bg-card rounded-2xl shadow-soft border border-border p-4 flex items-center gap-4">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <PawPrint className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-muted rounded-xl px-4 py-3 text-muted-foreground cursor-pointer hover:bg-muted/70 transition-colors">
              Share something with the community...
            </div>
            <Button className="bg-gradient-hero shadow-glow hidden sm:flex">
              Post
            </Button>
          </div>
        </motion.div>

        {/* Posts Grid */}
        <div className="max-w-2xl mx-auto space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLike} />
          ))}
        </div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Button variant="outline" size="lg" className="font-semibold">
            Load More Posts
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunityFeed;