import { useState, useEffect } from "react";
import "../css/components/itineraryModal.css";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthProvider";

const allowedTypes = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

function validateHotel(hotelName, checkIn, checkOut, file) {
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
  if (file != null) {
    if (!allowedTypes.includes(file.type)) {
      errors.file =
        "Invalid file type. Only PDF or images (PNG, JPG, WEBP) are allowed.";
    }
  }

  return errors;
}

function validateFlight(flightNumber, flightDate, file) {
  const flightErrors = {};

  if (flightNumber == "") {
    flightErrors.number = "Flight number must be included";
  }

  if (flightDate == "" || flightDate == null) {
    flightErrors.date = "Flight date must be included";
  }

  console.log(file);
  console.log(file.type);

  if (file != null) {
    if (!allowedTypes.includes(file.type)) {
      flightErrors.file =
        "Invalid file type. Only PDF or images (PNG, JPG, WEBP) are allowed.";
    }
  }

  return flightErrors;
}

function validateItinerary(itItem, file) {
  const itineraryItemErrors = {};

  if (itItem == "") {
    itineraryItemErrors.itItem = "Itinerary item cannot be empty";
  }

  if (file != null) {
    if (!allowedTypes.includes(file.type)) {
      itineraryItemErrors.file =
        "Invalid file type. Only PDF or images (PNG, JPG, WEBP) are allowed.";
    }
  }

  return itineraryItemErrors;
}

export default function AddItinerary({
  isOpen,
  onAdd,
  onCancel,
  tripID,
  dataType,
  role,
}) {
  const [tripId, setTripId] = useState(tripID);
  const [datatype, setDatatype] = useState(dataType);
  const [dataAddStatus, setDataAddStatus] = useState(null);

  const [validationErrors, setValidationErrors] = useState({});

  const [userRole, serUserRole] = useState(role);

  // HOTEL
  const [hotelName, setHotelName] = useState("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [reservationWebsite, setReservationWebsite] = useState("");
  const [hotelFile, setHotelFile] = useState(null);

  // FLIGHT
  const [flightDate, setFlightDate] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [airportFrom, setAirportFrom] = useState("");
  const [airportTo, setAirportTo] = useState("");
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
      setDataAddStatus(null);
      setHotelName("");
      setHotelAddress("");
      setCheckIn("");
      setCheckOut("");
      setReservationWebsite("");
      setHotelFile(null);
      setFlightNumber("");
      setFlightDate("");
      setAirportFrom("");
      setDepartureTime("");
      setAirportTo("");
      setArrivalTime("");
      setReservationCode("");
      setFlightFile(null);
      setOtherName("");
      setOtherDescription("");
      setOtherFile(null);
    }
    if (isOpen) {
      setDatatype(dataType);
      setTripId(tripID);
    }
  }, [isOpen]);

  if (isOpen == false) {
    return null;
  }

  async function addHotel() {
    const newHotel = {};
    newHotel["tripID"] = tripId;
    newHotel["hotelName"] = hotelName;
    newHotel["address"] = hotelAddress ? hotelAddress : null;
    newHotel["dateFrom"] = checkIn;
    newHotel["dateTo"] = checkOut;
    newHotel["reservationWebsite"] = reservationWebsite
      ? reservationWebsite
      : null;

    console.log(newHotel);

    if (userRole == "Guest") {
      newHotel["confirmed"] = false;
    } else {
      newHotel["confirmed"] = true;
    }

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      return;
    }

    const hotelCreation = await fetch(
      "https://wanderfunds-backend.onrender.com/api/add-hotel",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newHotel),
      }
    );

    if (!hotelCreation.ok) {
      throw new Error("Add itinerary failed");
    }

    if (hotelFile != null) {
      const hotelData = await hotelCreation.json();
      const hotelID = hotelData.id;

      const path = `trips/${tripId}/hotels/${hotelFile.name}`;

      const { data, error } = await supabase.storage
        .from("trip-hotels")
        .upload(path, hotelFile, { contentType: hotelFile.type });

      if (error) {
        throw new Error("File upload failed");
      }

      const publicUrl = supabase.storage
        .from("trip-hotels")
        .getPublicUrl(`trips/${tripId}/hotels/${hotelFile.name}`)
        .data.publicUrl;

      const hotelUpdateFile = await fetch(
        "https://wanderfunds-backend.onrender.com/api/update-hotel",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ hotelID: hotelID, fileURL: publicUrl }),
        }
      );

      console.log(hotelUpdateFile);
    }

    return true;
  }

  async function addFlight() {
    const newFlight = {};
    newFlight["tripID"] = tripId;
    newFlight["flightNumber"] = flightNumber;
    newFlight["flightDate"] = flightDate ? flightDate : null;
    newFlight["airportFrom"] = airportFrom ? airportFrom : null;
    newFlight["departureTime"] = departureTime ? departureTime : null;
    newFlight["airportTo"] = airportTo ? airportTo : null;
    newFlight["arrivalTime"] = arrivalTime ? arrivalTime : null;
    newFlight["reservationCode"] = reservationCode ? reservationCode : null;

    if (userRole == "Guest") {
      newFlight["confirmed"] = false;
    } else {
      newFlight["confirmed"] = true;
    }

    console.log(newFlight);

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      return;
    }

    const flightCreation = await fetch(
      "https://wanderfunds-backend.onrender.com/api/add-flight",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFlight),
      }
    );

    if (!flightCreation.ok) {
      throw new Error("Add itinerary failed");
    }

    if (flightFile != null) {
      const flightData = await flightCreation.json();
      const flightId = flightData.id;

      const path = `trips/${tripId}/flights/${flightFile.name}`;

      const { data, error } = await supabase.storage
        .from("trip-flights")
        .upload(path, flightFile, { contentType: flightFile.type });

      if (error) {
        console.log(error);
        throw new Error("File upload failed");
      }

      console.log(data);

      const publicUrl = supabase.storage
        .from("trip-flights")
        .getPublicUrl(`trips/${tripId}/flights/${flightFile.name}`)
        .data.publicUrl;

      const flightUpdateResult = await fetch(
        "https://wanderfunds-backend.onrender.com/api/update-flight",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ flightID: flightId, fileURL: publicUrl }),
        }
      );

      console.log(flightUpdateResult);
    }

    return true;
  }

  async function addOther() {
    const newIt = {};
    newIt["tripID"] = tripId;
    newIt["itineraryType"] = otherName;
    newIt["itineraryDesc"] = otherDescription ? otherDescription : null;

    if (userRole == "Guest") {
      newIt["confirmed"] = false;
    } else {
      newIt["confirmed"] = true;
    }

    console.log(newIt);

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

    if (otherFile != null) {
      const itineraryData = await otherItCreation.json();
      const itId = itineraryData.id;

      const path = `trips/${tripId}/itinerary/${otherFile.name}`;

      const { data, error } = await supabase.storage
        .from("trip-itinerary")
        .upload(path, otherFile, { contentType: otherFile.type });

      if (error) {
        throw new Error("File upload failed");
      }

      const publicUrl = supabase.storage
        .from("trip-itinerary")
        .getPublicUrl(`trips/${tripId}/itinerary/${otherFile.name}`)
        .data.publicUrl;

      const itineraryUpdateResult = await fetch(
        "https://wanderfunds-backend.onrender.com/api/update-itinerary",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ itID: itId, fileURL: publicUrl }),
        }
      );

      console.log(itineraryUpdateResult);
    }

    return true;
  }

  async function handleAdd() {
    setValidationErrors({});
    var errors;
    if (datatype == "hotel") {
      errors = validateHotel(hotelName, checkIn, checkOut, hotelFile);
      setValidationErrors(errors);
    } else if (datatype == "flight") {
      errors = validateFlight(flightNumber, flightDate, flightFile);
      setValidationErrors(errors);
    } else {
      errors = validateItinerary(otherName, otherFile);
      setValidationErrors(errors);
    }

    if (Object.keys(errors).length != 0) {
      return;
    }

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
        setDataAddStatus("success");
        onAdd();
      } else {
        setDataAddStatus("fail");
      }

      setTimeout(() => onCancel(), 1000);
    } catch (e) {
      console.log("There was an error" + e);
      setDataAddStatus("fail");
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

                <div className="itineraryRow">
                  <label htmlFor="hotelReserv" className="itineraryLabel">
                    Reservation Website:
                  </label>
                  <input
                    id="hotelReserv"
                    type="text"
                    className="itineraryInput"
                    value={reservationWebsite}
                    onChange={(e) => setReservationWebsite(e.target.value)}
                    placeholder="Booking, Expedia"
                  />
                </div>

                <div className="itineraryRowFile">
                  <label htmlFor="hotelFile" className="itineraryLabel">
                    Attach file:
                  </label>
                  <input
                    id="hotelFile"
                    type="file"
                    className={`${validationErrors.file ? "borderRed" : ""}`}
                    accept="application/pdf,image/*"
                    onChange={(e) => setHotelFile(e.target.files?.[0] || null)}
                  />
                  {validationErrors.file && (
                    <p className="errorDisplayText" style={{ margin: 0 }}>
                      {validationErrors.file}
                    </p>
                  )}
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
                    className={`itineraryInput ${
                      validationErrors.date ? "borderRed" : ""
                    }`}
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                  />
                  {validationErrors.date && (
                    <p className="errorDisplayText" style={{ margin: 0 }}>
                      {validationErrors.date}
                    </p>
                  )}
                </div>

                <div className="itineraryRow">
                  <label htmlFor="airline" className="itineraryLabel">
                    Airport From:
                  </label>
                  <input
                    id="airline"
                    type="text"
                    className="itineraryInput"
                    value={airportFrom}
                    onChange={(e) => setAirportFrom(e.target.value)}
                    placeholder="e.g., Toronto Pearson"
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
                  <label htmlFor="airportTo" className="itineraryLabel">
                    Airport To:
                  </label>
                  <input
                    id="airportTo"
                    type="text"
                    className="itineraryInput"
                    value={airportTo}
                    onChange={(e) => setAirportTo(e.target.value)}
                    placeholder="e.g., Orlando International"
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
                    className={`${validationErrors.file ? "borderRed" : ""}`}
                    accept="application/pdf,image/*"
                    onChange={(e) => setFlightFile(e.target.files?.[0] || null)}
                  />
                  {validationErrors.file && (
                    <p className="errorDisplayText" style={{ margin: 0 }}>
                      {validationErrors.file}
                    </p>
                  )}
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
                    className={`${validationErrors.file ? "borderRed" : ""}`}
                    accept="application/pdf,image/*"
                    onChange={(e) => setOtherFile(e.target.files?.[0] || null)}
                  />
                  {validationErrors.file && (
                    <p className="errorDisplayText" style={{ margin: 0 }}>
                      {validationErrors.file}
                    </p>
                  )}
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
