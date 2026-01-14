import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Dog, Cat, Bird, Fish, Rabbit, Sparkles, Upload, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

const petTypes = [
  { id: "dog", name: "Dog", icon: Dog },
  { id: "cat", name: "Cat", icon: Cat },
  { id: "bird", name: "Bird", icon: Bird },
  { id: "fish", name: "Fish", icon: Fish },
  { id: "rabbit", name: "Rabbit", icon: Rabbit },
  { id: "other", name: "Other", icon: Sparkles },
];

const AddPet = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [petType, setPetType] = useState("dog");
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be less than 5MB", variant: "destructive" });
      return;
    }

    setPhotoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile || !user) return null;

    setIsUploading(true);
    
    const fileExt = photoFile.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("pet-photos")
      .upload(fileName, photoFile);

    setIsUploading(false);

    if (error) {
      console.error("Upload error:", error);
      toast({ title: "Error uploading photo", description: error.message, variant: "destructive" });
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("pet-photos")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!name.trim()) {
      toast({ title: "Please enter your pet's name", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    // Upload photo if selected
    let photoUrl: string | null = null;
    if (photoFile) {
      photoUrl = await uploadPhoto();
    }

    const { error } = await supabase.from("pets").insert({
      user_id: user.id,
      name: name.trim(),
      type: petType,
      breed: breed.trim() || null,
      age_years: age ? parseInt(age) : null,
      photo_url: photoUrl,
    });

    if (error) {
      toast({ title: "Error adding pet", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Pet added successfully! 🐾" });
      navigate("/profile");
    }
    setIsSubmitting(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 text-center">
          <h1 className="text-2xl font-bold">Sign in required</h1>
          <p className="text-muted-foreground mt-2">Please sign in to add a pet.</p>
          <Button onClick={() => navigate("/auth")} className="mt-6">
            Sign In
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              onClick={() => navigate("/profile")}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <h1 className="text-2xl font-display font-bold">Add New Pet</h1>
              <p className="text-muted-foreground mt-1">Tell us about your furry (or scaly) friend!</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Photo Upload */}
              <div>
                <Label className="mb-3 block">Pet Photo</Label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {photoPreview ? (
                      <div className="relative w-32 h-32 rounded-2xl overflow-hidden">
                        <img
                          src={photoPreview}
                          alt="Pet preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute top-1 right-1 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-32 h-32 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer">
                        <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">Add Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <div className="flex-1 text-sm text-muted-foreground">
                    <p>Upload a cute photo of your pet!</p>
                    <p className="mt-1">Max file size: 5MB</p>
                    <p>Formats: JPG, PNG, WebP</p>
                  </div>
                </div>
              </div>

              {/* Pet Type */}
              <div>
                <Label className="mb-3 block">Pet Type *</Label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {petTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = petType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setPetType(type.id)}
                        className={`p-3 rounded-xl border-2 transition-all text-center ${
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-1 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-xs ${isSelected ? "text-primary font-medium" : "text-muted-foreground"}`}>
                          {type.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="petName">Pet Name *</Label>
                <Input
                  id="petName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your pet's name"
                  className="mt-2"
                />
              </div>

              {/* Breed */}
              <div>
                <Label htmlFor="breed">Breed (optional)</Label>
                <Input
                  id="breed"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="e.g., Golden Retriever, Siamese, etc."
                  className="mt-2"
                />
              </div>

              {/* Age */}
              <div>
                <Label htmlFor="age">Age in years (optional)</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g., 3"
                  min="0"
                  max="30"
                  className="mt-2"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/profile")} 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isUploading} 
                  className="flex-1 bg-gradient-to-r from-primary to-accent"
                >
                  {isUploading ? "Uploading..." : isSubmitting ? "Adding..." : "Add Pet"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AddPet;