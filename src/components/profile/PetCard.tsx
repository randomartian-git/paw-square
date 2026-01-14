import { useState } from "react";
import { motion } from "framer-motion";
import { Dog, Cat, Bird, Fish, Rabbit, Sparkles, Trash2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Pet = {
  id: string;
  name: string;
  type: string;
  breed: string | null;
  age_years: number | null;
  photo_url: string | null;
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

interface PetCardProps {
  pet: Pet;
  onDelete: (petId: string) => Promise<void>;
  onViewGallery: (pet: Pet) => void;
}

const PetCard = ({ pet, onDelete, onViewGallery }: PetCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const PetIcon = petTypeIcons[pet.type] || Sparkles;

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(pet.id);
    setIsDeleting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
        {pet.photo_url ? (
          <img
            src={pet.photo_url}
            alt={pet.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <PetIcon className="w-6 h-6 text-primary-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{pet.name}</p>
        <p className="text-xs text-muted-foreground capitalize truncate">
          {pet.breed || pet.type}
          {pet.age_years && ` • ${pet.age_years} yrs`}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => onViewGallery(pet)}
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {pet.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete {pet.name}'s profile and photos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
};

export default PetCard;
