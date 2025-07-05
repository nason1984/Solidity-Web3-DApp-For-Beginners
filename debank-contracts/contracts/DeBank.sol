// SPDX-License-Identifier: MIT
// This specifies the license for the source code. The MIT License is a popular open-source license
// that allows others to freely use, modify, and distribute the code.

pragma solidity ^0.8.20;
// Declares the Solidity compiler version required for this contract.
// The caret `^` means the code is compatible with version 0.8.20 and up,
// but not including 0.9.0 or later. This ensures your code compiles successfully
// with minor future versions.

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// Imports the IERC20 interface from the OpenZeppelin library.
// IERC20 is a set of functions (interface) that every ERC-20 token must implement.
// Our DeBank contract will not be an ERC-20 token itself, but it will interact
// with the VNDT token (which is an ERC-20), so we need this interface to call VNDT's functions.

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
// Imports the IERC20Metadata interface from the OpenZeppelin library.
// This interface extends IERC20 to include functions for reading metadata such as `name()`, `symbol()`, and `decimals()`.
// We need it to access the `decimals()` function of the VNDT token in the constructor when setting default limits.

import "@openzeppelin/contracts/access/Ownable.sol";
// Imports the Ownable contract from the OpenZeppelin library.
// This contract provides a simple access control mechanism, where there is an 'owner'
// address that has exclusive rights to certain functions (e.g., `mint`, `burn`).

import "@openzeppelin/contracts/utils/Pausable.sol";
// Imports the Pausable library from OpenZeppelin.
// This contract provides functionalities to pause and unpause the contract's operations.
// It includes modifiers like `whenNotPaused` (only runs when not paused) and `whenPaused` (only runs when paused).

import "@openzeppelin/contracts/utils/Strings.sol";
// Imports the Strings library from OpenZeppelin.
// This library provides utility functions for string manipulation, including `toHexString()`
// to convert an address to a hexadecimal string, used for concatenating strings in transaction descriptions.

// SafeMath.sol is not imported because Solidity 0.8.0+ has built-in overflow and underflow checks
// for arithmetic operations on integer types by default.
// This makes `+`, `-`, `*`, `/` operations on `uint256` safer without an additional library.

contract DeBank is Ownable, Pausable {
    // Defines the DeBank contract.
    // `is Ownable`: This contract inherits all functions, variables, and modifiers from the Ownable contract,
    // providing an ownership mechanism and access control.
    // `is Pausable`: This contract inherits all functions, variables, and modifiers from the Pausable contract,
    // enabling the ability to pause and unpause contract operations.

    // `using SafeMath for uint256;` is not needed as SafeMath is no longer imported and basic arithmetic operations are safe.

    // --- State Variables ---
    // State variables are permanently stored on the blockchain.
    // Their values persist across transactions.

    address public bankOwner;
    // The address of the DeBank contract's owner.
    // This owner has the privilege to execute administrative functions.
    // `public` automatically creates a getter function `bankOwner()` to read this value from outside the contract.

    IERC20Metadata public vndToken;
    // An instance of the IERC20Metadata interface, representing the deployed VNDT token smart contract.
    // This variable allows the DeBank contract to interact with the VNDT token contract
    // (e.g., calling `transferFrom`, `transfer`).

    mapping(address => bool) public isAccount;
    // A mapping (a key-value store) to check if an address has an account within the DeBank system.
    // Key: address. Value: boolean (true if the account exists, false otherwise).
    // An account is considered "existing" in DeBank when it performs its first `deposit` transaction.

    mapping(address => uint256) public balances;
    // A mapping storing the VNDT balance of each account within the DeBank contract.
    // Key: user's address. Value: VNDT balance (uint256, in the smallest token units).
    // IMPORTANT NOTE: This balance is the amount of VNDT that the DeBank contract holds ON BEHALF of the user,
    // not the balance directly in their personal wallet (e.g., Metamask).

    uint256 public totalDeposits;
    // The total amount of VNDT currently held by the DeBank contract.
    // This is the sum of all user `balances`.

    uint256 public dailyTransferLimit;
    // The maximum transfer amount that each user can perform within a single day (in the smallest VNDT units).
    // This value can be updated by the `bankOwner`.

    mapping(address => mapping(uint256 => uint256)) public dailyTransferredAmount;
    // A nested mapping to track the total amount a user has transferred on a specific day.
    // Outer Key: user's address.
    // Inner Key: timestamp of the current day (uint256, calculated as `block.timestamp / 1 days`).
    // Value: the total amount transferred on that day (uint256).

    uint256 public transferFeeRate;
    // The transfer fee rate. This value is expressed in "basis points" (one hundredths of a percent).
    // Example: 10000 basis points = 100%. If `transferFeeRate = 10`, the fee is 0.1% (10 / 10000 = 0.001).
    // Can be updated by the `bankOwner`.

    address public feeReceiver;
    // The address that will receive transaction fees. Typically the bank owner's address.
    // Can be updated by the `bankOwner`.

    // A structure (struct) to define the details of a transaction record.
    // These structs are stored in the `accountTransactions` mapping.
    struct Transaction {
        uint256 id;                 // Unique ID for each transaction, automatically increments.
        address from;               // The sender's address for the transaction.
        address to;                 // The recipient's address for the transaction.
        uint256 amount;             // The amount/token of the transaction (before fee deduction for sender, after fee for recipient).
        uint256 timestamp;          // The time the transaction occurred (Unix timestamp).
        string txType;              // Type of transaction: "Deposit", "Withdraw", "TransferOut", "TransferIn", "SavingsDeposit", etc.
        string description;         // A brief description of the transaction, including a shortened address for readability.
    }

    mapping(address => Transaction[]) public accountTransactions;
    // A mapping to store the transaction history for each account.
    // Key: user's address. Value: an array of Transaction structs.

    uint256 public nextTransactionId;
    // A counter used to generate unique IDs for each new transaction.
    // Increments after each transaction is recorded.

    // --- Components for Savings Functionality (Advanced) ---
    // Structure to store information about each user's savings account.
    struct SavingsAccount {
        uint256 amount;             // The principal amount deposited for savings.
        uint256 startTime;          // The timestamp of the block when the savings deposit began.
        uint256 durationMonths;     // The duration of the savings term in months (e.g., 3, 6, 12 months).
        uint256 interestRate;       // The annual interest rate (in basis points) applied to this savings account at the time of deposit.
        bool isActive;              // The status of the savings account (true: active/not yet withdrawn, false: withdrawn).
    }
    mapping(address => SavingsAccount[]) public userSavingsAccounts; // Mapping storing each user's savings accounts.
    // Key: user's address. Value: an array of SavingsAccount structs.

    uint256 public savingsInterestRate; // The global annual interest rate (in basis points) for new savings deposits.
    // This value can be updated by the `bankOwner`.


    // --- Events ---
    // Events are how smart contracts "announce" what has happened on the blockchain.
    // They are recorded in blockchain logs and can be listened to by frontend applications to update the UI in real-time.
    // The `indexed` keyword helps optimize searching and filtering events in logs.

    event AccountOpened(address indexed account);
    // Emitted when a new account is opened in DeBank (first interaction, e.g., deposit).

    event Deposited(address indexed account, uint256 amount, uint256 balance);
    // Emitted when a user deposits VNDT into DeBank.
    // `account`: the sender's address. `amount`: the deposited amount. `balance`: the new account balance.

    event Withdrawn(address indexed account, uint256 amount, uint256 balance);
    // Emitted when a user withdraws VNDT from DeBank.
    // `account`: the withdrawer's address. `amount`: the withdrawn amount. `balance`: the new account balance.

    event Transferred(address indexed from, address indexed to, uint256 amount, uint256 fee);
    // Emitted when VNDT is transferred between accounts within DeBank.
    // `from`: sender's address. `to`: recipient's address. `amount`: transferred amount. `fee`: collected fee.

    event DailyLimitUpdated(uint256 newLimit);
    // Emitted when the daily transfer limit is updated by the owner.

    event FeeRateUpdated(uint256 newRate);
    // Emitted when the transfer fee rate is updated by the owner.

    event FeeReceiverUpdated(address indexed newReceiver);
    // Emitted when the fee recipient address is updated by the owner.

    event SavingsDeposited(address indexed account, uint256 amount, uint256 durationMonths);
    // Emitted when a user deposits funds into a savings account.
    // `account`: depositor's address. `amount`: deposited amount. `durationMonths`: savings term.

    event SavingsWithdrawn(address indexed account, uint256 amount, uint256 interestEarned);
    // Emitted when a user withdraws funds from a savings account, including earned interest.

    // --- Constructor ---
    // This function is executed ONLY ONCE when the contract is deployed to the blockchain.
    // It is used to initialize the contract's initial state variables.
    constructor(address _vndTokenAddress) Ownable(msg.sender) Pausable() {
        // `Ownable(msg.sender)`: Calls the Ownable contract's constructor to set the contract deployer's address
        // (`msg.sender`) as the owner of this DeBank contract.
        // `Pausable()`: Calls the Pausable contract's constructor. (It does not take an argument in OZ v5.x).
        
        bankOwner = msg.sender;
        // Assigns the `bankOwner` variable to the address of the contract deployer.

        vndToken = IERC20Metadata(_vndTokenAddress);
        // Initializes the `vndToken` variable by casting the `_vndTokenAddress`
        // to an IERC20Metadata object. This allows the DeBank contract to call ERC20 functions
        // on the VNDT token contract.

        // Sets the initial default values for state variables:
        dailyTransferLimit = 1_000_000_000 * (10 ** vndToken.decimals());
        // Sets the default daily transfer limit to 1 billion VNDT.
        // `10 ** vndToken.decimals()` converts the human-readable amount (1 billion VNDT)
        // to the smallest unit used by the token (e.g., 10^18 if decimals is 18).

        transferFeeRate = 10;
        // Sets the default transfer fee rate to 0.1% (10 basis points).

        feeReceiver = msg.sender;
        // The default fee recipient address is the address of the DeBank contract's owner.

        nextTransactionId = 1;
        // Initializes the next transaction ID to 1.

        savingsInterestRate = 500; // Default annual interest rate for savings is 5% (500 basis points).
    }

    // --- Modifiers ---
    // Modifiers are functions attached to other functions to add conditional checks before
    // the main function's code is executed. If the condition is not met, the transaction will revert.
    // This helps in code reuse and enhances contract security.

    modifier onlyBankOwner() {
        // This modifier ensures that only the `bankOwner` (the contract deployer) can call the function.
        require(msg.sender == bankOwner, "DeBank: Only bank owner can call this function");
        // `require`: checks a condition. If the condition is false, the transaction will revert with an error message.
        _; // The underscore is where the main function's code will be inserted and executed.
    }

    modifier accountExists(address _account) {
        // This modifier checks if the `_account` exists (has interacted/deposited before) in the DeBank system.
        require(isAccount[_account], "DeBank: Account does not exist");
        _;
    }

    modifier sufficientBalance(uint256 _amount) {
        // This modifier checks if the function caller (`msg.sender`) has sufficient balance (`balances[msg.sender]`)
        // to perform the transaction with the given `_amount`.
        // In Solidity 0.8.0+, subtraction will automatically revert if the result is negative (underflow),
        // so checking `balances[msg.sender] >= _amount` is safe and necessary.
        require(balances[msg.sender] >= _amount, "DeBank: Insufficient balance");
        _;
    }

    modifier notZeroAddress(address _addr) {
        // This modifier ensures that the `_addr` is not the "zero address" (0x0).
        // The zero address is a special address often used as a default value or a burn address.
        // Sending funds to 0x0 is equivalent to burning them.
        require(_addr != address(0), "DeBank: Zero address not allowed");
        _;
    }

    modifier checkDailyLimit(address _sender, uint256 _amount) {
        // This modifier checks if adding `_amount` to the `_sender`'s total transferred amount for the day
        // exceeds the `dailyTransferLimit`.
        uint256 today = block.timestamp / 1 days; // Calculates the timestamp of the current day (rounded down to the day).
        // `1 days` is a global constant equivalent to 24 * 60 * 60 seconds.
        // Integer division truncates the hours/minutes/seconds part, keeping only the day part.
        require(dailyTransferredAmount[_sender][today] + _amount <= dailyTransferLimit, "DeBank: Daily transfer limit exceeded");
        _;
    }

    // --- User Functions ---
    // These are functions that regular users can call to interact with the bank.

    /**
     * @dev Allows a user to deposit VNDT into their DeBank account.
     * The user MUST have called the `approve()` function on the VNDT contract beforehand
     * to grant the DeBank contract permission to move a specific amount of VNDT from their wallet.
     * If no `approve` call was made or the approved amount is insufficient, the `transferFrom`
     * transaction will fail.
     * @param _amount The amount of VNDT to deposit (in the token's smallest units).
     */
    function deposit(uint256 _amount) public notZeroAddress(msg.sender) whenNotPaused {
        // `public`: the function can be called from anywhere.
        // `notZeroAddress(msg.sender)`: uses a modifier to ensure the caller is not the zero address.
        // `whenNotPaused`: modifier from Pausable, ensures the function only runs when the contract is not paused.
        require(_amount > 0, "DeBank: Deposit amount must be greater than zero");
        // Ensures the deposit amount is greater than 0 to prevent meaningless transactions.

        // If this is the first time this account interacts with DeBank (not yet in `isAccount`),
        // marks it as an existing account and emits an `AccountOpened` event.
        if (!isAccount[msg.sender]) {
            isAccount[msg.sender] = true;
            emit AccountOpened(msg.sender); // Emits an event signaling a new account has been opened.
        }

        // Transfers VNDT from the user's wallet (msg.sender) to the DeBank contract (address(this)).
        // This command ONLY SUCCEEDS if the user has previously called `vndToken.approve(DeBankContractAddress, _amount)`.
        require(vndToken.transferFrom(msg.sender, address(this), _amount), "DeBank: VNDT transferFrom failed. Did you approve enough?");
        // `address(this)`: refers to the DeBank contract's own address.

        // Updates the user's VNDT balance within the DeBank contract.
        balances[msg.sender] = balances[msg.sender] + _amount; // Uses native addition.
        // Updates the total amount of VNDT held by the DeBank contract.
        totalDeposits = totalDeposits + _amount; // Uses native addition.

        // Records the transaction in the sender's history.
        accountTransactions[msg.sender].push(
            Transaction({
                id: nextTransactionId++, // Uses and increments a unique transaction ID.
                from: msg.sender,
                to: address(this), // The DeBank contract's address is the recipient in a deposit transaction.
                amount: _amount,
                timestamp: block.timestamp, // The time of the transaction (Unix timestamp).
                txType: "Deposit", // Transaction type: "Deposit".
                description: "Deposit to DeBank account" // Brief description.
            })
        );
        emit Deposited(msg.sender, _amount, balances[msg.sender]);
        // Emits the `Deposited` event for the frontend to listen to and update the UI.
    }

    /**
     * @dev Allows a user to withdraw VNDT from their DeBank account to their personal wallet.
     * @param _amount The amount of VNDT to withdraw (in the token's smallest units).
     */
    function withdraw(uint256 _amount) public accountExists(msg.sender) sufficientBalance(_amount) whenNotPaused {
        // `accountExists(msg.sender)`: Ensures the caller has an account in DeBank.
        // `sufficientBalance(_amount)`: Ensures the caller has enough balance in DeBank to withdraw.
        // `whenNotPaused`: Ensures the function only runs when the contract is not paused.
        require(_amount > 0, "DeBank: Withdraw amount must be greater than zero");
        // Ensures the withdrawal amount is greater than 0.

        // Decreases the user's balance within the DeBank contract.
        balances[msg.sender] = balances[msg.sender] - _amount; // Uses native subtraction.

        // Transfers VNDT from the DeBank contract to the user's personal wallet.
        require(vndToken.transfer(msg.sender, _amount), "DeBank: VNDT transfer failed during withdrawal");

        // Decreases the total amount of VNDT held by the DeBank contract (as funds leave the contract).
        totalDeposits = totalDeposits - _amount; // Uses native subtraction.

        // Records the transaction in the withdrawer's history.
        accountTransactions[msg.sender].push(
            Transaction({
                id: nextTransactionId++,
                from: address(this), // The DeBank contract's address is the sender in a withdrawal transaction.
                to: msg.sender,
                amount: _amount,
                timestamp: block.timestamp,
                txType: "Withdraw",
                description: "Withdraw from DeBank account"
            })
        );
        emit Withdrawn(msg.sender, _amount, balances[msg.sender]);
        // Emits the `Withdrawn` event for the frontend to listen to.
    }

    /**
     * @dev Allows a user to transfer VNDT to another account within the DeBank system.
     * Applies a daily transfer limit and calculates a transaction fee.
     * @param _to The recipient's address.
     * @param _amount The amount of VNDT to transfer (in the token's smallest units).
     */
    function transfer(address _to, uint256 _amount)
        public
        accountExists(msg.sender) // Ensures the sender has an account in DeBank.
        notZeroAddress(_to)        // Ensures the recipient's address is not the zero address.
        sufficientBalance(_amount) // Ensures the sender has enough balance in DeBank.
        checkDailyLimit(msg.sender, _amount) // Checks the daily transfer limit.
        whenNotPaused // Ensures the function only runs when the contract is not paused.
    {
        require(_amount > 0, "DeBank: Transfer amount must be greater than zero");
        require(msg.sender != _to, "DeBank: Cannot transfer to yourself");
        // Ensures sender and recipient are not the same address to prevent unnecessary transactions.

        // Calculates the transaction fee.
        // Fee = (amount * fee_rate) / 10000 (since fee_rate is in basis points).
        uint256 fee = _amount * transferFeeRate / 10000; // Uses native multiplication and division.
        // The actual amount the recipient will receive after deducting the fee.
        uint256 amountAfterFee = _amount - fee; // Uses native subtraction.

        // Decreases the sender's balance by the TOTAL amount (including fee) within the DeBank contract.
        balances[msg.sender] = balances[msg.sender] - _amount; // Uses native subtraction.

        // If the recipient does not yet have an account in DeBank, creates a new account for them.
        if (!isAccount[_to]) {
            isAccount[_to] = true;
            emit AccountOpened(_to); // Emits an event signaling a new account has been opened.
        }
        // Increases the recipient's balance by the amount received after fee deduction.
        balances[_to] = balances[_to] + amountAfterFee; // Uses native addition.

        // Transfers the transaction fee to the `feeReceiver` address.
        if (fee > 0) {
            // Only transfers the fee if it's greater than 0.
            // `vndToken.transfer` is a function that sends tokens from the DeBank contract to the fee recipient address.
            require(vndToken.transfer(feeReceiver, fee), "DeBank: Failed to transfer fee to receiver");
        }

        // Updates the sender's total transferred amount for the current day to enforce the daily limit.
        uint256 today = block.timestamp / 1 days; // Gets the timestamp of the current day.
        dailyTransferredAmount[msg.sender][today] = dailyTransferredAmount[msg.sender][today] + _amount; // Accumulates the transferred amount.

        // Records the transaction in the SENDER's history.
        accountTransactions[msg.sender].push(
            Transaction({
                id: nextTransactionId++, // Uses and increments a unique transaction ID.
                from: msg.sender,
                to: _to,
                amount: _amount, // Records the original amount (before fee) for the sender.
                timestamp: block.timestamp,
                txType: "TransferOut",
                description: string.concat("Transfer to ", Strings.toHexString(_to)) // Concatenates strings for a detailed description.
            })
        );
        // Records the transaction in the RECIPIENT's history.
        accountTransactions[_to].push(
            Transaction({
                id: nextTransactionId++,
                from: msg.sender,
                to: _to,
                amount: amountAfterFee, // Records the actual amount received for the recipient.
                timestamp: block.timestamp,
                txType: "TransferIn",
                description: string.concat("Received from ", Strings.toHexString(msg.sender))
            })
        );
        emit Transferred(msg.sender, _to, _amount, fee);
        // Emits the `Transferred` event for the frontend to listen to.
    }

    /**
     * @dev Returns the VNDT balance of a specific account within the DeBank system.
     * @param _account The address of the account to check the balance for.
     * @return The balance of that account (uint256).
     */
    function getBalance(address _account) public view returns (uint256) {
        // `view`: This function does not modify the blockchain state; it only reads data.
        // Therefore, calling a `view` function does not cost gas (when called externally).
        // This function does not require `accountExists` so it can return 0 for non-existent accounts.
        return balances[_account];
    }

    /**
     * @dev Returns the entire transaction history for a specific account.
     * This function requires the account to exist (have made at least one deposit).
     * @param _account The address of the account.
     * @return An array of Transaction structs representing the transaction history.
     */
    function getAccountTransactionHistory(address _account) public view accountExists(_account) returns (Transaction[] memory) {
        // `memory`: Specifies that the returned array is a temporary copy in memory,
        // not permanently stored in the contract's storage.
        // This function requires the account to exist because querying history for a non-existent account is meaningless.
        return accountTransactions[_account];
    }

    /**
     * @dev Returns the total amount transferred by a user on the current day.
     * @param _account The address of the account.
     * @return The total amount transferred today.
     */
    function getDailyTransferredAmount(address _account) public view returns (uint256) {
        uint256 today = block.timestamp / 1 days;
        return dailyTransferredAmount[_account][today];
    }

    /**
     * @dev Allows a user to deposit VNDT into a fixed-term savings account.
     * The deposited amount will be locked within the contract and cannot be withdrawn until the term ends.
     * @param _amount The amount of VNDT to deposit into savings (in the token's smallest units).
     * @param _durationMonths The duration of the savings term in months (e.g., 3, 6, 12).
     */
    function depositSavings(uint256 _amount, uint256 _durationMonths) public accountExists(msg.sender) sufficientBalance( _amount) whenNotPaused {
        require(_amount > 0, "DeBank: Savings deposit amount must be greater than zero");
        require(_durationMonths > 0 && _durationMonths <= 60, "DeBank: Savings duration must be between 1 and 60 months"); // Limits the term to prevent overflow issues with large numbers.

        // Decreases the user's main balance (funds are moved from `balances` to `userSavingsAccounts`).
        // The balance in `balances` decreases, but `totalDeposits` does not change because the funds remain within the contract;
        // only their management status changes (from transactional balance to savings balance).
        balances[msg.sender] = balances[msg.sender] - _amount;

        // Records the new savings account information in the user's `userSavingsAccounts` array.
        userSavingsAccounts[msg.sender].push(
            SavingsAccount({
                amount: _amount,
                startTime: block.timestamp, // The timestamp when interest calculation begins.
                durationMonths: _durationMonths,
                interestRate: savingsInterestRate, // Uses the current global interest rate.
                isActive: true // Marks the savings account as active.
            })
        );

        // Records the transaction in the sender's history.
        accountTransactions[msg.sender].push(
            Transaction({
                id: nextTransactionId++,
                from: msg.sender,
                to: address(this), // Represents the internal savings account (funds remain within the contract).
                amount: _amount,
                timestamp: block.timestamp,
                txType: "SavingsDeposit",
                description: string.concat("Deposit to savings for ", Strings.toString(_durationMonths), " months")
            })
        );
        emit SavingsDeposited(msg.sender, _amount, _durationMonths); // Emits the `SavingsDeposited` event.
    }

    /**
     * @dev Allows a user to withdraw funds from a savings account after the term has ended.
     * The principal amount and earned interest will be transferred back to the user's main balance.
     * @param _index The index of the savings account within the user's `userSavingsAccounts` array.
     */
    function withdrawSavings(uint256 _index) public accountExists(msg.sender) whenNotPaused {
        // Retrieves a reference to the specific savings account.
        require(_index < userSavingsAccounts[msg.sender].length, "DeBank: Invalid savings account index"); // Checks if the index is valid.
        SavingsAccount storage sAccount = userSavingsAccounts[msg.sender][_index];
        
        require(sAccount.isActive, "DeBank: Savings account is not active"); // Ensures the savings account is active.

        // Calculates the end time of the savings term.
        // Uses 30 days per month for simplicity; can use exact seconds in a month if needed.
        uint256 endTime = sAccount.startTime + (sAccount.durationMonths * 30 days);
        require(block.timestamp >= endTime, "DeBank: Savings period has not ended yet"); // Ensures the term has ended.

        // Calculates the interest earned (simple annual interest, prorated by month).
        // Interest = (amount * interest_rate / 10000) * (duration_months / 12)
        // The final division by `/ 12` converts the annual interest rate to a monthly rate corresponding to the term.
        uint256 interestEarned = (sAccount.amount * sAccount.interestRate / 10000) * sAccount.durationMonths / 12;
        uint256 totalAmount = sAccount.amount + interestEarned; // Total amount = principal + interest.

        // Transfers the total amount (principal + interest) back to the user's main balance.
        balances[msg.sender] = balances[msg.sender] + totalAmount;
        sAccount.isActive = false; // Marks the savings account as withdrawn.

        // Records the savings withdrawal transaction in the history.
        accountTransactions[msg.sender].push(
            Transaction({
                id: nextTransactionId++,
                from: address(this), // Represents the DeBank contract (source of interest payment).
                to: msg.sender,
                amount: totalAmount,
                timestamp: block.timestamp,
                txType: "SavingsWithdrawal",
                description: string.concat("Withdrawal from savings, interest earned: ", Strings.toString(interestEarned / (10 ** vndToken.decimals()))) // Displays earned interest.
            })
        );
        emit SavingsWithdrawn(msg.sender, sAccount.amount, interestEarned); // Emits the `SavingsWithdrawn` event.
    }


    // --- Admin Functions ---
    // These functions are protected by the `onlyBankOwner` modifier to ensure security and control.
    // They also use modifiers from Pausable to ensure proper operation based on the paused state.

    function pause() public onlyBankOwner whenNotPaused {
        // Can only pause the contract if the caller is the bankOwner and the contract is not already paused.
        _pause(); // Internal function from Pausable, performs the contract pausing.
    }

    function unpause() public onlyBankOwner whenPaused {
        // Can only unpause the contract if the caller is the bankOwner and the contract is currently paused.
        _unpause(); // Internal function from Pausable, performs the contract unpausing.
    }

    function setDailyTransferLimit(uint256 _newLimit) public onlyBankOwner {
        require(_newLimit > 0, "DeBank: Daily limit must be greater than zero"); // The limit must be greater than 0.
        dailyTransferLimit = _newLimit; // Updates the state variable.
        emit DailyLimitUpdated(_newLimit); // Emits an event signaling the change.
    }

    function setFeeRate(uint256 _newRate) public onlyBankOwner {
        require(_newRate <= 10000, "DeBank: Fee rate cannot exceed 100%"); // Ensures the fee rate does not exceed 100% (10000 basis points).
        transferFeeRate = _newRate; // Updates the state variable.
        emit FeeRateUpdated(_newRate); // Emits an event signaling the change.
    }

    function setFeeReceiver(address _newReceiver) public onlyBankOwner notZeroAddress(_newReceiver) {
        feeReceiver = _newReceiver; // Updates the state variable.
        emit FeeReceiverUpdated(_newReceiver); // Emits an event signaling the change.
    }

    function recoverVNDT(uint256 _amount) public onlyBankOwner {
        // This function allows the bank owner to recover any VNDT accidentally sent directly
        // to the DeBank contract address without going through the `deposit` function (e.g., user sent to wrong address).
        // This is a safety mechanism to retrieve stuck assets.
        require(vndToken.balanceOf(address(this)) >= _amount, "DeBank: Not enough VNDT in contract to recover"); // Ensures the contract has enough funds to recover.
        require(vndToken.transfer(bankOwner, _amount), "DeBank: Failed to recover VNDT"); // Transfers VNDT to the bankOwner's wallet.
    }

    /**
     * @dev Sets the global annual interest rate for new savings accounts.
     * Only the bank owner (`bankOwner`) can call this function.
     * @param _newRate The new annual interest rate in basis points (e.g., 500 = 5%).
     */
    function setSavingsInterestRate(uint256 _newRate) public onlyBankOwner {
        savingsInterestRate = _newRate; // Updates the global savings interest rate.
    }
}
```
<br>
```solidity
// SPDX-License-Identifier: MIT
// This specifies the license for the source code. The MIT License is a popular open-source license
// that allows others to freely use, modify, and distribute the code.

pragma solidity ^0.8.20;
// Declares the Solidity compiler version required for this contract.
// The caret `^` means the code is compatible with version 0.8.20 and up,
// but not including 0.9.0 or later. This ensures your code compiles successfully
// with minor future versions.

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// Imports the ERC20 contract from the OpenZeppelin library.
// This contract provides a standard implementation of the ERC-20 token standard,
// including functions like `transfer`, `balanceOf`, `approve`, `transferFrom`, etc.

import "@openzeppelin/contracts/access/Ownable.sol";
// Imports the Ownable contract from the OpenZeppelin library.
// This contract provides a basic access control mechanism, where there is an 'owner'
// address that has exclusive rights to certain functions (e.g., `mint`, `burn`).

contract VNDT is ERC20, Ownable {
    // Defines the VNDT (Vietnam Dong Token) contract.
    // `is ERC20`: Inherits all functions and state variables from the ERC20 standard.
    // `is Ownable`: Inherits the ownership features, making the deployer the owner.

    // Constructor: This function is executed only once when the contract is deployed to the blockchain.
    // It initializes the token's name, symbol, and mints the initial supply to the deployer.
    constructor()
        ERC20("Vietnam Dong Token", "VNDT") // Calls the ERC20 constructor to set the token's name and symbol.
        Ownable(msg.sender) // Calls the Ownable constructor, setting the contract deployer (msg.sender) as the owner.
    {
        // Mints the initial supply of 1,000,000,000 VNDT to the contract deployer (msg.sender).
        // `1_000_000_000` is the human-readable amount.
        // `(10 ** decimals())` converts this human-readable amount to the smallest unit of the token (wei-like units).
        // ERC20 tokens typically have 18 decimals, so 1,000,000,000 * 10^18 = 10^27 smallest units.
        _mint(msg.sender, 1_000_000_000 * (10 ** decimals()));
    }

    // Function to mint (create) new tokens.
    // Only the contract owner can call this function.
    // This will be used to issue new VNDT for testing purposes or as part of a controlled supply mechanism.
    // @param to The address to which new tokens will be minted.
    // @param amount The amount of new tokens to mint (in smallest units).
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount); // Calls the internal `_mint` function from the ERC20 contract.
    }

    // Function to burn (destroy) tokens.
    // Only the contract owner can call this function.
    // This can be used in scenarios where tokens need to be removed from circulation (e.g., in a redemption process).
    // @param amount The amount of tokens to burn from the caller's balance (in smallest units).
    function burn(uint256 amount) public onlyOwner {
        _burn(msg.sender, amount); // Calls the internal `_burn` function from the ERC20 contract.
    }
}
```
<br>
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract DeBank is Ownable, Pausable {
    // --- State Variables ---
    address public bankOwner;
    IERC20Metadata public vndToken;
    mapping(address => bool) public isAccount;
    mapping(address => uint256) public balances;
    uint256 public totalDeposits;
    uint256 public dailyTransferLimit;
    mapping(address => mapping(uint256 => uint256)) public dailyTransferredAmount;
    uint256 public transferFeeRate;
    address public feeReceiver;

    struct Transaction {
        uint256 id;
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        string txType;
        string description;
    }

    mapping(address => Transaction[]) public accountTransactions;
    uint256 public nextTransactionId;

    struct SavingsAccount {
        uint256 amount;
        uint256 startTime;
        uint256 durationMonths;
        uint256 interestRate;
        bool isActive;
    }
    mapping(address => SavingsAccount[]) public userSavingsAccounts;
    uint256 public savingsInterestRate;


    // --- Sự kiện (Events) ---
    event AccountOpened(address indexed account);
    event Deposited(address indexed account, uint256 amount, uint256 balance);
    event Withdrawn(address indexed account, uint256 amount, uint256 balance);
    event Transferred(address indexed from, address indexed to, uint256 amount, uint256 fee);
    event DailyLimitUpdated(uint256 newLimit);
    event FeeRateUpdated(uint256 newRate);
    event FeeReceiverUpdated(address indexed newReceiver);
    event SavingsDeposited(address indexed account, uint256 amount, uint256 durationMonths);
    event SavingsWithdrawn(address indexed account, uint256 amount, uint256 interestEarned);


    // --- Constructor ---
    constructor(address _vndTokenAddress) Ownable(msg.sender) Pausable() {
        bankOwner = msg.sender;
        vndToken = IERC20Metadata(_vndTokenAddress);
        dailyTransferLimit = 1_000_000_000 * (10 ** vndToken.decimals());
        transferFeeRate = 10;
        feeReceiver = msg.sender;
        nextTransactionId = 1;
        savingsInterestRate = 500;
    }

    // --- Bộ Biến Đổi (Modifiers) ---
    modifier onlyBankOwner() {
        require(msg.sender == bankOwner, "DeBank: Only bank owner can call this function");
        _;
    }

    modifier accountExists(address _account) {
        require(isAccount[_account], "DeBank: Account does not exist");
        _;
    }

    modifier sufficientBalance(uint256 _amount) {
        require(balances[msg.sender] >= _amount, "DeBank: Insufficient balance");
        _;
    }

    modifier notZeroAddress(address _addr) {
        require(_addr != address(0), "DeBank: Zero address not allowed");
        _;
    }

    modifier checkDailyLimit(address _sender, uint256 _amount) {
        uint256 today = block.timestamp / 1 days;
        require(dailyTransferredAmount[_sender][today] + _amount <= dailyTransferLimit, "DeBank: Daily transfer limit exceeded");
        _;
    }

    // --- Hàm Người Dùng (User Functions) ---
    function deposit(uint256 _amount) public notZeroAddress(msg.sender) whenNotPaused {
        require(_amount > 0, "DeBank: Deposit amount must be greater than zero");
        if (!isAccount[msg.sender]) {
            isAccount[msg.sender] = true;
            emit AccountOpened(msg.sender);
        }
        require(vndToken.transferFrom(msg.sender, address(this), _amount), "DeBank: VNDT transferFrom failed. Did you approve enough?");
        balances[msg.sender] = balances[msg.sender] + _amount;
        totalDeposits = totalDeposits + _amount;
        accountTransactions[msg.sender].push(
            Transaction({
                id: nextTransactionId++,
                from: msg.sender,
                to: address(this),
                amount: _amount,
                timestamp: block.timestamp,
                txType: "Deposit",
                description: "Deposit to DeBank account"
            })
        );
        emit Deposited(msg.sender, _amount, balances[msg.sender]);
    }

    function withdraw(uint256 _amount) public accountExists(msg.sender) sufficientBalance(_amount) whenNotPaused {
        require(_amount > 0, "DeBank: Withdraw amount must be greater than zero");
        balances[msg.sender] = balances[msg.sender] - _amount;
        require(vndToken.transfer(msg.sender, _amount), "DeBank: VNDT transfer failed during withdrawal");
        totalDeposits = totalDeposits - _amount;
        accountTransactions[msg.sender].push(
            Transaction({
                id: nextTransactionId++,
                from: address(this),
                to: msg.sender,
                amount: _amount,
                timestamp: block.timestamp,
                txType: "Withdraw",
                description: "Withdraw from DeBank account"
            })
        );
        emit Withdrawn(msg.sender, _amount, balances[msg.sender]);
    }

    function transfer(address _to, uint256 _amount)
        public
        accountExists(msg.sender)
        notZeroAddress(_to)
        sufficientBalance(_amount)
        checkDailyLimit(msg.sender, _amount)
        whenNotPaused
    {
        require(_amount > 0, "DeBank: Transfer amount must be greater than zero");
        require(msg.sender != _to, "DeBank: Cannot transfer to yourself");

        uint256 fee = _amount * transferFeeRate / 10000;
        uint256 amountAfterFee = _amount - fee;

        balances[msg.sender] = balances[msg.sender] - _amount;

        if (!isAccount[_to]) {
            isAccount[_to] = true;
            emit AccountOpened(_to);
        }
        balances[_to] = balances[_to] + amountAfterFee;

        if (fee > 0) {
            require(vndToken.transfer(feeReceiver, fee), "DeBank: Failed to transfer fee to receiver");
        }

        uint256 today = block.timestamp / 1 days;
        dailyTransferredAmount[msg.sender][today] = dailyTransferredAmount[msg.sender][today] + _amount;

        accountTransactions[msg.sender].push(
            Transaction({
                id: nextTransactionId++,
                from: msg.sender,
                to: _to,
                amount: _amount,
                timestamp: block.timestamp,
                txType: "TransferOut",
                description: string.concat("Transfer to ", Strings.toHexString(_to))
            })
        );
        accountTransactions[_to].push(
            Transaction({
                id: nextTransactionId++,
                from: msg.sender,
                to: _to,
                amount: amountAfterFee,
                timestamp: block.timestamp,
                txType: "TransferIn",
                description: string.concat("Received from ", Strings.toHexString(msg.sender))
            })
        );
        emit Transferred(msg.sender, _to, _amount, fee);
    }

    function getBalance(address _account) public view returns (uint256) {
        return balances[_account];
    }

    function getAccountTransactionHistory(address _account) public view accountExists(_account) returns (Transaction[] memory) {
        return accountTransactions[_account];
    }

    function getDailyTransferredAmount(address _account) public view returns (uint256) {
        uint256 today = block.timestamp / 1 days;
        return dailyTransferredAmount[_account][today];
    }

    function depositSavings(uint256 _amount, uint256 _durationMonths) public accountExists(msg.sender) sufficientBalance( _amount) whenNotPaused {
        require(_amount > 0, "DeBank: Savings deposit amount must be greater than zero");
        require(_durationMonths > 0 && _durationMonths <= 60, "DeBank: Savings duration must be between 1 and 60 months");

        balances[msg.sender] = balances[msg.sender] - _amount;

        userSavingsAccounts[msg.sender].push(
            SavingsAccount({
                amount: _amount,
                startTime: block.timestamp,
                durationMonths: _durationMonths,
                interestRate: savingsInterestRate,
                isActive: true
            })
        );

        accountTransactions[msg.sender].push(
            Transaction({
                id: nextTransactionId++,
                from: msg.sender,
                to: address(this),
                amount: _amount,
                timestamp: block.timestamp,
                txType: "SavingsDeposit",
                description: string.concat("Deposit to savings for ", Strings.toString(_durationMonths), " months")
            })
        );
        emit SavingsDeposited(msg.sender, _amount, _durationMonths);
    }

    function withdrawSavings(uint256 _index) public accountExists(msg.sender) whenNotPaused {
        require(_index < userSavingsAccounts[msg.sender].length, "DeBank: Invalid savings account index");
        SavingsAccount storage sAccount = userSavingsAccounts[msg.sender][_index];
        
        require(sAccount.isActive, "DeBank: Savings account is not active");

        uint256 endTime = sAccount.startTime + (sAccount.durationMonths * 30 days);
        require(block.timestamp >= endTime, "DeBank: Savings period has not ended yet");

        uint256 interestEarned = (sAccount.amount * sAccount.interestRate / 10000) * sAccount.durationMonths / 12;
        uint256 totalAmount = sAccount.amount + interestEarned;

        balances[msg.sender] = balances[msg.sender] + totalAmount;
        sAccount.isActive = false;

        accountTransactions[msg.sender].push(
            Transaction({
                id: nextTransactionId++,
                from: address(this),
                to: msg.sender,
                amount: totalAmount,
                timestamp: block.timestamp,
                txType: "SavingsWithdrawal",
                description: string.concat("Withdrawal from savings, interest earned: ", Strings.toString(interestEarned / (10 ** vndToken.decimals())))
            })
        );
        emit SavingsWithdrawn(msg.sender, sAccount.amount, interestEarned);
    }


    function pause() public onlyBankOwner whenNotPaused {
        _pause();
    }

    function unpause() public onlyBankOwner whenPaused {
        _unpause();
    }

    function setDailyTransferLimit(uint256 _newLimit) public onlyBankOwner {
        require(_newLimit > 0, "DeBank: Daily limit must be greater than zero");
        dailyTransferLimit = _newLimit;
        emit DailyLimitUpdated(_newLimit);
    }

    function setFeeRate(uint256 _newRate) public onlyBankOwner {
        require(_newRate <= 10000, "DeBank: Fee rate cannot exceed 100%");
        transferFeeRate = _newRate;
        emit FeeRateUpdated(_newRate);
    }

    function setFeeReceiver(address _newReceiver) public onlyBankOwner notZeroAddress(_newReceiver) {
        feeReceiver = _newReceiver;
        emit FeeReceiverUpdated(_newReceiver);
    }

    function recoverVNDT(uint256 _amount) public onlyBankOwner {
        require(vndToken.balanceOf(address(this)) >= _amount, "DeBank: Not enough VNDT in contract to recover");
        require(vndToken.transfer(bankOwner, _amount), "DeBank: Failed to recover VNDT");
    }

    function setSavingsInterestRate(uint256 _newRate) public onlyBankOwner {
        savingsInterestRate = _newRate;
    }
}
```
Chào bạn, tôi đã nắm được yêu cầu của bạn. Chúng ta sẽ cập nhật file `DeBank.sol` để chuyển toàn bộ các comment sang tiếng Anh, theo kế hoạch quốc tế hóa dự án của bạn.

Dưới đây là mã nguồn của `DeBank.sol` với tất cả các comment đã được dịch sang tiếng Anh.

### **Bước 1: Cập nhật `debank-contracts/contracts/DeBank.sol`**

**Vui lòng cập nhật toàn bộ nội dung của file `debank-contracts/contracts/DeBank.sol` của bạn bằng mã nguồn dưới đây:**


```solidity
// SPDX-License-Identifier: MIT
// This specifies the license for the source code. The MIT License is a popular open-source license
// that allows others to freely use, modify, and distribute the code.

pragma solidity ^0.8.20;
// Declares the Solidity compiler version required for this contract.
// The caret `^` means the code is compatible with version 0.8.20 and up,
// but not including 0.9.0 or later. This ensures your code compiles successfully
// with minor future versions.

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// Imports the IERC20 interface from the OpenZeppelin library.
// IERC20 is a set of functions (interface) that every ERC-20 token must implement.
// Our DeBank contract will not be an ERC-20 token itself, but it will interact
// with the VNDT token (which is an ERC-20), so we need this interface to call VNDT's functions.

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
// Imports the IERC20Metadata interface from the OpenZeppelin library.
// This interface extends IERC20 to include functions for reading metadata such as `name()`, `symbol()`, and `decimals()`.
// We need it to access the `decimals()` function of the VNDT token in the constructor when setting default limits.

import "@openzeppelin/contracts/access/Ownable.sol";
// Imports the Ownable contract from the OpenZeppelin library.
// This contract provides a basic access control mechanism, where there is an 'owner'
// address that has exclusive rights to certain functions (e.g., `mint`, `burn`).

import "@openzeppelin/contracts/utils/Pausable.sol";
// Imports the Pausable library from OpenZeppelin.
// This contract provides functionalities to pause and unpause the contract's operations.
// It includes modifiers like `whenNotPaused` (only runs when not paused) and `whenPaused` (only runs when paused).

import "@openzeppelin/contracts/utils/Strings.sol";
// Imports the Strings library from OpenZeppelin.
// This library provides utility functions for string manipulation, including `toHexString()`
// to convert an address to a hexadecimal string, used for concatenating strings in transaction descriptions.

// SafeMath.sol is not imported because Solidity 0.8.0+ has built-in overflow and underflow checks
// for arithmetic operations on integer types by default.
// This makes `+`, `-`, `*`, `/` operations on `uint256` safer without an additional library.

contract DeBank is Ownable, Pausable {
    // Defines the DeBank contract.
    // `is Ownable`: This contract inherits all functions, variables, and modifiers from the Ownable contract,
    // providing an ownership mechanism and access control.
    // `is Pausable`: This contract inherits all functions, variables, and modifiers from the Pausable contract,
    // enabling the ability to pause and unpause contract operations.

    // `using SafeMath for uint256;` is not needed as SafeMath is no longer imported and basic arithmetic operations are safe.

    // --- State Variables ---
    // State variables are permanently stored on the blockchain.
    // Their values persist across transactions.

    address public bankOwner;
    // The address of the DeBank contract's owner.
    // This owner has the privilege to execute administrative functions.
    // `public` automatically creates a getter function `bankOwner()` to read this value from outside the contract.

    IERC20Metadata public vndToken;
    // An instance of the IERC20Metadata interface, representing the deployed VNDT token smart contract.
    // This variable allows the DeBank contract to interact with the VNDT token contract
    // (e.g., calling `transferFrom`, `transfer`).

    mapping(address => bool) public isAccount;
    // A mapping (a key-value store) to check if an address has an account within the DeBank system.
    // Key: address. Value: boolean (true if the account exists, false otherwise).
    // An account is considered "existing" in DeBank when it performs its first `deposit` transaction.

    mapping(address => uint256) public balances;
    // A mapping storing the VNDT balance of each account within the DeBank contract.
    // Key: user's address. Value: VNDT balance (uint256, in the smallest token units).
    // IMPORTANT NOTE: This balance is the amount of VNDT that the DeBank contract holds ON BEHALF of the user,
    // not the balance directly in their personal wallet (e.g., Metamask).

    uint256 public totalDeposits;
    // The total amount of VNDT currently held by the DeBank contract.
    // This is the sum of all user `balances`.

    uint256 public dailyTransferLimit;
    // The maximum transfer amount that each user can perform within a single day (in the smallest VNDT units).
    // This value can be updated by the `bankOwner`.

    mapping(address => mapping(uint256 => uint256)) public dailyTransferredAmount;
    // A nested mapping to track the total amount a user has transferred on a specific day.
    // Outer Key: user's address.
    // Inner Key: timestamp of the current day (uint256, calculated as `block.timestamp / 1 days`).
    // Value: the total amount transferred on that day (uint256).

    uint256 public transferFeeRate;
    // The transfer fee rate. This value is expressed in "basis points" (one hundredths of a percent).
    // Example: 10000 basis points = 100%. If `transferFeeRate = 10`, the fee is 0.1% (10 / 10000 = 0.001).
    // Can be updated by the `bankOwner`.

    address public feeReceiver;
    // The address that will receive transaction fees. Typically the bank owner's address.
    // Can be updated by the `bankOwner`.

    // A structure (struct) to define the details of a transaction record.
    // These structs are stored in the `accountTransactions` mapping.
    struct Transaction {
        uint256 id;                 // Unique ID for each transaction, automatically increments.
        address from;               // The sender's address for the transaction.
        address to;                 // The recipient's address for the transaction.
        uint256 amount;             // The amount/token of the transaction (before fee deduction for sender, after fee for recipient).
        uint256 timestamp;          // The time the transaction occurred (Unix timestamp).
        string txType;              // Type of transaction: "Deposit", "Withdraw", "TransferOut", "TransferIn", "SavingsDeposit", etc.
        string description;         // A brief description of the transaction, including a shortened address for readability.
    }

    mapping(address => Transaction[]) public accountTransactions;
    // A mapping to store the transaction history for each account.
    // Key: user's address. Value: an array of Transaction structs.

    uint256 public nextTransactionId;
    // A counter used to generate unique IDs for each new transaction.
    // Increments after each transaction is recorded.

    // --- Components for Savings Functionality (Advanced) ---
    // Structure to store information about each user's savings account.
    struct SavingsAccount {
        uint256 amount;             // The principal amount deposited for savings.
        uint256 startTime;          // The timestamp of the block when the savings deposit began.
        uint256 durationMonths;     // The duration of the savings term in months (e.g., 3, 6, 12 months).
        uint256 interestRate;       // The annual interest rate (in basis points) applied to this savings account at the time of deposit.
        bool isActive;              // The status of the savings account (true: active/not yet withdrawn, false: withdrawn).
    }
    mapping(address => SavingsAccount[]) public userSavingsAccounts; // Mapping storing each user's savings accounts.
    // Key: user's address. Value: an array of SavingsAccount structs.

    uint256 public savingsInterestRate; // The global annual interest rate (in basis points) for new savings deposits.
    // This value can be updated by the `bankOwner`.


    // --- Events ---
    // Events are how smart contracts "announce" what has happened on the blockchain.
    // They are recorded in blockchain logs and can be listened to by frontend applications to update the UI in real-time.
    // The `indexed` keyword helps optimize searching and filtering events in logs.

    event AccountOpened(address indexed account);
    // Emitted when a new account is opened in DeBank (first interaction, e.g., deposit).

    event Deposited(address indexed account, uint256 amount, uint256 balance);
    // Emitted when a user deposits VNDT into DeBank.
    // `account`: the sender's address. `amount`: the deposited amount. `balance`: the new account balance.

    event Withdrawn(address indexed account, uint256 amount, uint256 balance);
    // Emitted when a user withdraws VNDT from DeBank.
    // `account`: the withdrawer's address. `amount`: the withdrawn amount. `balance`: the new account balance.

    event Transferred(address indexed from, address indexed to, uint256 amount, uint256 fee);
    // Emitted when VNDT is transferred between accounts within DeBank.
    // `from`: sender's address. `to`: recipient's address. `amount`: transferred amount. `fee`: collected fee.

    event DailyLimitUpdated(uint256 newLimit);
    // Emitted when the daily transfer limit is updated by the owner.

    event FeeRateUpdated(uint256 newRate);
    // Emitted when the transfer fee rate is updated by the owner.

    event FeeReceiverUpdated(address indexed newReceiver);
    // Emitted when the fee recipient address is updated by the owner.

    event SavingsDeposited(address indexed account, uint256 amount, uint256 durationMonths);
    // Emitted when a user deposits funds into a savings account.
    // `account`: depositor's address. `amount`: deposited amount. `durationMonths`: savings term.

    event SavingsWithdrawn(address indexed account, uint256 amount, uint256 interestEarned);
    // Emitted when a user withdraws funds from a savings account, including earned interest.

    // --- Constructor ---
    // This function is executed ONLY ONCE when the contract is deployed to the blockchain.
    // It is used to initialize the contract's initial state variables.
    constructor(address _vndTokenAddress) Ownable(msg.sender) Pausable() {
        // `Ownable(msg.sender)`: Calls the Ownable contract's constructor to set the contract deployer's address
        // (`msg.sender`) as the owner of this DeBank contract.
        // `Pausable()`: Calls the Pausable contract's constructor. (It does not take an argument in OZ v5.x).
        
        bankOwner = msg.sender;
        // Assigns the `bankOwner` variable to the address of the contract deployer.

        vndToken = IERC20Metadata(_vndTokenAddress);
        // Initializes the `vndToken` variable by casting the `_vndTokenAddress`
        // to an IERC20Metadata object. This allows the DeBank contract to call ERC20 functions
        // on the VNDT token contract.

        // Sets the initial default values for state variables:
        dailyTransferLimit = 1_000_000_000 * (10 ** vndToken.decimals());
        // Sets the default daily transfer limit to 1 billion VNDT.
        // `10 ** vndToken.decimals()` converts the human-readable amount (1 billion VNDT)
        // to the smallest unit used by the token (e.g., 10^18 if decimals is 18).

        transferFeeRate = 10;
        // Sets the default transfer fee rate to 0.1% (10 basis points).

        feeReceiver = msg.sender;
        // The default fee recipient address is the address of the DeBank contract's owner.

        nextTransactionId = 1;
        // Initializes the next transaction ID to 1.

        savingsInterestRate = 500; // Default annual interest rate for savings is 5% (500 basis points).
    }

    // --- Modifiers ---
    // Modifiers are functions attached to other functions to add conditional checks before
    // the main function's code is executed. If the condition is not met, the transaction will revert.
    // This helps in code reuse and enhances contract security.

    modifier onlyBankOwner() {
        // This modifier ensures that only the `bankOwner` (the contract deployer) can call the function.
        require(msg.sender == bankOwner, "DeBank: Only bank owner can call this function");
        // `require`: checks a condition. If the condition is false, the transaction will revert with an error message.
        _; // The underscore is where the main function's code will be inserted and executed.
    }

    modifier accountExists(address _account) {
        // This modifier checks if the `_account` exists (has interacted/deposited before) in the DeBank system.
        require(isAccount[_account], "DeBank: Account does not exist");
        _;
    }

    modifier sufficientBalance(uint256 _amount) {
        // This modifier checks if the function caller (`msg.sender`) has sufficient balance (`balances[msg.sender]`)
        // to perform the transaction with the given `_amount`.
        // In Solidity 0.8.0+, subtraction will automatically revert if the result is negative (underflow),
        // so checking `balances[msg.sender] >= _amount` is safe and necessary.
        require(balances[msg.sender] >= _amount, "DeBank: Insufficient balance");
        _;
    }

    modifier notZeroAddress(address _addr) {
        // This modifier ensures that the `_addr` is not the "zero address" (0x0).
        // The zero address is a special address often used as a default value or a burn address.
        // Sending funds to 0x0 is equivalent to burning them.
        require(_addr != address(0), "DeBank: Zero address not allowed");
        _;
    }

    modifier checkDailyLimit(address _sender, uint256 _amount) {
        // This modifier checks if adding `_amount` to the `_sender`'s total transferred amount for the day
        // exceeds the `dailyTransferLimit`.
        uint256 today = block.timestamp / 1 days; // Calculates the timestamp of the current day (rounded down to the day).
        // `1 days` is a global constant equivalent to 24 * 60 * 60 seconds.
        // Integer division truncates the hours/minutes/seconds part, keeping only the day part.
        require(dailyTransferredAmount[_sender][today] + _amount <= dailyTransferLimit, "DeBank: Daily transfer limit exceeded");
        _;
    }

    // --- User Functions ---
    // These are functions that regular users can call to interact with the bank.

    /**
     * @dev Allows a user to deposit VNDT into their DeBank account.
     * The user MUST have called the `approve()` function on the VNDT contract beforehand
     * to grant the DeBank contract permission to move a specific amount of VNDT from their wallet.
     * If no `approve` call was made or the approved amount is insufficient, the `transferFrom`
     * transaction will fail.
     * @param _amount The amount of VNDT to deposit (in the token's smallest units).
     */
    function deposit(uint256 _amount) public notZeroAddress(msg.sender) whenNotPaused {
        // `public`: the function can be called from anywhere.
        // `notZeroAddress(msg.sender)`: uses a modifier to ensure the caller is not the zero address.
        // `whenNotPaused`: modifier from Pausable, ensures the function only runs when the contract is not paused.
        require(_amount > 0, "DeBank: Deposit amount must be greater than zero");
        // Ensures the deposit amount is greater than 0 to prevent meaningless transactions.

        // If this is the first time this account interacts with DeBank (not yet in `isAccount`),
        // marks it as an existing account and emits an `AccountOpened` event.
        if (!isAccount[msg.sender]) {
            isAccount[msg.sender] = true;
            emit AccountOpened(msg.sender); // Emits an event signaling a new account has been opened.
        }

        // Transfers VNDT from the user's wallet (msg.sender) to the DeBank contract (address(this)).
        // This command ONLY SUCCEEDS if the user has previously called `vndToken.approve(DeBankContractAddress, _amount)`.
        require(vndToken.transferFrom(msg.sender, address(this), _amount), "DeBank: VNDT transferFrom failed. Did you approve enough?");
        // `address(this)`: refers to the DeBank contract's own address.

        // Updates the user's VNDT balance within the DeBank contract.
        balances[msg.sender] = balances[msg.sender] + _amount; // Uses native addition.
        // Updates the total amount of VNDT held by the DeBank contract.
        totalDeposits = totalDeposits + _amount; // Uses native addition.

        // Records the transaction in the sender's history.
        accountTransactions[msg.sender].push(
            Transaction({
                id: nextTransactionId++, // Uses and increments a unique transaction ID.
                from: msg.sender,
                to: address(this), // The DeBank contract's address is the recipient in a deposit transaction.
                amount: _amount,
                timestamp: block.timestamp, // The time of the transaction (Unix timestamp).
                txType: "Deposit", // Transaction type: "Deposit".
                description: "Deposit to DeBank account" // Brief description.
            })
        );
        emit Deposited(msg.sender, _amount, balances[msg.sender]);
        // Emits the `Deposited` event for the frontend to listen to and update the UI.
    }

    /**
     * @dev Allows a user to withdraw VNDT from their DeBank account to their personal wallet.
     * @param _amount The amount of VNDT to withdraw (in the token's smallest units).
     */
    function withdraw(uint256 _amount) public accountExists(msg.sender) sufficientBalance(_amount) whenNotPaused {
        // `accountExists(msg.sender)`: Ensures the caller has an account in DeBank.
        // `sufficientBalance(_amount)`: Ensures the caller has enough balance in DeBank to withdraw.
        // `whenNotPaused`: Ensures the function only runs when the contract is not paused.
        require(_amount > 0, "DeBank: Withdraw amount must be greater than zero");
        // Ensures the withdrawal amount is greater than 0.

        // Decreases the user's balance within the DeBank contract.
        balances[msg.sender] = balances[msg.sender] - _amount; // Uses native subtraction.

        // Transfers VNDT from the DeBank contract to the user's personal wallet.
        require(vndToken.transfer(msg.sender, _amount), "DeBank: VNDT transfer failed during withdrawal");

        // Decreases the total amount of VNDT held by the DeBank contract (as funds leave the contract).
        totalDeposits = totalDeposits - _amount; // Uses native subtraction.

        // Records the transaction in the withdrawer's history.
        accountTransactions[msg.sender].push(
            Transaction({
                id: nextTransactionId++,
                from: address(this), // The DeBank contract's address is the sender in a withdrawal transaction.
                to: msg.sender,
                amount: _amount,
                timestamp: block.timestamp,
                txType: "Withdraw",
                description: "Withdraw from DeBank account"
            })
        );
        emit Withdrawn(msg.sender, _amount, balances[msg.sender]);
        // Emits the `Withdrawn` event for the frontend to listen to.
    }

    /**
     * @dev Allows a user to transfer VNDT to another account within the DeBank system.
     * Applies a daily transfer limit and calculates a transaction fee.
     * @param _to The recipient's address.
     * @param _amount The amount of VNDT to transfer (in the token's smallest units).
     */
    function transfer(address _to, uint256 _amount)
        public
        accountExists(msg.sender) // Ensures the sender has an account in DeBank.
        notZeroAddress(_to)        // Ensures the recipient's address is not the zero address.
        sufficientBalance(_amount) // Ensures the sender has enough balance in DeBank.
        checkDailyLimit(msg.sender, _amount) // Checks the daily transfer limit.
        whenNotPaused // Ensures the function only runs when the contract is not paused.
    {
        require(_amount > 0, "DeBank: Transfer amount must be greater than zero");
        require(msg.sender != _to, "DeBank: Cannot transfer to yourself");
        // Ensures sender and recipient are not the same address to prevent unnecessary transactions.

        // Calculates the transaction fee.
        // Fee = (amount * fee_rate) / 10000 (since fee_rate is in basis points).
        uint256 fee = _amount * transferFeeRate / 10000; // Uses native multiplication and division.
        // The actual amount the recipient will receive after deducting the fee.
        uint256 amountAfterFee = _amount - fee; // Uses native subtraction.

        // Decreases the sender's balance by the TOTAL amount (including fee) within the DeBank contract.
        balances[msg.sender] = balances[msg.sender] - _amount; // Uses native subtraction.

        // If the recipient does not yet have an account in DeBank, creates a new account for them.
        if (!isAccount[_to]) {
            isAccount[_to] = true;
            emit AccountOpened(_to); // Emits an event signaling a new account has been opened.
        }
        // Increases the recipient's balance by the amount received after fee deduction.
        balances[_to] = balances[_to] + amountAfterFee; // Uses native addition.

        // Transfers the transaction fee to the `feeReceiver` address.
        if (fee > 0) {
            // Only transfers the fee if it's greater than 0.
            // `vndToken.transfer` is a function that sends tokens from the DeBank contract to the fee recipient address.
            require(vndToken.transfer(feeReceiver, fee), "DeBank: Failed to transfer fee to receiver");
        }

        // Updates the sender's total transferred amount for the current day to enforce the daily limit.
        uint256 today = block.timestamp / 1 days; // Gets the timestamp of the current day.
        dailyTransferredAmount[msg.sender][today] = dailyTransferredAmount[msg.sender][today] + _amount; // Accumulates the transferred amount.

        // Records the transaction in the SENDER's history.
        accountTransactions[msg.sender].push(
            Transaction({
                id: nextTransactionId++, // Uses and increments a unique transaction ID.
                from: msg.sender,
                to: _to,
                amount: _amount, // Records the original amount (before fee) for the sender.
                timestamp: block.timestamp,
                txType: "TransferOut",
                description: string.concat("Transfer to ", Strings.toHexString(_to)) // Concatenates strings for a detailed description.
            })
        );
        // Records the transaction in the RECIPIENT's history.
        accountTransactions[_to].push(
            Transaction({
                id: nextTransactionId++,
                from: msg.sender,
                to: _to,
                amount: amountAfterFee, // Records the actual amount received for the recipient.
                timestamp: block.timestamp,
                txType: "TransferIn",
                description: string.concat("Received from ", Strings.toHexString(msg.sender))
            })
        );
        emit Transferred(msg.sender, _to, _amount, fee);
        // Emits the `Transferred` event for the frontend to listen to.
    }

    /**
     * @dev Returns the VNDT balance of a specific account within the DeBank system.
     * @param _account The address of the account to check the balance for.
     * @return The balance of that account (uint256).
     */
    function getBalance(address _account) public view returns (uint256) {
        // `view`: This function does not modify the blockchain state; it only reads data.
        // Therefore, calling a `view` function does not cost gas (when called externally).
        // This function does not require `accountExists` so it can return 0 for non-existent accounts.
        return balances[_account];
    }

    /**
     * @dev Returns the entire transaction history for a specific account.
     * This function requires the account to exist (have made at least one deposit).
     * @param _account The address of the account.
     * @return An array of Transaction structs representing the transaction history.
     */
    function getAccountTransactionHistory(address _account) public view accountExists(_account) returns (Transaction[] memory) {
        // `memory`: Specifies that the returned array is a temporary copy in memory,
        // not permanently stored in the contract's storage.
        // This function requires the account to exist because querying history for a non-existent account is meaningless.
        return accountTransactions[_account];
    }

    /**
     * @dev Returns the total amount transferred by a user on the current day.
     * @param _account The address of the account.
     * @return The total amount transferred today.
     */
    function getDailyTransferredAmount(address _account) public view returns (uint256) {
        uint256 today = block.timestamp / 1 days;
        return dailyTransferredAmount[_account][today];
    }

    /**
     * @dev Allows a user to deposit VNDT into a fixed-term savings account.
     * The deposited amount will be locked within the contract and cannot be withdrawn until the term ends.
     * @param _amount The amount of VNDT to deposit into savings (in the token's smallest units).
     * @param _durationMonths The duration of the savings term in months (e.g., 3, 6, 12).
     */
    function depositSavings(uint256 _amount, uint256 _durationMonths) public accountExists(msg.sender) sufficientBalance( _amount) whenNotPaused {
        require(_amount > 0, "DeBank: Savings deposit amount must be greater than zero");
        require(_durationMonths > 0 && _durationMonths <= 60, "DeBank: Savings duration must be between 1 and 60 months"); // Limits the term to prevent overflow issues with large numbers.

        // Decreases the user's main balance (funds are moved from `balances` to `userSavingsAccounts`).
        // The balance in `balances` decreases, but `totalDeposits` does not change because the funds remain within the contract;
        // only their management status changes (from transactional balance to savings balance).
        balances[msg.sender] = balances[msg.sender] - _amount;

        // Records the new savings account information in the user's `userSavingsAccounts` array.
        userSavingsAccounts[msg.sender].push(
            SavingsAccount({
                amount: _amount,
                startTime: block.timestamp, // The timestamp when interest calculation begins.
                durationMonths: _durationMonths,
                interestRate: savingsInterestRate, // Uses the current global interest rate.
                isActive: true // Marks the savings account as active.
            })
        );

        // Records the transaction in the sender's history.
        accountTransactions[msg.sender].push(
            Transaction({
                id: nextTransactionId++,
                from: msg.sender,
                to: address(this), // Represents the internal savings account (funds remain within the contract).
                amount: _amount,
                timestamp: block.timestamp,
                txType: "SavingsDeposit",
                description: string.concat("Deposit to savings for ", Strings.toString(_durationMonths), " months")
            })
        );
        emit SavingsDeposited(msg.sender, _amount, _durationMonths); // Emits the `SavingsDeposited` event.
    }

    /**
     * @dev Allows a user to withdraw funds from a savings account after the term has ended.
     * The principal amount and earned interest will be transferred back to the user's main balance.
     * @param _index The index of the savings account within the user's `userSavingsAccounts` array.
     */
    function withdrawSavings(uint256 _index) public accountExists(msg.sender) whenNotPaused {
        // Retrieves a reference to the specific savings account.
        require(_index < userSavingsAccounts[msg.sender].length, "DeBank: Invalid savings account index"); // Checks if the index is valid.
        SavingsAccount storage sAccount = userSavingsAccounts[msg.sender][_index];
        
        require(sAccount.isActive, "DeBank: Savings account is not active"); // Ensures the savings account is active.

        // Calculates the end time of the savings term.
        // Uses 30 days per month for simplicity; can use exact seconds in a month if needed.
        uint256 endTime = sAccount.startTime + (sAccount.durationMonths * 30 days);
        require(block.timestamp >= endTime, "DeBank: Savings period has not ended yet"); // Ensures the term has ended.

        // Calculates the interest earned (simple annual interest, prorated by month).
        // Interest = (amount * interest_rate / 10000) * (duration_months / 12)
        // The final division by `/ 12` converts the annual interest rate to a monthly rate corresponding to the term.
        uint256 interestEarned = (sAccount.amount * sAccount.interestRate / 10000) * sAccount.durationMonths / 12;
        uint256 totalAmount = sAccount.amount + interestEarned; // Total amount = principal + interest.

        // Transfers the total amount (principal + interest) back to the user's main balance.
        balances[msg.sender] = balances[msg.sender] + totalAmount;
        sAccount.isActive = false; // Marks the savings account as withdrawn.

        // Records the savings withdrawal transaction in the history.
        accountTransactions[msg.sender].push(
            Transaction({
                id: nextTransactionId++,
                from: address(this), // Represents the DeBank contract (source of interest payment).
                to: msg.sender,
                amount: totalAmount,
                timestamp: block.timestamp,
                txType: "SavingsWithdrawal",
                description: string.concat("Withdrawal from savings, interest earned: ", Strings.toString(interestEarned / (10 ** vndToken.decimals()))) // Displays earned interest.
            })
        );
        emit SavingsWithdrawn(msg.sender, sAccount.amount, interestEarned); // Emits the `SavingsWithdrawn` event.
    }


    // --- Admin Functions ---
    // These functions are protected by the `onlyBankOwner` modifier to ensure security and control.
    // They also use modifiers from Pausable to ensure proper operation based on the paused state.

    function pause() public onlyBankOwner whenNotPaused {
        // Can only pause the contract if the caller is the bankOwner and the contract is not already paused.
        _pause(); // Internal function from Pausable, performs the contract pausing.
    }

    function unpause() public onlyBankOwner whenPaused {
        // Can only unpause the contract if the caller is the bankOwner and the contract is currently paused.
        _unpause(); // Internal function from Pausable, performs the contract unpausing.
    }

    function setDailyTransferLimit(uint256 _newLimit) public onlyBankOwner {
        require(_newLimit > 0, "DeBank: Daily limit must be greater than zero"); // The limit must be greater than 0.
        dailyTransferLimit = _newLimit; // Updates the state variable.
        emit DailyLimitUpdated(_newLimit); // Emits an event signaling the change.
    }

    function setFeeRate(uint256 _newRate) public onlyBankOwner {
        require(_newRate <= 10000, "DeBank: Fee rate cannot exceed 100%"); // Ensures the fee rate does not exceed 100% (10000 basis points).
        transferFeeRate = _newRate; // Updates the state variable.
        emit FeeRateUpdated(_newRate); // Emits an event signaling the change.
    }

    function setFeeReceiver(address _newReceiver) public onlyBankOwner notZeroAddress(_newReceiver) {
        feeReceiver = _newReceiver; // Updates the state variable.
        emit FeeReceiverUpdated(_newReceiver); // Emits an event signaling the change.
    }

    function recoverVNDT(uint256 _amount) public onlyBankOwner {
        // This function allows the bank owner to recover any VNDT accidentally sent directly
        // to the DeBank contract address without going through the `deposit` function (e.g., user sent to wrong address).
        // This is a safety mechanism to retrieve stuck assets.
        require(vndToken.balanceOf(address(this)) >= _amount, "DeBank: Not enough VNDT in contract to recover"); // Ensures the contract has enough funds to recover.
        require(vndToken.transfer(bankOwner, _amount), "DeBank: Failed to recover VNDT"); // Transfers VNDT to the bankOwner's wallet.
    }

    /**
     * @dev Sets the global annual interest rate for new savings accounts.
     * Only the bank owner (`bankOwner`) can call this function.
     * @param _newRate The new annual interest rate in basis points (e.g., 500 = 5%).
     */
    function setSavingsInterestRate(uint256 _newRate) public onlyBankOwner {
        savingsInterestRate = _newRate; // Updates the global savings interest rate.
    }
}
