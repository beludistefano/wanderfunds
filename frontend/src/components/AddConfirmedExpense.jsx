import { useState, useEffect } from "react";
import "../css/components/expensemodal.css";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthProvider";

function validateExpense(name, amount, date) {
  const expenseErrors = {};

  if (name == "") {
    expenseErrors.name = "Expense name must be included";
  }
  if (amount <= 0) {
    expenseErrors.amount = "Expense amount must be included and over 0";
  }
  if (date == "" || date == null) {
    expenseErrors.confDate = "You must include a confirmation date";
  }

  return expenseErrors;
}

export default function AddConfirmedExpense({
  isOpen,
  onAdd,
  onCancel,
  members,
  tripSplit,
  tripID,
  tripRole,
}) {
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [expenseSplit, setExpenseSplit] = useState(tripSplit);
  const [expenseDate, setExpenseDate] = useState();
  const [expenseAddStatus, setExpenseAddStatus] = useState(null);
  const [tripMembers, setTripMembers] = useState(members);
  const [expenseConfDate, setExpenseConfDate] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [role, setRole] = useState(tripRole);

  useEffect(() => {
    if (!isOpen) {
      setExpenseAddStatus(null);
      setExpenseName("");
      setExpenseAmount(0);
      setExpenseDate();
      setExpenseSplit(tripSplit);
      setExpenseConfDate(null);
      setValidationErrors({});
      console.log(tripSplit);
    }
  }, [isOpen]);

  if (isOpen == false) {
    return null;
  }

  async function addExpense() {
    setValidationErrors({});

    const expenseValidation = validateExpense(
      expenseName,
      expenseAmount,
      expenseConfDate
    );
    setValidationErrors(expenseValidation);

    if (Object.keys(expenseValidation).length != 0) {
      return;
    }

    const newExpense = {};
    newExpense["tripID"] = tripID;
    newExpense["name"] = expenseName;
    newExpense["amount"] = Number(expenseAmount);
    newExpense["expectedDate"] = expenseDate ? expenseDate : null;
    newExpense["members"] = tripMembers;

    if (
      expenseSplit == "Shared Expense" ||
      expenseSplit == "Trip Default - Shared" ||
      expenseSplit == "equal" ||
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

    newExpense["expenseStatus"] = "accepted";
    newExpense["confirmedDate"] = expenseConfDate;

    console.log(newExpense);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        return;
      }

      const expenseCreation = await fetch(
        "https://wanderfunds-backend.onrender.com/api/confirmed-expenses",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
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
        <h4>Add Confirmed Expense</h4>
        {expenseAddStatus == null ? (
          <>
            <div id="addExpenseForm">
              <div className="expenseRow">
                <label htmlFor="expenseName" className="expenseLabel">
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
                <label htmlFor="expenseAmount" className="expenseLabel">
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
                  <label htmlFor="expenseSplit" className="expenseLabel">
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
                <label htmlFor="expenseDate" className="expenseLabel">
                  Expense Date:
                </label>
                <input
                  id="expenseDate"
                  className="expenseInput"
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                />
              </div>
              <div className="expenseRow">
                <label htmlFor="expenseDate" className="expenseLabel">
                  Confirmation Date:
                </label>
                <input
                  id="confirmationDate"
                  className={`expenseInput ${
                    validationErrors.amount ? "borderRed" : ""
                  }`}
                  type="date"
                  value={expenseConfDate}
                  onChange={(e) => setExpenseConfDate(e.target.value)}
                />
                {validationErrors.confDate && (
                  <p
                    className="errorDisplayText"
                    style={{ gridColumn: "1 / -1", margin: 0 }}
                  >
                    {validationErrors.confDate}
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
