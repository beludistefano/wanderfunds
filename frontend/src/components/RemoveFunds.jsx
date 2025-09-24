import "../css/components/fundsmodal.css";

export default function RemoveFunds({ isOpen, onConfirm, onCancel }) {
  if (isOpen == false) {
    return null;
  }

  return (
    <div id="modalConfirm">
      <div id="modalConfirmCard">
        <h4>Withdraw Funds</h4>

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
            onClick={onConfirm}
            className="confirmButtons buttonConfirmOk"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
