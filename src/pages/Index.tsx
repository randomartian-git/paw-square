import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CommunityFeed from "@/components/CommunityFeed";
import PetSpotlights from "@/components/PetSpotlights";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <Hero />
      
      {/* Features section - simple fade in */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Features />
      </motion.div>
      
      {/* Community Feed - simple fade in */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <CommunityFeed />
      </motion.div>
      
      {/* Pet Spotlights - simple fade in */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <PetSpotlights />
      </motion.div>
      
      <Footer />
    </div>
  );
};

export default Index;
