import { faUser, faX } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../css/members.css";

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
              <div className="memberDiv" key={member.userroleid}>
                <FontAwesomeIcon className="fa-icon" icon={faUser} />
                <div className="memberName">{member.name}</div>
                <div className="memberRole">{"(" + member.role + ")"}</div>
                <div className="removeRow">
                  <FontAwesomeIcon icon={faX} /> Remove
                </div>
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
            id="buttonLeave"
            className="button"
          >
            LEAVE TRIP
          </button>
          <button
            onClick={() => {
              navigate(`/trip/${trip.tripid}`);
            }}
            id="buttonLeave"
            className="button"
          >
            DELETE TRIP
          </button>
        </div>
      </div>
    </>
  );
}
