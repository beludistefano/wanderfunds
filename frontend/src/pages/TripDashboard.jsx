import Header from "../components/header";
import MainSideBar from "../components/MainSideBar";
import TripHeader from "../components/TripHeader";
import TripMenu from "../components/TripMenu";
import "../css/tripdash.css";

export default function TripDashboard() {
  var tripID = "6a5f7a6b-b7f6-4d29-ab5e-d2dade687000";

  return (
    <div>
      <Header></Header>
      <div id="mainContent">
        <MainSideBar id="mainSideBar" />
        <div id="dashboardCenterSection">
          <TripHeader destination={"Aruba"} status={"Confirmed"} />
          <TripMenu tripID={tripID} />
        </div>
      </div>
    </div>
  );
}
