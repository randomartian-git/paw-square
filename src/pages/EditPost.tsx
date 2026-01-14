import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Upload, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";

const EditPost = () => {
  const { postId } = useParams<{ postId: string }>();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [category, setCategory] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    if (!postId) return;

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .maybeSingle();

    if (error || !data) {
      toast({ title: "Post not found", variant: "destructive" });
      navigate("/community");
      return;
    }

    // Check ownership
    if (data.user_id !== user?.id) {
      toast({ title: "You can only edit your own posts", variant: "destructive" });
      navigate(`/post/${postId}`);
      return;
    }

    setTitle(data.title);
    setContent(data.content);
    setTags(data.tags || []);
    setCategory(data.category);
    setExistingImageUrl(data.image_url);
    setImagePreview(data.image_url);
    setFetching(false);
  };

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be less than 5MB", variant: "destructive" });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !user) return existingImageUrl;

    setUploadingImage(true);
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("post-images")
      .upload(fileName, imageFile);

    setUploadingImage(false);

    if (error) {
      toast({ title: "Error uploading image", description: error.message, variant: "destructive" });
      return existingImageUrl;
    }

    const { data: urlData } = supabase.storage
      .from("post-images")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    if (!user || !postId) {
      toast({
        title: "Error",
        description: "Unable to update post",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    let imageUrl: string | null = existingImageUrl;
    if (imageFile) {
      imageUrl = await uploadImage();
    } else if (!imagePreview) {
      imageUrl = null;
    }

    const { error } = await supabase
      .from("posts")
      .update({
        title: title.trim(),
        content: content.trim(),
        tags: tags.length > 0 ? tags : null,
        image_url: imageUrl,
      })
      .eq("id", postId);

    if (error) {
      toast({
        title: "Error updating post",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Post updated! ✨",
        description: "Your changes have been saved",
      });
      navigate(`/post/${postId}`);
    }

    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-64 bg-muted rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -15, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-40 left-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
        />
      </div>

      <main className="relative pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-border">
              <h1 className="text-2xl font-display font-bold">Edit Post</h1>
              <p className="text-muted-foreground">Update your post details</p>
            </div>

            <div className="p-6 space-y-6">
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

              {/* Image Upload for Photo/Showcase category */}
              {category === "photo" && (
                <div>
                  <Label className="text-base font-semibold mb-2 block">
                    Photo
                  </Label>
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full max-h-64 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload an image
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                    </label>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="tags" className="text-base font-semibold mb-2 block">
                  Tags (optional)
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

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || uploadingImage || !title.trim() || !content.trim()}
                  className="bg-gradient-to-r from-primary to-accent"
                >
                  {loading || uploadingImage ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default EditPost;
