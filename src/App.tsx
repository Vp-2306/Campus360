import { Routes, Route } from "react-router-dom";
import AuthGate from "./components/AuthGate";

import Campus360 from "./modules/Campus360";
import CareerLayout from "./layouts/CareerLayout";
import CareerModule from "./modules/career/CareerModule";
import GuidancePage from "./pages/career/GuidancePage";
import ProjectsPage from "./pages/career/ProjectsPage";
import CampusBuzzPage from "./pages/career/CampusBuzzPage";
import ChatPage from "./pages/career/ChatPage";
import ProjectWorkspace from "./pages/career/ProjectWorkspace";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ProfileSetup from "./pages/auth/ProfileSetup";

import SportsHub from "./pages/sports/SportsHub";

export default function App() {
  return (
    <Routes>

      {/* CAMPUS360 HOME (NO MAIN NAVBAR) */}
      <Route path="/" element={<Campus360 />} />

      {/* AUTH */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />
      <Route path="/profile-setup" element={<AuthGate><ProfileSetup/></AuthGate>} />

      {/* CAREER MODULE LAYOUT */}
      <Route element={<CareerLayout />}>
        <Route path="/career" element={<CareerModule />} />
        <Route path="/career/guidance" element={<AuthGate><GuidancePage/></AuthGate>} />
        <Route path="/career/projects" element={<AuthGate><ProjectsPage/></AuthGate>} />
        <Route path="/career/buzz" element={<AuthGate><CampusBuzzPage/></AuthGate>} />
        <Route path="/career/chat/:id" element={<ChatPage />} />
        <Route path="/projects/workspace/:projectId" element={<ProjectWorkspace />} />
      </Route>

      
      <Route
        path="/sports"
        element={
          <AuthGate>
            <SportsHub />
          </AuthGate>
        }
      />
    </Routes>
  );
}
