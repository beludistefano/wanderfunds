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
  const [loadingExp, setLoadingExp] = useState(true);
  const [role, setRole] = useState(null);
  const { session, initialized } = useAuth();
  const [tripData, setTripData] = useState(null);

  const [expenses, setExpenses] = useState(null);

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

  async function getExpenses() {
    try {
      if (!token) {
        return;
      }

      const expensesData = await fetch(
        `https://wanderfunds-backend.onrender.com/api/expenses?tripId=${tripid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const expenses = await expensesData.json();

      console.log(expenses);

      setExpenses(expenses);
      setLoadingExp(false);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    getTrip();
    getExpenses();
  }, [initialized, token, tripid]);

  return (
    <div>
      {!loading && !loadingExp ? (
        <>
          <Header></Header>
          <div id="mainContent">
            <MainSideBar id="mainSideBar" />
            <div id="dashboardCenterSection">
              <TripHeader
                destination={tripData.destination}
                status={tripData.status}
                url={tripData.trip_header_url}
              />
              <TripMenu tripID={tripid} />
              <Calendar
                startDate={tripData.from_date}
                endDate={tripData.to_date}
                expenses={expenses}
              />
            </div>
          </div>{" "}
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
