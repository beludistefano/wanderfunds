import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

import "../css/main.css";

import MainSideBar from "../components/MainSideBar";
import Header from "../components/header";
import TripCard from "../components/TripCard";

export default function Main() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getTrips() {
      try {
        const tripData = await fetch(
          "https://wanderfunds-backend.onrender.com/api/trips"
        );
        const trips = await tripData.json();

        console.log(trips);

        setTrips(trips);
        setLoading(false);
      } catch (e) {
        console.log(e);
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
