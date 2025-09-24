import "../css/components/expensemodal.css";

export default function AddRemoveFunds({
  isOpen,
  onConfirm,
  onCancel,
  action,
}) {
  if (isOpen == false) {
    return null;
  }

  return <></>;
}
