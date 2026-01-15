import { motion } from "framer-motion";
import { PawPrint, Users, Menu, X, Sparkles, Info, LogOut, Settings, Bot, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navLinks = [
    { name: "Community", icon: Users, href: "/community" },
    { name: "About", icon: Info, href: "/about" },
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
          <motion.div
            whileHover={{ scale: 1.02 }}
          >
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow">
                <PawPrint className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold text-foreground">
                Paw<span className="text-gradient">Square</span>
              </span>
            </Link>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => {
              const isActive = location.pathname === link.href;
              
              const LinkComponent = link.href.startsWith("/") && !link.href.includes("#") ? Link : "a";
              const linkProps = link.href.startsWith("/") && !link.href.includes("#")
                ? { to: link.href }
                : { href: link.href };

              return (
                <motion.div
                  key={link.name}
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <LinkComponent
                    {...linkProps as any}
                    className={`flex items-center gap-2 transition-colors font-medium ${
                      isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.name}
                  </LinkComponent>
                </motion.div>
              );
            })}
            
            {/* AI Assistant Button */}
            <motion.div
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link
                to="/ai-assistant"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium text-sm hover:shadow-glow transition-shadow"
              >
                <Bot className="w-4 h-4" />
                AI Assistant
              </Link>
            </motion.div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button variant="ghost" onClick={() => navigate("/messages")} className="font-semibold">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Messages
                </Button>
                <Button variant="ghost" onClick={() => navigate("/profile")} className="font-semibold">
                  <Avatar className="w-6 h-6 mr-2">
                    <AvatarFallback className="bg-gradient-hero text-xs text-primary-foreground">
                      {user.email?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  Profile
                </Button>
                <Button variant="ghost" onClick={() => navigate("/settings")} className="font-semibold">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="ghost" onClick={() => { signOut(); navigate("/"); }} className="font-semibold hover:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/settings")} className="font-semibold">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="ghost" onClick={() => navigate("/auth")} className="font-semibold hover:text-primary">
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth?mode=signup")} className="bg-gradient-hero font-semibold shadow-glow hover:shadow-elevated transition-shadow">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Join the Pack
                </Button>
              </>
            )}
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
              {navLinks.map((link) => {
                const LinkComponent = link.href.startsWith("/") && !link.href.includes("#") ? Link : "a";
                const linkProps = link.href.startsWith("/") && !link.href.includes("#")
                  ? { to: link.href }
                  : { href: link.href };

                return (
                  <LinkComponent
                    key={link.name}
                    {...linkProps as any}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    <link.icon className="w-5 h-5" />
                    {link.name}
                  </LinkComponent>
                );
              })}
              
              {/* AI Assistant - Mobile */}
              <Link
                to="/ai-assistant"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 mx-4 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium text-sm"
              >
                <Bot className="w-5 h-5" />
                AI Pet Assistant
              </Link>
              
              <div className="flex flex-col gap-2 px-4 pt-4 border-t border-border">
                {user && (
                  <Button variant="ghost" onClick={() => { navigate("/messages"); setIsOpen(false); }} className="w-full justify-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Messages
                  </Button>
                )}
                <Button variant="ghost" onClick={() => { navigate("/settings"); setIsOpen(false); }} className="w-full justify-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                {!user && (
                  <>
                    <Button variant="ghost" onClick={() => { navigate("/auth"); setIsOpen(false); }} className="w-full justify-center">
                      Sign In
                    </Button>
                    <Button onClick={() => { navigate("/auth?mode=signup"); setIsOpen(false); }} className="w-full bg-gradient-hero shadow-glow">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Join the Pack
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;