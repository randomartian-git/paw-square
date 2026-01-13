import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, MapPin, Calendar, Edit2, Plus, Dog, Cat, Bird, 
  Fish, Rabbit, Sparkles, Settings, BookmarkIcon, MessageSquare,
  Heart, Award, Camera
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
import { formatDistanceToNow } from "date-fns";

type Profile = {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  created_at: string;
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
  category: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
};

const petTypeIcons: Record<string, any> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  fish: Fish,
  rabbit: Rabbit,
  hamster: Sparkles,
  other: Sparkles,
};

const badges = [
  { id: "helpful", name: "Helpful Owner", icon: Heart, color: "bg-red-500/20 text-red-400" },
  { id: "active", name: "Active Member", icon: MessageSquare, color: "bg-blue-500/20 text-blue-400" },
  { id: "trainer", name: "Trainer", icon: Award, color: "bg-purple-500/20 text-purple-400" },
];

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: "",
    bio: "",
    location: "",
  });
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
      supabase.from("posts").select("id, title, category, likes_count, comments_count, created_at")
        .eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("bookmarks").select("post_id, posts(id, title, category, likes_count, comments_count, created_at)")
        .eq("user_id", user.id),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data);
      setEditForm({
        display_name: profileRes.data.display_name || "",
        bio: profileRes.data.bio || "",
        location: profileRes.data.location || "",
      });
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border overflow-hidden mb-8"
        >
          {/* Banner */}
          <div className="h-32 bg-gradient-hero relative">
            <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-20" />
          </div>
          
          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              <Avatar className="w-24 h-24 border-4 border-card">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-hero text-3xl text-primary-foreground">
                  {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              
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
              </div>
              
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} className="bg-gradient-hero">
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

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {badges.map((badge) => (
                <Badge key={badge.id} className={badge.color}>
                  <badge.icon className="w-3 h-3 mr-1" />
                  {badge.name}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pets Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">My Pets</h2>
                <Button size="sm" variant="ghost">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {pets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                    <Dog className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">No pets added yet</p>
                  <Button size="sm" className="bg-gradient-hero">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Pet
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {pets.map((pet) => {
                    const PetIcon = petTypeIcons[pet.type] || Sparkles;
                    return (
                      <div
                        key={pet.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center">
                          {pet.photo_url ? (
                            <img
                              src={pet.photo_url}
                              alt={pet.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <PetIcon className="w-6 h-6 text-primary-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{pet.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {pet.breed || pet.type}
                            {pet.age_years && ` • ${pet.age_years} yrs`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
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
                  Saved
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="mt-6 space-y-4">
                {posts.length === 0 ? (
                  <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No posts yet</p>
                    <Button className="mt-4 bg-gradient-hero" onClick={() => navigate("/community")}>
                      Create Your First Post
                    </Button>
                  </div>
                ) : (
                  posts.map((post) => (
                    <motion.div
                      key={post.id}
                      whileHover={{ scale: 1.01 }}
                      className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:border-primary/30 transition-colors"
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
                    <Button className="mt-4 bg-gradient-hero" onClick={() => navigate("/community")}>
                      Explore Community
                    </Button>
                  </div>
                ) : (
                  bookmarks.map((post) => (
                    <motion.div
                      key={post.id}
                      whileHover={{ scale: 1.01 }}
                      className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:border-primary/30 transition-colors"
                    >
                      <Badge variant="outline" className="mb-2 capitalize">
                        {post.category}
                      </Badge>
                      <h3 className="font-semibold">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                    </motion.div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
