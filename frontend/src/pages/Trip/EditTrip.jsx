import { Link, useNavigate } from "react-router-dom";
import "../../css/edittrip.css";
import { useState } from "react";

export default function EditTrip({ trip }) {
  const navigate = useNavigate();

  const [updateDestination, setUpdateDestination] = useState(trip.destination);

  async function updateTrip(e) {
    e.preventDefault();

    const destination = document.getElementById("destination").value.trim();
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;
    const status = document.getElementById("status").value;
    const autoAdd = document.getElementById("autoAdd").checked;
    const defaultSplit = document.getElementById("defaultSplit").value;
    const description = document.getElementById("description").value;

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

    const updateTrip = {};
    updateTrip["destination"] = updateDestination;
    updateTrip["from_date"] = formatFromDate;
    updateTrip["to_date"] = formatToDate;
    updateTrip["default_split"] = defaultSplit;
    updateTrip["description"] = description;
    updateTrip["status"] = status;
    updateTrip["auto_add"] = autoAdd;
    updateTrip["tripID"] = trip.tripid;

    console.log(updateTrip);

    try {
      const updateResp = await fetch("http://localhost:3000/api/trip", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateTrip),
      });

      if (updateResp.status == 200) {
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

  async function deleteTrip(e) {
    e.preventDefault();

    try {
      const deleteResp = await fetch(
        "http://localhost:3000/api/trip/" + trip.tripid,
        {
          method: "DELETE",
        }
      );

      if (deleteResp.status == 200) {
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
    <div style={{ paddingRight: "2%", paddingLeft: "2%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingTop: "10px",
        }}
      >
        <div className="ownerContainer">
          <p>OWNER</p>
        </div>
      </div>
      <h2 style={{ textAlign: "left" }}>EDIT TRIP</h2>
      <form id="editForm">
        <div className="formRow">
          <label className="formLabel" for="destination">
            Destination
          </label>
          <input
            id="destination"
            className="formInput"
            name="destination"
            type="text"
            value={updateDestination}
            onChange={(e) => setUpdateDestination(e.target.value)}
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
              value={trip.fromDate}
            />
            <input
              id="toDate"
              name="toDate"
              className="formInputDate"
              type="date"
              value={trip.toDate}
            />
          </div>
        </div>
        <div className="formRow">
          <label className="formLabel" for="description">
            Description
          </label>
          <textarea id="description" className="formInput" name="description">
            {trip.description}
          </textarea>
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
          <label className="formLabel" for="defaultSplit">
            Default Split
          </label>
          <input
            id="defaultSplit"
            className="formInput"
            type="number"
            min="0"
            max="100"
            value={trip.default_split}
            disabled
          />
        </div>
        <div className="formRow inline">
          <label className="formLabel" for="autoAdd">
            Auto-add expenses?
          </label>
          <input type="checkbox" id="autoAdd" name="autoAdd" />
        </div>
        <input
          id="buttonSave"
          className="button"
          type="submit"
          value="SAVE"
          onClick={updateTrip}
        ></input>
      </form>
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        <button onClick={deleteTrip} id="buttonDelete" className="button">
          DELETE TRIP
        </button>
      </div>
    </div>
  );
}
