import { useState, useEffect } from "react";
import "../css/components/itineraryModal.css";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthProvider";

function validateHotel(hotelName, checkIn, checkOut) {
  const errors = {};

  if (hotelName == "" || hotelName == null) {
    errors.hotelName = "Hotel name must be included";
  }
  if (checkIn == null || checkIn == "") {
    errors.checkIn = "Check-in date must be included";
  }
  if (checkOut == null || checkOut == "") {
    errors.checkOut = "Check-out date must be included";
  }
  if (checkIn != "" && checkOut != "") {
    const inD = new Date(checkIn);
    const outD = new Date(checkOut);
    if (outD <= inD) {
      errors.checkOut = "Check-out must be after check-in";
    }
  }

  return errors;
}

function validateFlight(flightNumber) {
  const flightErrors = {};

  if (flightNumber == "") {
    flightErrors.number = "Flight number must be included";
  }

  return flightErrors;
}

function validateItinerary(itItem) {
  const itineraryItemErrors = {};

  if (itItem == "") {
    itineraryItemErrors.itItem = "Itinerary item cannot be empty";
  }

  return itineraryItemErrors;
}

export default function AddItinerary({
  isOpen,
  onAdd,
  onCancel,
  tripID,
  dataType,
}) {
  const [tripId, setTripId] = useState(tripID);
  const [datatype, setDatatype] = useState(dataType);
  const [dataAddStatus, setDataAddStatus] = useState(null);

  const [validationErrors, setValidationErrors] = useState({});

  // HOTEL
  const [hotelName, setHotelName] = useState("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [hotelFile, setHotelFile] = useState(null);

  // FLIGHT
  const [flightDate, setFlightDate] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [airline, setAirline] = useState("");
  const [reservationCode, setReservationCode] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [flightFile, setFlightFile] = useState(null);

  // OTHER
  const [otherName, setOtherName] = useState("");
  const [otherDescription, setOtherDescription] = useState("");
  const [otherFile, setOtherFile] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setDatatype(null);
      setTripId("");
      setValidationErrors({});
    }
    if (isOpen) {
      setDatatype(dataType);
    }
  }, [isOpen]);

  if (isOpen == false) {
    return null;
  }

  async function addHotel() {
    setValidationErrors({});

    const hotelValidation = validateHotel(hotelName, checkIn, checkOut);
    setValidationErrors(hotelValidation);

    if (Object.keys(hotelValidation).length != 0) {
      return;
    }
  }

  async function addFlight() {
    setValidationErrors({});

    const flightVal = validateFlight(flightNumber);
    setValidationErrors(flightVal);

    if (Object.keys(flightVal).length != 0) {
      return;
    }
  }

  async function addOther() {
    setValidationErrors({});

    const otherVal = validateItinerary(otherName);
    setValidationErrors(otherVal);

    if (Object.keys(otherVal).length != 0) {
      return;
    }

    const newIt = {};
    newIt["tripID"] = tripId;
    newIt["itineraryType"] = otherName;
    newIt["itineraryDesc"] = otherDescription ? otherDescription : null;

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      return;
    }

    const otherItCreation = await fetch(
      "https://wanderfunds-backend.onrender.com/api/add-itinerary",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newIt),
      }
    );

    if (!otherItCreation.ok) {
      throw new Error("Add itinerary failed");
    }

    return true;
  }

  async function handleAdd() {
    var result = "";
    try {
      if (datatype == "hotel") {
        result = await addHotel();
      } else if (datatype == "flight") {
        result = await addFlight();
      } else {
        result = await addOther();
      }

      if (result) {
        setExpenseAddStatus("success");
        onAdd();
      } else {
        setExpenseAddStatus("fail");
      }

      setTimeout(() => onCancel(), 1000);
    } catch (e) {
      console.log("There was an error" + e);
      setExpenseAddStatus("fail");
    } finally {
      setTimeout(() => onCancel(), 1000);
    }
  }

  return (
    <div id="modalConfirm">
      <div id="modalConfirmCard">
        {datatype === "flight" ? (
          <h4>Add Flight</h4>
        ) : datatype === "hotel" ? (
          <h4>Add Hotel Reservation</h4>
        ) : (
          <h4>Add Itinerary Item</h4>
        )}
        {dataAddStatus == null ? (
          <>
            {/* HOTEL */}
            {datatype === "hotel" && (
              <div className="itineraryFormGrid">
                <div className="itineraryRow">
                  <label htmlFor="hotelName" className="itineraryLabel">
                    Name:
                  </label>
                  <input
                    id="hotelName"
                    type="text"
                    className={`itineraryInput ${
                      validationErrors.hotelName ? "borderRed" : ""
                    }`}
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    placeholder="Hotel name"
                  />
                  {validationErrors.hotelName && (
                    <p className="errorDisplayText" style={{ margin: 0 }}>
                      {validationErrors.hotelName}
                    </p>
                  )}
                </div>

                <div className="itineraryRow">
                  <label htmlFor="hotelAddress" className="itineraryLabel">
                    Address:
                  </label>
                  <input
                    id="hotelAddress"
                    type="text"
                    className="itineraryInput"
                    value={hotelAddress}
                    onChange={(e) => setHotelAddress(e.target.value)}
                    placeholder="Street, city, etc."
                  />
                </div>

                <div className="itineraryRow">
                  <label htmlFor="checkIn" className="itineraryLabel">
                    Check-in:
                  </label>
                  <input
                    id="checkIn"
                    type="date"
                    className={`itineraryInput ${
                      validationErrors.checkIn ? "borderRed" : ""
                    }`}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                  {validationErrors.checkIn && (
                    <p className="errorDisplayText" style={{ margin: 0 }}>
                      {validationErrors.checkIn}
                    </p>
                  )}
                </div>

                <div className="itineraryRow">
                  <label htmlFor="checkOut" className="itineraryLabel">
                    Check-out:
                  </label>
                  <input
                    id="checkOut"
                    type="date"
                    className={`itineraryInput ${
                      validationErrors.checkOut ? "borderRed" : ""
                    }`}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                  {validationErrors.checkOut && (
                    <p className="errorDisplayText" style={{ margin: 0 }}>
                      {validationErrors.checkOut}
                    </p>
                  )}
                </div>

                <div className="itineraryRowFile">
                  <label htmlFor="hotelFile" className="itineraryLabel">
                    Attach file:
                  </label>
                  <input
                    id="hotelFile"
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => setHotelFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            )}

            {/* FLIGHT */}
            {datatype === "flight" && (
              <div className="itineraryFormGrid">
                <div className="itineraryRow">
                  <label htmlFor="flightNumber" className="itineraryLabel">
                    Flight:
                  </label>
                  <input
                    id="flightNumber"
                    type="text"
                    className={`itineraryInput ${
                      validationErrors.number ? "borderRed" : ""
                    }`}
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="e.g., AC123"
                  />
                  {validationErrors.number && (
                    <p className="errorDisplayText" style={{ margin: 0 }}>
                      {validationErrors.number}
                    </p>
                  )}
                </div>

                <div className="itineraryRow">
                  <label htmlFor="flightDate" className="itineraryLabel">
                    Date:
                  </label>
                  <input
                    id="flightDate"
                    type="date"
                    className="itineraryInput"
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                  />
                </div>

                <div className="itineraryRow">
                  <label htmlFor="departureTime" className="itineraryLabel">
                    Departure time:
                  </label>
                  <input
                    id="departureTime"
                    type="text"
                    className="itineraryInput"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                  />
                </div>

                <div className="itineraryRow">
                  <label htmlFor="arrivalTime" className="itineraryLabel">
                    Arrival time:
                  </label>
                  <input
                    id="arrivalTime"
                    type="text"
                    className="itineraryInput"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                  />
                </div>

                <div className="itineraryRow">
                  <label htmlFor="airline" className="itineraryLabel">
                    Airline:
                  </label>
                  <input
                    id="airline"
                    type="text"
                    className="itineraryInput"
                    value={airline}
                    onChange={(e) => setAirline(e.target.value)}
                    placeholder="e.g., Air Canada"
                  />
                </div>

                <div className="itineraryRow">
                  <label htmlFor="reservationCode" className="itineraryLabel">
                    Reservation code:
                  </label>
                  <input
                    id="reservationCode"
                    type="text"
                    className="itineraryInput"
                    value={reservationCode}
                    onChange={(e) => setReservationCode(e.target.value)}
                    placeholder="e.g., ABC123"
                  />
                </div>

                <div className="itineraryRowFile">
                  <label htmlFor="flightFile" className="itineraryLabel">
                    Attach file:
                  </label>
                  <input
                    id="flightFile"
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => setFlightFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            )}

            {/* OTHER */}
            {datatype === "other" && (
              <div className="itineraryFormGrid">
                <div className="itineraryRow">
                  <label htmlFor="otherName" className="itineraryLabel">
                    Name:
                  </label>
                  <input
                    id="otherName"
                    type="text"
                    className={`itineraryInput ${
                      validationErrors.itItem ? "borderRed" : ""
                    }`}
                    value={otherName}
                    onChange={(e) => setOtherName(e.target.value)}
                    placeholder="Item name"
                  />
                  {validationErrors.itItem && (
                    <p className="errorDisplayText" style={{ margin: 0 }}>
                      {validationErrors.itItem}
                    </p>
                  )}
                </div>

                <div className="itineraryRow">
                  <label htmlFor="otherDescription" className="itineraryLabel">
                    Description:
                  </label>
                  <textarea
                    id="otherDescription"
                    className="itineraryInput"
                    rows={3}
                    value={otherDescription}
                    onChange={(e) => setOtherDescription(e.target.value)}
                    placeholder="Short description"
                  />
                </div>

                <div className="itineraryRowFile">
                  <label htmlFor="otherFile" className="itineraryLabel">
                    Attach file:
                  </label>
                  <input
                    id="otherFile"
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => setOtherFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            )}
            <div id="modalConfirmOptions">
              <button
                onClick={onCancel}
                className="confirmButtons buttonConfirmCancel"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="confirmButtons buttonConfirmOk"
              >
                Save
              </button>
            </div>
          </>
        ) : dataAddStatus === "success" ? (
          <>
            <p className="greenText">Trip data added succesfully!</p>
          </>
        ) : (
          <>
            <p className="redText">
              There was an error saving your information
            </p>
          </>
        )}
      </div>
    </div>
  );
}
