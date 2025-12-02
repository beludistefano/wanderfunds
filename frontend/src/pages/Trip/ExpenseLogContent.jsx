import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../css/components/expenselog.css";
import AddConfirmedExpense from "../../components/AddConfirmedExpense";
import { useAuth } from "../../auth/AuthProvider";
import { faPlus, faSort } from "@fortawesome/free-solid-svg-icons";

const formatDate = (d) => (d ? d.slice(0, 10) : "");

export default function ExpenseLogContent({ role, tripID, trip }) {
  const { session, initialized } = useAuth();

  const [tripId, setTripId] = useState(tripID);
  const [userRole, setUserRole] = useState(role);
  const [expenses, setExpenses] = useState([]);
  const [tripData, setTripData] = useState(trip);

  const [allExpenses, setAllExpenses] = useState([]);

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const [searchExpValue, setSearchExpValue] = useState("");
  const [searchAmountValue, setSearchAmountValue] = useState("");
  const [searchIndValue, setSearchIndValue] = useState("");
  const [searchFromValue, setSearchFromValue] = useState("");
  const [searchToValue, setSearchToValue] = useState("");

  const [currentSort, setCurrentSort] = useState({ sort: "", order: "asc" });

  const noExpensesPhrases = [
    "You haven't paid for anything... yet 💸",
    "Zero adventures logged here yet ✨",
    "If you pay it before the trip... then it's free 🌍",
  ];

  function sortExp(sortBy) {
    const direction =
      sortBy === currentSort.sort && currentSort.order === "asc"
        ? "desc"
        : "asc";

    const sortedExpenses = [...expenses];

    if (sortBy == "ind") {
      if (direction == "asc") {
        sortedExpenses.sort(
          (a, b) =>
            Number(a.amount) / Number(tripData.members) -
            Number(b.amount) / Number(tripData.members)
        );
      } else {
        sortedExpenses.sort(
          (a, b) =>
            Number(b.amount) / Number(tripData.members) -
            Number(a.amount) / Number(tripData.members)
        );
      }
    } else if (sortBy == "total") {
      if (direction == "asc") {
        sortedExpenses.sort((a, b) => Number(a.amount) - Number(b.amount));
      } else {
        sortedExpenses.sort((a, b) => Number(b.amount) - Number(a.amount));
      }
    } else if (sortBy == "expense") {
      if (direction == "asc") {
        sortedExpenses.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        sortedExpenses.sort((a, b) => b.name.localeCompare(a.name));
      }
    } else if (sortBy == "date") {
      if (direction == "asc") {
        sortedExpenses.sort(
          (a, b) => new Date(a.confirmed_date) - new Date(b.confirmed_date)
        );
      } else {
        sortedExpenses.sort(
          (a, b) => new Date(b.confirmed_date) - new Date(a.confirmed_date)
        );
      }
    }

    setExpenses(sortedExpenses);
    setCurrentSort({ sort: sortBy, order: direction });
  }

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
      setAllExpenses(expenses);
    } catch (e) {
      console.log(e);
    }
  }

  async function refreshPage() {
    await getExpenses();
  }

  function search() {
    var filteredExpenses = allExpenses.filter((exp) => {
      if (
        searchExpValue.trim() &&
        !exp.name.toLowerCase().includes(searchExpValue.trim().toLowerCase())
      ) {
        return false;
      }

      if (
        searchAmountValue &&
        searchAmountValue > 0 &&
        Number(exp.amount) < searchAmountValue
      ) {
        return false;
      }

      const individualAmount =
        exp.split === "own"
          ? Number(exp.amount)
          : Number(exp.amount) / Number(tripData.members);

      if (
        searchIndValue &&
        searchIndValue > 0 &&
        individualAmount < searchIndValue
      ) {
        return false;
      }

      const date = exp.confirmed_date.slice(0, 10);

      if (searchFromValue && date < searchFromValue) {
        return false;
      }

      if (searchToValue && date > searchToValue) {
        return false;
      }

      return exp;
    });

    setExpenses(filteredExpenses);
  }

  function resetSearch() {
    setSearchExpValue("");
    setSearchAmountValue("");
    setSearchIndValue("");
    setSearchFromValue("");
    setSearchToValue("");

    setExpenses(allExpenses);
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
              id="expenseLogOwnerContainerContainer"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                paddingTop: "10px",
              }}
            >
              <div className="expenseLogOwnerContainer">
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
          <div id="searchContainerSection">
            <div id="searchContainer">
              <div className="searchGroup searchGroupText">
                <label htmlFor="searchExpense">Expense:</label>
                <input
                  type="text"
                  id="searchExpense"
                  className="searchInput searchInputText"
                  value={searchExpValue}
                  onChange={(e) => setSearchExpValue(e.target.value)}
                />
              </div>
              <div className="searchGroup" id="totalAmountGroup">
                <label htmlFor="searchAmount">Min total amount:</label>
                <input
                  type="number"
                  id="searchAmount"
                  className="searchInput searchInputAmount"
                  value={searchAmountValue}
                  onChange={(e) => setSearchAmountValue(e.target.value)}
                />
              </div>
              <div className="searchGroup" id="indAmountGroup">
                <label htmlFor="searchIndAmount">Min individual amount:</label>
                <input
                  type="number"
                  id="searchIndAmount"
                  className="searchInput searchInputAmount"
                  value={searchIndValue}
                  onChange={(e) => setSearchIndValue(e.target.value)}
                />
              </div>
              <div className="searchGroupDate">
                <div className="groupDate">
                  <label htmlFor="searchFromDate">From:</label>
                  <input
                    type="date"
                    id="searchFromDate"
                    className="searchInput searchInputText"
                    value={searchFromValue}
                    onChange={(e) => setSearchFromValue(e.target.value)}
                  />
                </div>
                <div className="groupDate">
                  <label htmlFor="searchToDate">To:</label>
                  <input
                    type="date"
                    id="searchToDate"
                    className="searchInput searchInputText"
                    value={searchToValue}
                    onChange={(e) => setSearchToValue(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div id="searchButtonsContainer">
              <input
                type="button"
                id="buttonSearch"
                className="buttonSearch"
                value="Search"
                onClick={search}
              />
              <input
                type="button"
                className="buttonSearch"
                id="buttonReset"
                value="Reset"
                onClick={resetSearch}
              />
            </div>
          </div>
          <div id="expenseLogTable">
            {expenses.length == 0 ? (
              getRandomPhrase(noExpensesPhrases)
            ) : (
              <table id="expensesTable">
                <thead>
                  <tr>
                    <th>
                      Expense{" "}
                      <FontAwesomeIcon
                        className="sortIcon"
                        onClick={() => sortExp("expense")}
                        icon={faSort}
                      />
                    </th>
                    <th style={{ textAlign: "right" }}>
                      Amount{" "}
                      <FontAwesomeIcon
                        className="sortIcon"
                        onClick={() => sortExp("total")}
                        icon={faSort}
                      />
                    </th>
                    <th style={{ textAlign: "right" }}>Split </th>
                    <th style={{ textAlign: "right" }}>
                      Date{" "}
                      <FontAwesomeIcon
                        className="sortIcon"
                        onClick={() => sortExp("date")}
                        icon={faSort}
                      />
                    </th>
                    <th style={{ textAlign: "right" }}>
                      Individual Total{" "}
                      <FontAwesomeIcon
                        className="sortIcon"
                        onClick={() => sortExp("ind")}
                        icon={faSort}
                      />
                    </th>
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
        <p>
          Expense log is only available on trips with a status of Confirmed or
          On Trip!
        </p>
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
