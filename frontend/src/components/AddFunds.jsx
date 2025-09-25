import { useState, useEffect } from "react";
import "../css/components/fundsmodal.css";

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

  useEffect(() => {
    if (!isOpen) {
      setAddedAmount(0);
      setCurrentAmount(currentAmount);
    }
  }, [isOpen]);

  if (isOpen == false) {
    return null;
  }

  async function addFunds() {
    if (addedAmount == 0) {
      console.log("Added funds must be over 0");
    }

    if (addedAmount < 0) {
      console.log("To withdraw funds use the withdraw funds function");
    }

    console.log(currentAmount);

    const newSavingsFund = {};
    newSavingsFund["savingsFundID"] = savingsFundID;
    newSavingsFund["amount"] = Number(currentAmount);
    newSavingsFund["newAmount"] = Number(addedAmount);

    console.log(newSavingsFund);

    try {
      const savingsFundUpdate = await fetch(
        "https://wanderfunds-backend.onrender.com/api/trip/savings",
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
                  className="fundsInput"
                  value={addedAmount}
                  onChange={(e) => setAddedAmount(e.target.value)}
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
