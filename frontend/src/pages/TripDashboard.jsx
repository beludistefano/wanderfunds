import { useParams } from "react-router-dom";
import Confirm from "../components/Confirmation";
import Header from "../components/header";
import MainSideBar from "../components/MainSideBar";
import TripHeader from "../components/TripHeader";
import TripMenu from "../components/TripMenu";
import "../css/tripdash.css";
import EditTrip from "./Trip/EditTrip";
import TripOverview from "./Trip/TripOverview";
import { useEffect, useState } from "react";

export default function TripDashboard() {
  const { tripid } = useParams();
  const [trip, setTrip] = useState();
  const [loading, setLoading] = useState(true);

  async function getTrip() {
    try {
      const tripData = await fetch(
        "https://wanderfunds-backend.onrender.com/api/trip/" + tripid
      );
      const tripJson = await tripData.json();

      setTrip(tripJson[0]);
      setLoading(false);

      console.log(tripJson[0]);
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
              <TripOverview trip={trip} userID={""} />
            </div>
          </div>{" "}
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
