import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CommunityFeed from "@/components/CommunityFeed";
import PetSpotlights from "@/components/PetSpotlights";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import FloatingParticles from "@/components/FloatingParticles";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <FloatingParticles />
      <Navbar />
      <Hero />
      <Features />
      <CommunityFeed />
      <PetSpotlights />
      <Footer />
    </div>
  );
};

export default Index;