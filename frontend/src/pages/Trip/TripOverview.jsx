import { useState, useEffect } from "react";
import "../../css/tripoverview.css";
import AddExpense from "../../components/AddExpense";
import AddFunds from "../../components/AddFunds";
import RemoveFunds from "../../components/RemoveFunds";
import EditExpense from "../../components/EditExpense";
import ConfirmExpense from "../../components/ConfirmExpense";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faCheck,
  faDollarSign,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../auth/AuthProvider";

export default function TripOverview({ trip, userRole }) {
  const { session, initialized } = useAuth();
  const [theTripID, setTheTripID] = useState(trip.tripid);
  const [savingsFund, setSavingsFund] = useState();
  const [savingsFundID, setSavingsFundID] = useState();
  const [expenses, setExpenses] = useState([]);
  const [totalTripCost, setTotalTripCost] = useState(0);
  const [pendingExpenses, setPendingExpenses] = useState(0);
  const [tripBalance, setTripBalance] = useState(0);
  const [tripOwner, setTripOwner] = useState(trip.ownerid);
  const [role, setRole] = useState(userRole);
  const [tripAutoAdd, setTripAutoAdd] = useState(trip.auto_add);

  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedConfExpense, setSelectedConfExpense] = useState(null);

  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [confirmExpenseOpen, setConfirmExpenseOpen] = useState(false);
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [removeFundsOpen, setRemoveFundsOpen] = useState(false);
  const [editExpenseOpen, setEditExpenseOpen] = useState(false);

  const token = session?.access_token;

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
    if (role == "Owner" || role == "Participant") {
      await getSavingsFund();
    }
    await getExpenses();
  }

  async function getSavingsFund() {
    try {
      if (!token) {
        return;
      }
      const savingsFundData = await fetch(
        `https://wanderfunds-backend.onrender.com/api/savings?tripId=${theTripID}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
      if (!token) {
        return;
      }

      const expensesData = await fetch(
        `https://wanderfunds-backend.onrender.com/api/expenses?tripId=${theTripID}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const expenses = await expensesData.json();

      setExpenses(expenses);
      console.log(expenses);
    } catch (e) {
      console.log(e);
    }
  }

  async function approveExpense(expenseID) {
    console.log("Clicked button");
    var acceptExpense = {};
    acceptExpense["expenseID"] = expenseID;
    console.log(acceptExpense);

    try {
      const acceptResp = await fetch(
        "https://wanderfunds-backend.onrender.com/api/accept-expense",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(acceptExpense),
        }
      );

      await refreshPage();
      console.log(acceptResp);
    } catch (e) {
      console.log("Error: " + e);
    }
  }

  async function rejectExpense(expenseID) {
    var deleteExpense = {};
    deleteExpense["expenseID"] = expenseID;
    console.log(deleteExpense);

    try {
      const deleteResp = await fetch(
        "https://wanderfunds-backend.onrender.com/api/delete-expense",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(deleteExpense),
        }
      );

      await refreshPage();
      console.log(deleteResp);
    } catch (e) {
      console.log("Error: " + e);
    }
  }

  useEffect(() => {
    if (!initialized || !token || !trip) {
      return;
    }
    (async () => {
      if (role == "Owner" || role == "Participant") {
        await getSavingsFund();
      }
      await getExpenses();
    })();
  }, [initialized, token, trip?.tripid]);

  useEffect(() => {
    if (savingsFund != null && expenses.length > 0) {
      if (trip.status == "Planning") {
        const acceptedExpenses = expenses.filter(
          (e) => e.expense_status === "accepted"
        );

        var pendingExp = acceptedExpenses
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
        const acceptedExpenses = expenses.filter(
          (e) => e.expense_status === "accepted"
        );

        var totalTripCost = acceptedExpenses
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
          .filter(
            (e) =>
              (e.confirmed === null || e.confirmed === false) &&
              e.expense_status === "accepted"
          )
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
        <div id="expensesContainer">
          <div id="expectedExpensesTitleSection">
            <h3 id="expectedExpensesTitle">Expected Expenses</h3>
            {(role == "Owner" || role == "Participant") && (
              <div
                id="addExpenseButton"
                onClick={() => {
                  setIsExpenseOpen(true);
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
                        {(role == "Owner" || role == "Participant") && (
                          <td
                            className="editPencil"
                            onClick={() => {
                              setEditExpenseOpen(true);
                              setSelectedExpense(e);
                            }}
                          >
                            ✏️
                          </td>
                        )}
                        {role == "Guest" && <td></td>}
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
                        <td style={{ textAlign: "center" }}>
                          {role === "Guest" ? (
                            <></>
                          ) : trip.status == "Planning" ? (
                            e.expense_status == "pending" ? (
                              role == "Owner" ? (
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "8px",
                                    justifyContent: "center",
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => approveExpense(e.expense_id)}
                                    id="approveExpenseButton"
                                  >
                                    <FontAwesomeIcon
                                      icon={faCheck}
                                      style={{ color: "white" }}
                                    />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => rejectExpense(e.expense_id)}
                                    id="rejectExpenseButton"
                                  >
                                    <FontAwesomeIcon
                                      icon={faXmark}
                                      style={{ color: "white" }}
                                    />
                                  </button>
                                </div>
                              ) : (
                                <span className="expenseLabelConfirm">
                                  Pending
                                </span>
                              )
                            ) : (
                              <div style={{ textAlign: "center" }}>
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  style={{ color: "black" }}
                                />
                              </div>
                            )
                          ) : e.expense_status == "pending" ? (
                            role == "Owner" ? (
                              <div
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  justifyContent: "center",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => approveExpense(e.expense_id)}
                                  id="approveExpenseButton"
                                >
                                  <FontAwesomeIcon
                                    icon={faCheck}
                                    style={{ color: "white" }}
                                  />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => rejectExpense(e.expense_id)}
                                  id="rejectExpenseButton"
                                >
                                  <FontAwesomeIcon
                                    icon={faXmark}
                                    style={{ color: "white" }}
                                  />
                                </button>
                              </div>
                            ) : (
                              <span className="expenseLabelConfirm">
                                Pending
                              </span>
                            )
                          ) : e.confirmed == true ? (
                            <p>
                              Paid
                              <FontAwesomeIcon icon={faCheck} />
                            </p>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                console.log(e);
                                setConfirmExpenseOpen(true);
                                setSelectedConfExpense(e);
                              }}
                              id="confirmExpenseButton"
                            >
                              Confirm
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {(role == "Owner" || role == "Participant") && (
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
        )}
      </div>
      <AddExpense
        isOpen={isExpenseOpen}
        onAdd={refreshPage}
        onCancel={() => setIsExpenseOpen(false)}
        members={trip.members}
        tripSplit={trip.default_split}
        tripID={theTripID}
        tripRole={role}
        autoadd={tripAutoAdd}
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
      {editExpenseOpen && expenses.length > 0 && (
        <EditExpense
          isOpen={editExpenseOpen}
          onUpdate={refreshPage}
          onCancel={() => setEditExpenseOpen(false)}
          members={trip.members}
          tripSplit={trip.default_split}
          expense={selectedExpense}
          tripRole={role}
          autoadd={tripAutoAdd}
        />
      )}
      {confirmExpenseOpen && expenses.length > 0 && (
        <ConfirmExpense
          isOpen={confirmExpenseOpen}
          onAdd={refreshPage}
          onCancel={() => setConfirmExpenseOpen(false)}
          expenseID={selectedConfExpense.expense_id}
          tripID={theTripID}
          amount={selectedConfExpense.amount / trip.members}
          split={selectedConfExpense.split}
        />
      )}
    </>
  );
}
