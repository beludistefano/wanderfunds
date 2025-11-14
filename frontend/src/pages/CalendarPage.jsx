import { useParams } from "react-router-dom";
import Header from "../components/header";
import MainSideBar from "../components/MainSideBar";
import TripHeader from "../components/TripHeader";
import TripMenu from "../components/TripMenu";
import "../css/tripdash.css";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthProvider";
import Calendar from "../components/Calendar";

export default function CalendarPage() {
  const { tripid } = useParams();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const { session, initialized } = useAuth();
  const [tripData, setTripData] = useState(null);

  const token = session?.access_token;

  async function getTrip() {
    try {
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

      const tripJson = await tripData.json();

      console.log(tripJson);

      setTripData(tripJson[0]);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  }

  useEffect(() => {
    getTrip();
  }, [initialized, token, tripid]);

  return (
    <div>
      {!loading ? (
        <>
          <Header></Header>
          <div id="mainContent">
            <MainSideBar id="mainSideBar" />
            <div id="dashboardCenterSection">
              <TripHeader
                destination={tripData.destination}
                status={tripData.status}
              />
              <TripMenu tripID={tripid} />
              <Calendar />
            </div>
          </div>{" "}
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
