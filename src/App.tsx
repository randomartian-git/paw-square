import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import PetProfile from "./pages/PetProfile";
import About from "./pages/About";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AIAssistant from "./pages/AIAssistant";
import PostDetail from "./pages/PostDetail";
import AddPet from "./pages/AddPet";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/forum" element={<Community />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/community" element={<Community />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<UserProfile />} />
              <Route path="/pet/:petId" element={<PetProfile />} />
              <Route path="/about" element={<About />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/post/:postId" element={<PostDetail />} />
              <Route path="/add-pet" element={<AddPet />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/edit-post/:postId" element={<EditPost />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;