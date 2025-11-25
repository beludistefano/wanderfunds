import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../css/ontrip.css";
import AddConfirmedExpense from "../../components/AddConfirmedExpense";
import { useAuth } from "../../auth/AuthProvider";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const formatDate = (d) => new Date(d).toISOString().slice(0, 10);

export default function OnTrip({ role, tripID, trip }) {
  const { session, initialized } = useAuth();

  const [tripId, setTripId] = useState(tripID);
  const [userRole, setUserRole] = useState(role);
  const [expenses, setExpenses] = useState([]);
  const [tripData, setTripData] = useState(trip);
  const [quickAddExp, setQuickAddExp] = useState([]);

  const [savingsFund, setSavingsFund] = useState();
  const [totalTripCost, setTotalTripCost] = useState(null);

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const [quickAddError, setQuickAddError] = useState(false);

  const noExpensesPhrases = [
    "You haven't paid for anything... yet 💸",
    "Zero adventures logged here yet ✨",
    "If you pay it before the trip... then it's free 🌍",
  ];

  function getRandomPhrase(phrases) {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
  }

  const token = session?.access_token;

  async function getExpenses() {
    try {
      if (!token) {
        return;
      }

      const expensesData = await fetch(
        `https://wanderfunds-backend.onrender.com/api/confirmed-expenses?tripId=${tripId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const quickAddExp = await fetch(
        `https://wanderfunds-backend.onrender.com/api/expenses?tripId=${tripId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const expenses = await expensesData.json();
      const quickAdd = await quickAddExp.json();

      console.log(expenses);
      console.log(quickAdd);

      setExpenses(expenses);

      const quickAddExpenses = quickAdd.filter(
        (e) =>
          e.expense_status === "accepted" &&
          (e.confirmed === false || e.confirmed == null)
      );

      setQuickAddExp(quickAddExpenses);

      var totalTripCost = expenses
        .reduce((sum, e) => {
          if (e.split === "shared") {
            return sum + (Number(e.amount) || 0) / tripData.members;
          } else {
            return sum + (Number(e.amount) || 0);
          }
        }, 0)
        .toFixed(2);

      setTotalTripCost(totalTripCost);
    } catch (e) {
      console.log(e);
    }
  }

  async function getSavingsFund() {
    try {
      if (!token) {
        return;
      }
      const savingsFundData = await fetch(
        `https://wanderfunds-backend.onrender.com/api/savings?tripId=${tripId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const savingsFundJson = await savingsFundData.json();

      console.log(savingsFundJson);
      setSavingsFund(savingsFundJson[0].amount);
    } catch (e) {
      console.log(e);
    }
  }

  async function refreshPage() {
    await getExpenses();
    await getSavingsFund();
  }

  useEffect(() => {
    if (!initialized || !token || !tripId) {
      return;
    }
    (async () => {
      await getExpenses();
      await getSavingsFund();
    })();
  }, [initialized, token, tripId]);

  async function quickAddExpense(expenseData) {
    const confExpense = {};
    confExpense["expenseID"] = expenseData.expense_id;
    confExpense["confirmed_date"] = new Date().toISOString();
    confExpense["tripID"] = expenseData.trip_id;
    confExpense["amount"] = expenseData.amount;
    confExpense["split"] = expenseData.split;

    try {
      if (!token) {
        return;
      }

      const confirmExpenseResult = await fetch(
        "https://wanderfunds-backend.onrender.com/api/confirm-expense",
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
        refreshPage();
      } else {
        setQuickAddError(true);
      }
    } catch (e) {
      setQuickAddError(true);
      console.log(e);
    }
  }

  return (
    <>
      <div id="containerTop" style={{ paddingRight: "2%", paddingLeft: "2%" }}>
        <div
          id="ownerContainerContainer"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingTop: "10px",
          }}
        >
          <div className="ownerContainer">
            <p>{role}</p>
          </div>
        </div>
        <h2 id="overviewTitle" style={{ textAlign: "left" }}>
          Overview
        </h2>
      </div>
      <div id="expensesSavingsCont">
        <div id="expenseLogContainerOnTrip">
          {userRole == "Guest" ? (
            <></>
          ) : (
            <div id="balanceSummaryContainer">
              <div className="onTripFundsCard totalBalanceOnTrip">
                <h4>Total Spent:</h4>
                <p>{totalTripCost ? "$ " + totalTripCost : "Loading..."}</p>
              </div>
              <div className="onTripFundsCard availableFundsOnTrip">
                <h4>Available Funds:</h4>
                <p
                  className={
                    savingsFund > 1000
                      ? "textGreen"
                      : savingsFund > 500
                      ? "textGreenYellow"
                      : savingsFund > 300
                      ? "textOrange"
                      : "textRed"
                  }
                >
                  {savingsFund ? "$ " + savingsFund : "Loading..."}
                </p>
              </div>
            </div>
          )}
          <div id="expenseLogTitleOnTrip">
            <h3 id="expectedExpensesTitle">Expense Log</h3>
            {(role == "Owner" || role == "Participant") && (
              <div
                id="addExpenseButton"
                onClick={() => {
                  setIsAddExpenseOpen(true);
                }}
              >
                <FontAwesomeIcon icon={faPlus} />
              </div>
            )}
            {role == "Guest" && (
              <div>
                <></>
              </div>
            )}
          </div>
          <div id="expenseLogTableOnTrip">
            {expenses.length == 0 ? (
              getRandomPhrase(noExpensesPhrases)
            ) : (
              <table id="expensesTableOnTrip">
                <thead>
                  <tr>
                    <th>Expense</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                    <th style={{ textAlign: "right" }}>Split</th>
                    <th style={{ textAlign: "right" }}>Date</th>
                    <th style={{ textAlign: "right" }}>Individual Total</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => {
                    return (
                      <tr id={e.expense_id} key={e.expense_id}>
                        <td>{e.name}</td>
                        <td style={{ textAlign: "right" }}>$ {e.amount}</td>
                        <td style={{ textAlign: "right" }}>
                          {e.split === "own" ? "100%" : "Split equally"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {e.confirmed_date ? formatDate(e.confirmed_date) : ""}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {e.split === "own"
                            ? "$ " + e.amount
                            : "$ " + (e.amount / tripData.members).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <AddConfirmedExpense
            isOpen={isAddExpenseOpen}
            onAdd={refreshPage}
            onCancel={() => setIsAddExpenseOpen(false)}
            members={tripData.members}
            tripSplit={tripData.default_split}
            tripID={tripId}
            tripRole={userRole}
            autoadd={tripData.auto_add}
          />
        </div>
        <div id="quickAddContainer">
          <h3 id="quickAddTitle">Quick Add</h3>
          <div id="quickAddTableContainer">
            {quickAddExp.length == 0 ? (
              getRandomPhrase(noExpensesPhrases)
            ) : (
              <table id="quickAddTable">
                <thead>
                  <tr>
                    <th>Expense</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                    <th style={{ textAlign: "right" }}>Split</th>
                    <th style={{ textAlign: "right" }}>Individual Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {quickAddExp.map((e) => {
                    return (
                      <tr id={e.expense_id} key={e.expense_id}>
                        <td>{e.name}</td>
                        <td style={{ textAlign: "right" }}>$ {e.amount}</td>
                        <td style={{ textAlign: "right" }}>
                          {e.split === "own" ? "100%" : "Split equally"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {e.split === "own"
                            ? "$ " + e.amount
                            : "$ " + (e.amount / trip.members).toFixed(2)}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            className="quickAddButton"
                            onClick={() => {
                              quickAddExpense(e);
                            }}
                          >
                            ADD
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          {quickAddError && (
            <div className="errorDisplayText">
              There was an error quick-adding your expense
            </div>
          )}
        </div>
      </div>
    </>
  );
}
