import { Link } from "react-router-dom";

import "../css/createtrip.css";

import MainSideBar from "../components/MainSideBar";
import Header from "../components/header";
import TripCard from "../components/tripCard";

export default function CreateTrip() {
  function createTrip() {}

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
                  id="fromDate"
                  name="fromDate"
                  className="formInputDate"
                  type="date"
                />
              </div>
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
              />
            </div>
            <div className="formRow">
              <label className="formLabel" for="defaultSplit">
                Default Split
              </label>
              <input
                id="autoAdd"
                className="formInput"
                type="number"
                min="0"
                max="100"
                value="50"
                disabled
              />
            </div>
            <div className="formRow inline">
              <label className="formLabel" for="autoAdd">
                Auto-add expenses?
              </label>
              <input type="checkbox" name="autoAdd" />
            </div>
            <input
              className="button buttonOK"
              type="submit"
              onClick={createTrip}
            ></input>
          </form>
          <Link>
            <button className="button buttonCancel">Cancel</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
