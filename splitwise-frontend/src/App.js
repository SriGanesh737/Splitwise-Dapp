import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"; // Import BrowserRouter, Routes, and Route
import { Navbar, Nav } from "react-bootstrap";
import ExpenseForm from "./components/ExpenseForm";
import ExpensePage from "./components/ExpensePage";
import OwnerExpensePage from "./components/OwnerExpensePage";
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS


function App() {
  const [contract, setContract] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    // Initialize your contract instance using ethers here
    async function initContract() {
      if (window.ethereum) {
       
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);


        const abi = [
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "expenseId",
                "type": "uint256"
              }
            ],
            "name": "ExpenseCreated",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "expenseId",
                "type": "uint256"
              }
            ],
            "name": "ExpenseSettled",
            "type": "event"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "",
                "type": "address"
              }
            ],
            "name": "balances",
            "outputs": [
              {
                "internalType": "int256",
                "name": "",
                "type": "int256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address[]",
                "name": "members",
                "type": "address[]"
              },
              {
                "internalType": "uint256[]",
                "name": "amounts",
                "type": "uint256[]"
              },
              {
                "internalType": "string",
                "name": "description",
                "type": "string"
              },
              {
                "internalType": "uint256",
                "name": "interestRate",
                "type": "uint256"
              }
            ],
            "name": "createExpense",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "expenseId",
                "type": "uint256"
              }
            ],
            "name": "deleteExpense",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "expenseId",
                "type": "uint256"
              },
              {
                "internalType": "string",
                "name": "newDescription",
                "type": "string"
              }
            ],
            "name": "editExpense",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "name": "expenses",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
              },
              {
                "internalType": "string",
                "name": "description",
                "type": "string"
              },
              {
                "internalType": "address",
                "name": "owner",
                "type": "address"
              },
              {
                "internalType": "bool",
                "name": "isSettled",
                "type": "bool"
              },
              {
                "internalType": "uint256",
                "name": "interestRate",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "creationTimestamp",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "user",
                "type": "address"
              }
            ],
            "name": "getBalance",
            "outputs": [
              {
                "internalType": "int256",
                "name": "",
                "type": "int256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "owner",
                "type": "address"
              }
            ],
            "name": "getExpensesByOwner",
            "outputs": [
              {
                "components": [
                  {
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                  },
                  {
                    "internalType": "string",
                    "name": "description",
                    "type": "string"
                  },
                  {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                  },
                  {
                    "internalType": "address[]",
                    "name": "involvedMembers",
                    "type": "address[]"
                  },
                  {
                    "internalType": "uint256[]",
                    "name": "amountsOwed",
                    "type": "uint256[]"
                  },
                  {
                    "internalType": "bool",
                    "name": "isSettled",
                    "type": "bool"
                  },
                  {
                    "internalType": "bool[]",
                    "name": "hasPaid",
                    "type": "bool[]"
                  },
                  {
                    "internalType": "uint256",
                    "name": "interestRate",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "creationTimestamp",
                    "type": "uint256"
                  }
                ],
                "internalType": "struct Splitwise.Expense[]",
                "name": "",
                "type": "tuple[]"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "getExpensesOfCaller",
            "outputs": [
              {
                "components": [
                  {
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                  },
                  {
                    "internalType": "string",
                    "name": "description",
                    "type": "string"
                  },
                  {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                  },
                  {
                    "internalType": "address[]",
                    "name": "involvedMembers",
                    "type": "address[]"
                  },
                  {
                    "internalType": "uint256[]",
                    "name": "amountsOwed",
                    "type": "uint256[]"
                  },
                  {
                    "internalType": "bool",
                    "name": "isSettled",
                    "type": "bool"
                  },
                  {
                    "internalType": "bool[]",
                    "name": "hasPaid",
                    "type": "bool[]"
                  },
                  {
                    "internalType": "uint256",
                    "name": "interestRate",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "creationTimestamp",
                    "type": "uint256"
                  }
                ],
                "internalType": "struct Splitwise.Expense[]",
                "name": "",
                "type": "tuple[]"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "expenseId",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "user",
                "type": "address"
              }
            ],
            "name": "markUserAsPaid",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "expenseId",
                "type": "uint256"
              }
            ],
            "name": "settleExpense",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ];
        
        const contractAddress = "0xFEfb209C061d77ac0f043924920d4B64c82D1aF2"; // Replace with your contract address

        const deployedContract = new ethers.Contract(contractAddress, abi, signer);
        setContract(deployedContract);

      } else {
        console.log("Please install MetaMask or connect to an Ethereum wallet");
      }
    }

    initContract();
  }, [walletAddress]);

  console.log(contract);

  return (
    <Router>
      <div>
      <Navbar bg="dark" variant="dark" className="mb-3">
      <Nav className="mr-auto">
        <Link to="/" className="nav-link custom-link">
          Home
        </Link>
        <Link to="/expenses" className="nav-link custom-link">
          Expenses
        </Link>
        <Link to="/myexpenses" className="nav-link custom-link">
          Expenses by You
        </Link>
      </Nav>
      </Navbar>

        <h1>Splitwise Expense Tracker</h1>
        <p>Connected Wallet Address: {walletAddress}</p>

        <Routes>
          <Route path="/" element={<ExpenseForm contract={contract} />} />
          <Route path="/expenses" element={<ExpensePage contract={contract} walletAddress={walletAddress} />} />
          <Route path="/myexpenses" element={<OwnerExpensePage contract={contract} walletAddress={walletAddress} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
