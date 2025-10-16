import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthProvider";

import "../css/createtrip.css";

import MainSideBar from "../components/MainSideBar";
import Header from "../components/header";

function validateTrip(destination, fromDate, toDate, members) {
  const tripErrors = {};

  if (destination == "") {
    tripErrors.destination = "Destination cannot be empty";
  }

  if (fromDate == "") {
    tripErrors.fromDate = "Start date is required";
  }

  if (toDate == "") {
    tripErrors.toDate = "End date is required";
  }

  const today = new Date();
  const formatFromDate = new Date(fromDate);
  const formatToDate = new Date(toDate);

  if (formatFromDate < today) {
    tripErrors.generalDate = "Start date must be in the future";
  }

  if (formatToDate < formatFromDate) {
    tripErrors.startEndDates = "End date cannot be before start date";
  }

  if (formatToDate.getDate() == formatFromDate.getDate()) {
    tripErrors.tripLength = "Trip must last at least one day";
  }

  if (members <= 0) {
    tripErrors.members = "Trip must have at least one member";
  }

  return tripErrors;
}

export default function CreateTrip() {
  const navigate = useNavigate();

  const [defaultMember, setDefaultMember] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});

  const { session, initialized } = useAuth();

  async function createTrip(e) {
    e.preventDefault();

    setValidationErrors({});

    const destination = document.getElementById("destination").value.trim();
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;
    const members = document.getElementById("members").value.trim();

    const description = document.getElementById("description").value;
    const status = document.getElementById("status").value;

    var autoAdd;
    var defaultSplit;

    if (members > 1) {
      autoAdd = document.getElementById("autoAdd").checked;
      defaultSplit = document.getElementById("defaultSplit").value;
    } else {
      autoAdd = null;
      defaultSplit = "own";
    }

    const formValidation = validateTrip(destination, fromDate, toDate, members);
    setValidationErrors(formValidation);

    if (Object.keys(formValidation).length != 0) {
      return;
    }

    const formatFromDate = new Date(fromDate);
    const formatToDate = new Date(toDate);

    const newTrip = {};
    newTrip["destination"] = destination;
    newTrip["from_date"] = formatFromDate;
    newTrip["to_date"] = formatToDate;
    newTrip["default_split"] = defaultSplit;
    newTrip["description"] = description;
    newTrip["status"] = status;
    newTrip["members"] = Number(members);
    newTrip["auto_add"] = autoAdd;

    console.log(newTrip);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        console.log("No access token yet.");
        return;
      }

      const creationResponse = await fetch(
        "https://wanderfunds-backend.onrender.com/api/trip",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTrip),
        }
      );

      console.log(creationResponse);

      if (creationResponse.status == 200) {
        navigate("/");
      } else {
        console.log("Error");
      }
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div>
      <Header></Header>
      <div id="mainContent">
        <MainSideBar id="mainSideBar" />
        <div id="centerSection">
          <h2>NEW TRIP</h2>
          <div className="ownerContainer">
            <p>OWNER</p>
          </div>
          <form id="createTripForm">
            <div className="formRow">
              <label className="formLabel" htmlFor="destination">
                Destination
              </label>
              <input
                id="destination"
                className={`formInput ${
                  validationErrors.destination ? "borderRed" : ""
                }`}
                name="destination"
                type="text"
                placeholder="Enter your destination..."
              />
              {validationErrors.destination && (
                <p className="errorDisplayText">
                  {validationErrors.destination}
                </p>
              )}
            </div>
            <div className="formRow">
              <label className="formLabel">Dates</label>
              <div className="formDate">
                <input
                  id="fromDate"
                  name="fromDate"
                  className={`formInputDate ${
                    validationErrors.fromDate ? "borderRed" : ""
                  }`}
                  type="date"
                />
                <input
                  id="toDate"
                  name="toDate"
                  className={`formInputDate ${
                    validationErrors.toDate ? "borderRed" : ""
                  }`}
                  type="date"
                />
              </div>
              {validationErrors.fromDate && (
                <p className="errorDisplayText">{validationErrors.fromDate}</p>
              )}
              {validationErrors.toDate && (
                <p className="errorDisplayText">{validationErrors.toDate}</p>
              )}
              {validationErrors.generalDate && (
                <p className="errorDisplayText">
                  {validationErrors.generalDate}
                </p>
              )}
              {validationErrors.startEndDates && (
                <p className="errorDisplayText">
                  {validationErrors.startEndDates}
                </p>
              )}
              {validationErrors.tripLength && (
                <p className="errorDisplayText">
                  {validationErrors.tripLength}
                </p>
              )}
            </div>
            <div className="formRow">
              <label className="formLabel" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                className="formInput"
                name="description"
              ></textarea>
            </div>
            <div className="formRow">
              <label className="formLabel" htmlFor="status">
                Status
              </label>
              <select name="status" id="status">
                <option value="Planning">Planning</option>
                <option value="Confirmed">Confirmed</option>
              </select>
            </div>
            <div className="formRow">
              <label className="formLabel" htmlFor="members">
                Members
              </label>
              <input
                id="members"
                name="members"
                className={`formInput ${
                  validationErrors.members ? "borderRed" : ""
                }`}
                type="number"
                min="0"
                value={defaultMember}
                onChange={(e) => setDefaultMember(e.target.value)}
              />
              {validationErrors.members && (
                <p className="errorDisplayText">{validationErrors.members}</p>
              )}
            </div>
            {defaultMember > 1 ? (
              <>
                <div className="formRow">
                  <label className="formLabel" htmlFor="defaultSplit">
                    Default Split
                  </label>
                  <select name="defaultSplit" id="defaultSplit">
                    <option value="equal">Equal Shares</option>
                    <option value="own">Own Expenses</option>
                  </select>
                </div>
                <div className="formRow inline">
                  <label className="formLabel" htmlFor="autoAdd">
                    Auto-add expenses?
                  </label>
                  <input type="checkbox" id="autoAdd" name="autoAdd" />
                </div>
              </>
            ) : null}
            <input
              className="button buttonOK"
              type="submit"
              onClick={createTrip}
            ></input>
          </form>
          <Link to="/">
            <button className="button buttonCancel">Cancel</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
