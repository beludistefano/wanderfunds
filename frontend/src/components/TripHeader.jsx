import "../css/components/tripheader.css";
import bgImg from "../assets/backgroundPlaceholder.jpg";
import { useState } from "react";

export default function TripHeader({ status, destination, url }) {
  const [headerURL, setHeaderURL] = useState(url);

  return (
    <div
      id="tripHeaderContainer"
      style={{
        backgroundImage: `url(${headerURL ? headerURL : bgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
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
