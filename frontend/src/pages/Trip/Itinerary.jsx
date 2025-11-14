import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import "../../css/itinerary.css";
import { useAuth } from "../../auth/AuthProvider";
import {
  faArrowRight,
  faCheck,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import AddItinerary from "../../components/AddItinerary";

const formatDate = (d) => new Date(d).toISOString().slice(0, 10);

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

      const hotelsJson = await hotelsData.json();
      console.log(hotelsJson);

      setFlights(await flightsData.json());
      setHotels(hotelsJson);
      setDataItems(await itineraryData.json());
    } catch (e) {
      console.log(e);
    }
  }

  async function acceptItinerary(id, datatype) {
    try {
      if (!token) {
        return;
      }

      if (datatype == "flight") {
        const flightConfirm = await fetch(
          "https://wanderfunds-backend.onrender.com/api/confirm-flight",
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ flightID: id }),
          }
        );
        console.log(flightConfirm);
      } else if (datatype == "hotel") {
        const hotelConfirm = await fetch(
          "https://wanderfunds-backend.onrender.com/api/confirm-hotel",
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ hotelID: id }),
          }
        );
        console.log(hotelConfirm);
      } else if (datatype == "itinerary") {
        const itineraryConfirm = await fetch(
          "https://wanderfunds-backend.onrender.com/api/confirm-itinerary",
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ itineraryID: id }),
          }
        );

        console.log(itineraryConfirm);
      }
    } catch (e) {
      console.log(e);
    }
    refreshPage();
  }

  async function refreshPage() {
    await getData();
  }

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
        id="containerItineraryTop"
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
          {flights == null || flights.length == 0 ? (
            <p>No data yet</p>
          ) : (
            flights.map((f) => {
              return (
                <div className="itineraryCard" key={f.id}>
                  <div className="itineraryInfoCol">
                    {f.confirmed == false ? (
                      <p className="itineraryTitle">
                        <span className="pendingItinerary">Pending</span>
                        {f.flight_number}
                      </p>
                    ) : (
                      <p className="itineraryTitle">{f.flight_number}</p>
                    )}
                    <p className="itinerarySubTitle">
                      {formatDate(f.flight_date)} - {f.airport_from}
                    </p>
                  </div>
                  <div>
                    {f.file_url ? (
                      <a href={f.file_url} className="fileLink" target="_blank">
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className="clickableIcon"
                        />
                      </a>
                    ) : (
                      <FontAwesomeIcon
                        className="fileNoLink"
                        icon={faArrowRight}
                      />
                    )}
                    {userRole === "Guest" ? (
                      <></>
                    ) : f.confirmed === false ? (
                      <span
                        className="acceptItContainer"
                        onClick={() => acceptItinerary(f.id, "flight")}
                      >
                        <FontAwesomeIcon
                          className="acceptIcon"
                          icon={faCheck}
                        />
                      </span>
                    ) : (
                      <></>
                    )}
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
          {hotels == null || hotels.length == 0 ? (
            <p>No data yet</p>
          ) : (
            hotels.map((h) => {
              return (
                <div className="itineraryCard" key={h.id}>
                  <div className="itineraryInfoCol">
                    {h.confirmed == false ? (
                      <p className="itineraryTitle">
                        <span className="pendingItinerary">Pending</span>
                        {h.hotel_name}
                      </p>
                    ) : (
                      <p className="itineraryTitle">{h.hotel_name}</p>
                    )}
                    <p>
                      {formatDate(h.date_from)} - {formatDate(h.date_to)}
                    </p>
                  </div>
                  <div>
                    {h.file_url ? (
                      <a href={h.file_url} className="fileLink" target="_blank">
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className="clickableIcon"
                        />
                      </a>
                    ) : (
                      <FontAwesomeIcon
                        className="fileNoLink"
                        icon={faArrowRight}
                      />
                    )}
                    {userRole === "Guest" ? (
                      <></>
                    ) : h.confirmed === false ? (
                      <span
                        className="acceptItContainer"
                        onClick={() => acceptItinerary(h.id, "hotel")}
                      >
                        <FontAwesomeIcon
                          className="acceptIcon"
                          icon={faCheck}
                        />
                      </span>
                    ) : (
                      <></>
                    )}
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
          {dataItems == null || dataItems.length == 0 ? (
            <p>No data yet</p>
          ) : (
            dataItems.map((i) => {
              return (
                <div className="itineraryCard" key={i.id}>
                  <div className="itineraryInfoCol">
                    {i.confirmed == false ? (
                      <p className="itineraryTitle">
                        <span className="pendingItinerary">Pending</span>
                        {i.itinerary_type}
                      </p>
                    ) : (
                      <p className="itineraryTitle">{i.itinerary_type}</p>
                    )}
                    <p>{i.itinerary_desc}</p>
                  </div>
                  <div>
                    {i.file_url ? (
                      <a href={i.file_url} className="fileLink" target="_blank">
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className="clickableIcon"
                        />
                      </a>
                    ) : (
                      <FontAwesomeIcon
                        className="fileNoLink"
                        icon={faArrowRight}
                      />
                    )}
                    {userRole === "Guest" ? (
                      <></>
                    ) : i.confirmed === false ? (
                      <span
                        className="acceptItContainer"
                        onClick={() => acceptItinerary(i.id, "itinerary")}
                      >
                        <FontAwesomeIcon
                          className="acceptIcon"
                          icon={faCheck}
                        />
                      </span>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div>
            <Link id="calendarViewButton" to={`/trip/calendar/${tripID}`}>
              See Calendar View
            </Link>
          </div>
        </div>
      </div>
      <AddItinerary
        isOpen={isFlightOpen}
        onAdd={refreshPage}
        onCancel={() => setIsFlightOpen(false)}
        tripID={tripId}
        dataType={"flight"}
        role={userRole}
      />
      <AddItinerary
        isOpen={isHotelOpen}
        onAdd={refreshPage}
        onCancel={() => setIsHotelOpen(false)}
        tripID={tripId}
        dataType={"hotel"}
        role={userRole}
      />
      <AddItinerary
        isOpen={isOtherOpen}
        onAdd={refreshPage}
        onCancel={() => setIsOtherOpen(false)}
        tripID={tripId}
        dataType={"other"}
        role={userRole}
      />
    </>
  );
}
