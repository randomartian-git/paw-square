import { motion } from "framer-motion";
import { PawPrint, Users, MessageCircle, Heart, Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Community", icon: Users, href: "#community" },
    { name: "Discussions", icon: MessageCircle, href: "#discussions" },
    { name: "Pet Spotlights", icon: Heart, href: "#spotlights" },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.a
            href="#"
            className="flex items-center gap-2 group"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow">
              <PawPrint className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">
              Paw<span className="text-gradient">Square</span>
            </span>
          </motion.a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </motion.a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="font-semibold hover:text-primary">
              Sign In
            </Button>
            <Button className="bg-gradient-hero font-semibold shadow-glow hover:shadow-elevated transition-shadow">
              <Sparkles className="w-4 h-4 mr-2" />
              Join the Pack
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                >
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-2 px-4 pt-4 border-t border-border">
                <Button variant="ghost" className="w-full justify-center">
                  Sign In
                </Button>
                <Button className="w-full bg-gradient-hero shadow-glow">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Join the Pack
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;