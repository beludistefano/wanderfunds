import "../css/components/expensemodal.css";

export default function AddExpense({
  isOpen,
  onAdd,
  onCancel,
  members,
  tripSplit,
}) {
  if (isOpen == false) {
    return null;
  }

  return (
    <div id="modalConfirm">
      <div id="modalConfirmCard">
        <h4>Add Expected Expense</h4>
        <div id="addExpenseForm">
          <div className="expenseRow">
            <label for="expenseName" className="expenseLabel">
              Name:
            </label>
            <input
              id="expenseName"
              type="text"
              className="expenseInput"
              placeholder="Expense name"
            />
          </div>
          <div className="expenseRow">
            <label for="expenseAmount" className="expenseLabel">
              Amount:
            </label>
            <input
              id="expenseAmount"
              type="number"
              step="0.01"
              className="expenseInput"
            />
          </div>
          {members > 1 ? (
            <div className="expenseRow">
              <label for="expenseSplit" className="expenseLabel">
                Split:
              </label>
              <select id="expenseSplit" className="expenseInput">
                {tripSplit == "own" ? (
                  <>
                    <option>Trip Default</option>
                    <option>Shared Expense</option>
                  </>
                ) : (
                  <>
                    <option>Trip Default</option>
                    <option>Own Expense</option>
                  </>
                )}
              </select>
            </div>
          ) : null}
          <div className="expenseRow">
            <label for="expenseDate" className="expenseLabel">
              Date:
            </label>
            <input id="expenseDate" className="expenseInput" type="date" />
          </div>
        </div>
        <div id="modalConfirmOptions">
          <button
            onClick={onCancel}
            className="confirmButtons buttonConfirmCancel"
          >
            Cancel
          </button>
          <button onClick={onAdd} className="confirmButtons buttonConfirmOk">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
