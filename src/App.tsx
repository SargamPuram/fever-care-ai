import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PatientDashboard from "./pages/PatientDashboard";
import ClinicianDashboard from "./pages/ClinicianDashboard";
import PatientDetailView from "./pages/PatientDetailView";
import Chatbot from "./pages/Chatbot";
import SymptomLog from "./pages/SymptomLog";
import DeviceSetup from "./pages/DeviceSetup";
import Heatmap from "./pages/Heatmap";
import NotFound from "./pages/NotFound";
<<<<<<< Updated upstream
import AITesting from "./components/AITesting";
=======
import PatientLogin from "./pages/PatientLogin";
import ClinicianLogin from "./pages/ClinicianLogin";
import PatientSignup from "./pages/PatientSignup";
import ClinicianSignup from "./pages/ClinicianSignup";
>>>>>>> Stashed changes

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup-patient" element={<PatientSignup />} />
          <Route path="/signin-patient" element={<PatientLogin />} />
          <Route path="/signup-clinician" element={<ClinicianSignup />} />
          <Route path="/signin-clinician" element={<ClinicianLogin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/symptom-log" element={<SymptomLog />} />
          <Route path="/device-setup" element={<DeviceSetup />} />
          <Route path="/clinician" element={<ClinicianDashboard />} />
          <Route path="/clinician/patient/:id" element={<PatientDetailView />} />
          <Route path="/heatmap" element={<Heatmap />} />
          <Route path="/ai-test" element={<AITesting />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
