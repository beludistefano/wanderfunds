import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../css/itinerary.css";
import { useAuth } from "../../auth/AuthProvider";
import { faArrowRight, faPlus } from "@fortawesome/free-solid-svg-icons";
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

      setFlights(await flightsData.json());
      setHotels(await hotelsData.json());
      setDataItems(await itineraryData.json());
    } catch (e) {
      console.log(e);
    }
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
                <div className="itineraryCard" key={f.id}>
                  <div className="itineraryInfoCol">
                    <p className="itineraryTitle">{f.flight_number}</p>
                    <p className="itinerarySubTitle">
                      {formatDate(f.flight_date)} - {f.airport_from}
                    </p>
                  </div>
                  <div>
                    {f.file_url ? (
                      <a href={f.file_url} target="_blank">
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className="clickableIcon"
                        />
                      </a>
                    ) : (
                      <FontAwesomeIcon icon={faArrowRight} />
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
          {hotels == null ? (
            <p>No data yet</p>
          ) : (
            hotels.map((h) => {
              return (
                <div className="itineraryCard" key={h.id}>
                  <div className="itineraryInfoCol">
                    <p className="itineraryTitle">{h.hotel_name}</p>
                    <p>
                      {formatDate(h.date_from)} - {formatDate(h.date_to)}
                    </p>
                  </div>
                  <div>
                    {h.file_url ? (
                      <a href={h.file_url} target="_blank">
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className="clickableIcon"
                        />
                      </a>
                    ) : (
                      <FontAwesomeIcon icon={faArrowRight} />
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
          {dataItems == null ? (
            <p>No data yet</p>
          ) : (
            dataItems.map((i) => {
              return (
                <div className="itineraryCard" key={i.id}>
                  <div className="itineraryInfoCol">
                    <p className="itineraryTitle">{i.itinerary_type}</p>
                    <p>{i.itinerary_desc}</p>
                  </div>
                  <div>
                    {i.file_url ? (
                      <a href={i.file_url} target="_blank">
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className="clickableIcon"
                        />
                      </a>
                    ) : (
                      <FontAwesomeIcon icon={faArrowRight} />
                    )}
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
