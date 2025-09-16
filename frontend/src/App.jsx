import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Main from "./pages/Main";
import TripDashboard from "./pages/TripDashboard";
import CreateTrip from "./pages/CreateTrip";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/newtrip" element={<CreateTrip />} />
          <Route path="/trip/:tripid" element={<TripDashboard />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
