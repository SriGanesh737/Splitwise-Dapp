// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;
contract Splitwise {
    struct Expense {
        uint id;
        string description;
        address owner;
        address[] involvedMembers;
        uint[] amountsOwed;
        bool isSettled;
        bool[] hasPaid;  // Boolean array to track who has paid
    }

    mapping(address => int) public balances;

    Expense[] public expenses;

    event ExpenseCreated(uint expenseId);
    event ExpenseSettled(uint expenseId);
    event PaymentRequest(uint expenseId, address indexed user);


    function createExpense(
        address[] memory members,
        uint[] memory amounts,
        string memory description
    ) public {
        require(members.length == amounts.length, "Mismatched arrays");

        // Create a new expense
        uint newExpenseId = expenses.length;
        expenses.push(Expense(newExpenseId, description, msg.sender, members, amounts, false, new bool[](members.length)));

        // Update balances for the involved members
        for (uint i = 0; i < members.length; i++) {
            balances[members[i]] += int(amounts[i]);
        }

        emit ExpenseCreated(newExpenseId);

        // Send payment requests to each involved member
        for (uint i = 0; i < members.length; i++) {
            if (members[i] != msg.sender) {
                emit PaymentRequest(newExpenseId, members[i]);
            }
        }
    }

function markUserAsPaid(uint expenseId, address user) public {
    require(expenseId < expenses.length, "Expense does not exist");
    require(expenseId >= 0, "Invalid expense ID");
    require(user != address(0), "Invalid user address");

    uint paidCount = 0;

    for (uint i = 0; i < expenses[expenseId].involvedMembers.length; i++) {
        if (expenses[expenseId].involvedMembers[i] == user) {
            require(!expenses[expenseId].hasPaid[i], "User has already been marked as paid");

            // Deduct the user's share from their balance
            balances[user] -= int(expenses[expenseId].amountsOwed[i]);

            expenses[expenseId].hasPaid[i] = true;
        }

        if (expenses[expenseId].hasPaid[i]) {
            paidCount++;
        }
    }

    // Check if all members have paid, and if so, settle the expense
    if (paidCount == expenses[expenseId].involvedMembers.length) {
        settleExpense(expenseId);
    }
}


function settleExpense(uint expenseId) public {
        require(expenseId < expenses.length, "Expense does not exist");
        require(!expenses[expenseId].isSettled, "Expense already settled");

        // Mark expense as settled
        expenses[expenseId].isSettled  = true;

        emit ExpenseSettled(expenseId);
}

function getBalance(address user) public view returns (int) {
        return balances[user];
}
    
function getExpensesOfCaller() public view returns (Expense[] memory) {
    uint count = 0;
    // Count the number of expenses involving the caller
    for (uint i = 0; i < expenses.length; i++) {
        for (uint j = 0; j < expenses[i].involvedMembers.length; j++) {
            if (expenses[i].involvedMembers[j] == msg.sender) {
                count++;
                break;
            }
        }
    }
    
    Expense[] memory callerExpenses = new Expense[](count);
    uint index = 0;

    for (uint i = 0; i < expenses.length; i++) {
        for (uint j = 0; j < expenses[i].involvedMembers.length; j++) {
            if (expenses[i].involvedMembers[j] == msg.sender) {
                callerExpenses[index] = expenses[i];
                index++;
                break;
            }
        }
    }

    return callerExpenses;
}

function editExpense(uint expenseId, string memory newDescription) public {
    // Add the logic to edit the description of an expense
    require(expenseId < expenses.length, "Expense does not exist");
    expenses[expenseId].description = newDescription;
}

function deleteExpense(uint expenseId) public {
    // Add the logic to delete an expense
    require(expenseId < expenses.length, "Expense does not exist");
    delete expenses[expenseId];
}

function getExpensesByOwner(address owner) public view returns (Expense[] memory) {
    uint count = 0;
    // Count the number of expenses owned by the provided address
    for (uint i = 0; i < expenses.length; i++) {
        if (expenses[i].owner == owner) {
            count++;
        }
    }

    Expense[] memory ownerExpenses = new Expense[](count);
    uint index = 0;

    for (uint i = 0; i < expenses.length; i++) {
        if (expenses[i].owner == owner) {
            ownerExpenses[index] = expenses[i];
            index++;
        }
    }

    return ownerExpenses;
}

}
