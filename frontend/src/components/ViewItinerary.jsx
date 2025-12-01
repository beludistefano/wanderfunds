import { useState, useEffect } from "react";
import "../css/components/itineraryModal.css";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthProvider";

export default function ViewItinerary({ isOpen, onCancel, type, data }) {
  const [datatype, setDatatype] = useState(type);

  const [itineraryData, setItineraryData] = useState(data);

  if (isOpen == false) {
    return null;
  }

  return (
    <div id="modalConfirm">
      <div id="modalConfirmCard">
        {datatype === "flight" ? (
          <h4>View Flight Details</h4>
        ) : datatype === "hotel" ? (
          <h4>View Hotel Details</h4>
        ) : (
          <h4>View Itinerary Details</h4>
        )}
        {/* HOTEL */}
        {datatype === "hotel" && (
          <div className="itineraryFormGrid">
            <div className="itineraryRow">
              <span className="itineraryLabel">Name:</span>
              <span className="itineraryValue">{data.hotel_name || "—"}</span>
            </div>

            <div className="itineraryRow">
              <span className="itineraryLabel">Address:</span>
              <span className="itineraryValue">{data.address || "—"}</span>
            </div>

            <div className="itineraryRow">
              <span className="itineraryLabel">Check-in:</span>
              <span className="itineraryValue">
                {data.date_from ? data.date_from.slice(0, 10) : "—"}
              </span>
            </div>

            <div className="itineraryRow">
              <span className="itineraryLabel">Check-out:</span>
              <span className="itineraryValue">
                {data.date_to ? data.date_to.slice(0, 10) : "—"}
              </span>
            </div>

            <div className="itineraryRow">
              <span className="itineraryLabel">Reservation Website:</span>
              <span className="itineraryValue">
                {data.reservation_website || "-"}
              </span>
            </div>
          </div>
        )}

        {/* FLIGHT */}
        {datatype === "flight" && (
          <div className="itineraryFormGrid">
            <div className="itineraryRow">
              <span className="itineraryLabel">Flight:</span>
              <span className="itineraryValue">
                {data.flight_number || "—"}
              </span>
            </div>

            <div className="itineraryRow">
              <span className="itineraryLabel">Date:</span>
              <span className="itineraryValue">
                {data.flight_date ? data.flight_date.slice(0, 10) : "—"}
              </span>
            </div>

            <div className="itineraryRow">
              <span className="itineraryLabel">Airport From:</span>
              <span className="itineraryValue">{data.airport_from || "—"}</span>
            </div>

            <div className="itineraryRow">
              <span className="itineraryLabel">Departure time:</span>
              <span className="itineraryValue">
                {data.departure_time || "—"}
              </span>
            </div>

            <div className="itineraryRow">
              <span className="itineraryLabel">Airport To:</span>
              <span className="itineraryValue">{data.airport_to || "—"}</span>
            </div>

            <div className="itineraryRow">
              <span className="itineraryLabel">Arrival time:</span>
              <span className="itineraryValue">{data.arrival_time || "—"}</span>
            </div>

            <div className="itineraryRow">
              <span className="itineraryLabel">Reservation code:</span>
              <span className="itineraryValue">
                {data.reservation_code || "—"}
              </span>
            </div>
          </div>
        )}

        {/* OTHER */}
        {datatype === "other" && (
          <div className="itineraryFormGrid">
            <div className="itineraryRow">
              <span className="itineraryLabel">Name:</span>
              <span className="itineraryValue">
                {data.itinerary_type || "—"}
              </span>
            </div>

            <div className="itineraryRow">
              <span className="itineraryLabel">Description:</span>
              <span className="itineraryValue">
                {data.itinerary_description || "—"}
              </span>
            </div>
          </div>
        )}
        <div id="modalConfirmOptions">
          <button
            onClick={onCancel}
            className="confirmButtons buttonConfirmCancel"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
