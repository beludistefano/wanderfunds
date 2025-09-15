import { Link } from "react-router-dom"
import "../css/tripcard.css"

export default function TripCard({ trip }) {

  const { tripID, destination, from_date, to_date, status } = trip;

  return (
    <div className="mainCardContainer">
    <Link className="linkCard" >
    <div className="tripCard">
        <div className="tripPictureContainer">
            <img className="tripBackgroundImage" src="./src/assets/backgroundplaceholder.png" alt="tripPicture" />
        </div>
        <div className="tripDataContainer">
          <p className="textMain">{destination}</p>
          <p className="textSecondary">{from_date} - {to_date}</p>
        </div>
        <div className="tripStatusContainer">
          <div className={`statusContainer status${status.replaceAll(" ", "")}`}>
            <p>{status}</p>
          </div>
          <div className="tripPeople">
            <p  className="textSecondary">2 people</p>
          </div>
        </div>
    </div>
    </Link>
    </div>
  );
}