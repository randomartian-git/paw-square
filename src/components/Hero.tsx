import { PawPrint, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const Hero = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const orbs = [
    { top: "10%", left: "20%", size: "400px", color: "bg-primary/10", blur: "blur-3xl", y: y1 },
    { top: "40%", right: "10%", size: "350px", color: "bg-accent/10", blur: "blur-3xl", y: y2 },
    { bottom: "20%", left: "30%", size: "300px", color: "bg-tertiary/8", blur: "blur-3xl", y: y3 },
    { top: "60%", right: "30%", size: "250px", color: "bg-quaternary/8", blur: "blur-2xl", y: y4 },
    { top: "75%", left: "10%", size: "200px", color: "bg-primary/5", blur: "blur-3xl", y: y2 },
  ];

  return (
    <section ref={sectionRef} className="relative min-h-[85vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Parallax background orbs */}
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
            y: orb.y,
          }}
        />
      ))}

      <motion.div style={{ opacity }} className="container mx-auto px-4 relative z-10">
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
      </motion.div>
      
      {/* Bottom gradient transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-primary/5 to-primary/10 pointer-events-none" />
    </section>
  );
};

export default Hero;