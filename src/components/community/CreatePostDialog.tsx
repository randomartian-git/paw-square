import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, HelpCircle, MessageSquare, Lightbulb, Camera, AlertTriangle,
  Dog, Cat, Bird, Fish, Rabbit, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

const postTypes = [
  { id: "question", label: "Question", icon: HelpCircle, color: "bg-blue-500/20 text-blue-400" },
  { id: "discussion", label: "Discussion", icon: MessageSquare, color: "bg-purple-500/20 text-purple-400" },
  { id: "tip", label: "Tip", icon: Lightbulb, color: "bg-yellow-500/20 text-yellow-400" },
  { id: "photo", label: "Photo", icon: Camera, color: "bg-green-500/20 text-green-400" },
  { id: "emergency", label: "Emergency", icon: AlertTriangle, color: "bg-red-500/20 text-red-400" },
];

const petTypes = [
  { id: "dog", label: "Dog", icon: Dog },
  { id: "cat", label: "Cat", icon: Cat },
  { id: "bird", label: "Bird", icon: Bird },
  { id: "fish", label: "Fish", icon: Fish },
  { id: "rabbit", label: "Rabbit", icon: Rabbit },
  { id: "other", label: "Other", icon: Sparkles },
  { id: "all", label: "All Pets", icon: Sparkles },
];

const topics = ["health", "training", "food", "adoption", "emergencies", "general"];

const CreatePostDialog = ({ isOpen, onClose, onPostCreated }: CreatePostDialogProps) => {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [petType, setPetType] = useState("");
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setTags([...tags, tag]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create a post",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!title.trim() || !content.trim() || !category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      category,
      pet_type: petType || null,
      topic: topic || null,
      tags: tags.length > 0 ? tags : null,
    });

    if (error) {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Post created! 🎉",
        description: "Your post has been shared with the community",
      });
      handleClose();
      onPostCreated();
    }

    setLoading(false);
  };

  const handleClose = () => {
    setStep(1);
    setCategory("");
    setPetType("");
    setTopic("");
    setTitle("");
    setContent("");
    setTags([]);
    setTagInput("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-elevated max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
            <div>
              <h2 className="text-xl font-display font-bold">Create a Post</h2>
              <p className="text-sm text-muted-foreground">Step {step} of 3</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Select Post Type */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <Label className="text-base font-semibold mb-4 block">What type of post is this?</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {postTypes.map((type) => (
                        <motion.button
                          key={type.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setCategory(type.id)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            category === type.id
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <type.icon className={`w-8 h-8 mx-auto mb-2 ${type.color.split(" ")[1]}`} />
                          <p className="font-medium text-sm">{type.label}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-4 block">Which pet is this about?</Label>
                    <div className="flex flex-wrap gap-2">
                      {petTypes.map((type) => (
                        <Button
                          key={type.id}
                          variant={petType === type.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPetType(type.id)}
                          className="capitalize"
                        >
                          <type.icon className="w-4 h-4 mr-1" />
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-4 block">Topic (optional)</Label>
                    <div className="flex flex-wrap gap-2">
                      {topics.map((t) => (
                        <Badge
                          key={t}
                          variant={topic === t ? "default" : "outline"}
                          className="cursor-pointer capitalize"
                          onClick={() => setTopic(topic === t ? "" : t)}
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!category}
                      className="bg-gradient-hero"
                    >
                      Next
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Write Content */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <Label htmlFor="title" className="text-base font-semibold mb-2 block">
                      Title *
                    </Label>
                    <Input
                      id="title"
                      placeholder="What's on your mind?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{title.length}/200</p>
                  </div>

                  <div>
                    <Label htmlFor="content" className="text-base font-semibold mb-2 block">
                      Content *
                    </Label>
                    <Textarea
                      id="content"
                      placeholder="Share more details..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={6}
                      maxLength={5000}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{content.length}/5000</p>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="ghost" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!title.trim() || !content.trim()}
                      className="bg-gradient-hero"
                    >
                      Next
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Add Tags & Preview */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <Label htmlFor="tags" className="text-base font-semibold mb-2 block">
                      Add Tags (optional)
                    </Label>
                    <Input
                      id="tags"
                      placeholder="Type and press Enter (max 5)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      disabled={tags.length >= 5}
                    />
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            #{tag} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Preview */}
                  <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-sm text-muted-foreground mb-2">Preview</p>
                    <div className="flex gap-2 mb-2">
                      <Badge className="capitalize">{category}</Badge>
                      {petType && <Badge variant="outline" className="capitalize">{petType}</Badge>}
                      {topic && <Badge variant="outline" className="capitalize">{topic}</Badge>}
                    </div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{content}</p>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="ghost" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-gradient-hero shadow-glow"
                    >
                      {loading ? "Posting..." : "Share with Community"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreatePostDialog;
