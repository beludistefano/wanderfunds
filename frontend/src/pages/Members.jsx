import { useParams } from "react-router-dom";
import Header from "../components/header";
import MainSideBar from "../components/MainSideBar";
import TripHeader from "../components/TripHeader";
import TripMenu from "../components/TripMenu";
import "../css/tripdash.css";
import MembersTrip from "./Trip/MembersTrip";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthProvider";

export default function Members() {
  const { tripid } = useParams();
  const [tripMembers, setTripMembers] = useState();
  const [loading, setLoading] = useState(true);
  const { session, initialized } = useAuth();

  async function getTripMembers() {
    try {
      const { data } = await supabase.auth.getSession();

      const token = data.session?.access_token;
      if (!token) {
        setLoading(false);
        return;
      }

      const tripMembersData = await fetch(
        `https://wanderfunds-backend.onrender.com/api/userroles?tripId=${tripid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const tripMembersJson = await tripMembersData.json();

      console.log(tripMembersJson);

      setTripMembers(tripMembersJson);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  }

  useEffect(() => {
    getTripMembers();
  }, [initialized, session, tripid]);

  return (
    <div>
      {!loading ? (
        <>
          <Header></Header>
          <div id="mainContent">
            <MainSideBar id="mainSideBar" />
            <div id="dashboardCenterSection">
              <TripHeader
                destination={tripMembers[0].destination}
                status={tripMembers[0].status}
              />
              <TripMenu tripID={tripid} />
              <MembersTrip tripMembers={tripMembers} />
            </div>
          </div>{" "}
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
