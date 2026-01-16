import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { useState } from "react";

interface LikeButtonProps {
  isLiked: boolean;
  likesCount: number;
  onLike: () => void;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LikeButton = ({ 
  isLiked, 
  likesCount, 
  onLike, 
  showCount = true,
  size = "md",
  className = ""
}: LikeButtonProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    onLike();
    setTimeout(() => setIsAnimating(false), 400);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 transition-all duration-200 ${
        isLiked 
          ? "text-accent" 
          : "text-muted-foreground hover:text-accent"
      } ${className}`}
    >
      <div className="relative">
        <motion.div
          animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Heart 
            className={`${sizeClasses[size]} transition-all duration-200 ${
              isLiked ? "fill-current" : ""
            }`} 
          />
        </motion.div>
        
        {/* Burst particles animation */}
        <AnimatePresence>
          {isAnimating && !isLiked && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ 
                    scale: 1,
                    opacity: 0,
                    x: Math.cos((i * 60) * Math.PI / 180) * 20,
                    y: Math.sin((i * 60) * Math.PI / 180) * 20,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <Heart className="w-2 h-2 text-accent fill-current" />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
      
      {showCount && (
        <motion.span 
          key={likesCount}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`font-medium text-sm ${isLiked ? "text-accent" : ""}`}
        >
          {likesCount}
        </motion.span>
      )}
    </button>
  );
};

export default LikeButton;
