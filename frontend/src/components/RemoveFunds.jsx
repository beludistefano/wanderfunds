import "../css/components/fundsmodal.css";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    if (!isOpen) {
      setRemovedAmount(0);
      setCurrentAmount(currentAmount);
    }
  }, [isOpen]);

  if (isOpen == false) {
    return null;
  }

  async function removeFunds() {
    if (removedAmount == 0) {
      console.log("Withdrawal funds must be over 0");
    }

    if (removedAmount < 0) {
      console.log("To withdraw funds use the withdraw funds function");
    }

    const newSavingsFund = {};
    newSavingsFund["savingsFundID"] = savingsFundID;
    newSavingsFund["amount"] = Number(currentAmount);
    newSavingsFund["newAmount"] = 0 - Number(removedAmount);

    console.log(newSavingsFund);

    try {
      const savingsFundUpdate = await fetch(
        "http://localhost:3000/api/trip/savings",
        {
          method: "PUT",
          headers: {
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
                  className="fundsInput"
                  value={removedAmount}
                  onChange={(e) => setRemovedAmount(e.target.value)}
                />
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
