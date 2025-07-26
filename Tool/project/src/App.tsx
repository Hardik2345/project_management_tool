import React from "react";
import { useAuth } from "./hooks/useAuth";
import LoadingScreen from "./components/ui/LoadingScreen";
import { Navigate, BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Projects } from "./pages/Projects";
import { EditProject } from "./pages/EditProject";
import { Tasks } from "./pages/Tasks";
import { TimeTracking } from "./pages/TimeTracking";
import { TeamManagement } from "./pages/TeamManagement";
import { ProfileView } from "./pages/ProfileView";
import { Invoices } from "./pages/Invoices";
import { ClientPortal } from "./pages/ClientPortal";
import { Settings } from "./pages/Settings";
import { ClientManagement } from "./pages/ClientManagement";
import { Meetings } from "./pages/Meetings";
import Login from "./pages/Login";

function App() {
  const { user, loading } = useAuth();
  return (
    <AppProvider>
      <Router>
        {loading ? (
          <LoadingScreen />
        ) : (
          <Routes>
            {!user ? (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            ) : (
              <>
                <Route path="/login" element={<Navigate to="/" />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="projects/:id/edit" element={<EditProject />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="time" element={<TimeTracking />} />
                  <Route path="team" element={<TeamManagement />} />
                  <Route path="team/:memberId/profile" element={<ProfileView />} />
                  <Route path="profile/:userId" element={<ProfileView />} />
                  <Route path="invoices" element={<Invoices />} />
                  <Route path="client" element={<ClientPortal />} />
                  <Route path="clients" element={<ClientManagement />} />
                  <Route path="meetings" element={<Meetings />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </>
            )}
          </Routes>
        )}
      </Router>
    </AppProvider>
  );
}

export default App;
