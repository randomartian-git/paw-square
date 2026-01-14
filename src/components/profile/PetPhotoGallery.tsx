import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, ChevronLeft, ChevronRight, Dog, Cat, Bird, Fish, Rabbit, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Pet = {
  id: string;
  name: string;
  type: string;
  breed: string | null;
  age_years: number | null;
  photo_url: string | null;
};

interface PetPhotoGalleryProps {
  pet: Pet | null;
  isOpen: boolean;
  onClose: () => void;
  onPhotoUpdated: () => void;
}

const petTypeIcons: Record<string, any> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  fish: Fish,
  rabbit: Rabbit,
  hamster: Sparkles,
  other: Sparkles,
};

const PetPhotoGallery = ({ pet, isOpen, onClose, onPhotoUpdated }: PetPhotoGalleryProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<{ id: string; photo_url: string }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (pet && isOpen) {
      fetchPhotos();
    }
  }, [pet, isOpen]);

  const fetchPhotos = async () => {
    if (!pet) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("pet_photos")
      .select("id, photo_url")
      .eq("pet_id", pet.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching photos:", error);
      setPhotos([]);
    } else {
      const photoList = data || [];
      
      // Add the main photo if it exists and isn't already in the list
      if (pet.photo_url && !photoList.some(p => p.photo_url === pet.photo_url)) {
        photoList.unshift({ id: "main", photo_url: pet.photo_url });
      }
      
      setPhotos(photoList);
    }
    setIsLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pet || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be less than 5MB", variant: "destructive" });
      return;
    }

    setIsUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${pet.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("pet-photos")
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: "Error uploading photo", description: uploadError.message, variant: "destructive" });
    } else {
      // Get the public URL and save to pet_photos table
      const { data: publicUrl } = supabase.storage.from("pet-photos").getPublicUrl(fileName);
      
      const { error: insertError } = await supabase.from("pet_photos").insert({
        pet_id: pet.id,
        user_id: user.id,
        photo_url: publicUrl.publicUrl
      });

      if (insertError) {
        toast({ title: "Error saving photo", description: insertError.message, variant: "destructive" });
      } else {
        toast({ title: "Photo uploaded! 📸" });
        fetchPhotos();
        onPhotoUpdated();
      }
    }

    setIsUploading(false);
    e.target.value = "";
  };

  const handleDelete = async (photo: { id: string; photo_url: string }) => {
    if (!user || !pet) return;

    // Don't delete from DB if it's just the main photo entry
    if (photo.id !== "main") {
      // Delete from pet_photos table
      const { error: dbError } = await supabase
        .from("pet_photos")
        .delete()
        .eq("id", photo.id);

      if (dbError) {
        toast({ title: "Error deleting photo", description: dbError.message, variant: "destructive" });
        return;
      }
    }

    // Extract the path from the URL and delete from storage
    const urlParts = photo.photo_url.split("/pet-photos/");
    if (urlParts.length >= 2) {
      const filePath = decodeURIComponent(urlParts[1]);
      await supabase.storage.from("pet-photos").remove([filePath]);
    }

    toast({ title: "Photo deleted" });
    
    // Update the main photo if we deleted it
    if (pet.photo_url === photo.photo_url) {
      const newPhotos = photos.filter((p) => p.photo_url !== photo.photo_url);
      await supabase
        .from("pets")
        .update({ photo_url: newPhotos[0]?.photo_url || null })
        .eq("id", pet.id);
      onPhotoUpdated();
    }
    
    fetchPhotos();
    setSelectedIndex((prev) => Math.max(0, prev - 1));
  };

  const handleSetMainPhoto = async (photoUrl: string) => {
    if (!pet) return;

    const { error } = await supabase
      .from("pets")
      .update({ photo_url: photoUrl })
      .eq("id", pet.id);

    if (error) {
      toast({ title: "Error updating photo", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Main photo updated! 🌟" });
      onPhotoUpdated();
    }
  };

  const PetIcon = pet ? petTypeIcons[pet.type] || Sparkles : Sparkles;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PetIcon className="w-5 h-5 text-primary" />
            {pet?.name}'s Photo Gallery
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Main Photo Display */}
          <div className="relative aspect-video bg-muted rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            ) : photos.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={photos[selectedIndex].id}
                    src={photos[selectedIndex].photo_url}
                    alt={`${pet?.name} photo ${selectedIndex + 1}`}
                    className="w-full h-full object-contain"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </AnimatePresence>

                {photos.length > 1 && (
                  <>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute left-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
                      onClick={() => setSelectedIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
                      onClick={() => setSelectedIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </>
                )}

                {/* Photo Actions */}
                <div className="absolute bottom-2 right-2 flex gap-2">
                  {photos[selectedIndex].photo_url !== pet?.photo_url && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSetMainPhoto(photos[selectedIndex].photo_url)}
                    >
                      Set as Main
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => handleDelete(photos[selectedIndex])}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Photo Counter */}
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-background/80 text-sm">
                  {selectedIndex + 1} / {photos.length}
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <PetIcon className="w-12 h-12 mb-2" />
                <p>No photos yet</p>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedIndex(index)}
                  className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === selectedIndex
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent hover:border-muted-foreground"
                  }`}
                >
                  <img src={photo.photo_url} alt="" className="w-full h-full object-cover" />
                  {photo.photo_url === pet?.photo_url && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-primary-foreground bg-primary px-1 rounded">
                        MAIN
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-center">
            <label>
              <Button asChild variant="outline" disabled={isUploading}>
                <span className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "Uploading..." : "Add Photo"}
                </span>
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PetPhotoGallery;
