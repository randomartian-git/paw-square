import { motion } from "framer-motion";
import { Heart, MapPin, Star } from "lucide-react";
import { useState } from "react";

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
  },
];

const PetCard = ({ pet, onLike }: { pet: Pet; onLike: (id: number) => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={pet.image}
          alt={pet.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
        
        {/* Badge */}
        {pet.badge && (
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-background/90 backdrop-blur-sm text-sm font-medium">
            {pet.badge}
          </div>
        )}

        {/* Like button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onLike(pet.id)}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
            pet.isLiked
              ? "bg-accent text-accent-foreground"
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
    <section id="spotlights" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-4">
            <Star className="w-4 h-4 text-primary" />
            Pet Spotlights
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Meet Our <span className="text-gradient">Furry Stars</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover adorable pets from our community. Give them some love! ❤️
          </p>
        </motion.div>

        {/* Pet Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {petList.map((pet) => (
            <PetCard key={pet.id} pet={pet} onLike={handleLike} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PetSpotlights;