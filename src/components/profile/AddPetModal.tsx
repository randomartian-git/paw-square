import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Dog, Cat, Bird, Fish, Rabbit, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AddPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPetAdded: () => void;
}

const petTypes = [
  { id: "dog", name: "Dog", icon: Dog },
  { id: "cat", name: "Cat", icon: Cat },
  { id: "bird", name: "Bird", icon: Bird },
  { id: "fish", name: "Fish", icon: Fish },
  { id: "rabbit", name: "Rabbit", icon: Rabbit },
  { id: "other", name: "Other", icon: Sparkles },
];

const AddPetModal = ({ isOpen, onClose, onPetAdded }: AddPetModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [petType, setPetType] = useState("dog");
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim()) {
      toast({ title: "Please enter your pet's name", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("pets").insert({
      user_id: user.id,
      name: name.trim(),
      type: petType,
      breed: breed.trim() || null,
      age_years: age ? parseInt(age) : null,
    });

    if (error) {
      toast({ title: "Error adding pet", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Pet added successfully! 🐾" });
      setName("");
      setBreed("");
      setAge("");
      setPetType("dog");
      onPetAdded();
      onClose();
    }
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-display font-bold">Add New Pet</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Pet Type */}
              <div>
                <Label className="mb-3 block">Pet Type</Label>
                <div className="grid grid-cols-3 gap-2">
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
                  placeholder="e.g., Golden Retriever"
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
                <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-primary to-accent">
                  {isSubmitting ? "Adding..." : "Add Pet"}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddPetModal;
