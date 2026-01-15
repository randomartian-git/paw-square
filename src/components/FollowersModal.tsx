import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, UserCheck } from "lucide-react";
import { toast } from "sonner";

type FollowUser = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
};

interface FollowersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  initialTab?: "followers" | "following";
}

const FollowersModal = ({ open, onOpenChange, userId, initialTab = "followers" }: FollowersModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      fetchData();
    }
  }, [open, userId, initialTab]);

  const fetchData = async () => {
    setLoading(true);

    // Fetch followers (people who follow this user)
    const { data: followersData } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("following_id", userId);

    // Fetch following (people this user follows)
    const { data: followingData } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId);

    const followerIds = followersData?.map((f) => f.follower_id) || [];
    const followingIds = followingData?.map((f) => f.following_id) || [];

    // Fetch profiles for followers
    if (followerIds.length > 0) {
      const { data: followerProfiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", followerIds);
      setFollowers(followerProfiles || []);
    } else {
      setFollowers([]);
    }

    // Fetch profiles for following
    if (followingIds.length > 0) {
      const { data: followingProfiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", followingIds);
      setFollowing(followingProfiles || []);
    } else {
      setFollowing([]);
    }

    // Check which users the current user is following
    if (user) {
      const allUserIds = [...new Set([...followerIds, ...followingIds])];
      if (allUserIds.length > 0) {
        const { data: myFollows } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id)
          .in("following_id", allUserIds);

        const statusMap: Record<string, boolean> = {};
        myFollows?.forEach((f) => {
          statusMap[f.following_id] = true;
        });
        setFollowingStatus(statusMap);
      }
    }

    setLoading(false);
  };

  const handleToggleFollow = async (targetUserId: string) => {
    if (!user) {
      toast.error("Please sign in to follow users");
      return;
    }
    if (targetUserId === user.id) return;

    setActionLoading(targetUserId);

    try {
      if (followingStatus[targetUserId]) {
        // Unfollow
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", targetUserId);

        setFollowingStatus((prev) => ({ ...prev, [targetUserId]: false }));
      } else {
        // Follow
        await supabase.from("follows").insert({
          follower_id: user.id,
          following_id: targetUserId,
        });

        setFollowingStatus((prev) => ({ ...prev, [targetUserId]: true }));
      }
    } catch (error) {
      console.error("[ToggleFollow]", error);
      toast.error("Failed to update follow");
    } finally {
      setActionLoading(null);
    }
  };

  const handleNavigateToProfile = (targetUserId: string) => {
    onOpenChange(false);
    navigate(`/profile/${targetUserId}`);
  };

  const renderUserList = (users: FollowUser[]) => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {activeTab === "followers" ? "No followers yet" : "Not following anyone yet"}
        </div>
      );
    }

    return (
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {users.map((u) => (
          <div
            key={u.user_id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div
              className="flex items-center gap-3 flex-1 cursor-pointer"
              onClick={() => handleNavigateToProfile(u.user_id)}
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={u.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  {u.display_name?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium hover:text-primary transition-colors">
                {u.display_name || "Pet Lover"}
              </span>
            </div>

            {user && u.user_id !== user.id && (
              <Button
                size="sm"
                variant={followingStatus[u.user_id] ? "outline" : "default"}
                disabled={actionLoading === u.user_id}
                onClick={() => handleToggleFollow(u.user_id)}
                className="shrink-0"
              >
                {followingStatus[u.user_id] ? (
                  <>
                    <UserCheck className="w-3 h-3 mr-1" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3 mr-1" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Connections</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "followers" | "following")}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="followers">
              Followers ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following">
              Following ({following.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="mt-4">
            {renderUserList(followers)}
          </TabsContent>

          <TabsContent value="following" className="mt-4">
            {renderUserList(following)}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersModal;
