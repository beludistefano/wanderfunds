import "../css/components/confirm.css";

export default function Confirm({
  text,
  options,
  isOpen,
  onConfirmNo,
  onConfirmOk,
}) {
  if (isOpen == false) {
    return null;
  }

  return (
    <div id="modalConfirm">
      <div id="modalConfirmCard">
        <div id="modalConfirmText">
          <p>{text}</p>
        </div>
        <div id="modalConfirmOptions">
          <button
            onClick={onConfirmOk}
            className="confirmButtons buttonConfirmCancel"
          >
            {options.ok}
          </button>
          <button
            onClick={onConfirmNo}
            className="confirmButtons buttonConfirmOk"
          >
            {options.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
