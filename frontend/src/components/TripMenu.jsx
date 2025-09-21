import "../css/components/tripmenu.css";
import { Link } from "react-router-dom";

export default function TripMenu({ tripID }) {
  return (
    <div id="tripMenuContainer">
      <ul id="tripMenuList">
        <li>
          <Link className="tripMenuLinks" to={"/trip/" + tripID}>
            Overview
          </Link>
        </li>
        <li>
          <Link className="tripMenuLinks" to={"/trip/edit/" + tripID}>
            Edit Trip
          </Link>
        </li>
        <li>
          <Link className="tripMenuLinks" to={"/trip/expenses/" + tripID}>
            Expense Log
          </Link>
        </li>
        <li>
          <Link className="tripMenuLinks" to={"/trip/itinerary/" + tripID}>
            Itinerary
          </Link>
        </li>
        <li>
          <Link className="tripMenuLinks" to={"/trip/members/" + tripID}>
            Members
          </Link>
        </li>
      </ul>
    </div>
  );
}
