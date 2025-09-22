import "../../css/tripoverview.css";

export default function TripOverview() {
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
            <div id="addExpenseButton">+</div>
          </div>
          <div id="expensesTableContainer">
            <table id="expensesTable">
              <thead>
                <tr>
                  <th>Expense</th>
                  <th>Amount</th>
                  <th>Split</th>
                  <th>Percentage</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Disney Tickets</td>
                  <td>$ 500</td>
                  <td>100%</td>
                  <td>$ 500</td>
                  <td>
                    <span>✔</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div id="savingsContainer">
          <div id="savingsFundTitle">
            <h3>Savings Fund</h3>
          </div>
          <div id="fundsCardsContainer">
            <div className="fundsCardsRow">
              <div className="fundsCard">
                <h4>Pending Expenses:</h4>
                <p>$ 466,66</p>
              </div>
              <div className="fundsCard">
                <h4>Saved Funds:</h4>
                <p>$ 250</p>
              </div>
              <div className="fundsCard balanceCard">
                <h4>Balance:</h4>
                <p>$ 216,66</p>
              </div>
            </div>
            <div className="fundsCardsRow">
              <div className="fundsCard totalTripCard">
                <h4>Total Trip Cost:</h4>
                <p>$ 1376,66</p>
              </div>
            </div>
            <button className="button" id="addFundsButton">
              Add Funds
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
