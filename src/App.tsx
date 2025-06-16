import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import Login from "./components/Login";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import routes from "tempo-routes";
import SignUp from "./components/SignUp";
import LinearProgress from '@mui/material/LinearProgress';
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <AuthProvider>
      <Toaster /> {/* Required for showing toast */}
      <Suspense fallback={<LinearProgress color="success" />}>
        <>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Home initialTab="profile" />
                </ProtectedRoute>
              }
            />
            {import.meta.env.VITE_TEMPO === "true" && (
              <Route path="/tempobook/*" />
            )}
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
