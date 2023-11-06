import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./ExpensePage.css"; 

function ExpensePage({ contract, walletAddress }) {
  const [expenses, setExpenses] = useState([]);
  const [showSettled, setShowSettled] = useState(false);
  const [balance, setBalance] = useState("0"); // State for the user's balance

  useEffect(() => {
    // console.log(walletAddress)
    async function loadExpenses() {
      if (contract && walletAddress) {
        const callerExpenses = await contract.getExpensesOfCaller();
        setExpenses(callerExpenses);

        // Fetch and set the balance here
        const userBalance = await getBalance(walletAddress);
        setBalance(userBalance);

        console.log(callerExpenses);
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


  const calculateDays = (timestamp) => {
    // console.log(timestamp)
    const currentTimestamp = Math.floor(Date.now() / 1000); // Convert current time to Unix timestamp
    const timeDifferenceInSeconds = currentTimestamp - timestamp;
    const secondsInADay = 86400; // Number of seconds in a day (24 hours * 60 minutes * 60 seconds)

    const daysSinceCreation = Math.floor(timeDifferenceInSeconds / secondsInADay);
    
    return daysSinceCreation+1;
}


  const handlePayment = async (expenseId, ownerAddress, actualAmount, interestRate,expenseTitle,numOfDays) => {
    try {
        
        const actualAmountInEth =Number(ethers.utils.formatEther(actualAmount));
        //check the data type of actualAmountInEth
        console.log(actualAmountInEth, interestRate, numOfDays);
        
        // Calculate the total amount to be paid (actual amount + interest)
        let totalAmountToBePaidInEth = actualAmountInEth + (actualAmountInEth * interestRate * numOfDays) / 100;
        // round to 6 decimal places
        totalAmountToBePaidInEth = Math.round(totalAmountToBePaidInEth * 1000000) / 1000000;

        // Create a description for the transaction
        const description = `Payment for expense ${expenseTitle}. Actual Amount: ${actualAmountInEth} ETH, Interest: ${totalAmountToBePaidInEth-actualAmountInEth}ETH for ${numOfDays} days`;
        console.log(description,totalAmountToBePaidInEth);

        // Create a transaction object for the payment with a description
        const transaction = {
            from: walletAddress,
            to: ownerAddress,
            value: ethers.utils.parseEther(totalAmountToBePaidInEth.toString()).toHexString(), // Convert to Wei value
           
        };

        // Prompt the user to sign a transaction for both payment and marking as paid
        await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [transaction],
        });

        console.log("Sending payment to owner:", ownerAddress, totalAmountToBePaidInEth);

        // Transaction was successful, mark the user as paid in the contract
        await contract.markUserAsPaid(expenseId, walletAddress);

        // Update the list of expenses
        const updatedExpenses = await contract.getExpensesOfCaller();
        setExpenses(updatedExpenses);
    } catch (error) {
        console.error("Error processing payment and marking user as paid:", error);
    }
};

// Helper function to convert a string to bytes32
// function descriptionToBytes32(description) {
//   return ethers.utils.formatBytes32String(description);
// }
  

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
      

      <div className="toggle-switch">
  <input
    type="radio"
    id="unSettledToggle"
    value="unsettled"
    checked={!showSettled}
    onChange={() => toggleShowSettled(false)}
  />
  <label htmlFor="unSettledToggle">Unsettled</label>
  
  <input
    type="radio"
    id="SettledToggle"
    value="settled"
    checked={showSettled}
    onChange={() => toggleShowSettled(true)}
  />
  <label htmlFor="SettledToggle">Settled</label>
      </div>


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
                        <button onClick={() => handlePayment(expense.id, expense.owner, amountNeedToPay(expense.amountsOwed, expense.involvedMembers), expense.interestRate.toNumber(),expense.description,calculateDays(expense.creationTimestamp.toNumber()))}>Pay</button>
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
