import { faUser, faX } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../css/members.css";
import InviteMember from "../../components/InviteMember";

export default function MembersTrip({ tripMembers, role, tripID }) {
  const [tripMembersData, setTripMembersData] = useState(tripMembers);
  const [userRole, setUserRole] = useState(role);
  const [tripId, setTripId] = useState(tripID);

  const [inviteGuestOpen, setInviteGuestOpen] = useState(false);
  const [inviteParticipantOpen, setInviteParticipantOpen] = useState(false);

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
                {userRole === "Owner" && (
                  <div className="removeRow">
                    <FontAwesomeIcon icon={faX} /> Remove
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div id="memberButtonsContainer">
          {(userRole === "Owner" || userRole === "Participant") && (
            <>
              <button
                id="buttonSave"
                onClick={() => setInviteGuestOpen(true)}
                className="button"
              >
                ADD GUEST
              </button>
              <button
                id="buttonSave"
                onClick={() => setInviteParticipantOpen(true)}
                className="button"
              >
                ADD PARTICIPANT
              </button>
            </>
          )}
          {(userRole === "Guest" || userRole === "Participant") && (
            <button
              onClick={() => {
                navigate(`/trip/${trip.tripid}`);
              }}
              id="buttonLeave"
              className="button"
            >
              LEAVE TRIP
            </button>
          )}
          {userRole === "Owner" && (
            <button
              onClick={() => {
                navigate(`/trip/${trip.tripid}`);
              }}
              id="buttonLeave"
              className="button"
            >
              DELETE TRIP
            </button>
          )}
        </div>
      </div>
      {inviteParticipantOpen && (
        <InviteMember
          isOpen={inviteParticipantOpen}
          onCancel={() => setInviteParticipantOpen(false)}
          memberType="participant"
          tripID={tripId}
        />
      )}
      {inviteGuestOpen && (
        <InviteMember
          isOpen={inviteGuestOpen}
          onCancel={() => setInviteGuestOpen(false)}
          memberType="guest"
          tripID={tripId}
        />
      )}
    </>
  );
}
