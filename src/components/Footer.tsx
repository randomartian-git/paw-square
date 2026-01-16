import { motion } from "framer-motion";
import { PawPrint, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const links: Record<string, { label: string; href: string }[]> = {
    Community: [
      { label: "Feed", href: "/community" },
      { label: "Discussions", href: "/community" },
      { label: "AI Assistant", href: "/ai-assistant" },
    ],
    Resources: [
      { label: "Pet Care Tips", href: "/ai-assistant" },
      { label: "About", href: "/about" },
    ],
    Account: [
      { label: "Profile", href: "/profile" },
      { label: "Messages", href: "/messages" },
      { label: "Settings", href: "/settings" },
    ],
  };

  return (
    <footer className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow">
                  <PawPrint className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-display font-bold text-foreground">
                  Paw<span className="text-gradient">Square</span>
                </span>
              </Link>
            </motion.div>
            <p className="text-muted-foreground mb-6 max-w-sm">
              The digital town square where pet parents connect, share, and support each other on the journey of pet ownership.
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              Made with <Heart className="w-4 h-4 text-accent fill-accent mx-1" /> for pet lovers everywhere
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-display font-bold mb-4 text-foreground">{category}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            © 2026 PawSquare. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/about"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              About
            </Link>
            <Link
              to="/community"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Community
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;