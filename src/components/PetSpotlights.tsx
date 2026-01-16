import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Heart, MapPin, Star } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Pet {
  id: string;
  name: string;
  breed: string | null;
  age_years: number | null;
  photo_url: string | null;
  type: string;
  user_id: string;
  owner_name?: string;
  owner_location?: string;
}

const gradients = [
  "from-primary via-accent to-primary",
  "from-tertiary via-primary to-tertiary",
  "from-quaternary via-accent to-quaternary",
  "from-accent via-primary to-accent",
];

const PetCard = ({ pet, index }: { pet: Pet; index: number }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });
  const navigate = useNavigate();
  
  const directions = [
    { x: -60, y: 40 },
    { x: 60, y: 30 },
    { x: -40, y: 50 },
    { x: 40, y: 60 },
  ];
  const dir = directions[index % 4];
  const gradient = gradients[index % gradients.length];

  const defaultImage = pet.type === "Cat" 
    ? "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=500&fit=crop"
    : "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=500&fit=crop";

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: dir.x, y: dir.y, rotate: index % 2 === 0 ? -5 : 5 }}
      animate={isInView ? { opacity: 1, x: 0, y: 0, rotate: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, type: "spring", stiffness: 80 }}
      whileHover={{ y: -15, scale: 1.03, rotate: 0 }}
      onClick={() => navigate(`/pet/${pet.id}`)}
      className="group relative bg-card/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all cursor-pointer"
    >
      {/* Animated border gradient */}
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ backgroundSize: "200% 200%" }}
      />
      <div className="absolute inset-[2px] bg-card rounded-2xl" />
      
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-2xl">
        <motion.img
          src={pet.photo_url || defaultImage}
          alt={pet.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.15 }}
          transition={{ duration: 0.6 }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
        
        {/* Badge for featured pets */}
        {index === 0 && (
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute top-4 left-4 px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm text-sm font-medium border border-border"
          >
            ⭐ Featured
          </motion.div>
        )}

        {/* Pet Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-foreground">
          <h3 className="text-xl font-display font-bold mb-1">{pet.name}</h3>
          <p className="text-foreground/70 text-sm mb-2">
            {pet.breed || pet.type} • {pet.age_years ? `${pet.age_years} years` : "Age unknown"}
          </p>
          {pet.owner_location && (
            <div className="flex items-center gap-1 text-sm text-foreground/60">
              <MapPin className="w-3 h-3" />
              {pet.owner_location}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const PetSpotlights = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-120, 120]);
  const y3 = useTransform(scrollYProgress, [0, 1], [100, -80]);
  const x1 = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const x2 = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [-20, 20]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [15, -15]);

  useEffect(() => {
    const fetchPets = async () => {
      const { data: petsData, error } = await supabase
        .from("pets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) {
        console.error("Error fetching pets:", error);
        setLoading(false);
        return;
      }

      if (petsData && petsData.length > 0) {
        // Fetch owner profiles
        const userIds = [...new Set(petsData.map(p => p.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, location")
          .in("user_id", userIds);

        const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        const enrichedPets = petsData.map(pet => ({
          ...pet,
          owner_name: profilesMap.get(pet.user_id)?.display_name || "Pet Parent",
          owner_location: profilesMap.get(pet.user_id)?.location || undefined,
        }));

        setPets(enrichedPets);
      }
      setLoading(false);
    };

    fetchPets();
  }, []);

  if (loading) {
    return (
      <section id="spotlights" className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-quaternary/20 to-accent/20 text-foreground text-sm font-medium mb-4 border border-quaternary/30">
              <Star className="w-4 h-4 text-quaternary" />
              Pet Spotlights
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Meet Our <span className="text-gradient-warm">Furry Stars</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover adorable pets from our community. Give them some love! ❤️
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[4/5] bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (pets.length === 0) {
    return (
      <section id="spotlights" className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-quaternary/20 to-accent/20 text-foreground text-sm font-medium mb-4 border border-quaternary/30">
              <Star className="w-4 h-4 text-quaternary" />
              Pet Spotlights
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Meet Our <span className="text-gradient-warm">Furry Stars</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              No pets to spotlight yet. Be the first to add your furry friend! 🐾
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="spotlights" className="py-20 relative overflow-hidden" ref={containerRef}>
      {/* Enhanced animated background decorations */}
      <motion.div 
        className="absolute top-0 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
        style={{ y: y1, x: x1, rotate: rotate1 }}
      />
      <motion.div 
        className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
        style={{ y: y2, x: x2, rotate: rotate2 }}
      />
      <motion.div 
        className="absolute top-1/2 right-10 w-48 h-48 bg-accent/8 rounded-full blur-3xl"
        style={{ y: y3, x: x1 }}
      />
      <motion.div 
        className="absolute top-1/4 left-10 w-64 h-64 bg-tertiary/8 rounded-full blur-3xl"
        style={{ y: y1, x: x2, rotate: rotate1 }}
      />
      <motion.div 
        className="absolute bottom-1/4 left-1/2 w-56 h-56 bg-primary/5 rounded-full blur-3xl"
        style={{ y: y2, x: x1, rotate: rotate2 }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-quaternary/20 to-accent/20 text-foreground text-sm font-medium mb-4 border border-quaternary/30"
          >
            <Star className="w-4 h-4 text-quaternary" />
            Pet Spotlights
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Meet Our <span className="text-gradient-warm">Furry Stars</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover adorable pets from our community. Give them some love! ❤️
          </p>
        </motion.div>

        {/* Pet Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pets.map((pet, index) => (
            <PetCard key={pet.id} pet={pet} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PetSpotlights;
