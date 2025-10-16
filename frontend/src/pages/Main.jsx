import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthProvider";

import "../css/main.css";

import MainSideBar from "../components/MainSideBar";
import Header from "../components/header";
import TripCard from "../components/TripCard";

export default function Main() {
  const { session, initialized } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initialized) return;
    if (!session) return;

    async function getTrips() {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) {
          setTrips([]);
          setLoading(false);
          return;
        }
        const tripData = await fetch(
          "https://wanderfunds-backend.onrender.com/api/trips",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!tripData.ok) {
          console.error("Trips fetch failed:", tripData.status);
          setTrips([]);
          setLoading(false);
          return;
        }

        const trips = await tripData.json();

        setTrips(trips);
        setLoading(false);
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    }

    getTrips();
  }, []);

  return (
    <div id="centralDiv">
      <Header></Header>
      <div id="mainContent">
        <MainSideBar id="mainSideBar" />
        <div id="centerSection">
          <div id="buttonContainer">
            <button className="mainButton">
              <Link to="/newtrip" className="mainButtonText">
                NEW TRIP
              </Link>
            </button>
          </div>
          <div id="cardContainer">
            {!loading ? (
              trips.map((t) => {
                return (
                  <TripCard
                    className="tripCard"
                    key={t.tripid}
                    trip={{
                      tripID: t.tripid,
                      destination: t.destination,
                      from_date: t.from_date,
                      to_date: t.to_date,
                      status: t.status,
                      members: t.members,
                    }}
                  />
                );
              })
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
