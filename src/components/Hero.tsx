import { motion, useScroll, useTransform } from "framer-motion";
import { PawPrint, Users, Heart, Sparkles, Star, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const ref = useRef(null);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  // Enhanced parallax transforms for dramatic multi-directional movement
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const x1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const x2 = useTransform(scrollYProgress, [0, 1], [0, 250]);
  const x3 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 270]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const rotate3 = useTransform(scrollYProgress, [0, 1], [0, 120]);
  
  // Content animations - moves upward and fades as you scroll
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -150]);
  const contentX = useTransform(scrollYProgress, [0, 0.5], [0, -50]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  const floatingElements = [
    { top: "10%", left: "5%", delay: 0, size: 24, icon: PawPrint, color: "text-primary/40", motion: { y: y1, x: x1, rotate: rotate1 } },
    { top: "15%", right: "8%", delay: 0.5, size: 32, icon: Heart, color: "text-accent/40", motion: { y: y2, x: x2, rotate: rotate2 } },
    { top: "55%", left: "6%", delay: 1, size: 20, icon: Star, color: "text-quaternary/50", motion: { y: y3, x: x3 } },
    { top: "65%", right: "7%", delay: 1.5, size: 28, icon: PawPrint, color: "text-tertiary/40", motion: { y: y1, x: x2, rotate: rotate3 } },
    { top: "35%", right: "12%", delay: 2, size: 18, icon: Heart, color: "text-primary/30", motion: { y: y2, rotate: rotate1, x: x1 } },
    { top: "25%", left: "12%", delay: 0.8, size: 22, icon: Star, color: "text-accent/35", motion: { y: y3, x: x2, rotate: rotate2 } },
    { top: "80%", left: "15%", delay: 1.2, size: 16, icon: Circle, color: "text-tertiary/25", motion: { y: y2, x: x1, rotate: rotate3 } },
    { top: "45%", left: "3%", delay: 0.3, size: 14, icon: Circle, color: "text-quaternary/30", motion: { y: y1, rotate: rotate2, x: x3 } },
    { top: "70%", right: "15%", delay: 0.7, size: 20, icon: Star, color: "text-primary/35", motion: { y: y3, x: x1, rotate: rotate1 } },
    { top: "85%", right: "25%", delay: 1.4, size: 18, icon: PawPrint, color: "text-accent/30", motion: { y: y2, x: x2 } },
  ];

  // Background orbs with enhanced multi-directional parallax
  const orbs = [
    { top: "10%", left: "20%", size: "400px", color: "bg-primary/10", blur: "blur-3xl", motion: { y: y2, x: x1, rotate: rotate3 } },
    { top: "40%", right: "10%", size: "350px", color: "bg-accent/10", blur: "blur-3xl", motion: { y: y1, x: x2, rotate: rotate2 } },
    { bottom: "20%", left: "30%", size: "300px", color: "bg-tertiary/8", blur: "blur-3xl", motion: { y: y3, x: x3 } },
    { top: "60%", right: "30%", size: "250px", color: "bg-quaternary/8", blur: "blur-2xl", motion: { y: y2, x: x1, rotate: rotate1 } },
    { top: "75%", left: "10%", size: "200px", color: "bg-primary/5", blur: "blur-3xl", motion: { y: y1, x: x2 } },
  ];

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated background orbs */}
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full ${orb.color} ${orb.blur}`}
          style={{
            top: orb.top,
            left: orb.left,
            right: orb.right,
            bottom: orb.bottom,
            width: orb.size,
            height: orb.size,
            ...orb.motion,
          }}
        />
      ))}
      
      {/* Floating decorative elements with multi-directional parallax */}
      {floatingElements.map((item, index) => (
        <motion.div
          key={index}
          className={`absolute ${item.color}`}
          style={{ 
            top: item.top, 
            left: item.left, 
            right: item.right,
            ...item.motion,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: item.delay, duration: 0.8, type: "spring" }}
        >
          <motion.div
            animate={{ 
              y: [-8, 8, -8], 
              rotate: [-10, 10, -10],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 4 + index * 0.5, 
              repeat: Infinity, 
              delay: item.delay,
              ease: "easeInOut"
            }}
          >
            <item.icon size={item.size} />
          </motion.div>
        </motion.div>
      ))}

      <motion.div style={{ scale, opacity, y: contentY, x: contentX }} className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 text-foreground text-sm font-medium mb-8 border border-primary/30 backdrop-blur-sm"
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
              onClick={() => navigate("/forum")}
              className="bg-gradient-hero text-lg px-8 py-6 shadow-glow hover:shadow-elevated transition-all hover:scale-105 font-semibold"
            >
              <PawPrint className="w-5 h-5 mr-2" />
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
              { icon: Users, value: "12K+", label: "Pet Parents", color: "bg-primary/20", iconColor: "text-primary", glow: "shadow-glow" },
              { icon: Heart, value: "45K+", label: "Happy Moments", color: "bg-accent/20", iconColor: "text-accent", glow: "shadow-glow-accent" },
              { icon: PawPrint, value: "8K+", label: "Pet Profiles", color: "bg-tertiary/20", iconColor: "text-tertiary", glow: "shadow-glow-tertiary" },
            ].map((stat, index) => (
              <motion.div 
                key={index} 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.08, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center ${stat.glow}`}>
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

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/50 to-transparent" />
    </section>
  );
};

export default Hero;
