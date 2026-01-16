import { useState } from "react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Common emojis for quick access
const COMMON_EMOJIS = [
  "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊",
  "😇", "🙂", "😉", "😍", "🥰", "😘", "😋", "😛",
  "🤔", "🤗", "🤭", "🤫", "🤥", "😶", "😐", "😑",
  "😏", "😒", "🙄", "😬", "😮‍💨", "🤐", "😯", "😲",
  "😳", "🥺", "😢", "😭", "😤", "😠", "🤬", "😈",
  "👍", "👎", "👏", "🙌", "🤝", "💪", "🙏", "✌️",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
  "🐾", "🦴", "🐕", "🐈", "🐩", "🦮", "🐕‍🦺", "🐈‍⬛",
];

type EmojiPickerProps = {
  onEmojiSelect: (emoji: string) => void;
};

const EmojiPicker = ({ onEmojiSelect }: EmojiPickerProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (emoji: string) => {
    onEmojiSelect(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0" type="button">
          <Smile className="w-5 h-5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <div className="grid grid-cols-8 gap-1">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleSelect(emoji)}
              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-muted rounded transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
