import { useParams } from "react-router-dom";
import Header from "../components/header";
import MainSideBar from "../components/MainSideBar";
import TripHeader from "../components/TripHeader";
import TripMenu from "../components/TripMenu";
import "../css/profile.css";
import MembersTrip from "./Trip/MembersTrip";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthProvider";

export default function EditProfile() {
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

      const profileData = await fetch(`http://localhost:3000/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    console.log("Profile mounted");
    return () => console.log("Profile unmounted");
  }, []);

  return (
    <div>
      {!loading ? (
        <>
          <Header></Header>
          <div id="mainContent">
            <MainSideBar id="mainSideBar" />
            <div id="dashboardCenterSection">
              <div id="profileCenterContent">
                <h2 id="editTitle" style={{ textAlign: "left" }}>
                  PROFILE
                </h2>
                <p className="labelTitle">Name:</p>
                <p className="profileAnswer">{profile.name}</p>
                <p className="labelTitle">Email:</p>
                <p className="profileAnswer">{profile.email}</p>
                <p className="labelTitle">Password:</p>
                <p className="profileAnswer">**********</p>
                <div className="labelInLine">
                  <p className="labelTitle">Email notifications:</p>
                  <input
                    type="checkbox"
                    checked={profile.email_notifications === true}
                  />
                </div>
                <div className="profileButtonContainer">
                  <button id="buttonSave" className="button">
                    EDIT PROFILE
                  </button>
                  <button id="buttonLeave" className="button">
                    DELETE PROFILE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
