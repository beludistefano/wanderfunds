import { Link, useParams } from "react-router-dom";
import Header from "../components/header";
import MainSideBar from "../components/MainSideBar";
import TripHeader from "../components/TripHeader";
import TripMenu from "../components/TripMenu";
import "../css/profile.css";
import MembersTrip from "./Trip/MembersTrip";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthProvider";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const { session, initialized } = useAuth();
  const [profile, setProfile] = useState(null);
  const [displayConfirm, setDisplayConfirm] = useState(false);

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

  const deleteProfile = async (e) => {
    e.preventDefault();

    setDisplayConfirm(false);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        return;
      }

      const deleteProfile = await fetch(
        "https://wanderfunds-backend.onrender.com/api/profile",
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(deleteProfile);
    } catch (e) {
      console.log(e);
    }
  };

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
                  <Link
                    to={"/profile/edit"}
                    id="buttonSave"
                    className="button buttonProfile"
                    state={{
                      name: profile.name,
                      emailNotif: profile.email_notifications,
                    }}
                  >
                    EDIT PROFILE
                  </Link>
                  <button
                    id="buttonLeave"
                    onClick={() => {
                      setDisplayConfirm(true);
                    }}
                    className="button"
                  >
                    DELETE PROFILE
                  </button>
                </div>
              </div>
            </div>
            <Confirm
              text={"Are you sure you want to delete your profile?"}
              options={{ ok: "Delete", cancel: "Cancel" }}
              isOpen={displayConfirm}
              onConfirmOk={deleteProfile}
              onConfirmNo={() => setDisplayConfirm(false)}
            />
          </div>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
