import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import LandingPage from "./pages/LandingPage";
import StudentAuth from "./pages/StudentAuth";
import AdminAuth from "./pages/AdminAuth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// Layouts
import { StudentLayout } from "./layouts/StudentLayout";
import { AdminLayout } from "./layouts/AdminLayout";

// Student Pages
import StudentHome from "./pages/student/StudentHome";
import SubmitApplication from "./pages/student/SubmitApplication";
import MySubmissions from "./pages/student/MySubmissions";
import StudentNotifications from "./pages/student/StudentNotifications";
import StudentProfile from "./pages/student/StudentProfile";
import RequestCertificate from "./pages/student/RequestCertificate";
import MyGrievances from "./pages/student/MyGrievances";
import StudentAnnouncements from "./pages/student/StudentAnnouncements";

// Admin Pages
import AdminOverview from "./pages/admin/AdminOverview";
import AllApplications from "./pages/admin/AllApplications";
import ExportExcel from "./pages/admin/ExportExcel";
import SendNotifications from "./pages/admin/SendNotifications";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminCertificates from "./pages/admin/AdminCertificates";
import ManageGrievances from "./pages/admin/ManageGrievances";
import Announcements from "./pages/admin/Announcements";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/student-auth" element={<StudentAuth />} />
              <Route path="/admin-auth" element={<AdminAuth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Legacy routes */}
              <Route path="/login" element={<StudentAuth />} />
              <Route path="/login/:role" element={<StudentAuth />} />
              <Route path="/signup" element={<StudentAuth />} />

              {/* Student Routes */}
              <Route path="/student" element={<ProtectedRoute allowedRoles={["student"]}><StudentLayout /></ProtectedRoute>}>
                <Route index element={<StudentHome />} />
                <Route path="submit" element={<SubmitApplication />} />
                <Route path="submissions" element={<MySubmissions />} />
                <Route path="notifications" element={<StudentNotifications />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="certificates" element={<RequestCertificate />} />
                <Route path="grievances" element={<MyGrievances />} />
                <Route path="announcements" element={<StudentAnnouncements />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminOverview />} />
                <Route path="applications" element={<AllApplications />} />
                <Route path="pending" element={<AllApplications filterStatus="pending" />} />
                <Route path="verified" element={<AllApplications filterStatus="verified" />} />
                <Route path="rejected" element={<AllApplications filterStatus="rejected" />} />
                <Route path="certificates" element={<AdminCertificates />} />
                <Route path="grievances" element={<ManageGrievances />} />
                <Route path="export" element={<ExportExcel />} />
                <Route path="notifications" element={<SendNotifications />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="announcements" element={<Announcements />} />
              </Route>

              <Route path="/forgot-password/:role" element={<ForgotPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
