import "../css/components/fundsmodal.css";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const { data } = await supabase.auth.getSession();
const token = data.session?.access_token;

function validateFunds(amount) {
  const fundsErrors = {};

  if (amount <= 0) {
    fundsErrors.amount = "Amount must be over 0";
  }

  return fundsErrors;
}

export default function RemoveFunds({
  isOpen,
  onConfirm,
  onCancel,
  currentSavingsAmount,
  savingsFundID,
}) {
  const [currentAmount, setCurrentAmount] = useState(currentSavingsAmount);
  const [removedAmount, setRemovedAmount] = useState(0);
  const [updateFundsStatus, setUpdateFundsStatus] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setRemovedAmount(0);
      setCurrentAmount(currentAmount);
      setValidationErrors({});
    }
  }, [isOpen]);

  if (isOpen == false) {
    return null;
  }

  async function removeFunds() {
    setValidationErrors({});

    const fundsValidation = validateFunds(removedAmount);
    setValidationErrors(fundsValidation);

    if (Object.keys(fundsValidation).length != 0) {
      return;
    }

    const newSavingsFund = {};
    newSavingsFund["savingsFundID"] = savingsFundID;
    newSavingsFund["amount"] = Number(currentAmount);
    newSavingsFund["newAmount"] = 0 - Number(removedAmount);

    console.log(newSavingsFund);

    try {
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
        <h4>Withdraw Funds</h4>
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
                  value={removedAmount}
                  onChange={(e) => setRemovedAmount(e.target.value)}
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
                onClick={removeFunds}
                className="confirmButtons buttonConfirmOk"
              >
                Confirm
              </button>
            </div>
          </>
        ) : updateFundsStatus === "success" ? (
          <>
            <p className="greenText">You shouldn't have done that...</p>
          </>
        ) : (
          <>
            <p className="redText">Withdrawal failed</p>
          </>
        )}
      </div>
    </div>
  );
}
