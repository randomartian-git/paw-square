import { motion } from "framer-motion";
import { ArrowLeft, Shield, Heart, MessageCircle, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Guidelines = () => {
  const guidelines = [
    {
      icon: Heart,
      title: "Be Kind and Respectful",
      description: "Treat all community members with respect. We're all here because we love our pets. Harassment, bullying, or discrimination of any kind will not be tolerated.",
      examples: {
        do: ["Offer constructive feedback politely", "Celebrate others' pets and achievements", "Support fellow pet parents through challenges"],
        dont: ["Use offensive language or slurs", "Mock or belittle others' pets or care choices", "Engage in personal attacks"]
      }
    },
    {
      icon: Shield,
      title: "Keep Content Safe and Appropriate",
      description: "All content must be safe for all ages. No graphic, violent, or inappropriate content. Content promoting animal abuse or neglect will result in immediate removal and ban.",
      examples: {
        do: ["Share cute and heartwarming pet moments", "Post helpful care tips and advice", "Ask questions about pet health and behavior"],
        dont: ["Post graphic injury photos without warning", "Share content depicting animal cruelty", "Post spam or commercial advertisements"]
      }
    },
    {
      icon: MessageCircle,
      title: "Share Accurate Information",
      description: "When giving advice, be honest about your expertise level. For medical concerns, always recommend consulting a veterinarian. Misinformation can harm pets.",
      examples: {
        do: ["Share personal experiences clearly labeled as such", "Cite sources when sharing factual information", "Recommend professional help for serious issues"],
        dont: ["Pretend to be a veterinarian when you're not", "Share unverified medical advice as fact", "Recommend dangerous home remedies"]
      }
    },
    {
      icon: AlertTriangle,
      title: "Respect Privacy",
      description: "Don't share personal information about other users. Respect everyone's privacy and only share what you're comfortable with others knowing.",
      examples: {
        do: ["Keep discussions focused on pets", "Ask permission before sharing others' content", "Report privacy violations to moderators"],
        dont: ["Share others' personal information", "Stalk or harass users outside the platform", "Take screenshots to share elsewhere without consent"]
      }
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-4 mb-8">
              <Link to="/community">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold">Community Guidelines</h1>
                  <p className="text-muted-foreground text-sm">Keep our community safe and friendly</p>
                </div>
              </div>
            </div>

            {/* Introduction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 mb-8 border border-primary/20"
            >
              <p className="text-lg leading-relaxed">
                Welcome to our pet-loving community! These guidelines help ensure a positive experience for everyone. 
                By participating, you agree to follow these rules. Violations may result in content removal or account suspension.
              </p>
            </motion.div>

            {/* Guidelines */}
            <div className="space-y-6">
              {guidelines.map((guideline, index) => {
                const Icon = guideline.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + index * 0.05, duration: 0.3 }}
                    className="bg-card rounded-2xl border border-border overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold mb-2">{guideline.title}</h2>
                          <p className="text-muted-foreground">{guideline.description}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="font-medium text-green-600 dark:text-green-400">Do</span>
                          </div>
                          <ul className="space-y-2">
                            {guideline.examples.do.map((item, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-green-500 mt-1">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-destructive/10 rounded-xl p-4 border border-destructive/20">
                          <div className="flex items-center gap-2 mb-3">
                            <XCircle className="w-4 h-4 text-destructive" />
                            <span className="font-medium text-destructive">Don't</span>
                          </div>
                          <ul className="space-y-2">
                            {guideline.examples.dont.map((item, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-destructive mt-1">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Enforcement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="mt-8 bg-muted/50 rounded-2xl p-6 border border-border"
            >
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Enforcement
              </h3>
              <p className="text-muted-foreground mb-4">
                Our moderators review reported content and take appropriate action. Consequences may include:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Content removal with notification
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  Temporary suspension for repeat violations
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-destructive" />
                  Permanent ban for severe violations
                </li>
              </ul>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.3 }}
              className="mt-8 text-center text-muted-foreground"
            >
              <p>
                Questions about these guidelines? Contact our moderation team through the community.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Guidelines;
