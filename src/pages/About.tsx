import { motion } from "framer-motion";
import { Shield, Heart, Users, AlertTriangle, PawPrint, Sparkles, Bot } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

const About = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-glow">
              <PawPrint className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              About <span className="text-gradient">PawSquare</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              PawSquare is a digital town square for pet owners to connect, support each other, 
              and manage everyday pet-related needs in one unified space.
            </p>
          </motion.div>
        </section>

        {/* Mission Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Community First",
                description: "We believe pet parents helping pet parents creates the strongest support network.",
                color: "text-accent",
              },
              {
                icon: Users,
                title: "Connect with Pet Parents",
                description: "Find and connect with other pet parents for walks, playdates, and support.",
                color: "text-tertiary",
              },
              {
                icon: Sparkles,
                title: "AI-Powered Help",
                description: "Get instant answers to pet care questions with our AI assistant, available 24/7.",
                color: "text-primary",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl border border-border p-8 text-center"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-muted flex items-center justify-center`}>
                  <item.icon className={`w-8 h-8 ${item.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* AI Disclaimer Section */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-8 md:p-12"
          >
            <div className="flex items-start gap-6">
              <div className="hidden sm:flex w-16 h-16 shrink-0 rounded-xl bg-card border border-border items-center justify-center">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
                  AI Pet Assistant Disclaimer
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground text-lg mb-4">
                    Our AI Pet Assistant is designed to provide general pet care information, 
                    tips, and guidance. It can help with:
                  </p>
                  <ul className="text-muted-foreground space-y-2 mb-6">
                    <li>• General pet care questions and tips</li>
                    <li>• Training advice and behavior suggestions</li>
                    <li>• Nutrition and diet information</li>
                    <li>• Summarizing community discussions</li>
                    <li>• Helping you draft questions for the community</li>
                  </ul>
                  
                  <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 mt-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-destructive mb-2">
                          Important Medical Disclaimer
                        </h3>
                        <p className="text-muted-foreground">
                          The AI Pet Assistant is <strong>NOT a substitute for professional veterinary care</strong>. 
                          It cannot diagnose medical conditions, prescribe treatments, or provide emergency care advice. 
                          Always consult with a licensed veterinarian for any health concerns about your pet.
                        </p>
                        <p className="text-muted-foreground mt-2">
                          <strong>In case of emergency</strong>, please contact your local emergency veterinary clinic immediately.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Safety Section */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Safety & <span className="text-gradient">Trust</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We're committed to maintaining a safe, supportive environment for all pet parents.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: Shield,
                title: "Community Guidelines",
                points: [
                  "Be respectful and supportive to fellow pet parents",
                  "No spam, harassment, or inappropriate content",
                  "Report concerning posts or behavior",
                  "Protect your personal information",
                ],
              },
              {
                icon: Heart,
                title: "Pet Safety First",
                points: [
                  "Never share advice that could harm animals",
                  "Recommend veterinary care for medical issues",
                  "Support responsible pet ownership",
                  "Promote adoption and ethical treatment",
                ],
              },
            ].map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl border border-border p-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{section.title}</h3>
                </div>
                <ul className="space-y-3">
                  {section.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-12"
          >
            <h2 className="text-3xl font-display font-bold mb-4">
              {user ? "Explore the Community" : "Ready to Join the Community?"}
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              {user 
                ? "Connect with fellow pet parents, share stories, and discover helpful tips."
                : "Connect with thousands of pet parents who share your passion for giving pets the best life."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!user && (
                <Button asChild className="bg-gradient-hero shadow-glow hover:shadow-elevated">
                  <Link to="/auth">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Join PawSquare
                  </Link>
                </Button>
              )}
              <Button asChild variant={user ? "default" : "outline"} className={user ? "bg-gradient-hero shadow-glow hover:shadow-elevated" : ""}>
                <Link to="/community">
                  Explore Community
                </Link>
              </Button>
              {user && (
                <Button asChild variant="outline">
                  <Link to="/profile">
                    View Your Profile
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
