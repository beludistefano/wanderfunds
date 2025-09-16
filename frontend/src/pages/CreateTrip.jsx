import { Link } from "react-router-dom"

import "../css/main.css"

import MainSideBar from "../components/MainSideBar"
import Header from "../components/header";
import TripCard from "../components/tripCard";

export default function CreateTrip() {

  return (
    <div>
      <Header></Header>
      <div id="mainContent">
        <MainSideBar id="mainSideBar" />
        <div id="centerSection">
          bla bla
        </div>
      </div>
    </div>
  );
}