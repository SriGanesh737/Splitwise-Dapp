import React, { useState } from "react";
import { ethers } from "ethers"; // Import your Ethereum contract here

import "./ExpenseForm.css"; // Import your custom CSS file

function ExpenseForm({ contract }) {
  const [formData, setFormData] = useState({ address: "", amount: "", description: "" });
  const [members, setMembers] = useState([]);
  const [successMessage, setSuccessMessage] = useState(""); // State for success message

  const handleAddMember = () => {
    const address = formData.address;
    const amount = formData.amount;

    // Regular expression to match integers or decimals
    const amountPattern = /^\d+(\.\d{0,2})?/; // Allowing up to 2 decimal places

    if (address && amount && amountPattern.test(amount)) {
      // Convert the amount to Wei (ETH to Wei conversion)
      setMembers([...members, { address, amount }]);
      setFormData({ address: "", amount: "", description: formData.description });
    } else {
      // Display an error message or handle the validation failure as needed
      alert("Please enter a valid amount in Ether (e.g., 0.01 ETH with up to 2 decimal places).");
    }
  }

  const handleCreateExpense = async () => {
    if (members.length > 0) {
      const memberAddresses = members.map((member) => member.address);
      const memberAmounts = members.map((member) => ethers.utils.parseEther(member.amount.toString())); // Convert to Wei
      const description = formData.description; // Set the description from the input field

      try {
        // Call the createExpense function in your contract here

        console.log("Array of amounts: ", memberAmounts);
        const tx = await contract.createExpense(memberAddresses, memberAmounts, description);
        await tx.wait();
        setSuccessMessage("Expense created successfully!"); // Display success message
        setMembers([]); // Clear the members list
        setFormData({ address: "", amount: "", description: "" }); // Clear the input fields
      } catch (error) {
        // Handle the error (e.g., display an error message).
        console.error("Error creating expense:", error);
        setSuccessMessage("Error creating expense. Please try again.");
      }
    }
  }

  return (
    <div className="expense-form">
      <h2>Create Expense</h2>
      <form>
      <input
          type="text"
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <input
          type="text"
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
        <input
          type="text"
          placeholder="Amount"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        />
        
        <button type="button" onClick={handleAddMember}>
          Add One More Member
        </button>
      </form>
      {members.length > 0 && (
        <div>
          <h3>Added Members:</h3>
          <ul>
            {members.map((member, index) => (
              <li key={index}>
                Address: {member.address}, Amount: {member.amount.toString()} ETH
              </li>
            ))}
          </ul>
        </div>
      )}
      <button type="button" onClick={handleCreateExpense}>
        Submit
      </button>
      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  )
}

export default ExpenseForm;
