import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Main from "./pages/Main";
import TripDashboard from "./pages/TripDashboard";
import CreateTrip from "./pages/CreateTrip";
import TripEdit from "./pages/TripEdit";
import Members from "./pages/Members";
import RejectInvitation from "./pages/RejectInvitation";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Index from "./pages/Index";
import AuthProvider from "./auth/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Main />
                </ProtectedRoute>
              }
            />
            <Route
              path="/newtrip"
              element={
                <ProtectedRoute>
                  <CreateTrip />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trip/:tripid"
              element={
                <ProtectedRoute>
                  <TripDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trip/edit/:tripid"
              element={
                <ProtectedRoute>
                  <TripEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trip/members/:tripid"
              element={
                <ProtectedRoute>
                  <Members />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trip/reject/:invitationid"
              element={<RejectInvitation />}
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
