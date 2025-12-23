import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AuthGate from "./components/AuthGate";

import CareerModule from "./modules/career/CareerModule";
import GuidancePage from "./pages/career/GuidancePage";
import ProjectsPage from "./pages/career/ProjectsPage";
import CampusBuzzPage from "./pages/career/CampusBuzzPage";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ProfileSetup from "./pages/auth/ProfileSetup";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<CareerModule />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />

        {/* PROFILE SETUP (logged in but incomplete) */}
        <Route
          path="/profile-setup"
          element={
            <AuthGate>
              <ProfileSetup />
            </AuthGate>
          }
        />

        {/* PROTECTED ROUTES */}
        <Route
          path="/career/guidance"
          element={
            <AuthGate>
              <GuidancePage />
            </AuthGate>
          }
        />
        <Route
          path="/career/projects"
          element={
            <AuthGate>
              <ProjectsPage />
            </AuthGate>
          }
        />
        <Route
          path="/career/buzz"
          element={
            <AuthGate>
              <CampusBuzzPage />
            </AuthGate>
          }
        />
      </Routes>
    </div>
  );
}
