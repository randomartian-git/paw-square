import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Calendar, Dog, Cat, Bird, Fish, Rabbit, Sparkles, Heart, MessageSquare, Mail, UserPlus, UserCheck, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import FollowersModal from "@/components/FollowersModal";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

type Profile = {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  created_at: string;
  followers_count: number;
  following_count: number;
};

type Pet = {
  id: string;
  name: string;
  type: string;
  breed: string | null;
  age_years: number | null;
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

const petTypeIcons: Record<string, any> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  fish: Fish,
  rabbit: Rabbit,
  other: Sparkles,
};

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingConversation, setStartingConversation] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<"followers" | "following">("followers");

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  const fetchData = async () => {
    if (!userId) return;
    setLoading(true);

    const [profileRes, petsRes, postsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("pets").select("*").eq("user_id", userId),
      supabase.from("posts").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (petsRes.data) setPets(petsRes.data);
    if (postsRes.data) setPosts(postsRes.data);

    // Check if current user is following this profile
    if (user && userId !== user.id) {
      const { data: followData } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", userId)
        .maybeSingle();
      setIsFollowing(!!followData);
    }

    setLoading(false);
  };

  const handleFollow = async () => {
    if (!user) {
      toast.error("Please sign in to follow users");
      navigate("/auth");
      return;
    }
    if (!userId || userId === user.id) return;

    setFollowLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId);

        if (error) throw error;

        setIsFollowing(false);
        setProfile((prev) =>
          prev ? { ...prev, followers_count: Math.max(0, prev.followers_count - 1) } : prev
        );
        toast.success("Unfollowed successfully");
      } else {
        // Follow
        const { error } = await supabase.from("follows").insert({
          follower_id: user.id,
          following_id: userId,
        });

        if (error) throw error;

        setIsFollowing(true);
        setProfile((prev) =>
          prev ? { ...prev, followers_count: prev.followers_count + 1 } : prev
        );
        toast.success("Following!");
      }
    } catch (error) {
      console.error("[Follow]", error);
      toast.error("Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleStartConversation = async () => {
    if (!user) {
      toast.error("Please sign in to send messages");
      navigate("/auth");
      return;
    }

    if (!userId || userId === user.id) return;

    setStartingConversation(true);

    try {
      // Check if a conversation already exists between these users
      const { data: myConversations, error: myConversationsError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (myConversationsError) throw myConversationsError;

      if (myConversations && myConversations.length > 0) {
        const conversationIds = myConversations.map((c) => c.conversation_id);

        const { data: existingConv, error: existingConvError } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", userId)
          .in("conversation_id", conversationIds)
          .limit(1)
          .maybeSingle();

        if (existingConvError) throw existingConvError;

        if (existingConv?.conversation_id) {
          // Conversation exists, navigate to it
          navigate(`/messages/${existingConv.conversation_id}`);
          return;
        }
      }

      // Create new conversation.
      // IMPORTANT: we don't call `.select()` here because the conversations SELECT policy
      // requires being a participant, and participants are added in the next steps.
      const conversationId = crypto.randomUUID();

      const { error: convError } = await supabase.from("conversations").insert({
        id: conversationId,
      });

      if (convError) {
        throw convError;
      }

      // Add both participants (insert self first to satisfy RLS)
      const { error: addMeError } = await supabase.from("conversation_participants").insert({
        conversation_id: conversationId,
        user_id: user.id,
      });

      if (addMeError) {
        throw addMeError;
      }

      const { error: addOtherError } = await supabase.from("conversation_participants").insert({
        conversation_id: conversationId,
        user_id: userId,
      });

      if (addOtherError) {
        throw addOtherError;
      }

      navigate(`/messages/${conversationId}`);
    } catch (error) {
      console.error("[startConversation]", error);
      toast.error("Failed to start conversation");
    } finally {
      setStartingConversation(false);
    }
  };

  if (loading) {
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 text-center">
          <h1 className="text-2xl font-bold">User not found</h1>
          <p className="text-muted-foreground mt-2">This profile doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border overflow-hidden mb-8"
        >
          <div className="h-32 bg-gradient-to-r from-primary/30 via-accent/30 to-tertiary/30" />

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              <Avatar className="w-24 h-24 border-4 border-card">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-3xl text-primary-foreground">
                  {profile.display_name?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-2xl font-display font-bold">{profile.display_name || "Pet Lover"}</h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
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
                    <span className="font-semibold">{profile.followers_count}</span>
                    <span className="text-muted-foreground">followers</span>
                  </button>
                  <button
                    onClick={() => {
                      setFollowersModalTab("following");
                      setFollowersModalOpen(true);
                    }}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <span className="font-semibold">{profile.following_count}</span>
                    <span className="text-muted-foreground">following</span>
                  </button>
                </div>
              </div>

              {user && userId !== user.id && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleFollow}
                    disabled={followLoading}
                    variant={isFollowing ? "outline" : "default"}
                    className={isFollowing ? "" : "bg-gradient-hero shadow-glow"}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleStartConversation}
                    disabled={startingConversation}
                    variant="outline"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {startingConversation ? "..." : "Message"}
                  </Button>
                </div>
              )}
            </div>

            {profile.bio && (
              <p className="text-muted-foreground mt-4">{profile.bio}</p>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pets */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Pets ({pets.length})</h2>
              {pets.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No pets yet</p>
              ) : (
                <div className="space-y-3">
                  {pets.map((pet) => {
                    const PetIcon = petTypeIcons[pet.type] || Sparkles;
                    return (
                      <div 
                        key={pet.id} 
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => navigate(`/pet/${pet.id}`)}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <PetIcon className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium hover:text-primary transition-colors">{pet.name}</p>
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
            </div>
          </motion.div>

          {/* Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <h2 className="text-lg font-semibold mb-4">Posts ({posts.length})</h2>
            {posts.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-12 text-center">
                <p className="text-muted-foreground">No posts yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => navigate(`/post/${post.id}`)}
                    className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:border-primary/30 transition-all"
                  >
                    <Badge variant="outline" className="mb-2 capitalize">{post.category}</Badge>
                    <h3 className="font-semibold">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" /> {post.likes_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" /> {post.comments_count}
                      </span>
                      <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Followers Modal */}
      {userId && (
        <FollowersModal
          open={followersModalOpen}
          onOpenChange={setFollowersModalOpen}
          userId={userId}
          initialTab={followersModalTab}
        />
      )}
    </div>
  );
};

export default UserProfile;
