import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HelpCircle, MessageSquare, Lightbulb, Image, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PostType = "question" | "discussion" | "tip" | "showcase";

const postTypes = [
  { id: "question" as PostType, label: "Question", icon: HelpCircle, description: "Ask for help or advice", color: "from-tertiary to-primary" },
  { id: "discussion" as PostType, label: "Discussion", icon: MessageSquare, description: "Start a conversation", color: "from-accent to-quaternary" },
  { id: "tip" as PostType, label: "Tip & Advice", icon: Lightbulb, description: "Share your knowledge", color: "from-quaternary to-tertiary" },
  { id: "showcase" as PostType, label: "Pet Showcase", icon: Image, description: "Show off your pet", color: "from-primary to-accent" },
];

const CreatePostModal = ({ isOpen, onClose }: CreatePostModalProps) => {
  const [selectedType, setSelectedType] = useState<PostType>("discussion");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please add a title for your post");
      return;
    }
    if (!content.trim()) {
      toast.error("Please add some content to your post");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Post created successfully! 🎉");
    setTitle("");
    setContent("");
    setTags("");
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    if (title.trim() || content.trim()) {
      if (confirm("Are you sure you want to discard this post?")) {
        setTitle("");
        setContent("");
        setTags("");
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-display font-bold text-foreground">
                Create New Post
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Post Type Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  What type of post is this?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {postTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;
                    
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                          isSelected
                            ? `border-primary bg-gradient-to-br ${type.color} bg-opacity-20`
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <div className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                          isSelected ? "bg-white/20" : "bg-muted"
                        }`}>
                          <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-muted-foreground"}`} />
                        </div>
                        <p className={`font-medium text-sm ${isSelected ? "text-white" : "text-foreground"}`}>
                          {type.label}
                        </p>
                        <p className={`text-xs mt-1 ${isSelected ? "text-white/70" : "text-muted-foreground"}`}>
                          {type.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your post a catchy title..."
                  className="bg-muted/50 border-border focus:border-primary"
                  maxLength={150}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {title.length}/150
                </p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Content
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts, questions, or experiences..."
                  className="bg-muted/50 border-border focus:border-primary min-h-[150px] resize-none"
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {content.length}/2000
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tags (optional)
                </label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Add tags separated by commas (e.g., dogs, training, puppies)"
                  className="bg-muted/50 border-border focus:border-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tags help others find your post
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
              <Button
                variant="ghost"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Publish Post
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;
