import { useState, useEffect } from "react";
import "../css/components/expensemodal.css";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthProvider";

function validateExpense(name, amount) {
  const expenseErrors = {};

  if (name == "") {
    expenseErrors.name = "Expense name must be included";
  }
  if (amount <= 0) {
    expenseErrors.amount = "Expense amount must be included and over 0";
  }

  return expenseErrors;
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
  }, [isOpen]);

  if (isOpen == false) {
    return null;
  }

  async function handleAdd() {}

  // async function addExpense() {
  //   setValidationErrors({});

  //   const expenseValidation = validateExpense(expenseName, expenseAmount);
  //   setValidationErrors(expenseValidation);

  //   if (Object.keys(expenseValidation).length != 0) {
  //     return;
  //   }

  //   const newExpense = {};
  //   newExpense["tripID"] = tripID;
  //   newExpense["name"] = expenseName;
  //   newExpense["amount"] = Number(expenseAmount);
  //   newExpense["expectedDate"] = expenseDate ? expenseDate : null;

  //   if (
  //     expenseSplit == "Shared Expense" ||
  //     expenseSplit == "Trip Default - Shared" ||
  //     expenseSplit == "equal" ||
  //     expenseSplit == "shared"
  //   ) {
  //     newExpense["split"] = "shared";
  //   } else if (
  //     expenseSplit == "Own Expense" ||
  //     expenseSplit == "Trip Default - Own" ||
  //     expenseSplit == "own"
  //   ) {
  //     newExpense["split"] = "own";
  //   }

  //   if (autoAdd == true) {
  //     newExpense["expenseStatus"] = "accepted";
  //   } else {
  //     if (newExpense["split"] == "own" || role == "Owner") {
  //       newExpense["expenseStatus"] = "accepted";
  //     } else {
  //       newExpense["expenseStatus"] = "pending";
  //     }
  //   }

  //   newExpense["role"] = role;

  //   console.log(newExpense);

  //   try {
  //     const { data } = await supabase.auth.getSession();
  //     const token = data.session?.access_token;
  //     if (!token) {
  //       return;
  //     }

  //     const expenseCreation = await fetch(
  //       "https://wanderfunds-backend.onrender.com/api/expenses",
  //       {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(newExpense),
  //       }
  //     );

  //     if (expenseCreation.ok) {
  //       setExpenseAddStatus("success");
  //       onAdd();
  //     } else {
  //       setExpenseAddStatus("fail");
  //     }

  //     setTimeout(() => onCancel(), 800);
  //   } catch (e) {
  //     console.log("There was an error" + e);
  //     setExpenseAddStatus("fail");
  //     setTimeout(() => onCancel(), 800);
  //   }
  // }

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
              <div className="formGrid">
                <div className="row">
                  <label htmlFor="hotelName" className="label">
                    Name:
                  </label>
                  <input
                    id="hotelName"
                    type="text"
                    className="input"
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    placeholder="Hotel name"
                  />
                </div>

                <div className="row">
                  <label htmlFor="hotelAddress" className="label">
                    Address:
                  </label>
                  <input
                    id="hotelAddress"
                    type="text"
                    className="input"
                    value={hotelAddress}
                    onChange={(e) => setHotelAddress(e.target.value)}
                    placeholder="Street, city, etc."
                  />
                </div>

                <div className="row">
                  <label htmlFor="checkIn" className="label">
                    Check-in:
                  </label>
                  <input
                    id="checkIn"
                    type="datetime-local"
                    className="input"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>

                <div className="row">
                  <label htmlFor="checkOut" className="label">
                    Check-out:
                  </label>
                  <input
                    id="checkOut"
                    type="datetime-local"
                    className="input"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>

                <div className="row">
                  <label htmlFor="hotelFile" className="label">
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
              <div className="formGrid">
                <div className="row">
                  <label htmlFor="flightDate" className="label">
                    Date:
                  </label>
                  <input
                    id="flightDate"
                    type="date"
                    className="input"
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                  />
                </div>

                <div className="row">
                  <label htmlFor="departureTime" className="label">
                    Departure time:
                  </label>
                  <input
                    id="departureTime"
                    type="time"
                    className="input"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                  />
                </div>

                <div className="row">
                  <label htmlFor="arrivalTime" className="label">
                    Arrival time:
                  </label>
                  <input
                    id="arrivalTime"
                    type="time"
                    className="input"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                  />
                </div>

                <div className="row">
                  <label htmlFor="airline" className="label">
                    Airline:
                  </label>
                  <input
                    id="airline"
                    type="text"
                    className="input"
                    value={airline}
                    onChange={(e) => setAirline(e.target.value)}
                    placeholder="e.g., Air Canada"
                  />
                </div>

                <div className="row">
                  <label htmlFor="reservationCode" className="label">
                    Reservation code:
                  </label>
                  <input
                    id="reservationCode"
                    type="text"
                    className="input"
                    value={reservationCode}
                    onChange={(e) => setReservationCode(e.target.value)}
                    placeholder="e.g., ABC123"
                  />
                </div>

                <div className="row">
                  <label htmlFor="flightNumber" className="label">
                    Flight:
                  </label>
                  <input
                    id="flightNumber"
                    type="text"
                    className="input"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="e.g., AC123"
                  />
                </div>

                <div className="row">
                  <label htmlFor="flightFile" className="label">
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
              <div className="formGrid">
                <div className="row">
                  <label htmlFor="otherName" className="label">
                    Name:
                  </label>
                  <input
                    id="otherName"
                    type="text"
                    className="input"
                    value={otherName}
                    onChange={(e) => setOtherName(e.target.value)}
                    placeholder="Item name"
                  />
                </div>

                <div className="row">
                  <label htmlFor="otherDescription" className="label">
                    Description:
                  </label>
                  <textarea
                    id="otherDescription"
                    className="input"
                    rows={3}
                    value={otherDescription}
                    onChange={(e) => setOtherDescription(e.target.value)}
                    placeholder="Short description"
                  />
                </div>

                <div className="row">
                  <label htmlFor="otherFile" className="label">
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
