import { motion } from "framer-motion";
import { Settings as SettingsIcon, Sun, Moon, Eye, Check, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme, ThemeMode } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const themeOptions: { id: ThemeMode; name: string; description: string; icon: typeof Sun; colors: string[] }[] = [
  {
    id: "light",
    name: "Light Mode",
    description: "Warm, pet-friendly colors with soft orange and cream tones. Clean and welcoming for first-time pet owners.",
    icon: Sun,
    colors: ["bg-orange-400", "bg-amber-200", "bg-green-400"],
  },
  {
    id: "dark",
    name: "Dark Mode",
    description: "Dark background with purple accents. Comfortable for night usage without sacrificing readability.",
    icon: Moon,
    colors: ["bg-purple-600", "bg-purple-400", "bg-pink-500"],
  },
  {
    id: "colorblind",
    name: "Color-Blind Friendly Mode",
    description: "Designed for users with color-vision deficiencies. Uses blue accents and avoids red/green contrast for better accessibility.",
    icon: Eye,
    colors: ["bg-blue-500", "bg-sky-400", "bg-cyan-400"],
  },
];

const Settings = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow">
                <SettingsIcon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">Settings</h1>
                <p className="text-muted-foreground text-sm">Customize your experience</p>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <section className="mb-10">
            <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-primary" />
              Appearance & Accessibility
            </h2>
            
            <div className="grid gap-4">
              {themeOptions.map((option, index) => {
                const Icon = option.icon;
                const isSelected = theme === option.id;
                
                return (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setTheme(option.id)}
                    className={`relative w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-glow"
                        : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{option.name}</h3>
                          {isSelected && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                            >
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </motion.span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {option.description}
                        </p>
                        
                        {/* Color preview */}
                        <div className="flex gap-2 mt-3">
                          {option.colors.map((color, i) => (
                            <div
                              key={i}
                              className={`w-6 h-6 rounded-full ${color} ring-2 ring-background`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {option.id === "colorblind" && (
                      <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <Eye className="w-4 h-4 flex-shrink-0" />
                          <span>
                            This mode uses patterns and icons alongside colors, avoids red/green combinations, 
                            and ensures sufficient contrast for users with color vision deficiencies.
                          </span>
                        </p>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-5 rounded-2xl bg-card border border-border"
          >
            <h3 className="font-semibold mb-2">About Accessibility</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              PawSquare is committed to providing an inclusive experience for all pet lovers. 
              Our accessibility features ensure that everyone can enjoy connecting with the community, 
              regardless of visual preferences or needs. Your selected theme will be remembered 
              across all pages and sessions.
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Settings;
