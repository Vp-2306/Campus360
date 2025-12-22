import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CareerModule from "./modules/career/CareerModule";
import GuidancePage from "./pages/career/GuidancePage";
import ProjectsPage from "./pages/career/ProjectsPage";
import CampusBuzzPage from "./pages/career/CampusBuzzPage";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <Routes>
        <Route path="/" element={<CareerModule />} />
        <Route path="/career/guidance" element={<GuidancePage />} />
        <Route path="/career/projects" element={<ProjectsPage />} />
        <Route path="/career/buzz" element={<CampusBuzzPage />} />
      </Routes>
    </div>
  );
}
