import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/header";
import MainSideBar from "../components/MainSideBar";
import TripMenu from "../components/TripMenu";
import "../css/profile.css";
import MembersTrip from "./Trip/MembersTrip";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthProvider";

function validateEdit(name) {
  const profileErrors = {};

  if (name.trim() == "") {
    profileErrors.name = "Name cannot be empty";
  }

  return profileErrors;
}

export default function EditProfile() {
  const { state } = useLocation();

  const [loading, setLoading] = useState(true);
  const { session, initialized } = useAuth();
  const [profileName, setProfileName] = useState(state?.name ?? "");
  const [profileNotif, setProfileNotif] = useState(!!state?.emailNotif);
  const [updateError, setUpdateError] = useState(false);
  const [updateResult, setUpdateResult] = useState(null);

  const [validationErrors, setValidationErrors] = useState({});

  const navigate = useNavigate();

  async function saveProfile(e) {
    e.preventDefault();

    setValidationErrors({});

    const formValidation = validateEdit(profileName);
    setValidationErrors(formValidation);

    if (Object.keys(formValidation).length != 0) {
      return;
    }

    const updateProfile = {};
    updateProfile["name"] = profileName;
    updateProfile["email_notifications"] = profileNotif;

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        return;
      }

      const updateResp = await fetch(
        "https://wanderfunds-backend.onrender.com/api/profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateProfile),
        }
      );

      console.log(updateResp);

      if (updateResp.status == 200) {
        setUpdateError(false);
        setUpdateResult("Profile updated succesfully!");
        setTimeout(() => goBack(), 1000);
      } else {
        setUpdateError(true);
        setUpdateResult("There was an error updating your profile");
        console.log("Error");
      }
    } catch (e) {
      console.log(e);
      setUpdateError(true);
      setUpdateResult("There was an error updating your profile");
    }
  }

  function goBack() {
    navigate("/profile");
  }

  return (
    <div>
      <>
        <Header></Header>
        <div id="mainContent">
          <MainSideBar id="mainSideBar" />
          <div id="dashboardCenterSection">
            <div id="profileCenterContent">
              <h2 id="editTitle" style={{ textAlign: "left" }}>
                EDIT PROFILE
              </h2>
              {updateResult && (
                <p
                  className={updateError ? "errorDisplayText" : "successText"}
                  style={{ margin: 0 }}
                >
                  {updateResult}
                </p>
              )}
              <p className="labelTitle">Name:</p>
              <input
                type="text"
                className="formInputProfile"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
              {validationErrors.name && (
                <p className="errorDisplayText" style={{ margin: 0 }}>
                  {validationErrors.name}
                </p>
              )}
              <div className="labelInLine">
                <p className="labelTitle">Email notifications:</p>
                <input
                  type="checkbox"
                  checked={profileNotif}
                  onChange={(e) => setProfileNotif(e.target.checked)}
                />
              </div>
              <div className="profileButtonContainer">
                <button
                  id="buttonSave"
                  onClick={saveProfile}
                  className="button buttonProfile"
                >
                  SAVE PROFILE
                </button>
                <button
                  id="buttonCancel"
                  onClick={goBack}
                  className="button buttonProfile"
                >
                  BACK
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    </div>
  );
}
