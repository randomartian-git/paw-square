import { motion, useScroll, useTransform } from "framer-motion";
import { PawPrint, Users, Heart, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const floatingElements = [
    { top: "10%", left: "5%", delay: 0, size: 24, icon: PawPrint, color: "text-primary/30" },
    { top: "20%", right: "10%", delay: 0.5, size: 32, icon: Heart, color: "text-accent/30" },
    { top: "60%", left: "8%", delay: 1, size: 20, icon: Star, color: "text-quaternary/40" },
    { top: "70%", right: "5%", delay: 1.5, size: 28, icon: PawPrint, color: "text-tertiary/30" },
    { top: "40%", right: "15%", delay: 2, size: 18, icon: Heart, color: "text-primary/25" },
    { top: "30%", left: "15%", delay: 0.8, size: 22, icon: Star, color: "text-accent/25" },
  ];

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated background gradients */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(270_70%_55%_/_0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(330_85%_60%_/_0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(180_70%_45%_/_0.08),transparent_50%)]" />
      </div>
      
      {/* Floating decorative elements */}
      {floatingElements.map((item, index) => (
        <motion.div
          key={index}
          className={`absolute ${item.color}`}
          style={{ top: item.top, left: item.left, right: item.right, y, opacity }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: item.delay, duration: 0.8 }}
        >
          <motion.div
            animate={{ y: [-5, 5, -5], rotate: [-5, 5, -5] }}
            transition={{ duration: 3 + index * 0.5, repeat: Infinity, delay: item.delay }}
          >
            <item.icon size={item.size} />
          </motion.div>
        </motion.div>
      ))}

      <motion.div style={{ y, opacity }} className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-secondary to-accent/20 text-secondary-foreground text-sm font-medium mb-8 border border-primary/20"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            The Digital Town Square for Pet Parents
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-tight mb-6"
          >
            Where Pet Lovers{" "}
            <span className="text-gradient">Connect</span>,{" "}
            <br className="hidden sm:block" />
            Share & <span className="text-gradient-secondary">Thrive</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Join thousands of pet parents in a warm, supportive community. 
            Share stories, get advice, and celebrate the joy of pet ownership together.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="bg-gradient-hero text-lg px-8 py-6 shadow-glow hover:shadow-elevated transition-all hover:scale-105 font-semibold"
            >
              <PawPrint className="w-5 h-5 mr-2" />
              Join the Community
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2 border-tertiary/50 hover:bg-tertiary/10 hover:border-tertiary transition-colors font-semibold text-tertiary"
            >
              Explore Posts
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mt-16"
          >
            {[
              { icon: Users, value: "12K+", label: "Pet Parents", color: "bg-primary/10", iconColor: "text-primary" },
              { icon: Heart, value: "45K+", label: "Happy Moments", color: "bg-accent/10", iconColor: "text-accent" },
              { icon: PawPrint, value: "8K+", label: "Pet Profiles", color: "bg-tertiary/10", iconColor: "text-tertiary" },
            ].map((stat, index) => (
              <motion.div 
                key={index} 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-muted/50 via-muted/20 to-transparent" />
    </section>
  );
};

export default Hero;
