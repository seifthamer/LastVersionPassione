import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import Dashboard from "../pages/dashboard_utilisateur/DashboardUtilisateur";
import Equipe from "../pages/equipe/Equipe";
import Match from "../pages/match/Match";
import Joueur from "../pages/joueur/Joueur";
import Quiz from "../pages/quiz/Quiz";
import Login from "../Components/login/Login";
import Home from "../pages/home/Home";
import useAuthStore from "../Store/authStore";
import Blog from "../pages/blog/Blog";
import Galerie from "../pages/galerie/Galerie";
import Gestion from "../pages/gestion/Gestion";
import Apropos from "../pages/gestion/Apropos";
import RegleDeJeux from "../pages/gestion/RegleDeJeux";
import ConditionDutilisateur from "../pages/gestion/ConditionDutilisateur";
import DetailsMatch from "../pages/match/DetailsMatch";
import Sponsors from "../pages/sponsors/Sponsors";

const AppRouter = () => {
  const { token, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Protected Route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="equipe" element={<Equipe />} />
        <Route path="match" element={<Match />} />
        <Route path="match/:id" element={<DetailsMatch />} />
        <Route path="joueur" element={<Joueur />} />
        <Route path="blog" element={<Blog />} />
        <Route path="galerie" element={<Galerie />} />
        <Route path="gestion" element={<Gestion />} />
        <Route path="gestion/about" element={<Apropos />} />
        <Route path="gestion/rules" element={<RegleDeJeux />} />
        <Route path="gestion/terms" element={<ConditionDutilisateur />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="sponsors" element={<Sponsors />} />
      </Route>

      {/* Catch-all 404 page */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRouter;
