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

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const { session, initialized } = useAuth();
  const [profile, setProfile] = useState(null);

  async function getProfile() {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        setLoading(false);
        return;
      }

      const profileData = await fetch(
        `https://wanderfunds-backend.onrender.com/api/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const profileJson = await profileData.json();

      console.log(profileJson);

      setProfile(profileJson);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  }

  useEffect(() => {
    getProfile();
  }, [initialized, session]);

  return (
    <div>
      {!loading ? (
        <>
          <Header></Header>
          <div id="mainContent">
            <MainSideBar id="mainSideBar" />
            <div id="dashboardCenterSection"></div>
          </div>{" "}
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
