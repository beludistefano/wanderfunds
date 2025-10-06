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
      const tripMembersData = await fetch(
        `https://wanderfunds-backend.onrender.com/api/userroles?tripId=${tripid}`
      );
      const tripMembersJson = await tripMembersData.json();

      console.log(tripMembersJson);

      setTripMembers(tripMembersJson);
      setLoading(false);
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
              <TripHeader
                destination={tripMembers[0].destination}
                status={tripMembers[0].status}
              />
              <TripMenu tripID={tripid} />
              <MembersTrip trip={tripMembers} />
            </div>
          </div>{" "}
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
