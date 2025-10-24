import { useParams } from "react-router-dom";
import Header from "../components/header";
import { useEffect, useState } from "react";

export default function AcceptInvitation() {
  const { invitationid } = useParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  async function acceptInvitation() {
    try {
      const acceptData = await fetch(
        `https://wanderfunds-backend.onrender.com/api/acceptinvitation?invitation_token=${invitationid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const acceptJson = await acceptData.json();

      if (!acceptData.ok) {
        setLoading(false);
        setResult("Error accepting trip!");
        return;
      }

      const userRoleValues = {};
      userRoleValues["tripID"] = acceptJson.tripID;
      userRoleValues["member_type"] = acceptJson.memberType;

      const createUserRole = await fetch(
        "https://wanderfunds-backend.onrender.com/api/user-role",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userRoleValues),
        }
      );

      if (!createUserRole.ok) {
        setLoading(false);
        setResult("Error creating user role!");
        return;
      }

      if (acceptJson.memberType == "Participant") {
        const savingsFundValues = {};
        savingsFundValues["tripID"] = acceptJson.tripID;

        const createSavingsFund = await fetch(
          "https://wanderfunds-backend.onrender.com/api/new-savings-fund",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(savingsFundValues),
          }
        );

        if (!createSavingsFund.ok) {
          setLoading(false);
          setResult("Error creating savings fund!");
          return;
        }
      }

      setLoading(false);
      setResult("The trip has been added to your trips!");
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div>
      <Header></Header>
      <div id="mainContentAcceptInvitation">
        <h2>Are you ready for take-off? ✈️</h2>
        <p>Click the button below to accept the invitation</p>
        <button className="button buttonOK" onClick={acceptInvitation}>
          Accept Invitation
        </button>
      </div>
    </div>
  );
}
