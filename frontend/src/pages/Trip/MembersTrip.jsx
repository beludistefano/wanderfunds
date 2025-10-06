import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function MembersTrip({ tripMembers }) {
  const [tripMembersData, setTripMembersData] = useState(tripMembers);

  return (
    <>
      <div
        id="containerEditTop"
        style={{ paddingRight: "2%", paddingLeft: "2%" }}
      >
        <div
          id="ownerContainerContainer"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingTop: "10px",
          }}
        >
          <div className="ownerContainer">
            <p>OWNER</p>
          </div>
        </div>
        <h2 id="editTitle" style={{ textAlign: "left" }}>
          MEMBERS
        </h2>
      </div>
      <div id="tripMembersContainer">
        <div id="tripData">
          {tripMembersData.map((member) => {
            return (
              <div className="memberRow">
                <div className="memberName">
                  <FontAwesomeIcon icon={faUser} />
                  {member.name}
                </div>
                <div className="memberName">({member.role})</div>
              </div>
            );
          })}
        </div>
        <div id="memberButtonsContainer">
          <button id="buttonSave" className="button">
            ADD GUEST
          </button>
          <button id="buttonSave" className="button">
            ADD PARTICIPANT
          </button>
          <button
            onClick={() => {
              navigate(`/trip/${trip.tripid}`);
            }}
            id="buttonDelete"
            className="button"
          >
            DELETE TRIP
          </button>
        </div>
      </div>
    </>
  );
}
