import { useState, useEffect } from "react";
import "../css/components/expensemodal.css";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthProvider";

function validateEmail(email) {
  const expenseErrors = {};

  if (email == "") {
    expenseErrors.email = "Email cannot be empty";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim())) {
    expenseErrors.email = "Please enter a valid email address";
  }

  return expenseErrors;
}

export default function InviteMember({ isOpen, onCancel, memberType, tripID }) {
  const [memberEmail, setMemberEmail] = useState("");
  const [type, setType] = useState(memberType);
  const [tripId, setTripId] = useState(tripID);
  const [inviteStatus, setInviteStatus] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setMemberEmail(null);
      setValidationErrors({});
      setInviteStatus(null);
    }
  }, [isOpen]);

  if (isOpen == false) {
    return null;
  }

  async function inviteMember() {
    setValidationErrors({});

    const emailValidation = validateEmail(memberEmail);
    setValidationErrors(emailValidation);

    if (Object.keys(emailValidation).length != 0) {
      return;
    }

    const newMember = {};
    newMember["tripID"] = tripId;
    newMember["destinationEmail"] = memberEmail;
    newMember["memberType"] = type;

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        return;
      }

      const memberInvite = await fetch(
        "https://wanderfunds-backend.onrender.com/api/addmember",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newMember),
        }
      );

      if (memberInvite.ok) {
        setInviteStatus("success");
      } else {
        setInviteStatus("fail");
      }

      setTimeout(() => onCancel(), 1000);
    } catch (e) {
      console.log("There was an error" + e);
      setInviteStatus("fail");
      setTimeout(() => onCancel(), 1000);
    }
  }

  return (
    <div id="modalConfirm">
      <div id="modalConfirmCard">
        <h4>Invite {memberType}</h4>
        {inviteStatus == null ? (
          <>
            <div id="addExpenseForm">
              <div className="expenseRow">
                <label for="expenseName" className="expenseLabel">
                  Email:
                </label>
                <input
                  id="expenseName"
                  type="email"
                  className={`expenseInput ${
                    validationErrors.email ? "borderRed" : ""
                  }`}
                  placeholder="Member email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                />
                {validationErrors.email && (
                  <p
                    className="errorDisplayText"
                    style={{ gridColumn: "1 / -1", margin: 0 }}
                  >
                    {validationErrors.email}
                  </p>
                )}
              </div>
            </div>
            <div id="modalConfirmOptions">
              <button
                onClick={onCancel}
                className="confirmButtons buttonConfirmCancel"
              >
                Cancel
              </button>
              <button
                onClick={inviteMember}
                className="confirmButtons buttonConfirmOk"
              >
                Invite
              </button>
            </div>
          </>
        ) : inviteStatus === "success" ? (
          <>
            <p className="greenText">Invitation sent succesfully!</p>
          </>
        ) : (
          <>
            <p className="redText">There was an error inviting new member</p>
          </>
        )}
      </div>
    </div>
  );
}
