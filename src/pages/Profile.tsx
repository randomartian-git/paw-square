import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, Calendar, Edit2, Plus, Dog, BookmarkIcon, MessageSquare,
  Heart, Award, Camera, X, Loader2, Trash2, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import PetCard from "@/components/profile/PetCard";
import PetPhotoGallery from "@/components/profile/PetPhotoGallery";
import ImageCropDialog from "@/components/profile/ImageCropDialog";
import FollowersModal from "@/components/FollowersModal";
import { formatDistanceToNow } from "date-fns";

type Profile = {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  location: string | null;
  created_at: string;
  flair: string[] | null;
  custom_flair: string | null;
  followers_count: number;
  following_count: number;
};

type Pet = {
  id: string;
  name: string;
  type: string;
  breed: string | null;
  age_years: number | null;
  photo_url: string | null;
};

type Post = {
  id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
};


const predefinedFlairs = [
  { id: "helpful", name: "Helpful Owner", icon: Heart, color: "bg-red-500/20 text-red-400" },
  { id: "active", name: "Active Member", icon: MessageSquare, color: "bg-blue-500/20 text-blue-400" },
  { id: "trainer", name: "Trainer", icon: Award, color: "bg-purple-500/20 text-purple-400" },
  { id: "rescue", name: "Rescue Advocate", icon: Heart, color: "bg-green-500/20 text-green-400" },
  { id: "breeder", name: "Breeder", icon: Dog, color: "bg-orange-500/20 text-orange-400" },
];

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingFlairs, setIsEditingFlairs] = useState(false);
  const [customFlairInput, setCustomFlairInput] = useState("");
  const [selectedFlairs, setSelectedFlairs] = useState<string[]>([]);
  const [customFlair, setCustomFlair] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    display_name: "",
    bio: "",
    location: "",
  });
  const [galleryPet, setGalleryPet] = useState<Pet | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [bannerProgress, setBannerProgress] = useState(0);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [bannerCropDialogOpen, setBannerCropDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedBannerImage, setSelectedBannerImage] = useState<string>("");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<"followers" | "following">("followers");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const [profileRes, petsRes, postsRes, bookmarksRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("pets").select("*").eq("user_id", user.id),
      supabase.from("posts").select("*")
        .eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("bookmarks").select("post_id, posts(*)")
        .eq("user_id", user.id),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data);
      setEditForm({
        display_name: profileRes.data.display_name || "",
        bio: profileRes.data.bio || "",
        location: profileRes.data.location || "",
      });
      setSelectedFlairs(profileRes.data.flair || []);
      setCustomFlair(profileRes.data.custom_flair || null);
      setCustomFlairInput(profileRes.data.custom_flair || "");
    }
    if (petsRes.data) setPets(petsRes.data);
    if (postsRes.data) setPosts(postsRes.data);
    if (bookmarksRes.data) {
      const bookmarkedPosts = bookmarksRes.data
        .map(b => b.posts as any)
        .filter(Boolean);
      setBookmarks(bookmarkedPosts);
    }

    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: editForm.display_name,
        bio: editForm.bio,
        location: editForm.location,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved",
      });
      setIsEditing(false);
      fetchData();
    }
  };

  const toggleFlair = async (flairId: string) => {
    if (!user) return;
    
    const newFlairs = selectedFlairs.includes(flairId) 
      ? selectedFlairs.filter(f => f !== flairId)
      : [...selectedFlairs, flairId];
    
    setSelectedFlairs(newFlairs);
    
    const { error } = await supabase
      .from("profiles")
      .update({ flair: newFlairs })
      .eq("user_id", user.id);
    
    if (error) {
      toast({
        title: "Error updating flairs",
        description: error.message,
        variant: "destructive",
      });
      // Revert on error
      setSelectedFlairs(selectedFlairs);
    }
  };

  const handleSaveCustomFlair = async () => {
    if (!user) return;
    
    const trimmedFlair = customFlairInput.trim();
    setCustomFlair(trimmedFlair || null);
    
    const { error } = await supabase
      .from("profiles")
      .update({ custom_flair: trimmedFlair || null })
      .eq("user_id", user.id);
    
    if (error) {
      toast({
        title: "Error updating custom flair",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Custom flair saved!" });
    }
  };

  const handleRemoveCustomFlair = async () => {
    if (!user) return;
    
    setCustomFlair(null);
    setCustomFlairInput("");
    
    const { error } = await supabase
      .from("profiles")
      .update({ custom_flair: null })
      .eq("user_id", user.id);
    
    if (error) {
      toast({
        title: "Error removing custom flair",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAvatarFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image must be less than 10MB", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const handleBannerFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image must be less than 10MB", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedBannerImage(reader.result as string);
      setBannerCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
    if (bannerInputRef.current) bannerInputRef.current.value = '';
  };

  const handleAvatarCropComplete = async (croppedBlob: Blob) => {
    if (!user) return;

    setUploadingAvatar(true);
    setAvatarProgress(0);

    try {
      // Delete old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/profile-images/')[1];
        if (oldPath) {
          await supabase.storage.from('profile-images').remove([decodeURIComponent(oldPath)]);
        }
      }
      setAvatarProgress(20);

      const filePath = `${user.id}/avatar_${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, croppedBlob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;
      setAvatarProgress(70);

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      setAvatarProgress(100);

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      toast({ title: "Profile picture updated!" });
      setCropDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Error uploading image", description: error.message, variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
      setAvatarProgress(0);
    }
  };

  const handleBannerCropComplete = async (croppedBlob: Blob) => {
    if (!user) return;

    setUploadingBanner(true);
    setBannerProgress(0);

    try {
      // Delete old banner if exists
      if (profile?.banner_url) {
        const oldPath = profile.banner_url.split('/profile-images/')[1];
        if (oldPath) {
          await supabase.storage.from('profile-images').remove([decodeURIComponent(oldPath)]);
        }
      }
      setBannerProgress(20);

      const filePath = `${user.id}/banner_${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, croppedBlob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;
      setBannerProgress(70);

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ banner_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      setBannerProgress(100);

      setProfile(prev => prev ? { ...prev, banner_url: publicUrl } : null);
      toast({ title: "Banner updated!" });
      setBannerCropDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Error uploading banner", description: error.message, variant: "destructive" });
    } finally {
      setUploadingBanner(false);
      setBannerProgress(0);
    }
  };

  const handleRemoveAvatar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !profile?.avatar_url) return;

    setUploadingAvatar(true);
    try {
      const oldPath = profile.avatar_url.split('/profile-images/')[1];
      if (oldPath) {
        await supabase.storage.from('profile-images').remove([decodeURIComponent(oldPath)]);
      }

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, avatar_url: null } : null);
      toast({ title: "Profile picture removed" });
    } catch (error: any) {
      toast({ title: "Error removing image", description: error.message, variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveBanner = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !profile?.banner_url) return;

    setUploadingBanner(true);
    try {
      const oldPath = profile.banner_url.split('/profile-images/')[1];
      if (oldPath) {
        await supabase.storage.from('profile-images').remove([decodeURIComponent(oldPath)]);
      }

      const { error } = await supabase
        .from('profiles')
        .update({ banner_url: null })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, banner_url: null } : null);
      toast({ title: "Banner removed" });
    } catch (error: any) {
      toast({ title: "Error removing banner", description: error.message, variant: "destructive" });
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleDeletePet = async (petId: string) => {
    if (!user) return;

    // Delete pet photos from storage first
    const { data: files } = await supabase.storage
      .from("pet-photos")
      .list(`${user.id}/${petId}`);

    if (files && files.length > 0) {
      const filePaths = files.map((file) => `${user.id}/${petId}/${file.name}`);
      await supabase.storage.from("pet-photos").remove(filePaths);
    }

    // Also check for photos in the old path format
    const { data: oldFiles } = await supabase.storage
      .from("pet-photos")
      .list(user.id);

    if (oldFiles) {
      // Filter to find files that might belong to this pet (we can't be 100% sure for old format)
      const pet = pets.find((p) => p.id === petId);
      if (pet?.photo_url) {
        const urlParts = pet.photo_url.split("/pet-photos/");
        if (urlParts.length > 1) {
          const filePath = decodeURIComponent(urlParts[1]);
          await supabase.storage.from("pet-photos").remove([filePath]);
        }
      }
    }

    // Delete the pet record
    const { error } = await supabase.from("pets").delete().eq("id", petId);

    if (error) {
      toast({
        title: "Error deleting pet",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Pet removed successfully" });
      fetchData();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-muted rounded-2xl" />
            <div className="h-32 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-card rounded-2xl border border-border overflow-hidden mb-8"
        >
          {/* Banner */}
          <div 
            className="h-32 relative group cursor-pointer overflow-hidden"
            onClick={() => bannerInputRef.current?.click()}
          >
            {profile?.banner_url ? (
              <img 
                src={profile.banner_url} 
                alt="Profile banner" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary/30 via-accent/30 to-tertiary/30" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              {uploadingBanner ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <>
                  <div className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  {profile?.banner_url && (
                    <button 
                      onClick={handleRemoveBanner}
                      className="p-2 rounded-full bg-destructive/80 hover:bg-destructive transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  )}
                </>
              )}
            </div>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerFileSelect}
              className="hidden"
            />
          </div>
          
          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              <div className="relative group">
                <div 
                  className="cursor-pointer"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Avatar className="w-24 h-24 border-4 border-card">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-3xl text-primary-foreground">
                      {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {uploadingAvatar ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>
                {profile?.avatar_url && (
                  <button 
                    onClick={handleRemoveAvatar}
                    className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-destructive hover:bg-destructive/90 transition-colors opacity-0 group-hover:opacity-100 shadow-md"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                )}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileSelect}
                  className="hidden"
                />
              </div>
              
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={editForm.display_name}
                    onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                    placeholder="Display name"
                    className="max-w-xs"
                  />
                ) : (
                  <h1 className="text-2xl font-display font-bold">
                    {profile?.display_name || "Pet Lover"}
                  </h1>
                )}
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  {profile?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {formatDistanceToNow(new Date(profile?.created_at || new Date()), { addSuffix: true })}
                  </span>
                </div>
                {/* Follower stats */}
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <button
                    onClick={() => {
                      setFollowersModalTab("followers");
                      setFollowersModalOpen(true);
                    }}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{profile?.followers_count ?? 0}</span>
                    <span className="text-muted-foreground">followers</span>
                  </button>
                  <button
                    onClick={() => {
                      setFollowersModalTab("following");
                      setFollowersModalOpen(true);
                    }}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <span className="font-semibold">{profile?.following_count ?? 0}</span>
                    <span className="text-muted-foreground">following</span>
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} className="bg-gradient-to-r from-primary to-accent">
                      Save
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mt-4">
              {isEditing ? (
                <div className="space-y-4">
                  <Textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell us about yourself and your pets..."
                    rows={3}
                  />
                  <Input
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="Location (e.g., San Francisco, CA)"
                  />
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {profile?.bio || "No bio yet. Tell us about yourself!"}
                </p>
              )}
            </div>

            {/* Flairs/Badges */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Flairs</span>
                <button 
                  onClick={() => setIsEditingFlairs(!isEditingFlairs)}
                  className="text-xs text-primary hover:underline"
                >
                  {isEditingFlairs ? "Done" : "Edit"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {isEditingFlairs ? (
                  <>
                    {predefinedFlairs.map((flair) => {
                      const isSelected = selectedFlairs.includes(flair.id);
                      return (
                        <Badge 
                          key={flair.id} 
                          className={`cursor-pointer transition-all ${isSelected ? flair.color : "bg-muted text-muted-foreground"}`}
                          onClick={() => toggleFlair(flair.id)}
                        >
                          <flair.icon className="w-3 h-3 mr-1" />
                          {flair.name}
                          {isSelected && <X className="w-3 h-3 ml-1" />}
                        </Badge>
                      );
                    })}
                    {/* Custom flair input */}
                    <div className="w-full mt-3 flex gap-2">
                      <Input
                        value={customFlairInput}
                        onChange={(e) => setCustomFlairInput(e.target.value)}
                        placeholder="Add custom flair..."
                        className="max-w-xs h-8 text-sm"
                        maxLength={30}
                      />
                      <Button 
                        size="sm" 
                        onClick={handleSaveCustomFlair}
                        disabled={!customFlairInput.trim()}
                        className="h-8"
                      >
                        Save
                      </Button>
                      {customFlair && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={handleRemoveCustomFlair}
                          className="h-8 text-destructive hover:text-destructive"
                        >
                          Remove Custom
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {predefinedFlairs
                      .filter(f => selectedFlairs.includes(f.id))
                      .map((badge) => (
                        <Badge key={badge.id} className={badge.color}>
                          <badge.icon className="w-3 h-3 mr-1" />
                          {badge.name}
                        </Badge>
                      ))}
                    {customFlair && (
                      <Badge className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary">
                        <Award className="w-3 h-3 mr-1" />
                        {customFlair}
                      </Badge>
                    )}
                    {selectedFlairs.length === 0 && !customFlair && (
                      <span className="text-sm text-muted-foreground">No flairs selected</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pets Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">My Pets</h2>
                <Button size="sm" variant="ghost" onClick={() => navigate("/add-pet")}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {pets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                    <Dog className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">No pets added yet</p>
                  <Button size="sm" className="bg-gradient-to-r from-primary to-accent" onClick={() => navigate("/add-pet")}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Pet
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {pets.map((pet) => (
                      <PetCard
                        key={pet.id}
                        pet={pet}
                        onDelete={handleDeletePet}
                        onViewGallery={setGalleryPet}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gradient">{posts.length}</p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gradient">
                    {posts.reduce((acc, p) => acc + p.likes_count, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Likes</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Activity Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="posts" className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  My Posts
                </TabsTrigger>
                <TabsTrigger value="bookmarks" className="flex-1">
                  <BookmarkIcon className="w-4 h-4 mr-2" />
                  Saved ({bookmarks.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="mt-6 space-y-4">
                {posts.length === 0 ? (
                  <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No posts yet</p>
                    <Button className="mt-4 bg-gradient-to-r from-primary to-accent" onClick={() => navigate("/forum")}>
                      Create Your First Post
                    </Button>
                  </div>
                ) : (
                  posts.map((post) => (
                    <motion.div
                      key={post.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant="outline" className="mb-2 capitalize">
                            {post.category}
                          </Badge>
                          <h3 className="font-semibold">{post.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {post.likes_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {post.comments_count}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="bookmarks" className="mt-6 space-y-4">
                {bookmarks.length === 0 ? (
                  <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <BookmarkIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No saved posts yet</p>
                    <Button className="mt-4 bg-gradient-to-r from-primary to-accent" onClick={() => navigate("/forum")}>
                      Explore Community
                    </Button>
                  </div>
                ) : (
                  bookmarks.map((post) => (
                    <motion.div
                      key={post.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:border-primary/30 transition-all"
                    >
                      <Badge variant="outline" className="mb-2 capitalize">
                        {post.category}
                      </Badge>
                      <h3 className="font-semibold">{post.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {post.likes_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {post.comments_count}
                        </span>
                        <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      {/* Pet Photo Gallery */}
      <PetPhotoGallery
        pet={galleryPet}
        isOpen={!!galleryPet}
        onClose={() => setGalleryPet(null)}
        onPhotoUpdated={fetchData}
      />

      {/* Image Crop Dialogs */}
      <ImageCropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        imageSrc={selectedImage}
        aspectRatio={1}
        title="Crop Profile Picture"
        onCropComplete={handleAvatarCropComplete}
        uploadProgress={avatarProgress}
        isUploading={uploadingAvatar}
      />

      <ImageCropDialog
        open={bannerCropDialogOpen}
        onOpenChange={setBannerCropDialogOpen}
        imageSrc={selectedBannerImage}
        aspectRatio={16 / 5}
        title="Crop Banner"
        onCropComplete={handleBannerCropComplete}
        uploadProgress={bannerProgress}
        isUploading={uploadingBanner}
      />

      {/* Followers Modal */}
      {user && (
        <FollowersModal
          open={followersModalOpen}
          onOpenChange={setFollowersModalOpen}
          userId={user.id}
          initialTab={followersModalTab}
        />
      )}
    </div>
  );
};

export default Profile;
