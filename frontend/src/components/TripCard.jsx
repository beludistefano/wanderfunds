import { Link } from "react-router-dom";
import "../css/components/tripcard.css";

export default function TripCard({ trip }) {
  const { tripID, destination, from_date, to_date, status } = trip;

  const from_date_raw = new Date(from_date);
  const formattedFrom = from_date_raw.toLocaleDateString();

  const to_date_raw = new Date(to_date);
  const formattedTo = to_date_raw.toLocaleDateString();

  return (
    <div className="mainCardContainer">
      <Link className="linkCard">
        <div className="tripCard">
          <div className="tripPictureContainer">
            <img
              className="tripBackgroundImage"
              src="./src/assets/backgroundplaceholder.png"
              alt="tripPicture"
            />
          </div>
          <div className="tripDataContainer">
            <p className="textMain">{destination}</p>
            <p className="textSecondary">
              {formattedFrom} - {formattedTo}
            </p>
          </div>
          <div className="tripStatusContainer">
            <div
              className={`statusContainer status${status.replaceAll(" ", "")}`}
            >
              <p>{status}</p>
            </div>
            <div className="tripPeople">
              <p className="textSecondary">2 people</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
