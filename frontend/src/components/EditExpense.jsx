import { useState, useEffect } from "react";
import "../css/components/expensemodal.css";

const formatDate = (dateString) => {
  return dateString ? dateString.split("T")[0] : "";
};

export default function EditExpense({
  isOpen,
  onUpdate,
  onCancel,
  members,
  tripSplit,
  expense,
}) {
  const [expenseID, setExpenseID] = useState(expense.expense_id);
  const [expenseName, setExpenseName] = useState(expense.name);
  const [expenseAmount, setExpenseAmount] = useState(expense.amount);
  const [expenseSplit, setExpenseSplit] = useState(null);
  const [expenseDate, setExpenseDate] = useState(
    formatDate(expense.expected_date)
  );
  const [expenseUpdateStatus, setExpenseUpdateStatus] = useState(null);

  useEffect(() => {
    if (expense.split == "own") {
      if (tripSplit == "equal") {
        setExpenseSplit("Own Expense");
      } else {
        setExpenseSplit("Trip Default - Own");
      }
    } else if (expense.split == "share") {
      if (tripSplit == "equal") {
        setExpenseSplit("Trip Default - Shared");
      } else {
        setExpenseSplit("Own Expense");
      }
    }
    if (!isOpen) {
      setExpenseUpdateStatus(null);
    }
  }, [isOpen]);

  if (isOpen == false) {
    return null;
  }

  async function updateExpense() {
    if (expenseName == "") {
      console.log("Expense name must be included");
      return;
    }
    if (expenseAmount == 0) {
      console.log("Expense amount must be included");
      return;
    } else if (expenseAmount < 0) {
      console.log("Expense amount must be over 0");
      return;
    }

    const updateExpense = {};
    updateExpense["expenseID"] = expenseID;
    updateExpense["name"] = expenseName;
    updateExpense["amount"] = Number(expenseAmount);
    updateExpense["expectedDate"] = expenseDate ? expenseDate : null;

    if (
      expenseSplit == "Shared Expense" ||
      expenseSplit == "Trip Default - Shared" ||
      expenseSplit == "shared"
    ) {
      updateExpense["split"] = "shared";
    } else if (
      expenseSplit == "Own Expense" ||
      expenseSplit == "Trip Default - Own" ||
      expenseSplit == "own"
    ) {
      updateExpense["split"] = "own";
    }

    console.log(updateExpense);

    try {
      const expenseUpdate = await fetch(
        "https://wanderfunds-backend.onrender.com/api/expenses",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateExpense),
        }
      );

      console.log(await expenseUpdate.json());

      if (expenseUpdate.ok) {
        setExpenseUpdateStatus("success");
        onUpdate();
      } else {
        setExpenseUpdateStatus("fail");
      }

      setTimeout(() => onCancel(), 800);
    } catch (e) {
      console.log("There was an error" + e);
      setExpenseUpdateStatus("fail");
      setTimeout(() => onCancel(), 800);
    }
  }

  return (
    <div id="modalConfirm">
      <div id="modalConfirmCard">
        <h4>Edit Expense</h4>
        {expenseUpdateStatus == null ? (
          <>
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
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
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
                  min="0.01"
                  className="expenseInput"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                />
              </div>
              {members > 1 ? (
                <div className="expenseRow">
                  <label for="expenseSplit" className="expenseLabel">
                    Split:
                  </label>
                  <select
                    id="expenseSplit"
                    className="expenseInput"
                    value={expenseSplit}
                    onChange={(e) => setExpenseSplit(e.target.value)}
                  >
                    {tripSplit == "own" ? (
                      <>
                        <option>Trip Default - Own</option>
                        <option>Shared Expense</option>
                      </>
                    ) : (
                      <>
                        <option>Trip Default - Shared</option>
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
                <input
                  id="expenseDate"
                  className="expenseInput"
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
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
                onClick={updateExpense}
                className="confirmButtons buttonConfirmOk"
              >
                Update
              </button>
            </div>
          </>
        ) : expenseUpdateStatus === "success" ? (
          <>
            <p className="greenText">Expense updated succesfully!</p>
          </>
        ) : (
          <>
            <p className="redText">There was an error updating your expense</p>
          </>
        )}
      </div>
    </div>
  );
}
