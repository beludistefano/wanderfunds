import { useState, useEffect } from "react";
import "../css/components/expensemodal.css";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthProvider";

const formatDate = (dateString) => {
  return dateString ? dateString.split("T")[0] : "";
};

function validateExpense(name, amount) {
  const expenseErrors = {};

  if (name == "") {
    expenseErrors.name = "Expense name must be included";
  }
  if (amount <= 0) {
    expenseErrors.amount = "Expense amount must be included and over 0";
  }

  return expenseErrors;
}

export default function EditExpense({
  isOpen,
  onUpdate,
  onCancel,
  members,
  tripSplit,
  expense,
  tripRole,
  autoadd,
}) {
  const [expenseID, setExpenseID] = useState(expense.expense_id);
  const [expenseName, setExpenseName] = useState(expense.name);
  const [expenseAmount, setExpenseAmount] = useState(expense.amount);
  const [expenseSplit, setExpenseSplit] = useState(expense.split);
  const [expenseDate, setExpenseDate] = useState(
    formatDate(expense.expected_date)
  );
  const [expenseUpdateStatus, setExpenseUpdateStatus] = useState(null);
  const [deleteExpenseStatus, setDeleteExpenseStatus] = useState(null);
  const [expenseConf, setExpenseConf] = useState(expense.confirmed);
  const [role, setRole] = useState(tripRole);
  const [autoAdd, setAutoAdd] = useState(autoadd);

  const [validationErrors, setValidationErrors] = useState({});

  console.log(expense);

  useEffect(() => {
    setValidationErrors({});
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

  async function deleteExpense() {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        return;
      }

      const deleteExpenseData = {
        expenseID: expenseID,
      };

      const expenseDeletion = await fetch(
        "https://wanderfunds-backend.onrender.com/api/delete-expense",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(deleteExpenseData),
        }
      );

      console.log(await expenseDeletion.json());

      if (expenseDeletion.ok) {
        setDeleteExpenseStatus("success");
        onUpdate();
      } else {
        setDeleteExpenseStatus("fail");
      }

      setTimeout(() => onCancel(), 1000);
    } catch (e) {
      console.log("There was an error" + e);
      setDeleteExpenseStatus("fail");
      setTimeout(() => onCancel(), 1000);
    }
  }

  async function updateExpense() {
    setValidationErrors({});

    const expenseValidation = validateExpense(expenseName, expenseAmount);
    setValidationErrors(expenseValidation);

    if (Object.keys(expenseValidation).length != 0) {
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
      expenseSplit == "shared" ||
      expenseSplit == "equal"
    ) {
      updateExpense["split"] = "shared";
    } else if (
      expenseSplit == "Own Expense" ||
      expenseSplit == "Trip Default - Own" ||
      expenseSplit == "own"
    ) {
      updateExpense["split"] = "own";
    }

    if (autoAdd == true) {
      updateExpense["expenseStatus"] = "accepted";
    } else {
      if (updateExpense["split"] == "own" || role == "Owner") {
        updateExpense["expenseStatus"] = "accepted";
      } else {
        updateExpense["expenseStatus"] = "pending";
      }
    }

    updateExpense["role"] = role;

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        return;
      }

      const expenseUpdate = await fetch(
        "https://wanderfunds-backend.onrender.com/api/expenses",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
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
        {expenseUpdateStatus == null && deleteExpenseStatus == null ? (
          <>
            <div id="addExpenseForm">
              <div className="expenseRow">
                <label for="expenseName" className="expenseLabel">
                  Name:
                </label>
                <input
                  id="expenseName"
                  type="text"
                  className={`expenseInput ${
                    validationErrors.name ? "borderRed" : ""
                  }`}
                  placeholder="Expense name"
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                />
                {validationErrors.name && (
                  <p
                    className="errorDisplayText"
                    style={{ gridColumn: "1 / -1", margin: 0 }}
                  >
                    {validationErrors.name}
                  </p>
                )}
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
                  className={`expenseInput ${
                    validationErrors.amount ? "borderRed" : ""
                  }`}
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
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
            <div>
              <div id="modalConfirmOptions">
                <button
                  onClick={onCancel}
                  id="cancelGreyButton"
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
              {expenseConf != true && (
                <div>
                  <button
                    onClick={deleteExpense}
                    className="confirmButtons buttonConfirmCancel"
                  >
                    DELETE
                  </button>
                </div>
              )}
            </div>
          </>
        ) : expenseUpdateStatus === "success" ? (
          <>
            <p className="greenText">Expense updated successfully!</p>
          </>
        ) : deleteExpenseStatus === "success" ? (
          <>
            <p className="greenText">Expense deleted successfully!</p>
          </>
        ) : deleteExpenseStatus === "error" ? (
          <>
            <p className="redText">There was an error deleting your expense</p>
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
