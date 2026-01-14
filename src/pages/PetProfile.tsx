import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Dog, 
  Cat, 
  Bird, 
  Fish, 
  Rabbit, 
  Sparkles, 
  Calendar, 
  Share2,
  MapPin,
  Heart,
  Plus,
  X,
  Trash2,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { formatDistanceToNow } from "date-fns";

type Pet = {
  id: string;
  name: string;
  type: string;
  breed: string | null;
  age_years: number | null;
  photo_url: string | null;
  user_id: string;
  created_at: string;
};

type Owner = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  location: string | null;
};

type PetPhoto = {
  id: string;
  photo_url: string;
  caption: string | null;
  created_at: string;
};

const petTypeIcons: Record<string, any> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  fish: Fish,
  rabbit: Rabbit,
  hamster: Sparkles,
  other: Sparkles,
};

const petTypeColors: Record<string, string> = {
  dog: "from-amber-500 to-orange-500",
  cat: "from-purple-500 to-pink-500",
  bird: "from-sky-500 to-cyan-500",
  fish: "from-blue-500 to-indigo-500",
  rabbit: "from-pink-400 to-rose-500",
  hamster: "from-yellow-500 to-amber-500",
  other: "from-primary to-accent",
};

const PetProfile = () => {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [photos, setPhotos] = useState<PetPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const isOwner = user && pet && user.id === pet.user_id;

  useEffect(() => {
    if (petId) fetchPetData();
  }, [petId]);

  const fetchPetData = async () => {
    if (!petId) return;
    setLoading(true);

    const [petRes, photosRes] = await Promise.all([
      supabase.from("pets").select("*").eq("id", petId).maybeSingle(),
      supabase.from("pet_photos").select("*").eq("pet_id", petId).order("created_at", { ascending: false })
    ]);

    if (petRes.error || !petRes.data) {
      setLoading(false);
      return;
    }

    setPet(petRes.data);
    if (photosRes.data) setPhotos(photosRes.data);

    // Fetch owner profile
    const { data: ownerData } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url, location")
      .eq("user_id", petRes.data.user_id)
      .maybeSingle();

    if (ownerData) setOwner(ownerData);
    setLoading(false);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/pet/${petId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard!" });
    } catch {
      toast({ title: "Failed to copy link", variant: "destructive" });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pet || !user) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${pet.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("pet-photos")
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage.from("pet-photos").getPublicUrl(fileName);

    const { error: insertError } = await supabase.from("pet_photos").insert({
      pet_id: pet.id,
      user_id: user.id,
      photo_url: publicUrl.publicUrl
    });

    if (insertError) {
      toast({ title: "Error saving photo", description: insertError.message, variant: "destructive" });
    } else {
      toast({ title: "Photo added!" });
      fetchPetData();
    }
    
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeletePhoto = async (photoId: string, photoUrl: string) => {
    if (!user) return;

    // Extract file path from URL
    const urlParts = photoUrl.split("/pet-photos/");
    if (urlParts[1]) {
      await supabase.storage.from("pet-photos").remove([urlParts[1]]);
    }

    const { error } = await supabase.from("pet_photos").delete().eq("id", photoId);
    
    if (error) {
      toast({ title: "Error deleting photo", variant: "destructive" });
    } else {
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      toast({ title: "Photo deleted" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24">
          <div className="max-w-4xl mx-auto animate-pulse space-y-6">
            <div className="aspect-square max-h-[500px] bg-muted rounded-2xl" />
            <div className="h-32 bg-muted rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Pet not found</h1>
            <p className="text-muted-foreground mt-2">
              This pet profile doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate(-1)} className="mt-6">
              Go Back
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const PetIcon = petTypeIcons[pet.type] || Sparkles;
  const gradientColor = petTypeColors[pet.type] || petTypeColors.other;
  const mainPhoto = pet.photo_url;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 flex items-center justify-between"
          >
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </motion.div>

          {/* Main Pet Photo - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden bg-card border border-border mb-6"
          >
            <div className={`aspect-square sm:aspect-[4/3] max-h-[500px] bg-gradient-to-br ${gradientColor} flex items-center justify-center`}>
              {mainPhoto ? (
                <img
                  src={mainPhoto}
                  alt={pet.name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setSelectedPhoto(mainPhoto)}
                />
              ) : (
                <PetIcon className="w-32 h-32 text-white/80" />
              )}
            </div>
            
            {/* Pet Name Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-white">{pet.name}</h1>
                <Badge className={`bg-white/20 backdrop-blur-sm text-white border-0 capitalize`}>
                  {pet.type}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-white/80 text-sm flex-wrap">
                {pet.breed && (
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {pet.breed}
                  </span>
                )}
                {pet.age_years && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {pet.age_years} {pet.age_years === 1 ? "year" : "years"} old
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Info */}
            <div className="space-y-6">
              {/* Owner Card */}
              {owner && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card rounded-xl border border-border p-5"
                >
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Pet Parent</h3>
                  <div 
                    className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 -mx-2 -my-1 px-2 py-1 rounded-lg transition-colors"
                    onClick={() => navigate(`/profile/${owner.user_id}`)}
                  >
                    <Avatar className="w-12 h-12 border-2 border-primary/30">
                      <AvatarImage src={owner.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        {owner.display_name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold hover:text-primary transition-colors">
                        {owner.display_name || "Pet Lover"}
                      </p>
                      {owner.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {owner.location}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Details Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-xl border border-border p-5"
              >
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium capitalize flex items-center gap-2">
                      <PetIcon className="w-4 h-4" />
                      {pet.type}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Breed</span>
                    <span className="font-medium">{pet.breed || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Age</span>
                    <span className="font-medium">
                      {pet.age_years 
                        ? `${pet.age_years} ${pet.age_years === 1 ? "year" : "years"}` 
                        : "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-medium text-sm">
                      {formatDistanceToNow(new Date(pet.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Photo Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    Photo Gallery
                  </h3>
                  {isOwner && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <Button
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="gap-2"
                      >
                        {uploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        Add Photo
                      </Button>
                    </>
                  )}
                </div>

                {photos.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No photos yet</p>
                    {isOwner && (
                      <p className="text-sm mt-1">Add some photos of {pet.name}!</p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photos.map((photo) => (
                      <div 
                        key={photo.id} 
                        className="relative group aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
                        onClick={() => setSelectedPhoto(photo.photo_url)}
                      >
                        <img
                          src={photo.photo_url}
                          alt={`${pet.name} photo`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        {isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePhoto(photo.id, photo.photo_url);
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="w-6 h-6" />
            </Button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedPhoto}
              alt={pet.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PetProfile;
