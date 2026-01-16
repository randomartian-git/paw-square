import { PawPrint, Users, Heart, Sparkles, Star, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const floatingElements = [
    { top: "10%", left: "5%", size: 24, icon: PawPrint, color: "text-primary/40" },
    { top: "15%", right: "8%", size: 32, icon: Heart, color: "text-accent/40" },
    { top: "55%", left: "6%", size: 20, icon: Star, color: "text-quaternary/50" },
    { top: "65%", right: "7%", size: 28, icon: PawPrint, color: "text-tertiary/40" },
    { top: "35%", right: "12%", size: 18, icon: Heart, color: "text-primary/30" },
    { top: "25%", left: "12%", size: 22, icon: Star, color: "text-accent/35" },
    { top: "80%", left: "15%", size: 16, icon: Circle, color: "text-tertiary/25" },
    { top: "45%", left: "3%", size: 14, icon: Circle, color: "text-quaternary/30" },
    { top: "70%", right: "15%", size: 20, icon: Star, color: "text-primary/35" },
    { top: "85%", right: "25%", size: 18, icon: PawPrint, color: "text-accent/30" },
  ];

  const orbs = [
    { top: "10%", left: "20%", size: "400px", color: "bg-primary/10", blur: "blur-3xl" },
    { top: "40%", right: "10%", size: "350px", color: "bg-accent/10", blur: "blur-3xl" },
    { bottom: "20%", left: "30%", size: "300px", color: "bg-tertiary/8", blur: "blur-3xl" },
    { top: "60%", right: "30%", size: "250px", color: "bg-quaternary/8", blur: "blur-2xl" },
    { top: "75%", left: "10%", size: "200px", color: "bg-primary/5", blur: "blur-3xl" },
  ];

  return (
    <section className="relative min-h-[85vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Static background orbs */}
      {orbs.map((orb, index) => (
        <div
          key={index}
          className={`absolute rounded-full ${orb.color} ${orb.blur}`}
          style={{
            top: orb.top,
            left: orb.left,
            right: orb.right,
            bottom: orb.bottom,
            width: orb.size,
            height: orb.size,
          }}
        />
      ))}
      
      {/* Static decorative elements */}
      {floatingElements.map((item, index) => (
        <div
          key={index}
          className={`absolute ${item.color}`}
          style={{ 
            top: item.top, 
            left: item.left, 
            right: item.right,
          }}
        >
          <item.icon size={item.size} />
        </div>
      ))}

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 text-foreground text-sm font-medium mb-6 border border-primary/30 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            The Digital Town Square for Pet Parents
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-tight mb-6">
            Where Pet Lovers{" "}
            <span className="text-gradient">Connect</span>,{" "}
            <br className="hidden sm:block" />
            Share & <span className="text-gradient-secondary">Thrive</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of pet parents in a warm, supportive community. 
            Share stories, get advice, and celebrate the joy of pet ownership together.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate("/forum")}
              className="bg-gradient-hero text-lg px-8 py-6 shadow-glow hover:shadow-elevated transition-shadow font-semibold"
            >
              <PawPrint className="w-5 h-5 mr-2" />
              Explore Posts
            </Button>
          </div>

        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/50 to-transparent" />
    </section>
  );
};

export default Hero;