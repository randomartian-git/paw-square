import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CommunityFeed from "@/components/CommunityFeed";
import PetSpotlights from "@/components/PetSpotlights";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const Index = () => {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Multi-directional transforms for each section
  // Features: slides in from left
  const featuresX = useTransform(scrollYProgress, [0.1, 0.25], [-100, 0]);
  const featuresRotate = useTransform(scrollYProgress, [0.1, 0.25], [-3, 0]);
  
  // Community Feed: slides in from right with diagonal
  const communityX = useTransform(scrollYProgress, [0.25, 0.45], [150, 0]);
  const communityY = useTransform(scrollYProgress, [0.25, 0.45], [-50, 0]);
  const communityRotate = useTransform(scrollYProgress, [0.25, 0.45], [3, 0]);
  
  // Pet Spotlights: slides up with scale
  const spotlightsY = useTransform(scrollYProgress, [0.45, 0.65], [100, 0]);
  const spotlightsScale = useTransform(scrollYProgress, [0.45, 0.65], [0.9, 1]);
  const spotlightsX = useTransform(scrollYProgress, [0.45, 0.65], [-80, 0]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <Hero />
      
      {/* Features section - slides from left */}
      <motion.div
        style={{ 
          x: featuresX, 
          rotate: featuresRotate,
        }}
        className="origin-center"
      >
        <Features />
      </motion.div>
      
      {/* Community Feed - slides diagonally from right */}
      <motion.div
        style={{ 
          x: communityX, 
          y: communityY,
          rotate: communityRotate,
        }}
        className="origin-center"
      >
        <CommunityFeed />
      </motion.div>
      
      {/* Pet Spotlights - slides up from bottom-left */}
      <motion.div
        style={{ 
          y: spotlightsY, 
          scale: spotlightsScale,
          x: spotlightsX,
        }}
        className="origin-center"
      >
        <PetSpotlights />
      </motion.div>
      
      <Footer />
    </div>
  );
};

export default Index;
