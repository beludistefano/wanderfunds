import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import "../css/createtrip.css";

import MainSideBar from "../components/MainSideBar";
import Header from "../components/header";
import TripCard from "../components/tripCard";

// OWNER ID FOR NOW

export default function CreateTrip() {
  const navigate = useNavigate();

  const [defaultMember, setDefaultMember] = useState(1);

  async function createTrip(e) {
    e.preventDefault();

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

    if (destination == "" || fromDate == "" || toDate == "") {
      console.log("Destination cannot be empty");
      return;
    }

    const today = new Date();
    const formatFromDate = new Date(fromDate);
    const formatToDate = new Date(toDate);

    if (formatFromDate < today) {
      console.log("Trip cannot start before today");
      return;
    }

    if (formatToDate < formatFromDate) {
      console.log("End date cannot be before start date");
      return;
    }

    if (formatToDate.getDate() == formatFromDate.getDate()) {
      console.log("Trip must last at least one day");
      return;
    }

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
      const creationResponse = await fetch("http://localhost:3000/api/trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTrip),
      });

      console.log(creationResponse);

      if (creationResponse.status == 200) {
        navigate("/");
      } else {
        // HANDLE ERROR VISUALLY
        console.log("Error");
      }
    } catch (e) {
      // HANDLE ERROR VISUALLY
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
          <form>
            <div className="formRow">
              <label className="formLabel" for="destination">
                Destination
              </label>
              <input
                id="destination"
                className="formInput"
                name="destination"
                type="text"
                placeholder="Enter your destination..."
              />
            </div>
            <div className="formRow">
              <label className="formLabel">Dates</label>
              <div className="formDate">
                <input
                  id="fromDate"
                  name="fromDate"
                  className="formInputDate"
                  type="date"
                />
                <input
                  id="toDate"
                  name="toDate"
                  className="formInputDate"
                  type="date"
                />
              </div>
            </div>
            <div className="formRow">
              <label className="formLabel" for="description">
                Description
              </label>
              <textarea
                id="description"
                className="formInput"
                name="description"
              ></textarea>
            </div>
            <div className="formRow">
              <label className="formLabel" for="status">
                Status
              </label>
              <select name="status" id="status">
                <option value="Planning">Planning</option>
                <option value="Confirmed">Confirmed</option>
              </select>
            </div>
            <div className="formRow">
              <label className="formLabel" for="members">
                Members
              </label>
              <input
                id="members"
                name="members"
                className="formInput"
                type="number"
                min="0"
                value={defaultMember}
                onChange={(e) => setDefaultMember(e.target.value)}
              />
            </div>
            {defaultMember > 1 ? (
              <>
                <div className="formRow">
                  <label className="formLabel" for="defaultSplit">
                    Default Split
                  </label>
                  <select name="defaultSplit" id="defaultSplit">
                    <option value="equal">Equal Shares</option>
                    <option value="own">Own Expenses</option>
                  </select>
                </div>
                <div className="formRow inline">
                  <label className="formLabel" for="autoAdd">
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
