import "../css/components/tripheader.css";
import bgImg from "../assets/backgroundplaceholder.png";
import nycImf from "../assets/nycSample.jpg";

export default function TripHeader({ status, destination }) {
  return (
    <div
      id="tripHeaderContainer"
      style={{ backgroundImage: `url(${nycImf})`, backgroundSize: "cover" }}
    >
      <div id="tripStatusContainer">
        <div className={`statusContainer status${status.replaceAll(" ", "")}`}>
          <p>{status}</p>
        </div>
      </div>
      <div id="destinationContainerParent">
        <div id="destinationContainer">
          <p className="destinationText">{destination}</p>
        </div>
      </div>
    </div>
  );
}
