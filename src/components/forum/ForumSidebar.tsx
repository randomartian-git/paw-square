import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  HelpCircle, 
  Lightbulb, 
  Image, 
  Layers,
  Plus,
  TrendingUp,
  Users
} from "lucide-react";
import type { ForumCategory } from "@/pages/Forum";

interface ForumSidebarProps {
  selectedCategory: ForumCategory;
  onCategoryChange: (category: ForumCategory) => void;
  onCreatePost: () => void;
}

const categories = [
  { id: "all" as ForumCategory, label: "All Posts", icon: Layers, color: "from-primary to-accent" },
  { id: "questions" as ForumCategory, label: "Questions", icon: HelpCircle, color: "from-tertiary to-primary" },
  { id: "discussions" as ForumCategory, label: "Discussions", icon: MessageSquare, color: "from-accent to-quaternary" },
  { id: "tips" as ForumCategory, label: "Tips & Advice", icon: Lightbulb, color: "from-quaternary to-tertiary" },
  { id: "showcase" as ForumCategory, label: "Pet Showcase", icon: Image, color: "from-primary to-tertiary" },
];

const trendingTopics = [
  { label: "Best food for puppies", posts: 234 },
  { label: "Cat behavior tips", posts: 189 },
  { label: "Training techniques", posts: 156 },
  { label: "Pet health concerns", posts: 142 },
];

const ForumSidebar = ({ selectedCategory, onCategoryChange, onCreatePost }: ForumSidebarProps) => {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full md:w-72 shrink-0"
    >
      {/* Create Post Button - Desktop */}
      <Button 
        onClick={onCreatePost}
        className="hidden md:flex w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 mb-6"
      >
        <Plus className="w-5 h-5 mr-2" />
        Create Post
      </Button>

      {/* Categories */}
      <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-4 mb-6">
        <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          Categories
        </h3>
        <div className="space-y-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isSelected 
                    ? "bg-gradient-to-r " + category.color + " text-white shadow-lg" 
                    : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-4 mb-6">
        <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          Trending Topics
        </h3>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <motion.button
              key={topic.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="w-full text-left group"
            >
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                #{topic.label.replace(/\s+/g, '')}
              </p>
              <p className="text-xs text-muted-foreground/60">{topic.posts} posts</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Community Stats */}
      <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl border border-primary/30 p-4">
        <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Community Stats
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              12.5K
            </p>
            <p className="text-xs text-muted-foreground">Members</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold bg-gradient-to-r from-accent to-tertiary bg-clip-text text-transparent">
              3.2K
            </p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold bg-gradient-to-r from-tertiary to-quaternary bg-clip-text text-transparent">
              856
            </p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold bg-gradient-to-r from-quaternary to-primary bg-clip-text text-transparent">
              98%
            </p>
            <p className="text-xs text-muted-foreground">Helpful</p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default ForumSidebar;
