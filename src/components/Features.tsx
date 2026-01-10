import { motion } from "framer-motion";
import { Users, MessageSquare, Calendar, MapPin, Heart, Shield } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Find Your Tribe",
    description: "Connect with pet parents near you who share your love for animals. Make friends, arrange playdates!",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: MessageSquare,
    title: "Expert Advice",
    description: "Get tips from experienced pet owners and veterinary professionals on health, training, and care.",
    color: "bg-secondary text-secondary-foreground",
  },
  {
    icon: Calendar,
    title: "Local Events",
    description: "Discover pet-friendly events, meetups, and activities happening in your neighborhood.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: MapPin,
    title: "Pet Services",
    description: "Find trusted groomers, vets, pet sitters, and more with community-verified reviews.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Heart,
    title: "Adoption Corner",
    description: "Help pets find forever homes. Share adoption stories and connect with local shelters.",
    color: "bg-secondary text-secondary-foreground",
  },
  {
    icon: Shield,
    title: "Safe Community",
    description: "A moderated, positive space where pet parents support each other without judgment.",
    color: "bg-accent/10 text-accent",
  },
];

const Features = () => {
  return (
    <section id="discussions" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-card p-6 rounded-2xl shadow-soft hover:shadow-elevated transition-all border border-border group"
            >
              <div
                className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-7 h-7" />
              </div>
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