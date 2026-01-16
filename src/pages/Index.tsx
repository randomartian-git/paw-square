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
      <CommunityFeed />
      <PetSpotlights />
      <Features />
      <Footer />
    </div>
  );
};

export default Index;