import { Link, useNavigate } from "react-router-dom";
import "../../css/edittrip.css";
import { useState } from "react";
import Confirm from "../../components/Confirmation";

const formatDate = (dateString) => {
  return dateString ? dateString.split("T")[0] : "";
};

function validateEdit(destination, fromDate, toDate) {
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

  const formatFromDate = new Date(fromDate);
  const formatToDate = new Date(toDate);

  if (formatToDate < formatFromDate) {
    tripErrors.startEndDates = "End date cannot be before start date";
  }

  if (formatToDate.getDate() == formatFromDate.getDate()) {
    tripErrors.tripLength = "Trip must last at least one day";
  }

  return tripErrors;
}

export default function EditTrip({ trip }) {
  const navigate = useNavigate();

  const [tripID, setTripID] = useState(trip.tripid);

  const [updateDestination, setUpdateDestination] = useState(trip.destination);
  const [updateFromDate, setUpdateFromDate] = useState(
    formatDate(trip.from_date)
  );
  const [updateToDate, setUpdatetoDate] = useState(formatDate(trip.to_date));
  const [updateStatus, setUpdateStatus] = useState(trip.status);
  const [updateDescription, setUpdateDescription] = useState(trip.description);
  const [updateDefaultSplit, setUpdateDefaultSplit] = useState(
    trip.default_split
  );
  const [updateAutoAdd, setUpdateAutoAdd] = useState(trip.auto_add);
  const [updateMembers, setUpdateMembers] = useState(trip.members);

  const [displayConfirm, setDisplayConfirm] = useState(false);

  const [validationErrors, setValidationErrors] = useState({});

  async function updateTrip(e) {
    e.preventDefault();

    setValidationErrors({});

    const destination = updateDestination;
    const fromDate = updateFromDate;
    const toDate = updateToDate;
    const status = updateStatus;
    const autoAdd = updateAutoAdd;
    const defaultSplit = updateDefaultSplit;
    const description = updateDescription;

    const today = new Date();
    const formatFromDate = new Date(fromDate);
    const formatToDate = new Date(toDate);

    const formValidation = validateEdit(destination, fromDate, toDate);
    setValidationErrors(formValidation);

    if (Object.keys(formValidation).length != 0) {
      return;
    }

    const updateTrip = {};
    updateTrip["destination"] = destination;
    updateTrip["from_date"] = formatFromDate;
    updateTrip["to_date"] = formatToDate;
    updateTrip["default_split"] = defaultSplit;
    updateTrip["description"] = description;
    updateTrip["status"] = status;
    updateTrip["auto_add"] = autoAdd;
    updateTrip["tripID"] = tripID;

    console.log(updateTrip);

    try {
      const updateResp = await fetch(
        "https://wanderfunds-backend.onrender.com/api/trip",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateTrip),
        }
      );

      console.log(await updateResp.json());

      if (updateResp.status == 200) {
        navigate(`/trip/${trip.tripid}`);
      } else {
        // HANDLE ERROR VISUALLY
        console.log("Error");
      }
    } catch (e) {
      // HANDLE ERROR VISUALLY
      console.log(e);
    }
  }

  const deleteTrip = async (e) => {
    e.preventDefault();

    setDisplayConfirm(false);

    try {
      const deleteResp = await fetch(
        "https://wanderfunds-backend.onrender.com/api/trip/" + trip.tripid,
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
  };

  return (
    <div
      id="containerEditTop"
      style={{ paddingRight: "2%", paddingLeft: "2%" }}
    >
      <div
        id="ownerContainerContainer"
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
      <h2 id="editTitle" style={{ textAlign: "left" }}>
        EDIT TRIP
      </h2>
      <form id="editForm">
        <div className="formRow">
          <label className="formLabel" for="destination">
            Destination
          </label>
          <input
            id="destination"
            className={`formInput ${
              validationErrors.destination ? "borderRed" : ""
            }`}
            name="destination"
            type="text"
            value={updateDestination}
            onChange={(e) => setUpdateDestination(e.target.value)}
          />
          {validationErrors.destination && (
            <p className="errorDisplayText">{validationErrors.destination}</p>
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
              value={updateFromDate}
              onChange={(e) => setUpdateFromDate(e.target.value)}
            />
            <input
              id="toDate"
              name="toDate"
              className={`formInputDate ${
                validationErrors.toDate ? "borderRed" : ""
              }`}
              type="date"
              value={updateToDate}
              onChange={(e) => setUpdatetoDate(e.target.value)}
            />
          </div>
          {validationErrors.fromDate && (
            <p className="errorDisplayText">{validationErrors.fromDate}</p>
          )}
          {validationErrors.toDate && (
            <p className="errorDisplayText">{validationErrors.toDate}</p>
          )}
          {validationErrors.startEndDates && (
            <p className="errorDisplayText">{validationErrors.startEndDates}</p>
          )}
          {validationErrors.tripLength && (
            <p className="errorDisplayText">{validationErrors.tripLength}</p>
          )}
        </div>
        <div className="formRow">
          <label className="formLabel" for="description">
            Description
          </label>
          <textarea
            id="description"
            className="formInput"
            name="description"
            onChange={(e) => setUpdateDescription(e.target.value)}
          >
            {updateDescription}
          </textarea>
        </div>
        <div className="formRow">
          <label className="formLabel" for="status">
            Status
          </label>
          <select
            name="status"
            id="status"
            value={updateStatus}
            onChange={(e) => setUpdateStatus(e.target.value)}
          >
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
            value={updateMembers}
            onChange={(e) => setUpdateMembers(e.target.value)}
            disabled
          />
        </div>
        {updateMembers > 1 ? (
          <>
            <div className="formRow">
              <label className="formLabel" for="defaultSplit">
                Default Split
              </label>
              <select
                name="defaultSplit"
                id="defaultSplit"
                value={updateDefaultSplit}
                onChange={(e) => setUpdateDefaultSplit(e.target.value)}
              >
                <option value="equal">Equal Shares</option>
                <option value="own">Own Expenses</option>
              </select>
            </div>
            <div className="formRow inline">
              <label className="formLabel" for="autoAdd">
                Auto-add expenses?
              </label>
              <input
                type="checkbox"
                id="autoAdd"
                name="autoAdd"
                checked={updateAutoAdd}
                onChange={(e) => setUpdateAutoAdd(e.target.checked)}
              />
            </div>
          </>
        ) : null}
        <input
          id="buttonSave"
          className="button"
          type="submit"
          value="SAVE"
          onClick={updateTrip}
        ></input>
      </form>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <button
          onClick={() => {
            setDisplayConfirm(true);
          }}
          id="buttonDelete"
          className="button"
        >
          DELETE TRIP
        </button>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <button
          onClick={() => {
            navigate(`/trip/${trip.tripid}`);
          }}
          id="buttonCancel"
          className="button"
        >
          CANCEL
        </button>
      </div>
      <Confirm
        text={"Are you sure you want to delete?"}
        options={{ ok: "Delete", cancel: "Cancel" }}
        isOpen={displayConfirm}
        onConfirmOk={deleteTrip}
        onConfirmNo={() => setDisplayConfirm(false)}
      />
    </div>
  );
}
