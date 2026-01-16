import { motion } from "framer-motion";
import { PawPrint, Heart, Star, Sparkles } from "lucide-react";

const particles = [
  // Top area
  { top: "5%", left: "8%", size: 18, icon: PawPrint, color: "text-primary/30", delay: 0 },
  { top: "8%", right: "12%", size: 22, icon: Heart, color: "text-accent/25", delay: 0.5 },
  { top: "12%", left: "25%", size: 16, icon: Star, color: "text-quaternary/35", delay: 1 },
  { top: "15%", right: "30%", size: 14, icon: Sparkles, color: "text-tertiary/30", delay: 1.5 },
  
  // Upper-middle area
  { top: "22%", left: "5%", size: 20, icon: Heart, color: "text-primary/25", delay: 2 },
  { top: "28%", right: "8%", size: 24, icon: PawPrint, color: "text-accent/30", delay: 0.3 },
  { top: "32%", left: "18%", size: 14, icon: Star, color: "text-tertiary/35", delay: 1.2 },
  { top: "35%", right: "22%", size: 18, icon: Heart, color: "text-quaternary/25", delay: 0.8 },
  
  // Middle area
  { top: "42%", left: "3%", size: 16, icon: Sparkles, color: "text-primary/30", delay: 1.8 },
  { top: "48%", right: "5%", size: 20, icon: PawPrint, color: "text-tertiary/25", delay: 0.6 },
  { top: "52%", left: "12%", size: 22, icon: Heart, color: "text-accent/35", delay: 2.2 },
  { top: "55%", right: "15%", size: 14, icon: Star, color: "text-primary/25", delay: 1.4 },
  
  // Lower-middle area
  { top: "62%", left: "6%", size: 18, icon: PawPrint, color: "text-quaternary/30", delay: 0.4 },
  { top: "68%", right: "10%", size: 16, icon: Sparkles, color: "text-accent/25", delay: 1.6 },
  { top: "72%", left: "20%", size: 20, icon: Heart, color: "text-tertiary/35", delay: 2.4 },
  { top: "75%", right: "25%", size: 14, icon: Star, color: "text-primary/30", delay: 0.9 },
  
  // Bottom area
  { top: "82%", left: "4%", size: 22, icon: Star, color: "text-accent/30", delay: 1.1 },
  { top: "85%", right: "7%", size: 18, icon: PawPrint, color: "text-quaternary/25", delay: 2.6 },
  { top: "88%", left: "15%", size: 16, icon: Heart, color: "text-primary/35", delay: 0.7 },
  { top: "92%", right: "18%", size: 20, icon: Sparkles, color: "text-tertiary/30", delay: 1.9 },
];

const FloatingParticles = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle, index) => (
        <motion.div
          key={index}
          className={`absolute ${particle.color}`}
          style={{
            top: particle.top,
            left: particle.left,
            right: particle.right,
          }}
          animate={{
            y: [0, -15, 0, 10, 0],
            x: [0, 8, 0, -8, 0],
            rotate: [0, 5, 0, -5, 0],
            opacity: [0.6, 1, 0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 8 + (index % 4) * 2,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        >
          <particle.icon size={particle.size} />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingParticles;
