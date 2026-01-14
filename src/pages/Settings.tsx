import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Sun, Moon, Eye, Check, ArrowLeft, Lock, Mail, Trash2, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme, ThemeMode } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast({ title: "Please type DELETE to confirm", variant: "destructive" });
      return;
    }

    setIsDeletingAccount(true);
    try {
      // Delete user data from related tables first
      if (user) {
        await supabase.from("pets").delete().eq("user_id", user.id);
        await supabase.from("posts").delete().eq("user_id", user.id);
        await supabase.from("comments").delete().eq("user_id", user.id);
        await supabase.from("likes").delete().eq("user_id", user.id);
        await supabase.from("bookmarks").delete().eq("user_id", user.id);
        await supabase.from("profiles").delete().eq("user_id", user.id);
      }

      // Sign out the user
      await signOut();
      
      toast({ 
        title: "Account deleted", 
        description: "Your account and all associated data have been removed." 
      });
      navigate("/");
    } catch (error: any) {
      toast({ 
        title: "Error deleting account", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) {
      toast({ title: "Please enter a new email", variant: "destructive" });
      return;
    }

    setIsUpdatingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) {
      toast({ title: "Error updating email", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email update initiated", description: "Please check your new email for a confirmation link." });
      setNewEmail("");
    }
    setIsUpdatingEmail(false);
  };

  const handleUpdatePassword = async () => {
    if (!newPassword.trim()) {
      toast({ title: "Please enter a new password", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }

    setIsUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast({ title: "Error updating password", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setIsUpdatingPassword(false);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
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
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    onClick={() => setTheme(option.id)}
                    className={`relative w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
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
                              transition={{ duration: 0.2 }}
                              className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                            >
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </motion.span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {option.description}
                        </p>
                        
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

          {/* Account Section - Only show if logged in */}
          {user && (
            <section className="mb-10">
              <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Account Settings
              </h2>

              <div className="space-y-6">
                {/* Change Email */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                  className="p-5 rounded-2xl bg-card border border-border"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Change Email</h3>
                      <p className="text-sm text-muted-foreground">Current: {user.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="newEmail">New Email Address</Label>
                      <Input
                        id="newEmail"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Enter new email"
                        className="mt-1"
                      />
                    </div>
                    <Button
                      onClick={handleUpdateEmail}
                      disabled={isUpdatingEmail || !newEmail.trim()}
                      className="bg-gradient-to-r from-primary to-accent"
                    >
                      {isUpdatingEmail ? "Updating..." : "Update Email"}
                    </Button>
                  </div>
                </motion.div>

                {/* Change Password */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.2 }}
                  className="p-5 rounded-2xl bg-card border border-border"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Change Password</h3>
                      <p className="text-sm text-muted-foreground">Update your account password</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="mt-1"
                      />
                    </div>
                    <Button
                      onClick={handleUpdatePassword}
                      disabled={isUpdatingPassword || !newPassword.trim()}
                      className="bg-gradient-to-r from-primary to-accent"
                    >
                      {isUpdatingPassword ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </motion.div>

                {/* Delete Account */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.2 }}
                  className="p-5 rounded-2xl bg-destructive/5 border border-destructive/20"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-destructive">Delete Account</h3>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
                    <p className="text-sm text-destructive flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>
                        This action is permanent and cannot be undone. All your pets, posts, comments, 
                        and profile data will be permanently deleted.
                      </span>
                    </p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full sm:w-auto">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete My Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                          <AlertTriangle className="w-5 h-5" />
                          Delete Account Permanently?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                          <p>
                            This will permanently delete your account and all associated data including:
                          </p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            <li>Your profile and settings</li>
                            <li>All your pets</li>
                            <li>All your posts and comments</li>
                            <li>Your likes and bookmarks</li>
                          </ul>
                          <p className="font-medium">
                            Type <span className="text-destructive font-bold">DELETE</span> to confirm:
                          </p>
                          <Input
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="Type DELETE to confirm"
                            className="mt-2"
                          />
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmText !== "DELETE" || isDeletingAccount}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {isDeletingAccount ? "Deleting..." : "Delete Forever"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </motion.div>
              </div>
            </section>
          )}

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.2 }}
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
