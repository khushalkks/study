import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { isLoggedIn } from "./auth";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import InterviewPage from "./pages/MockInterview";
import Resume from "./pages/Resume";
import Community from "./pages/Community";
import CodeCollab from "./pages/CodeCollab";
import QuizPage from "./pages/QuizPage";
import SummaryPage from "./pages/SummaryPage";
import MindMapGenerator from "./pages/MindMap";
import FlashcardGenerator from "./pages/FlashcardPage";
import ChatbotPage from "./pages/ChatbotPage";
import QuizResultPage from "./pages/QuizResultPage";
import StudyPlan from "./pages/StudyPlan";
import LoginPage from "./pages/LoginPage";

// Redirects logged-in users away from login page
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  if (isLoggedIn()) return <Navigate to="/home" replace />;
  return <>{children}</>;
};

// Blocks unauthenticated users from protected pages
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isLoggedIn()) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => (
  <Routes>
    {/* Public: login/register — redirects to /home if already logged in */}
    <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />

    {/* Protected routes */}
    <Route path="/home"       element={<ProtectedRoute><Home /></ProtectedRoute>} />
    <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/interview"  element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
    <Route path="/resume"     element={<ProtectedRoute><Resume /></ProtectedRoute>} />
    <Route path="/community"  element={<ProtectedRoute><Community /></ProtectedRoute>} />
    <Route path="/code"       element={<ProtectedRoute><CodeCollab /></ProtectedRoute>} />
    <Route path="/quiz"       element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
    <Route path="/summary"    element={<ProtectedRoute><SummaryPage /></ProtectedRoute>} />
    <Route path="/mindmap"    element={<ProtectedRoute><MindMapGenerator /></ProtectedRoute>} />
    <Route path="/flashcards" element={<ProtectedRoute><FlashcardGenerator /></ProtectedRoute>} />
    <Route path="/chatbot"    element={<ProtectedRoute><ChatbotPage /></ProtectedRoute>} />
    <Route path="/quiz/result" element={<ProtectedRoute><QuizResultPage /></ProtectedRoute>} />
    <Route path="/study-plan" element={<ProtectedRoute><StudyPlan /></ProtectedRoute>} />

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;