import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import "./OwnerExpensePage.css"; // Import the CSS file

function OwnerExpensePage({ contract, walletAddress }) {
  const [expenses, setExpenses] = useState([]);
  const [showSettled, setShowSettled] = useState(false);

  useEffect(() => {
    async function loadExpenses() {
      if (contract && walletAddress) {
        const ownerExpenses = await contract.getExpensesByOwner(walletAddress);
        setExpenses(ownerExpenses);
      }
    }

    loadExpenses();
  }, [contract, walletAddress]);

  const toggleShowSettled = (value) => {
    setShowSettled(value);
  };

  return (
    <div className="owner-expense-container">
      <h2>Your Expenses as Owner</h2>
      <ToggleButtonGroup
        type="radio"
        name="showSettled"
        value={showSettled}
        onChange={toggleShowSettled}
      >
        <ToggleButton value={false}>Unsettled</ToggleButton>
        <ToggleButton value={true}>Settled</ToggleButton>
      </ToggleButtonGroup>
      <ul>
        {expenses.map((expense) => {
          if (showSettled !== expense.isSettled) {
            return null;
          }
          return (
            <div key={expense.id} className="expense-item">
              <h3 className="expense-description">Description: {expense.description}</h3>
              <p>Expense Owner: You</p>
              <p>Involved Members:</p>
              <ul>
                {expense.involvedMembers.map((member, index) => {
                  const isCurrentUser = member.toLowerCase() === walletAddress;
                  return (
                    <li key={index} className="involved-member">
                      Address: {isCurrentUser ? "You" : member}
                      {" - "}
                      Amount to Pay:{" "}
                      <span className="amount-to-pay">
                        {ethers.utils.formatEther(expense.amountsOwed[index])} ETH
                      </span>
                      {" - "}
                      Paid: {expense.hasPaid[index] ? <span className="settled">Yes</span> : "No"}
                    </li>
                  );
                })}
              </ul>
              <p>Settled: {expense.isSettled ? "Yes" : "No"}</p>
            </div>
          );
        })}
      </ul>
    </div>
  );
}

export default OwnerExpensePage;

