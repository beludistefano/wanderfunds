import { Link } from "react-router-dom"

import "../css/main.css"

import MainSideBar from "../components/MainSideBar"
import Header from "../components/header";
import TripCard from "../components/tripCard";

export default function Main() {

  return (
    <div>
      <Header></Header>
      <div id="mainContent">
        <MainSideBar id="mainSideBar" />
        <div id="centerSection">
          <div id="buttonContainer">
          <button className="mainButton" ><Link className="mainButtonText">NEW TRIP</Link></button>
          </div>
        <div id="cardContainer">
          <TripCard className="tripCard" trip={{ tripID: "ABC", destination: "Aruba", from_date: "Nov 12", to_date: "Nov 25", status: "Confirmed" }} />
          <TripCard className="tripCard" trip={{ tripID: "ABC", destination: "Aruba", from_date: "Nov 12", to_date: "Nov 25", status: "Confirmed" }} />
          <TripCard className="tripCard" trip={{ tripID: "ABC", destination: "Aruba", from_date: "Nov 12", to_date: "Nov 25", status: "Confirmed" }} />
        </div>
        </div>
      </div>
    </div>
  );
}