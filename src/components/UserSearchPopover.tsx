import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface UserResult {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface UserSearchPopoverProps {
  className?: string;
}

const UserSearchPopover = ({ className = "" }: UserSearchPopoverProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, bio")
        .ilike("display_name", `%${query}%`)
        .limit(8);

      if (data && !error) {
        setResults(data);
        setShowResults(true);
      }
      setLoading(false);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleSelect = (userId: string) => {
    navigate(`/profile/${userId}`);
    setQuery("");
    setShowResults(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && results.length > 0 && setShowResults(true)}
          placeholder="Search users..."
          className="pl-9 pr-4 bg-muted/50"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50"
          >
            {results.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No users found</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {results.map((user) => (
                  <motion.button
                    key={user.user_id}
                    whileHover={{ backgroundColor: "hsl(var(--muted))" }}
                    onClick={() => handleSelect(user.user_id)}
                    className="w-full flex items-center gap-3 p-3 text-left transition-colors"
                  >
                    <Avatar className="w-10 h-10 border-2 border-primary/20">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm">
                        {user.display_name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {user.display_name || "Anonymous"}
                      </p>
                      {user.bio && (
                        <p className="text-xs text-muted-foreground truncate">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserSearchPopover;
