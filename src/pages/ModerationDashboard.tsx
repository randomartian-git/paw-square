import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { 
  Shield, Flag, Check, X, MessageCircle, FileText, 
  Clock, AlertTriangle, User, ChevronDown, ChevronUp,
  Eye, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useModeration } from "@/hooks/useModeration";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import Navbar from "@/components/Navbar";

interface Report {
  id: string;
  reporter_id: string;
  post_id: string | null;
  comment_id: string | null;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  resolved_by: string | null;
  resolved_at: string | null;
  reporter_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  post?: {
    id: string;
    title: string;
    content: string;
    user_id: string;
  };
  comment?: {
    id: string;
    content: string;
    user_id: string;
  };
}

const ModerationDashboard = () => {
  const { user } = useAuth();
  const { isModerator, loading: roleLoading, deletePostAsModerator, deleteCommentAsModerator } = useModeration();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    pending: 0,
    resolved: 0,
    dismissed: 0,
  });

  useEffect(() => {
    if (!roleLoading && !isModerator) {
      navigate("/community");
      return;
    }
    if (isModerator) {
      fetchReports();
    }
  }, [isModerator, roleLoading]);

  const fetchReports = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching reports", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    if (!data) {
      setLoading(false);
      return;
    }

    // Fetch related data
    const reporterIds = [...new Set(data.map(r => r.reporter_id))];
    const postIds = data.filter(r => r.post_id).map(r => r.post_id!);
    const commentIds = data.filter(r => r.comment_id).map(r => r.comment_id!);

    const [profilesRes, postsRes, commentsRes] = await Promise.all([
      supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", reporterIds),
      postIds.length > 0 
        ? supabase.from("posts").select("id, title, content, user_id").in("id", postIds)
        : Promise.resolve({ data: [] }),
      commentIds.length > 0 
        ? supabase.from("comments").select("id, content, user_id").in("id", commentIds)
        : Promise.resolve({ data: [] }),
    ]);

    const profilesMap = new Map<string, { user_id: string; display_name: string | null; avatar_url: string | null }>(
      profilesRes.data?.map(p => [p.user_id, p] as [string, typeof p]) || []
    );
    const postsMap = new Map<string, { id: string; title: string; content: string; user_id: string }>(
      postsRes.data?.map(p => [p.id, p] as [string, typeof p]) || []
    );
    const commentsMap = new Map<string, { id: string; content: string; user_id: string }>(
      commentsRes.data?.map(c => [c.id, c] as [string, typeof c]) || []
    );

    const enrichedReports: Report[] = data.map(report => ({
      ...report,
      reporter_profile: profilesMap.get(report.reporter_id),
      post: report.post_id ? postsMap.get(report.post_id) : undefined,
      comment: report.comment_id ? commentsMap.get(report.comment_id) : undefined,
    }));

    setReports(enrichedReports);
    setStats({
      pending: data.filter(r => r.status === "pending").length,
      resolved: data.filter(r => r.status === "resolved").length,
      dismissed: data.filter(r => r.status === "dismissed").length,
    });
    setLoading(false);
  };

  const toggleExpand = (reportId: string) => {
    setExpandedReports(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  const handleResolve = async (report: Report, action: "remove" | "dismiss") => {
    if (!user) return;

    if (action === "remove") {
      // Delete the reported content
      if (report.post_id && report.post) {
        const result = await deletePostAsModerator(report.post_id, report.post.user_id, report.post.title);
        if (!result.success) {
          toast({ title: "Error removing post", description: result.error, variant: "destructive" });
          return;
        }
      } else if (report.comment_id && report.comment) {
        const { data: commentData } = await supabase
          .from("comments")
          .select("post_id")
          .eq("id", report.comment_id)
          .single();
        
        if (commentData) {
          const result = await deleteCommentAsModerator(report.comment_id, report.comment.user_id, commentData.post_id);
          if (!result.success) {
            toast({ title: "Error removing comment", description: result.error, variant: "destructive" });
            return;
          }
        }
      }
    }

    // Update report status
    const { error } = await supabase
      .from("reports")
      .update({ 
        status: action === "remove" ? "resolved" : "dismissed",
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", report.id);

    if (error) {
      toast({ title: "Error updating report", description: error.message, variant: "destructive" });
    } else {
      toast({ 
        title: action === "remove" ? "Content removed" : "Report dismissed",
        description: action === "remove" ? "The user has been notified." : "The report has been marked as dismissed.",
      });
      fetchReports();
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      spam: "Spam or misleading",
      harassment: "Harassment or bullying",
      hate_speech: "Hate speech",
      inappropriate: "Inappropriate content",
      misinformation: "Misinformation",
      other: "Other",
    };
    return labels[reason] || reason;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-500/20 text-amber-500 border-amber-500/30">Pending</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30">Resolved</Badge>;
      case "dismissed":
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Dismissed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!isModerator) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-primary/20">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">Moderation Dashboard</h1>
              <p className="text-muted-foreground">Review and manage reported content</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pending Reports</CardDescription>
                <CardTitle className="text-3xl text-amber-500">{stats.pending}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Resolved</CardDescription>
                <CardTitle className="text-3xl text-green-500">{stats.resolved}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Dismissed</CardDescription>
                <CardTitle className="text-3xl text-muted-foreground">{stats.dismissed}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Reports */}
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                <Flag className="w-4 h-4" />
                Pending ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value="resolved" className="gap-2">
                <Check className="w-4 h-4" />
                Resolved
              </TabsTrigger>
              <TabsTrigger value="dismissed" className="gap-2">
                <X className="w-4 h-4" />
                Dismissed
              </TabsTrigger>
            </TabsList>

            {["pending", "resolved", "dismissed"].map(status => (
              <TabsContent key={status} value={status} className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : reports.filter(r => r.status === status).length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <Flag className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">No {status} reports</p>
                      <p className="text-muted-foreground">
                        {status === "pending" ? "All caught up!" : `Reports marked as ${status} will appear here.`}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  reports
                    .filter(r => r.status === status)
                    .map(report => (
                      <Card key={report.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              {report.post_id ? (
                                <FileText className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <MessageCircle className="w-5 h-5 text-muted-foreground" />
                              )}
                              <div>
                                <CardTitle className="text-base">
                                  {report.post_id ? "Post Report" : "Comment Report"}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(report.status)}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpand(report.id)}
                              >
                                {expandedReports.has(report.id) ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Reason */}
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                            <span className="font-medium">{getReasonLabel(report.reason)}</span>
                          </div>

                          {/* Reported content preview */}
                          {report.post && (
                            <div className="p-3 rounded-lg bg-muted/50 border border-border">
                              <p className="font-medium mb-1">{report.post.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {report.post.content}
                              </p>
                            </div>
                          )}
                          {report.comment && (
                            <div className="p-3 rounded-lg bg-muted/50 border border-border">
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {report.comment.content}
                              </p>
                            </div>
                          )}

                          {/* Expanded details */}
                          {expandedReports.has(report.id) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="space-y-4 pt-4 border-t border-border"
                            >
                              {report.description && (
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Additional details:</p>
                                  <p className="text-sm">{report.description}</p>
                                </div>
                              )}

                              <div className="flex items-center gap-3">
                                <p className="text-sm text-muted-foreground">Reported by:</p>
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={report.reporter_profile?.avatar_url || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {report.reporter_profile?.display_name?.[0] || "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">
                                    {report.reporter_profile?.display_name || "Anonymous"}
                                  </span>
                                </div>
                              </div>

                              {/* Actions */}
                              {status === "pending" && (
                                <div className="flex items-center gap-2 pt-2">
                                  {report.post_id && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      asChild
                                    >
                                      <Link to={`/post/${report.post_id}`}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Post
                                      </Link>
                                    </Button>
                                  )}

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" size="sm">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Remove Content
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Remove Content</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will permanently delete the reported content and notify the author.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleResolve(report, "remove")}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Remove
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleResolve(report, "dismiss")}
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Dismiss
                                  </Button>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default ModerationDashboard;
