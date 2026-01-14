import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const [pet, setPet] = useState<Pet | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (petId) fetchPetData();
  }, [petId]);

  const fetchPetData = async () => {
    if (!petId) return;
    setLoading(true);

    const { data: petData, error: petError } = await supabase
      .from("pets")
      .select("*")
      .eq("id", petId)
      .maybeSingle();

    if (petError || !petData) {
      setLoading(false);
      return;
    }

    setPet(petData);

    // Fetch owner profile
    const { data: ownerData } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url, location")
      .eq("user_id", petData.user_id)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24">
          <div className="max-w-2xl mx-auto animate-pulse space-y-6">
            <div className="h-64 bg-muted rounded-2xl" />
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto">
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

          {/* Pet Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border overflow-hidden mb-6"
          >
            {/* Hero Background */}
            <div className={`h-40 sm:h-56 bg-gradient-to-br ${gradientColor} relative`}>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMCAyYy0yLjIxIDAtNCAxLjc5LTQgNHMxLjc5IDQgNCA0IDQtMS43OSA0LTQtMS43OS00LTQtNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30" />
              
              {/* Share Button */}
              <Button
                size="icon"
                variant="secondary"
                onClick={handleShare}
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm border-0 hover:bg-white/30"
              >
                <Share2 className="w-4 h-4 text-white" />
              </Button>
            </div>

            {/* Pet Info */}
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-20">
                {/* Pet Photo */}
                <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-card bg-gradient-to-br ${gradientColor} flex items-center justify-center overflow-hidden shadow-lg`}>
                  {pet.photo_url ? (
                    <img
                      src={pet.photo_url}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PetIcon className="w-14 h-14 sm:w-20 sm:h-20 text-white" />
                  )}
                </div>

                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-display font-bold">{pet.name}</h1>
                    <Badge className={`bg-gradient-to-r ${gradientColor} text-white border-0 capitalize`}>
                      {pet.type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
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
              </div>
            </div>
          </motion.div>

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

          {/* Pet Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-5 mt-6"
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Type</p>
                <p className="font-medium capitalize flex items-center gap-2">
                  <PetIcon className="w-4 h-4" />
                  {pet.type}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Breed</p>
                <p className="font-medium">{pet.breed || "Not specified"}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Age</p>
                <p className="font-medium">
                  {pet.age_years 
                    ? `${pet.age_years} ${pet.age_years === 1 ? "year" : "years"}` 
                    : "Not specified"}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Member Since</p>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(pet.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PetProfile;
