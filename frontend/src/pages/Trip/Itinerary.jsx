import { faUser, faX } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../css/itinerary.css";
import InviteMember from "../../components/InviteMember";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../auth/AuthProvider";
import { Link, useParams, useNavigate } from "react-router-dom";
import { faArrowRight, faPlus } from "@fortawesome/free-solid-svg-icons";
import AddItinerary from "../../components/AddItinerary";

export default function Itinerary({ role, tripID }) {
  const { session, initialized } = useAuth();

  const [tripId, setTripId] = useState(tripID);
  const [userRole, setUserRole] = useState(role);

  const [flights, setFlights] = useState(null);
  const [hotels, setHotels] = useState(null);
  const [dataItems, setDataItems] = useState(null);

  const [isFlightOpen, setIsFlightOpen] = useState(false);
  const [isHotelOpen, setIsHotelOpen] = useState(false);
  const [isOtherOpen, setIsOtherOpen] = useState(false);

  const token = session?.access_token;

  async function getData() {
    try {
      if (!token) {
        return;
      }

      const itineraryData = await fetch(
        `https://wanderfunds-backend.onrender.com/api/itinerary/${tripId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const hotelsData = await fetch(
        `https://wanderfunds-backend.onrender.com/api/hotels/${tripId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const flightsData = await fetch(
        `https://wanderfunds-backend.onrender.com/api/flights/${tripId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(flightsData);
      console.log(hotelsData);
      console.log(itineraryData);
      // setSavingsFund(savingsFundJson[0].amount);
      // setSavingsFundID(savingsFundJson[0].savings_funds_id);
    } catch (e) {
      console.log(e);
    }
  }

  async function refreshPage() {}

  useEffect(() => {
    if (!initialized || !token || !tripID) {
      return;
    }
    (async () => {
      await getData();
    })();
  }, [initialized, token, tripID]);

  return (
    <>
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
          ITINERARY
        </h2>
      </div>
      <div id="itineraryContainer">
        <div className="tripData">
          <div className="tripDataTitle">
            <h3>Flights</h3>
            <div
              id="addFlightButton"
              onClick={() => {
                setIsFlightOpen(true);
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
            </div>
          </div>
          {flights == null ? (
            <p>No data yet</p>
          ) : (
            flights.map((f) => {
              return (
                <div className="itineraryCard">
                  <div className="itineraryInfoCol">
                    <p>{f.flight_number}</p>
                    <p>
                      {f.flight_date} - {f.airport_from}
                    </p>
                  </div>
                  <div>
                    <FontAwesomeIcon icon={faArrowRight} />
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="tripData">
          <div className="tripDataTitle">
            <h3>Hotels</h3>
            <div
              id="addHotelButton"
              onClick={() => {
                setIsHotelOpen(true);
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
            </div>
          </div>
          {hotels == null ? (
            <p>No data yet</p>
          ) : (
            hotels.map((h) => {
              return (
                <div className="itineraryCard">
                  <div className="itineraryInfoCol">
                    <p>{h.hotel_name}</p>
                    <p>{h.address}</p>
                  </div>
                  <div>
                    <FontAwesomeIcon icon={faArrowRight} />
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="tripData">
          <div className="tripDataTitle">
            <h3>Other</h3>
            <div
              id="addOtherButton"
              onClick={() => {
                setIsOtherOpen(true);
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
            </div>
          </div>
          {dataItems == null ? (
            <p>No data yet</p>
          ) : (
            dataItems.map((i) => {
              return (
                <div className="itineraryCard">
                  <div className="itineraryInfoCol">
                    <p>{i.itinerary_type}</p>
                    <p>{i.itinerary_desc}</p>
                  </div>
                  <div>
                    <FontAwesomeIcon icon={faArrowRight} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <AddItinerary
        isOpen={isFlightOpen}
        onAdd={refreshPage}
        onCancel={() => setIsFlightOpen(false)}
        tripID={tripId}
        dataType={"flight"}
      />
      <AddItinerary
        isOpen={isHotelOpen}
        onAdd={refreshPage}
        onCancel={() => setIsHotelOpen(false)}
        tripID={tripId}
        dataType={"hotel"}
      />
      <AddItinerary
        isOpen={isOtherOpen}
        onAdd={refreshPage}
        onCancel={() => setIsOtherOpen(false)}
        tripID={tripId}
        dataType={"other"}
      />
    </>
  );
}
