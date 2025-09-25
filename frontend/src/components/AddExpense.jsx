import { useState, useEffect } from "react";
import "../css/components/expensemodal.css";

export default function AddExpense({
  isOpen,
  onAdd,
  onCancel,
  members,
  tripSplit,
  tripID,
  userID,
}) {
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [expenseSplit, setExpenseSplit] = useState(tripSplit);
  const [expenseDate, setExpenseDate] = useState();
  const [expenseAddStatus, setExpenseAddStatus] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setExpenseAddStatus(null);
      setExpenseName("");
      setExpenseAmount(0);
      setExpenseDate();
      setExpenseSplit(tripSplit);
    }
  }, [isOpen]);

  if (isOpen == false) {
    return null;
  }

  async function addExpense() {
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

    const newExpense = {};
    newExpense["tripID"] = tripID;
    newExpense["ownerID"] = userID;
    newExpense["name"] = expenseName;
    newExpense["amount"] = Number(expenseAmount);
    newExpense["expectedDate"] = expenseDate ? expenseDate : null;
    newExpense["expenseStatus"] = "pending";

    if (
      expenseSplit == "Shared Expense" ||
      expenseSplit == "Trip Default - Shared" ||
      expenseSplit == "shared"
    ) {
      newExpense["split"] = "shared";
    } else if (
      expenseSplit == "Own Expense" ||
      expenseSplit == "Trip Default - Own" ||
      expenseSplit == "own"
    ) {
      newExpense["split"] = "own";
    }

    console.log(newExpense);

    try {
      const expenseCreation = await fetch(
        "http://localhost:3000/api/expenses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newExpense),
        }
      );

      if (expenseCreation.ok) {
        setExpenseAddStatus("success");
        onAdd();
      } else {
        setExpenseAddStatus("fail");
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
        <h4>Add Expected Expense</h4>
        {expenseAddStatus == null ? (
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
                onClick={addExpense}
                className="confirmButtons buttonConfirmOk"
              >
                Add
              </button>
            </div>
          </>
        ) : expenseAddStatus === "success" ? (
          <>
            <p className="greenText">Expense added succesfully!</p>
          </>
        ) : (
          <>
            <p className="redText">There was an error adding your expense</p>
          </>
        )}
      </div>
    </div>
  );
}
