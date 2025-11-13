import { useState, useEffect } from "react";
import "../css/components/expensemodal.css";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthProvider";

function validateExpense(date) {
  const expenseErrors = {};

  if (date == "") {
    expenseErrors.date = "You must include a date";
  }

  return expenseErrors;
}

export default function ConfirmExpense({
  isOpen,
  onAdd,
  onCancel,
  expenseID,
  tripID,
  amount,
  split,
}) {
  const [expenseId, setExpenseId] = useState(expenseID);
  const [confDate, setConfDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [tripId, setTripId] = useState(tripID);
  const [expenseAmount, setExpenseAmount] = useState(amount);
  const [expenseSplit, setExpenseSplit] = useState(split);

  const [expenseConfStatus, setExpenseConfStatus] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  console.log(expenseID);

  useEffect(() => {
    if (!isOpen) {
      setExpenseConfStatus(null);
      setConfDate(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
      });
      setValidationErrors({});
    }
  }, [isOpen]);

  if (isOpen == false) {
    return null;
  }

  async function confirmExpense() {
    setValidationErrors({});

    const expenseValidation = validateExpense(confDate);
    setValidationErrors(expenseValidation);

    if (Object.keys(expenseValidation).length != 0) {
      return;
    }

    const confExpense = {};
    confExpense["expenseID"] = expenseId;
    confExpense["confirmed_date"] = confDate;
    confExpense["tripID"] = tripId;
    confExpense["amount"] = expenseAmount;
    confExpense["split"] = expenseSplit;

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        return;
      }

      const confirmExpenseResult = await fetch(
        "http://localhost:3000/api/confirm-expense",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(confExpense),
        }
      );

      if (confirmExpenseResult.ok) {
        setExpenseConfStatus("success");
        onAdd();
      } else {
        setExpenseConfStatus("fail");
      }

      setTimeout(() => onCancel(), 1000);
    } catch (e) {
      console.log("There was an error" + e);
      setExpenseConfStatus("fail");
      setTimeout(() => onCancel(), 1000);
    }
  }

  return (
    <div id="modalConfirm">
      <div id="modalConfirmCard">
        <h4>Confirm Expense</h4>
        {expenseConfStatus == null ? (
          <>
            <div id="addExpenseForm">
              <p>
                Please enter the date where the expense was paid or processed
              </p>
              <div className="expenseRow">
                <label htmlFor="expenseDate" className="expenseLabel">
                  Confirmation Date:
                </label>
                <input
                  id="expenseDate"
                  className="expenseInput"
                  type="date"
                  value={confDate}
                  onChange={(e) => setConfDate(e.target.value)}
                />
                {validationErrors.date && (
                  <p
                    className="errorDisplayText"
                    style={{ gridColumn: "1 / -1", margin: 0 }}
                  >
                    {validationErrors.date}
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
                onClick={confirmExpense}
                className="confirmButtons buttonConfirmOk"
              >
                Confirm
              </button>
            </div>
          </>
        ) : expenseConfStatus === "success" ? (
          <>
            <p className="greenText">Expense confirmed succesfully!</p>
          </>
        ) : (
          <>
            <p className="redText">
              There was an error confirming your expense
            </p>
          </>
        )}
      </div>
    </div>
  );
}
