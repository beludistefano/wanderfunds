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
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthProvider";

export default function TripDashboard() {
  const { tripid } = useParams();
  const [trip, setTrip] = useState(null);
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

      if (!tripData.ok) {
        setLoading(false);
        return;
      }

      const tripJson = await tripData.json();

      setTrip(tripJson[0]);
      setLoading(false);

      console.log(tripJson[0]);
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
      {loading && <div>Loading...</div>}
      {!loading && trip && (
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
      )}
      + {!loading && !trip && <div>Unable to load trip.</div>}
    </div>
  );
}
