import { useState } from "react";
import { Outlet } from "react-router-dom";
import PetCareAssistant from "@/components/chat/PetCareAssistant";

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AIAssistantContext = {
  openAssistant: () => {},
};

const AppLayout = ({ children }: AppLayoutProps) => {
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Expose the function globally for navbar access
  AIAssistantContext.openAssistant = () => setIsAIOpen(true);

  return (
    <>
      {children}
      <PetCareAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
    </>
  );
};

export default AppLayout;