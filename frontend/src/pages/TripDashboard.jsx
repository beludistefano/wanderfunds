import Header from "../components/header";
import MainSideBar from "../components/MainSideBar";
import TripHeader from "../components/TripHeader";
import TripMenu from "../components/TripMenu";
import "../css/tripdash.css";
import EditTrip from "./Trip/EditTrip";

export default function TripDashboard() {
  var tripID = "6a5f7a6b-b7f6-4d29-ab5e-d2dade687000";

  const dummyTrip = {
    destination: "Aruba",
    description: "bla bla",
    status: "Planning",
    fromDate: "2025-09-25",
    toDate: "2025-09-27",
    default_split: 0.5,
    auto_add: false,
    tripid: "5b4360a5-6262-4f04-bbad-2b19c35b9d59",
  };

  return (
    <div>
      <Header></Header>
      <div id="mainContent">
        <MainSideBar id="mainSideBar" />
        <div id="dashboardCenterSection">
          <TripHeader destination={"Aruba"} status={"Confirmed"} />
          <TripMenu tripID={tripID} />
          <EditTrip trip={dummyTrip} />
        </div>
      </div>
    </div>
  );
}
