import { motion, useInView } from "framer-motion";
import { Heart, MapPin, Star } from "lucide-react";
import { useState, useRef } from "react";

interface Pet {
  id: number;
  name: string;
  breed: string;
  age: string;
  location: string;
  image: string;
  likes: number;
  isLiked: boolean;
  badge?: string;
  gradient: string;
}

const pets: Pet[] = [
  {
    id: 1,
    name: "Coco",
    breed: "French Bulldog",
    age: "3 years",
    location: "Los Angeles, CA",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=500&fit=crop",
    likes: 1234,
    isLiked: false,
    badge: "⭐ Featured",
    gradient: "from-primary via-accent to-primary",
  },
  {
    id: 2,
    name: "Whiskers",
    breed: "Persian Cat",
    age: "5 years",
    location: "New York, NY",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=500&fit=crop",
    likes: 982,
    isLiked: true,
    gradient: "from-tertiary via-primary to-tertiary",
  },
  {
    id: 3,
    name: "Rocky",
    breed: "German Shepherd",
    age: "2 years",
    location: "Chicago, IL",
    image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=500&fit=crop",
    likes: 756,
    isLiked: false,
    badge: "🏆 Top Dog",
    gradient: "from-quaternary via-accent to-quaternary",
  },
  {
    id: 4,
    name: "Mochi",
    breed: "Shiba Inu",
    age: "1 year",
    location: "Seattle, WA",
    image: "https://images.unsplash.com/photo-1545996124-0501ebae84d0?w=400&h=500&fit=crop",
    likes: 2341,
    isLiked: false,
    gradient: "from-accent via-primary to-accent",
  },
];

const PetCard = ({ pet, onLike, index }: { pet: Pet; onLike: (id: number) => void; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -12 }}
      className="group relative bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all"
    >
      {/* Animated border gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${pet.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
      <div className="absolute inset-[2px] bg-card rounded-2xl" />
      
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-2xl">
        <motion.img
          src={pet.image}
          alt={pet.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
        />
        
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent`} />
        
        {/* Badge */}
        {pet.badge && (
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute top-4 left-4 px-3 py-1 rounded-full bg-background/90 backdrop-blur-sm text-sm font-medium border border-border"
          >
            {pet.badge}
          </motion.div>
        )}

        {/* Like button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.15 }}
          onClick={() => onLike(pet.id)}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
            pet.isLiked
              ? "bg-accent text-accent-foreground shadow-glow-accent"
              : "bg-background/80 text-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Heart className={`w-5 h-5 ${pet.isLiked ? "fill-current" : ""}`} />
        </motion.button>

        {/* Pet Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-primary-foreground">
          <h3 className="text-xl font-display font-bold mb-1">{pet.name}</h3>
          <p className="text-primary-foreground/80 text-sm mb-2">{pet.breed} • {pet.age}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-primary-foreground/70">
              <MapPin className="w-3 h-3" />
              {pet.location}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Heart className="w-3 h-3" />
              {pet.likes.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PetSpotlights = () => {
  const [petList, setPetList] = useState(pets);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const handleLike = (id: number) => {
    setPetList((prev) =>
      prev.map((pet) =>
        pet.id === id
          ? {
              ...pet,
              isLiked: !pet.isLiked,
              likes: pet.isLiked ? pet.likes - 1 : pet.likes + 1,
            }
          : pet
      )
    );
  };

  return (
    <section id="spotlights" className="py-20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-quaternary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
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
        </motion.div>

        {/* Pet Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {petList.map((pet, index) => (
            <PetCard key={pet.id} pet={pet} onLike={handleLike} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PetSpotlights;
