import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Main from "./pages/Main";
import TripDashboard from "./pages/TripDashboard";
import CreateTrip from "./pages/CreateTrip";
import TripEdit from "./pages/TripEdit";
import Members from "./pages/Members";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/newtrip" element={<CreateTrip />} />
          <Route path="/trip/:tripid" element={<TripDashboard />} />
          <Route path="/trip/edit/:tripid" element={<TripEdit />} />
          <Route path="/trip/members/:tripid" element={<Members />} />
          <Route path="/trip/reject/:invitationid" element={<RejectInvitation />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
