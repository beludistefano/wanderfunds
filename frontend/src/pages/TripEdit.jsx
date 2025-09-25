import Confirm from "../components/Confirmation";
import Header from "../components/header";
import MainSideBar from "../components/MainSideBar";
import TripHeader from "../components/TripHeader";
import TripMenu from "../components/TripMenu";
import "../css/tripdash.css";
import EditTrip from "./Trip/EditTrip";
import TripOverview from "./Trip/TripOverview";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function TripEdit() {
  const { tripid } = useParams();
  const [trip, setTrip] = useState();
  const [loading, setLoading] = useState(true);

  async function getTrip() {
    try {
      const tripData = await fetch(
        "https://wanderfunds-backend.onrender.com/api/trip/" + tripid
      );
      const trip = await tripData.json();

      console.log(trip);
      console.log(tripid);

      setTrip(trip[0]);
      setLoading(false);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    getTrip();
  }, []);

  return (
    <div>
      {!loading ? (
        <>
          <Header></Header>
          <div id="mainContent">
            <MainSideBar id="mainSideBar" />
            <div id="dashboardCenterSection">
              <TripHeader destination={trip.destination} status={trip.status} />
              <TripMenu tripID={tripid} />
              <EditTrip trip={trip} />
            </div>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
