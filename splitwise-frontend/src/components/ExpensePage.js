import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import "./ExpensePage.css"; // Import the CSS file

function ExpensePage({ contract, walletAddress }) {
  const [expenses, setExpenses] = useState([]);
  const [showSettled, setShowSettled] = useState(false);
  const [balance, setBalance] = useState("0"); // State for the user's balance

  useEffect(() => {
    console.log(walletAddress)
    async function loadExpenses() {
      if (contract && walletAddress) {
        const callerExpenses = await contract.getExpensesOfCaller();
        setExpenses(callerExpenses);

        // Fetch and set the balance here
        const userBalance = await getBalance(walletAddress);
        setBalance(userBalance);
      }
    }

    loadExpenses();
  }, [contract, walletAddress]);

  const toggleShowSettled = (value) => {
    setShowSettled(value);
  };

  const amountNeedToPay = (amountsOwed, involvedMembers)=>{
    let amount = 0;
    for(let i = 0; i < involvedMembers.length; i++){
      if(involvedMembers[i].toLowerCase() === walletAddress){
        amount = amountsOwed[i];
        break;
      }
    }
    return amount;
  }

//   const handlePayment = async (expenseId, ownerAddress, amountToBePaid) => {
    
//     try {
//   // Create a transaction object for the payment
//   const transaction = {
//     from: walletAddress,
//     to: ownerAddress,
//     value: amountToBePaid.toHexString(),
//   };

//   // Prompt the user to sign a transaction for both payment and marking as paid
//   const response = await window.ethereum.request({
//     method: "eth_sendTransaction",
//     params: [transaction],
//   })

//   // Check if the user confirmed the transaction
//   if (response && response.hash) {
//     // Transaction was confirmed, mark the user as paid in the contract
//     await contract.markUserAsPaid(expenseId, walletAddress);
    
//     console.log("Payment transaction hash:", response.hash);
//     console.log("Sending payment to owner:", ownerAddress, amountToBePaid);

//     // Update the list of expenses
//     const updatedExpenses = await contract.getExpensesOfCaller();
//     setExpenses(updatedExpenses);
//   } else {
//     // Transaction was not confirmed
//     console.error("Payment transaction was not confirmed.");
//   }
// } catch (error) {
//   console.error("Error processing payment and marking user as paid:", error);
// }

//   };

  const handlePayment = async (expenseId, ownerAddress, amountToBePaid) => {
    try {
      // Create a transaction object for the payment
      const transaction = {
        from: walletAddress,
        to: ownerAddress,
        value: amountToBePaid.toHexString(),
      };
  
      // Prompt the user to sign a transaction for both payment and marking as paid
      const response = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transaction],
      });
      console.log("Sending payment to owner:", ownerAddress, amountToBePaid);
  
      // Transaction was successful, mark the user as paid in the contract
      await contract.markUserAsPaid(expenseId, walletAddress);
  
      // Update the list of expenses
      const updatedExpenses = await contract.getExpensesOfCaller();
      setExpenses(updatedExpenses);
      
    } catch (error) {
      console.error("Error processing payment and marking user as paid:", error);
    }
  };
  

  

  const getBalance = async (walletAddress) => {
    try {
      if (contract && walletAddress) {
        const balance = await contract.getBalance(walletAddress);
        // Convert the balance from Wei to Ether
        const balanceInEther = ethers.utils.formatEther(balance);
        return balanceInEther;
      }
      return "0"; // Return a default value if the contract or wallet address is not available
    } catch (error) {
      console.error("Error fetching balance:", error);
      return "0"; // Handle the error and return a default value
    }
  };
  

  return (
    <div className="expense-container">
      <h2>Your Expenses<span className="totalBalance">  (Total Amount You Need to Pay:{balance} ETH)</span></h2>  
      

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
          // console.log(expense);
          return (
            <div key={expense.id} className="expense-item">
              <h3 className="expense-description">Description: {expense.description}</h3>
              <p className="expense-owner">Expense Owner: {expense.owner === walletAddress ? "You" : expense.owner}</p>
              <p>Involved Members:</p>
              <ul className="involved-members-list">
                {expense.involvedMembers.map((member, index) => {
                  member = member.toLowerCase();
                  const isCurrentUser = member === walletAddress;
                  const isPaymentVisible = isCurrentUser && !expense.hasPaid[index];
                  return (
                    <li key={index} className={'involved-member'}>
                      Address: {isCurrentUser ? "You" : member}
                      {" - "}
                      Amount to Pay:{" "}
                      <span className="amount-to-pay">
                        {ethers.utils.formatEther(expense.amountsOwed[index])} ETH
                      </span>
                      {" - "}
                      Paid: {expense.hasPaid[index] ? "Yes" : "No"}
                      {isPaymentVisible && (
                        <button onClick={() => handlePayment(expense.id, expense.owner, amountNeedToPay(expense.amountsOwed, expense.involvedMembers))}>Pay</button>
                      )}
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

export default ExpensePage;
