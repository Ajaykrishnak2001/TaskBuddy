import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase-config.ts';
import Login from './pages/login';
import Tasklist from './pages/tasklist';
import Taskboard from './pages/taskBoard';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Stop loading after checking auth state
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while checking auth state
  }

  return (
    <Router>
      <div>
        <Routes>
          {/* Redirect to login if user is not authenticated */}
          <Route
            path="/"
            element={<Navigate to={user ? "/tasklist" : "/login"} replace />}
          />

          {/* Login Route */}
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/tasklist" replace />}
          />

          {/* Authentication Protected Routes */}
          <Route
            path="/tasklist"
            element={user ? <Tasklist /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/taskboard"
            element={user ? <Taskboard /> : <Navigate to="/login" replace />}
          />

          {/* Optional: Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
