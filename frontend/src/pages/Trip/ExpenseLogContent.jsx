import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../css/components/expenselog.css";
import AddConfirmedExpense from "../../components/AddConfirmedExpense";
import { useAuth } from "../../auth/AuthProvider";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const formatDate = (d) => new Date(d).toISOString().slice(0, 10);

export default function ExpenseLogContent({ role, tripID, trip }) {
  const { session, initialized } = useAuth();

  const [tripId, setTripId] = useState(tripID);
  const [userRole, setUserRole] = useState(role);
  const [expenses, setExpenses] = useState([]);
  const [tripData, setTripData] = useState(trip);

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

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

      const expenses = await expensesData.json();

      console.log(expenses);

      setExpenses(expenses);
    } catch (e) {
      console.log(e);
    }
  }

  async function refreshPage() {
    await getExpenses();
  }

  useEffect(() => {
    if (!initialized || !token || !tripId) {
      return;
    }
    (async () => {
      await getExpenses();
    })();
  }, [initialized, token, tripId]);

  return (
    <div id="expenseLogContainer">
      {tripData.status == "Confirmed" || tripData.status == "On trip" ? (
        <>
          <div id="containerItineraryTop">
            <div
              id="ownerContainerContainer"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                paddingTop: "10px",
              }}
            >
              <div className="ownerContainer">
                <p>{userRole}</p>
              </div>
            </div>
          </div>
          <div id="expenseLogTitle">
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
          <div id="expenseLogTable">
            {expenses.length == 0 ? (
              getRandomPhrase(noExpensesPhrases)
            ) : (
              <table id="expensesTable">
                <thead>
                  <tr>
                    <th>Expense</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                    <th style={{ textAlign: "right" }}>Split</th>
                    <th style={{ textAlign: "right" }}>Date</th>
                    <th style={{ textAlign: "right" }}>Individual Total</th>
                    <th></th>
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
                            : "$ " + (e.amount / trip.members).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <p>Expense log is only available on Confirmed trips!</p>
      )}

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
  );
}
