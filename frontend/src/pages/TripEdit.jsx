import Confirm from "../components/Confirmation";
import Header from "../components/header";
import MainSideBar from "../components/MainSideBar";
import TripHeader from "../components/TripHeader";
import TripMenu from "../components/TripMenu";
import "../css/tripdash.css";
import EditTrip from "./Trip/EditTrip";
import TripOverview from "./Trip/TripOverview";
import { useAuth } from "../auth/AuthProvider";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function TripEdit() {
  const { tripid } = useParams();
  const [trip, setTrip] = useState();
  const [loading, setLoading] = useState(true);
  const { session, initialized } = useAuth();

  async function getTrip() {
    try {
      const { data } = await supabase.auth.getSession();

      const token = data.session?.access_token;
      if (!token) {
        setLoading(false);
        return;
      }

      const tripData = await fetch(
        "https://wanderfunds-backend.onrender.com/api/trip/" + tripid,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const trip = await tripData.json();

      console.log(trip);
      console.log(tripid);

      setTrip(trip[0]);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initialized || !session) {
      return;
    }
    getTrip();
  }, [initialized, session, tripid]);

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
