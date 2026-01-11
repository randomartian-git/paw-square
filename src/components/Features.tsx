import { motion, useInView } from "framer-motion";
import { Users, MessageSquare, Calendar, MapPin, Heart, Shield } from "lucide-react";
import { useRef } from "react";

const features = [
  {
    icon: Users,
    title: "Find Your Tribe",
    description: "Connect with pet parents near you who share your love for animals. Make friends, arrange playdates!",
    gradient: "from-primary to-accent",
    bgGlow: "bg-primary/5",
  },
  {
    icon: MessageSquare,
    title: "Expert Advice",
    description: "Get tips from experienced pet owners and veterinary professionals on health, training, and care.",
    gradient: "from-tertiary to-primary",
    bgGlow: "bg-tertiary/5",
  },
  {
    icon: Calendar,
    title: "Local Events",
    description: "Discover pet-friendly events, meetups, and activities happening in your neighborhood.",
    gradient: "from-accent to-quaternary",
    bgGlow: "bg-accent/5",
  },
  {
    icon: MapPin,
    title: "Pet Services",
    description: "Find trusted groomers, vets, pet sitters, and more with community-verified reviews.",
    gradient: "from-quaternary to-tertiary",
    bgGlow: "bg-quaternary/5",
  },
  {
    icon: Heart,
    title: "Adoption Corner",
    description: "Help pets find forever homes. Share adoption stories and connect with local shelters.",
    gradient: "from-accent to-primary",
    bgGlow: "bg-accent/5",
  },
  {
    icon: Shield,
    title: "Safe Community",
    description: "A moderated, positive space where pet parents support each other without judgment.",
    gradient: "from-primary to-tertiary",
    bgGlow: "bg-primary/5",
  },
];

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="discussions" className="py-20 bg-muted/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Everything You Need,{" "}
            <span className="text-gradient">One Community</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            PawSquare brings together all the tools and connections you need to give your pet the best life
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`${feature.bgGlow} bg-card p-6 rounded-2xl shadow-soft hover:shadow-elevated transition-all border border-border group relative overflow-hidden`}
            >
              {/* Gradient accent line */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
              
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg`}
              >
                <feature.icon className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
