import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

import "../css/main.css";

import MainSideBar from "../components/MainSideBar";
import Header from "../components/header";
import TripCard from "../components/tripCard";

export default function Main() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getTrips() {
      try {
        const tripData = await fetch("http://localhost:3000/api/trips");
        const trips = await tripData.json();
        console.log(trips);
      } catch (e) {
        console.log(e);
      }
    }

    getTrips();
  }, []);

  return (
    <div>
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
              <TripCard
                className="tripCard"
                trip={{
                  tripID: "ABC",
                  destination: "Aruba",
                  from_date: "Nov 12",
                  to_date: "Nov 25",
                  status: "Confirmed",
                }}
              />
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
