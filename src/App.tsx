import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AlumniAuthProvider } from "@/contexts/AlumniAuthContext";
import JobReadyHubLayout from "@/components/JobReadyHubLayout";
import FeatureGate from "@/components/jobready/FeatureGate";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, ReactNode, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PublicAlumniProfile = lazy(() => import("./pages/PublicAlumniProfile"));
const Dashboard = lazy(() => import("./pages/jobready/JobReadyHubDashboard"));
const Jobs = lazy(() => import("./pages/jobready/JobReadyHubJobs"));
const CvAnalyzer = lazy(() => import("./pages/jobready/JobReadyHubCvAnalyzer"));
const CvBuilder = lazy(() => import("./pages/jobready/JobReadyHubCvBuilder"));
const CoverLetter = lazy(() => import("./pages/jobready/JobReadyHubCoverLetter"));
const InterviewPrep = lazy(() => import("./pages/jobready/JobReadyHubInterviewPrep"));
const InterviewRealtime = lazy(() => import("./pages/jobready/JobReadyHubInterviewRealtime"));
const CodingTest = lazy(() => import("./pages/jobready/JobReadyHubCodingTest"));
const Applications = lazy(() => import("./pages/jobready/JobReadyHubApplications"));
const Courses = lazy(() => import("./pages/jobready/JobReadyHubCourses"));
const CourseDetail = lazy(() => import("./pages/jobready/JobReadyHubCourseDetail"));
const LiveSessions = lazy(() => import("./pages/jobready/JobReadyHubLiveSessions"));
const Mentor = lazy(() => import("./pages/jobready/JobReadyHubMentor"));
const InterviewBank = lazy(() => import("./pages/jobready/JobReadyHubInterviewBank"));
const SqlTest = lazy(() => import("./pages/jobready/JobReadyHubSqlTest"));
const Profile = lazy(() => import("./pages/jobready/JobReadyHubProfile"));

const queryClient = new QueryClient();

const RouteLoadingFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <p className="text-muted-foreground text-sm">Memuat...</p>
  </div>
);

const hub = (node: ReactNode, featureKey?: string) => (
  <JobReadyHubLayout>{featureKey ? <FeatureGate featureKey={featureKey}>{node}</FeatureGate> : node}</JobReadyHubLayout>
);

/** Link lama intelligo.id/job-ready-hub/<fitur> -> /<fitur>. */
function LegacyRedirect() {
  const location = useLocation();
  const target = location.pathname.replace(/^\/job-ready-hub/, "") || "/";
  return <Navigate to={target + location.search} replace />;
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" richColors />
        <AlumniAuthProvider>
          <BrowserRouter>
            <Suspense fallback={<RouteLoadingFallback />}>
              <Routes>
                <Route path="/" element={hub(<Dashboard />)} />
                <Route path="/login" element={<Login />} />
                <Route path="/jobs" element={hub(<Jobs />, "job-board")} />
                <Route path="/cv-analyzer" element={hub(<CvAnalyzer />, "cv-analyzer")} />
                <Route path="/cv-builder" element={hub(<CvBuilder />, "cv-builder")} />
                <Route path="/cover-letter" element={hub(<CoverLetter />, "cover-letter")} />
                <Route path="/interview-prep" element={hub(<InterviewPrep />, "interview-prep")} />
                <Route path="/interview-realtime" element={hub(<InterviewRealtime />, "interview-realtime")} />
                <Route path="/coding-test" element={hub(<CodingTest />, "coding-test")} />
                <Route path="/applications" element={hub(<Applications />, "application-tracker")} />
                <Route path="/courses" element={hub(<Courses />, "video-course")} />
                <Route path="/courses/:id" element={hub(<CourseDetail />, "video-course")} />
                <Route path="/live-sessions" element={hub(<LiveSessions />, "live-session")} />
                <Route path="/mentor" element={hub(<Mentor />, "mentor-session")} />
                <Route path="/interview-bank" element={hub(<InterviewBank />, "interview-bank")} />
                <Route path="/sql-test" element={hub(<SqlTest />, "sql-test")} />
                <Route path="/profile" element={hub(<Profile />, "profile")} />
                <Route path="/u/:username" element={<PublicAlumniProfile />} />
                <Route path="/job-ready-hub/*" element={<LegacyRedirect />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AlumniAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
