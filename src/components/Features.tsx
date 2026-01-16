import { Users, MessageSquare, Calendar, MapPin, Heart, Shield } from "lucide-react";

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
    title: "Pet Events & Meetups",
    description: "Discover pet-friendly events, meetups, and activities happening around you.",
    gradient: "from-accent to-quaternary",
    bgGlow: "bg-accent/5",
  },
  {
    icon: MapPin,
    title: "Pet Services",
    description: "Find trusted groomers, vets, pet sitters, and more with community-verified reviews.",
    gradient: "from-tertiary to-primary",
    bgGlow: "bg-tertiary/5",
  },
  {
    icon: Heart,
    title: "Adoption Corner",
    description: "Help pets find forever homes. Share adoption stories and connect with shelters.",
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
  return (
    <section id="discussions" className="py-20 relative overflow-hidden">
      {/* Top gradient transition from previous section */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none" />
      
      {/* Static background orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-tertiary/5 rounded-full blur-3xl" />
      <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-quaternary/8 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-primary/5 rounded-full blur-3xl" />
      
      {/* Bottom gradient transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-accent/5 to-accent/10 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Everything You Need,{" "}
            <span className="text-gradient">One Community</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            PawSquare brings together all the tools and connections you need to give your pet the best life
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`${feature.bgGlow} bg-card/80 backdrop-blur-sm p-6 rounded-2xl shadow-soft hover:shadow-elevated transition-shadow border border-border group relative overflow-hidden`}
            >
              {/* Gradient accent line */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
              
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl`} />
              
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg relative z-10`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2 relative z-10">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed relative z-10">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;