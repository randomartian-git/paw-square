import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ForumSidebar from "@/components/forum/ForumSidebar";
import ForumPostList from "@/components/forum/ForumPostList";
import CreatePostModal from "@/components/forum/CreatePostModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export type ForumCategory = "all" | "questions" | "discussions" | "tips" | "showcase";

const Forum = () => {
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 left-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
        />
      </div>

      <main className="relative pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-accent to-tertiary bg-clip-text text-transparent">
                Community Forum
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ask questions, share experiences, and connect with fellow pet parents
            </p>
          </motion.div>

          {/* Create Post Button - Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:hidden mb-6"
          >
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Post
            </Button>
          </motion.div>

          {/* Main Content */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <ForumSidebar 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              onCreatePost={() => setIsCreateModalOpen(true)}
            />

            {/* Posts */}
            <ForumPostList selectedCategory={selectedCategory} />
          </div>
        </div>
      </main>

      <Footer />

      {/* Create Post Modal */}
      <CreatePostModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default Forum;
