import { useState, useEffect } from "react";
import "../../css/tripoverview.css";
import AddExpense from "../../components/AddExpense";
import AddFunds from "../../components/AddFunds";
import RemoveFunds from "../../components/RemoveFunds";

export default function TripOverview({ trip }) {
  const [theTripID, setTheTripID] = useState(trip.tripid);
  const userID = "c8379535-2cd7-4248-8c45-1c09ebac140f";
  const [savingsFund, setSavingsFund] = useState();
  const [savingsFundID, setSavingsFundID] = useState();
  const [expenses, setExpenses] = useState([]);
  const [totalTripCost, setTotalTripCost] = useState(0);
  const [pendingExpenses, setPendingExpenses] = useState(0);
  const [tripBalance, setTripBalance] = useState(0);

  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [removeFundsOpen, setRemoveFundsOpen] = useState(false);

  const noExpensesPhrases = [
    "Your wallet is safe... for now 💸",
    "Zero adventures logged here yet ✨",
    "Time to add your first adventure 🌍",
  ];

  function getRandomPhrase(phrases) {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
  }

  async function refreshPage() {
    await getSavingsFund();
    await getExpenses();
  }

  async function getSavingsFund() {
    try {
      const savingsFundData = await fetch(
        `http://localhost:3000/api/savings?tripId=${theTripID}&userId=${userID}`
      );
      const savingsFundJson = await savingsFundData.json();

      console.log(savingsFundJson);
      setSavingsFund(savingsFundJson[0].amount);
      setSavingsFundID(savingsFundJson[0].savings_funds_id);
    } catch (e) {
      console.log(e);
    }
  }

  async function getExpenses() {
    try {
      const expensesData = await fetch(
        `http://localhost:3000/api/expenses?tripId=${theTripID}&userId=${userID}`
      );

      const expenses = await expensesData.json();

      setExpenses(expenses);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    getSavingsFund();
    getExpenses();
  }, []);

  useEffect(() => {
    if (savingsFund != null && expenses.length > 0) {
      if (trip.status == "Planning") {
        var pendingExp = expenses
          .reduce((sum, e) => {
            if (e.split === "shared") {
              return sum + (Number(e.amount) || 0) / trip.members;
            } else {
              return sum + (Number(e.amount) || 0);
            }
          }, 0)
          .toFixed(2);

        setPendingExpenses(pendingExp);

        setTripBalance((savingsFund - pendingExp).toFixed(2));
      } else {
        var totalTripCost = expenses
          .reduce((sum, e) => {
            if (e.split === "shared") {
              return sum + (Number(e.amount) || 0) / trip.members;
            } else {
              return sum + (Number(e.amount) || 0);
            }
          }, 0)
          .toFixed(2);

        setTotalTripCost(totalTripCost);

        var pendingExpenses = expenses
          .filter((e) => e.status === "Pending")
          .reduce((sum, e) => {
            if (e.split === "shared") {
              return sum + (Number(e.amount) || 0) / trip.members;
            } else {
              return sum + (Number(e.amount) || 0);
            }
          }, 0)
          .toFixed(2);

        setPendingExpenses(pendingExpenses);

        setTripBalance((savingsFund - pendingExpenses).toFixed(2));
      }
    }
  }, [savingsFund, expenses]);

  return (
    <>
      <div style={{ paddingRight: "2%", paddingLeft: "2%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingTop: "10px",
          }}
        >
          <div className="ownerContainer">
            <p>OWNER</p>
          </div>
        </div>
        <h2 style={{ textAlign: "left" }}>Overview</h2>
      </div>
      <div id="expensesSavingsCont">
        <div id="expensesContainer">
          <div id="expectedExpensesTitleSection">
            <h3 id="expectedExpensesTitle">Expected Expenses</h3>
            <div
              id="addExpenseButton"
              onClick={() => {
                setIsExpenseOpen(true);
              }}
            >
              +
            </div>
          </div>
          <div id="expensesTableContainer">
            {expenses.length == 0 ? (
              getRandomPhrase(noExpensesPhrases)
            ) : (
              <table id="expensesTable">
                <thead>
                  <tr>
                    <th></th>
                    <th>Expense</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                    <th style={{ textAlign: "right" }}>Split</th>
                    <th style={{ textAlign: "right" }}>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => {
                    return (
                      <tr id={e.expense_id} key={e.expense_id}>
                        <td>✏️</td>
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
                        <td>
                          <span>✔</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div id="savingsContainer">
          <div id="savingsFundTitle">
            <h3>Savings Fund</h3>
          </div>
          <div id="fundsCardsContainer">
            <div className="fundsCardsRow">
              <div className="fundsCard">
                {trip.status == "Planning" ? (
                  <>
                    <h4>Expected Expenses:</h4>
                    <p>$ {pendingExpenses}</p>
                  </>
                ) : (
                  <>
                    <h4>Pending Expenses:</h4>
                    <p>$ {pendingExpenses}</p>
                  </>
                )}
              </div>
              <div className="fundsCard">
                <h4>Saved Funds:</h4>
                <p>{savingsFund ? "$ " + savingsFund : "Loading..."}</p>
              </div>
              <div className="fundsCard balanceCard">
                <h4>Balance:</h4>
                <p className={tripBalance < 0 ? "redText" : "greenText"}>
                  $ {tripBalance}
                </p>
              </div>
            </div>
            {trip.status == "Planning" ? null : (
              <div className="fundsCardsRow">
                <div className="fundsCard totalTripCard">
                  <h4>Total Trip Cost:</h4>
                  <p>$ {totalTripCost}</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setAddFundsOpen(true)}
              className="button"
              id="addFundsButton"
            >
              Add Funds
            </button>
            <button onClick={() => setRemoveFundsOpen(true)} id="removeFunds">
              Remove Funds
            </button>
          </div>
        </div>
      </div>
      <AddExpense
        isOpen={isExpenseOpen}
        onAdd={refreshPage}
        onCancel={() => setIsExpenseOpen(false)}
        members={trip.members}
        tripSplit={trip.default_split}
        tripID={theTripID}
        userID={userID}
      />
      {addFundsOpen && savingsFund != null && savingsFundID != null && (
        <AddFunds
          isOpen={addFundsOpen}
          onConfirm={refreshPage}
          onCancel={() => setAddFundsOpen(false)}
          currentSavingsAmount={savingsFund}
          savingsFundID={savingsFundID}
        />
      )}
      {removeFundsOpen && savingsFund != null && savingsFundID != null && (
        <RemoveFunds
          isOpen={removeFundsOpen}
          onConfirm={refreshPage}
          onCancel={() => setRemoveFundsOpen(false)}
          currentSavingsAmount={savingsFund}
          savingsFundID={savingsFundID}
        />
      )}
    </>
  );
}
