import { Link, useNavigate } from "react-router-dom";
import "../../css/edittrip.css";
import { useState } from "react";
import Confirm from "../../components/Confirmation";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../auth/AuthProvider";

const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const formatDate = (dateString) => {
  return dateString ? dateString.split("T")[0] : "";
};

function validateEdit(destination, fromDate, toDate, file, members) {
  const tripErrors = {};

  if (destination.trim() == "") {
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

  if (file != null) {
    if (!allowedTypes.includes(file.type)) {
      tripErrors.file =
        "Invalid file type. Only images (PNG, JPG, WEBP) are allowed.";
    }
  }

  if (members == 0) {
    tripErrors.members = "Trips must have at least 1 member";
  }

  return tripErrors;
}

export default function EditTrip({ trip, role }) {
  const navigate = useNavigate();

  const [tripID, setTripID] = useState(trip.tripid);
  const [userRole, setUserRole] = useState(role);

  const [tripHeaderURL, setTripHeaderURL] = useState(trip.trip_header_url);

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
  const [updateErrors, setUpdateErrors] = useState(null);

  const [headerPic, setHeaderPic] = useState(null);

  async function updateTripOwner(e) {
    e.preventDefault();

    setValidationErrors({});
    setUpdateErrors(null);

    const destination = updateDestination;
    const fromDate = updateFromDate;
    const toDate = updateToDate;
    const status = updateStatus;
    const autoAdd = updateAutoAdd;
    const defaultSplit = updateDefaultSplit;
    const description = updateDescription;
    const headerFile = headerPic;

    const members = updateMembers;

    const today = new Date();
    const formatFromDate = new Date(fromDate);
    const formatToDate = new Date(toDate);

    const formValidation = validateEdit(
      destination,
      fromDate,
      toDate,
      headerFile,
      members
    );
    setValidationErrors(formValidation);

    if (Object.keys(formValidation).length != 0) {
      return;
    }

    var publicUrl = "";

    if (headerFile != null) {
      const headerPath = `trips/${tripID}/headers/header`;

      const { data, error } = await supabase.storage
        .from("trip-headers")
        .upload(headerPath, headerFile, {
          contentType: headerFile.type,
          upsert: true,
        });

      if (error) {
        console.log(error);
        throw new Error("File upload failed");
      }

      publicUrl = supabase.storage
        .from("trip-headers")
        .getPublicUrl(`trips/${tripID}/headers/header`).data.publicUrl;

      console.log(publicUrl);
    }

    const updateTrip = {};
    updateTrip["destination"] = destination;
    updateTrip["from_date"] = formatFromDate;
    updateTrip["to_date"] = formatToDate;
    updateTrip["description"] = description;
    updateTrip["status"] = status;
    updateTrip["tripID"] = tripID;
    updateTrip["members"] = members;

    if (members == 1) {
      updateTrip["auto_add"] = null;
      updateTrip["default_split"] = "own";
    } else {
      updateTrip["auto_add"] = autoAdd;
      updateTrip["default_split"] = defaultSplit;
    }

    if (publicUrl.trim() == "") {
      updateTrip["trip_header_url"] = tripHeaderURL;
    } else {
      updateTrip["trip_header_url"] = publicUrl;
    }

    console.log(updateTrip);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        return;
      }

      const updateResp = await fetch(
        "https://wanderfunds-backend.onrender.com/api/trip",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateTrip),
        }
      );

      console.log(await updateResp.json());

      if (updateResp.status == 200) {
        navigate(`/trip/${trip.tripid}`);
      } else {
        setUpdateErrors("There was an error updating your trip!");
        console.log("Error");
      }
    } catch (e) {
      setUpdateErrors("There was an error updating your trip!");
      console.log(e);
    }
  }

  async function updateTripParticipant(e) {
    e.preventDefault();

    setValidationErrors({});
    setUpdateErrors(null);

    const destination = updateDestination;
    const fromDate = updateFromDate;
    const toDate = updateToDate;
    const status = updateStatus;
    const description = updateDescription;
    const headerFile = headerPic;

    const today = new Date();
    const formatFromDate = new Date(fromDate);
    const formatToDate = new Date(toDate);

    const formValidation = validateEdit(
      destination,
      fromDate,
      toDate,
      headerFile
    );
    setValidationErrors(formValidation);

    if (Object.keys(formValidation).length != 0) {
      return;
    }

    var publicUrl = "";

    if (headerFile != null) {
      const headerPath = `trips/${tripID}/headers/header`;

      const { data, error } = await supabase.storage
        .from("trip-headers")
        .upload(headerPath, headerFile, {
          contentType: headerFile.type,
          upsert: true,
        });

      if (error) {
        console.log(error);
        throw new Error("File upload failed");
      }

      publicUrl = supabase.storage
        .from("trip-headers")
        .getPublicUrl(`trips/${tripID}/headers/header`).data.publicUrl;

      console.log(publicUrl);
    }

    const updateTrip = {};
    updateTrip["destination"] = destination;
    updateTrip["from_date"] = formatFromDate;
    updateTrip["to_date"] = formatToDate;
    updateTrip["description"] = description;
    updateTrip["status"] = status;
    updateTrip["tripID"] = tripID;

    if (publicUrl.trim() == "") {
      updateTrip["trip_header_url"] = tripHeaderURL;
    } else {
      updateTrip["trip_header_url"] = publicUrl;
    }

    console.log(updateTrip);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        return;
      }

      const updateResp = await fetch(
        "https://wanderfunds-backend.onrender.com/api/trip-participant",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateTrip),
        }
      );

      console.log(await updateResp.json());

      if (updateResp.status == 200) {
        navigate(`/trip/${trip.tripid}`);
      } else {
        setUpdateErrors("There was an error updating your trip!");
        console.log("Error");
      }
    } catch (e) {
      setUpdateErrors("There was an error updating your trip!");
      console.log(e);
    }
  }

  const deleteTrip = async (e) => {
    e.preventDefault();

    setUpdateErrors(null);

    setDisplayConfirm(false);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        return;
      }

      const deleteResp = await fetch(
        "https://wanderfunds-backend.onrender.com/api/trip/" + trip.tripid,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (deleteResp.status == 200) {
        navigate("/");
      } else {
        setUpdateErrors("There was an error updating your trip!");
        console.log("Error");
      }
    } catch (e) {
      setUpdateErrors("There was an error updating your trip!");
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
          <p>{userRole}</p>
        </div>
      </div>
      <h2 id="editTitle" style={{ textAlign: "left" }}>
        EDIT TRIP
      </h2>
      {updateErrors ? (
        <p className="errorDisplayText">{updateErrors}</p>
      ) : (
        <></>
      )}
      <form id="editForm">
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
        <div className="formRow formHeaderPic">
          <label htmlFor="headerPic" className="formLabel">
            Select header picture:
          </label>
          <input
            id="headerPic"
            type="file"
            className={`${validationErrors.file ? "borderRed" : ""}`}
            accept="image/png, image/jpeg"
            onChange={(e) => setHeaderPic(e.target.files?.[0] || null)}
          />
          {validationErrors.file && (
            <p className="errorDisplayText" style={{ margin: 0 }}>
              {validationErrors.file}
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
            onChange={(e) => setUpdateDescription(e.target.value)}
          >
            {updateDescription}
          </textarea>
        </div>
        <div className="formRow">
          <label className="formLabel" htmlFor="status">
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
            <option value="On trip">On Trip</option>
          </select>
        </div>
        {userRole == "Owner" && (
          <>
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
                value={updateMembers}
                onChange={(e) => setUpdateMembers(e.target.value)}
              />
              {validationErrors.members && (
                <p className="errorDisplayText">{validationErrors.members}</p>
              )}
            </div>
            {updateMembers > 1 ? (
              <>
                <div className="formRow">
                  <label className="formLabel" htmlFor="defaultSplit">
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
                  <label className="formLabel" htmlFor="autoAdd">
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
          </>
        )}
        <input
          id="buttonSave"
          className="button"
          type="submit"
          value="SAVE"
          onClick={
            userRole == "Owner" ? updateTripOwner : updateTripParticipant
          }
        ></input>
      </form>
      {userRole == "Owner" && (
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
      )}
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
