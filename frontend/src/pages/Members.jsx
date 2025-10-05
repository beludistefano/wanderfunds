import { useParams } from "react-router-dom";
import Header from "../components/header";
import MainSideBar from "../components/MainSideBar";
import TripHeader from "../components/TripHeader";
import TripMenu from "../components/TripMenu";
import "../css/tripdash.css";
import MembersTrip from "./Trip/MembersTrip";
import { useEffect, useState } from "react";

export default function Members() {
  const { tripid } = useParams();
  const [tripMembers, setTripMembers] = useState();
  const [loading, setLoading] = useState(true);

  async function getTripMembers() {
    try {
      const tripMembersData = await fetch();
      // "https://wanderfunds-backend.onrender.com/api/trip/" + tripid
      const tripMembersJson = await tripMembersData.json();

      setTrip(tripMembersJson[0]);
      setLoading(false);

      console.log(tripMembersJson[0]);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    getTripMembers();
  }, []);

  return (
    <div>
      {!loading ? (
        <>
          <Header></Header>
          <div id="mainContent">
            <MainSideBar id="mainSideBar" />
            <div id="dashboardCenterSection">
              <TripHeader destination={trip.destination} status={trip.status} />
              <TripMenu tripID={tripid} />
              <MembersTrip trip={trip} />
            </div>
          </div>{" "}
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
