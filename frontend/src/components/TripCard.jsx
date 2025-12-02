import { Link } from "react-router-dom";
import "../css/components/tripcard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import bgPlaceholder from "../assets/backgroundplaceholder.png";

export default function TripCard({ trip }) {
  const { tripID, destination, from_date, to_date, status, members } = trip;

  function normalizeDbDate(value) {
    if (!value) return "";
    return value.slice(0, 10);
  }

  console.log(trip);

  const from_date_normalized = normalizeDbDate(from_date);

  const to_date_normalized = normalizeDbDate(to_date);

  return (
    <div className="mainCardContainer">
      <Link className="linkCard" to={"/trip/" + tripID}>
        <div className="tripCard">
          <div className="tripPictureContainer">
            <img
              className="tripBackgroundImage"
              src={bgPlaceholder}
              alt="tripPicture"
            />
          </div>
          <div className="tripDataContainer">
            <p className="textMain">{destination}</p>
            <p className="textSecondary">
              {from_date_normalized} - {to_date_normalized}
            </p>
            <p className="textSecondary">
              {members} <FontAwesomeIcon icon={faUser} />
            </p>
          </div>
          <div className="tripStatusContainer">
            <div
              className={`statusContainer status${status.replaceAll(" ", "")}`}
            >
              <p>{status}</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
