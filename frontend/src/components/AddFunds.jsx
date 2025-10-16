import { useState, useEffect } from "react";
import "../css/components/fundsmodal.css";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthProvider";

function validateFunds(amount) {
  const fundsErrors = {};

  if (amount <= 0) {
    fundsErrors.amount = "Added funds must be over 0";
  }

  return fundsErrors;
}

export default function AddFunds({
  isOpen,
  onConfirm,
  onCancel,
  currentSavingsAmount,
  savingsFundID,
}) {
  const [currentAmount, setCurrentAmount] = useState(currentSavingsAmount);
  const [addedAmount, setAddedAmount] = useState(0);
  const [updateFundsStatus, setUpdateFundsStatus] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setAddedAmount(0);
      setCurrentAmount(currentAmount);
      setValidationErrors({});
    }
  }, [isOpen]);

  if (isOpen == false) {
    return null;
  }

  async function addFunds() {
    setValidationErrors({});

    const fundsValidation = validateFunds(addedAmount);
    setValidationErrors(fundsValidation);

    if (Object.keys(fundsValidation).length != 0) {
      return;
    }

    const newSavingsFund = {};
    newSavingsFund["savingsFundID"] = savingsFundID;
    newSavingsFund["amount"] = Number(currentAmount);
    newSavingsFund["newAmount"] = Number(addedAmount);

    console.log(newSavingsFund);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        return;
      }

      const savingsFundUpdate = await fetch(
        "https://wanderfunds-backend.onrender.com/api/trip/savings",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newSavingsFund),
        }
      );

      if (savingsFundUpdate.ok) {
        setUpdateFundsStatus("success");
        onConfirm();
      } else {
        setUpdateFundsStatus("fail");
      }

      setTimeout(() => onCancel(), 800);
    } catch (e) {
      console.log("There was an error" + e);
      setExpenseAddStatus("fail");
      setTimeout(() => onCancel(), 800);
    }
  }

  return (
    <div id="modalConfirm">
      <div id="modalConfirmCard">
        <h4>Add Funds</h4>
        {updateFundsStatus == null ? (
          <>
            <div id="addRemoveFundsForm">
              <div className="fundsRow">
                <label for="fundsName" className="fundsLabel">
                  Amount:
                </label>
                <input
                  id="fundsAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={`fundsInput ${
                    validationErrors.amount ? "borderRed" : ""
                  }`}
                  value={addedAmount}
                  onChange={(e) => setAddedAmount(e.target.value)}
                />
                {validationErrors.amount && (
                  <p
                    className="errorDisplayText"
                    style={{ gridColumn: "1 / -1", margin: 0 }}
                  >
                    {validationErrors.amount}
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
                onClick={addFunds}
                className="confirmButtons buttonConfirmOk"
              >
                Confirm
              </button>
            </div>
          </>
        ) : updateFundsStatus === "success" ? (
          <>
            <p className="greenText">You're one step closer!</p>
          </>
        ) : (
          <>
            <p className="redText">There was an error adding funds</p>
          </>
        )}
      </div>
    </div>
  );
}
