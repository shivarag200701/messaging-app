import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";      // New slider UI
import Chat from "./pages/Chat";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Unified Login/Register page */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/chat" /> : <Auth />} />

        {/* Protected Chat Route */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;