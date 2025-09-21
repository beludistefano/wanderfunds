import { Link } from "react-router-dom";
import "../../css/edittrip.css";

export default function EditTrip({ trip }) {
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
            value={trip.destination}
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
        ></input>
      </form>
      <Link to="/" style={{ display: "flex", justifyContent: "flex-start" }}>
        <button id="buttonDelete" className="button">
          DELETE TRIP
        </button>
      </Link>
    </div>
  );
}
