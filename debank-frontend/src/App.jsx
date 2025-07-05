import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css'; // Import custom styles for modal and tabs

// Import ABI of smart contracts
// Ensure you have copied VNDT.json and DeBank.json to the src/contracts/ folder
import VNDT_ABI from './contracts/VNDT.json';
import DeBank_ABI from './contracts/DeBank.json';

// Get contract addresses and Bank Owner address from environment variables
const VNDT_CONTRACT_ADDRESS = import.meta.env.VITE_VNDT_CONTRACT_ADDRESS;
const DEBANK_CONTRACT_ADDRESS = import.meta.env.VITE_DEBANK_CONTRACT_ADDRESS;
const BANK_OWNER_ADDRESS = import.meta.env.VITE_BANK_OWNER_ADDRESS; // Wallet address of the bank owner (admin)

// --- Translations Object ---
// This object holds all the text strings for different languages.
const translations = {
  en: {
    appName: "App Demo Solidity, Web3, DApp",
    appFooter: "© 2025 Demo App. Developed for learning and experiencing Solidity.",
    connectWallet: "Connect Wallet",
    disconnectWallet: "Disconnect Wallet",
    accountSummary: "Your Account",
    status: "Status",
    connected: "Connected",
    notConnected: "Not Connected",
    network: "Network",
    walletAddress: "Wallet Address",
    copyAddress: "Copy Address",
    walletBalanceEth: "Wallet Balance (ETH):",
    systemBalance: "System Balance:",
    balanceDescription: "The displayed balance is the VNDT you have in your account within the smart contract.",
    transactions: "Transactions",
    depositTab: "Deposit",
    withdrawTab: "Withdraw",
    transferTab: "Transfer",
    savingsTab: "Savings",
    depositTitle: "Deposit Funds into the System",
    depositApprovalNeeded: "You need to approve the system contract to spend VNDT from your wallet before depositing.",
    depositAmount: "VNDT amount to deposit:",
    enterVNDT: "Enter VNDT",
    approveVNDT: "Approve VNDT",
    sendFunds: "Send Funds",
    withdrawTitle: "Withdraw Funds from the System",
    withdrawAmount: "VNDT amount to withdraw:",
    transferTitle: "Transfer Funds within the System",
    recipientAddress: "Recipient Address:",
    transferAmount: "VNDT amount to transfer:",
    savingsTitle: "Deposit Savings",
    savingsDescription: "Deposit VNDT into a savings account to earn interest (advanced feature).",
    savingsAmount: "VNDT amount to deposit for savings:",
    savingsDuration: "Term (months):",
    months3: "3 Months",
    months6: "6 Months",
    months12: "12 Months",
    depositSavings: "Deposit Savings",
    transactionHistory: "Transaction History",
    id: "ID",
    type: "Type",
    from: "From",
    to: "To",
    amountVNDT: "Amount (VNDT)",
    time: "Time",
    previous: "Previous",
    next: "Next",
    noTransactions: "No transactions recorded for this account.",
    connectToViewHistory: "Please connect wallet to view transaction history.",
    adminPanel: "Admin Panel",
    adminDescription: "You are logged in as the contract owner. You can perform the following administrative functions.",
    updateDailyLimit: "Update Daily Transfer Limit",
    newLimit: "New Limit (VNDT):",
    current: "Current:",
    update: "Update",
    updateFeeRate: "Update Transfer Fee Rate",
    newFeeRate: "New Fee Rate (%):",
    contractManagement: "Contract Management",
    pauseContract: "Pause Contract",
    unpauseContract: "Unpause Contract",
    modalConnectSuccess: "MetaMask wallet connected successfully!",
    modalAccountChanged: "MetaMask account changed to:",
    modalDisconnected: "MetaMask wallet disconnected or no account selected.",
    modalNetworkChanged: "Blockchain network changed to Chain ID:",
    modalConnectRejected: "You rejected the MetaMask wallet connection request.",
    modalConnectError: "Wallet connection error:",
    modalInstallMetamask: "Please install MetaMask wallet to use this app. You can find it at: metamask.io",
    modalCopySuccess: "Address copied to clipboard!",
    modalCopyError: "Could not copy address. Please copy manually.",
    modalNoAddress: "No wallet address to copy.",
    modalContractInitError: "Error: Could not initialize smart contract. Please check contract addresses and network.",
    modalApproveConfirm: "Approving {amount} VNDT. Please confirm in MetaMask...",
    modalApproveSuccess: "Approval successful! Tx Hash:",
    modalApproveRejected: "Approval transaction rejected by user.",
    modalApproveError: "Error approving VNDT:",
    modalDepositConfirm: "Depositing {amount} VNDT into the system. Please confirm in MetaMask...",
    modalDepositSuccess: "Deposit successful! Tx Hash:",
    modalDepositRejected: "Deposit transaction rejected by user.",
    modalDepositError: "Error depositing funds into the system:",
    modalWithdrawConfirm: "Withdrawing {amount} VNDT from the system. Please confirm in MetaMask...",
    modalWithdrawSuccess: "Withdrawal successful! Tx Hash:",
    modalWithdrawRejected: "Withdrawal transaction rejected by user.",
    modalWithdrawError: "Error withdrawing funds from the system:",
    modalTransferConfirm: "Transferring {amount} VNDT to {recipient}. Please confirm in MetaMask...",
    modalTransferSuccess: "Transfer successful! Tx Hash:",
    modalTransferRejected: "Transfer transaction rejected by user.",
    modalTransferError: "Error transferring funds:",
    modalSavingsConfirm: "Depositing {amount} VNDT into savings for {duration} months. Please confirm in MetaMask...",
    modalSavingsSuccess: "Savings deposit successful! Tx Hash:",
    modalSavingsRejected: "Savings deposit transaction rejected by user.",
    modalSavingsError: "Error depositing savings:",
    modalAdminNoPermission: "You do not have permission or are not connected.",
    modalAdminInvalidLimit: "Please enter a valid limit.",
    modalAdminUpdateLimitConfirm: "Updating daily transfer limit to {amount} VNDT...",
    modalAdminUpdateLimitSuccess: "Daily limit updated successfully! Tx Hash:",
    modalAdminUpdateLimitError: "Error updating limit:",
    modalAdminInvalidFeeRate: "Please enter a valid fee rate (0-10000 basis points).",
    modalAdminUpdateFeeRateConfirm: "Updating transfer fee rate to {rate}%...",
    modalAdminUpdateFeeRateSuccess: "Fee rate updated successfully! Tx Hash:",
    modalAdminUpdateFeeRateError: "Error updating fee rate:",
    modalAdminPauseConfirm: "Pausing contract. Please confirm in MetaMask...",
    modalAdminPauseSuccess: "Contract paused successfully! Tx Hash:",
    modalAdminPauseError: "Error pausing contract:",
    modalAdminUnpauseConfirm: "Unpausing contract. Please confirm in MetaMask...",
    modalAdminUnpauseSuccess: "Contract unpaused successfully! Tx Hash:",
    modalAdminUnpauseError: "Error unpausing contract:",
    errorInsufficientBalance: "Error: Insufficient balance. Please check your balance.",
    errorAccountDoesNotExist: "Error: Your account does not exist in the system (no deposit transaction yet).",
    errorDailyLimitExceeded: "Error: You have exceeded the daily transfer limit.",
    errorZeroAddress: "Error: Invalid recipient address (zero address 0x0).",
    errorTransferToSelf: "Error: Cannot transfer to yourself.",
    errorContractOwnerOnly: "Error: Only the contract owner can perform this function.",
    errorContractPaused: "Error: The contract is paused. Cannot perform transactions.",
    errorContractNotPaused: "Error: The contract is not paused.",
    errorSavingsDurationInvalid: "Error: Savings duration must be between 1 and 60 months.",
    errorSavingsAmountZero: "Error: Savings deposit amount must be greater than zero.",
    errorGenericRevert: "Transaction reverted on blockchain. Please check detailed logs.",
    errorGenericFetch: "Error fetching data: Unknown reason.",
    errorGenericTransaction: "Transaction error: Unknown reason.",
    errorFailedToLoad: "Failed to load",
    errorUnknown: "Unknown reason.",
    errorCheckLogs: "Please check detailed logs."
  },
  vi: {
    appName: "Ứng dụng Demo Solidity, Web3, DApp",
    appFooter: "© 2025 Ứng dụng Demo. Được phát triển để học và trải nghiệm Solidity.",
    connectWallet: "Kết Nối Ví",
    disconnectWallet: "Ngắt Kết Nối Ví",
    accountSummary: "Tài Khoản Của Bạn",
    status: "Trạng thái",
    connected: "Đã Kết Nối",
    notConnected: "Chưa Kết Nối",
    network: "Mạng lưới",
    walletAddress: "Địa chỉ Ví",
    copyAddress: "Sao chép địa chỉ",
    walletBalanceEth: "Số Dư Ví (ETH):",
    systemBalance: "Số Dư Hệ Thống:",
    balanceDescription: "Số dư hiển thị là VNDT đang có trong tài khoản của bạn trên hợp đồng thông minh.",
    transactions: "Giao Dịch",
    depositTab: "Gửi Tiền",
    withdrawTab: "Rút Tiền",
    transferTab: "Chuyển Tiền",
    savingsTab: "Tiết Kiệm",
    depositTitle: "Gửi Tiền vào Hệ Thống",
    depositApprovalNeeded: "Bạn cần phê duyệt (approve) cho hợp đồng hệ thống quyền chi tiêu VNDT từ ví của bạn trước khi gửi tiền.",
    depositAmount: "Số tiền VNDT muốn gửi:",
    enterVNDT: "Nhập số VNDT",
    approveVNDT: "Phê Duyệt VNDT",
    sendFunds: "Gửi Tiền",
    withdrawTitle: "Rút Tiền từ Hệ Thống",
    withdrawAmount: "Số tiền VNDT muốn rút:",
    transferTitle: "Chuyển Tiền Trong Hệ Thống",
    recipientAddress: "Địa chỉ người nhận:",
    transferAmount: "Số tiền VNDT muốn chuyển:",
    savingsTitle: "Gửi Tiết Kiệm",
    savingsDescription: "Gửi VNDT vào tài khoản tiết kiệm để nhận lãi suất (chức năng nâng cao).",
    savingsAmount: "Số tiền VNDT muốn gửi tiết kiệm:",
    savingsDuration: "Kỳ hạn (tháng):",
    months3: "3 Tháng",
    months6: "6 Tháng",
    months12: "12 Tháng",
    depositSavings: "Gửi Tiết Kiệm",
    transactionHistory: "Lịch Sử Giao Dịch",
    id: "ID",
    type: "Loại",
    from: "Từ",
    to: "Đến",
    amountVNDT: "Số tiền (VNDT)",
    time: "Thời gian",
    previous: "Trước",
    next: "Sau",
    noTransactions: "Chưa có giao dịch nào được ghi lại cho tài khoản này.",
    connectToViewHistory: "Vui lòng kết nối ví để xem lịch sử giao dịch.",
    adminPanel: "Bảng Điều Khiển Cấp Quyền và Quản Trị",
    adminDescription: "Bạn đang đăng nhập với tư cách chủ sở hữu hợp đồng. Bạn có thể thực hiện các chức năng quản trị sau.",
    updateDailyLimit: "Cập Nhật Hạn Mức Chuyển Hàng Ngày",
    newLimit: "Hạn mức mới (VNDT):",
    current: "Hiện tại:",
    update: "Cập Nhật",
    updateFeeRate: "Cập Nhật Tỷ Lệ Phí Chuyển Khoản",
    newFeeRate: "Tỷ lệ phí mới (%):",
    contractManagement: "Quản Lý Hợp Đồng",
    pauseContract: "Tạm Dừng Hợp Đồng",
    unpauseContract: "Khởi Động Hợp Đồng",
    modalConnectSuccess: "Kết nối ví MetaMask thành công!",
    modalAccountChanged: "Tài khoản MetaMask đã thay đổi sang:",
    modalDisconnected: "Ví MetaMask đã bị ngắt kết nối hoặc không còn tài khoản được chọn.",
    modalNetworkChanged: "Mạng blockchain đã thay đổi sang Chain ID:",
    modalConnectRejected: "Bạn đã từ chối yêu cầu kết nối ví MetaMask.",
    modalConnectError: "Lỗi kết nối ví:",
    modalInstallMetamask: "Vui lòng cài đặt ví MetaMask để sử dụng ứng dụng này. Bạn có thể tìm thấy nó tại: metamask.io",
    modalCopySuccess: "Địa chỉ đã được sao chép vào clipboard!",
    modalCopyError: "Không thể sao chép địa chỉ. Vui lòng sao chép thủ công.",
    modalNoAddress: "Không có địa chỉ ví để sao chép.",
    modalContractInitError: "Lỗi: Không thể khởi tạo smart contract. Vui lòng kiểm tra địa chỉ contract và mạng.",
    modalApproveConfirm: "Đang phê duyệt {amount} VNDT. Vui lòng xác nhận trong MetaMask...",
    modalApproveSuccess: "Phê duyệt thành công! Tx Hash:",
    modalApproveRejected: "Giao dịch phê duyệt bị từ chối bởi người dùng.",
    modalApproveError: "Lỗi phê duyệt VNDT:",
    modalDepositConfirm: "Đang gửi {amount} VNDT vào hệ thống. Vui lòng xác nhận trong MetaMask...",
    modalDepositSuccess: "Gửi tiền thành công! Tx Hash:",
    modalDepositRejected: "Giao dịch gửi tiền bị từ chối bởi người dùng.",
    modalDepositError: "Lỗi gửi tiền vào hệ thống:",
    modalWithdrawConfirm: "Đang rút {amount} VNDT từ hệ thống. Vui lòng xác nhận trong MetaMask...",
    modalWithdrawSuccess: "Rút tiền thành công! Tx Hash:",
    modalWithdrawRejected: "Giao dịch rút tiền bị từ chối bởi người dùng.",
    modalWithdrawError: "Lỗi rút tiền từ hệ thống:",
    modalTransferConfirm: "Đang chuyển {amount} VNDT đến {recipient}. Vui lòng xác nhận trong MetaMask...",
    modalTransferSuccess: "Chuyển tiền thành công! Tx Hash:",
    modalTransferRejected: "Giao dịch chuyển tiền bị từ chối bởi người dùng.",
    modalTransferError: "Lỗi chuyển tiền:",
    modalSavingsConfirm: "Đang gửi {amount} VNDT vào tiết kiệm kỳ hạn {duration} tháng. Vui lòng xác nhận trong MetaMask...",
    modalSavingsSuccess: "Gửi tiết kiệm thành công! Tx Hash:",
    modalSavingsRejected: "Giao dịch gửi tiết kiệm bị từ chối bởi người dùng.",
    modalSavingsError: "Lỗi gửi tiết kiệm:",
    modalAdminNoPermission: "Bạn không có quyền hoặc chưa kết nối.",
    modalAdminInvalidLimit: "Vui lòng nhập hạn mức hợp lệ.",
    modalAdminUpdateLimitConfirm: "Đang cập nhật hạn mức chuyển khoản hàng ngày thành {amount} VNDT...",
    modalAdminUpdateLimitSuccess: "Cập nhật hạn mức thành công! Tx Hash:",
    modalAdminUpdateLimitError: "Lỗi cập nhật hạn mức:",
    modalAdminInvalidFeeRate: "Vui lòng nhập tỷ lệ phí hợp lệ (0-10000 basis points).",
    modalAdminUpdateFeeRateConfirm: "Đang cập nhật tỷ lệ phí chuyển khoản thành {rate}%...",
    modalAdminUpdateFeeRateSuccess: "Cập nhật tỷ lệ phí thành công! Tx Hash:",
    modalAdminUpdateFeeRateError: "Lỗi cập nhật tỷ lệ phí:",
    modalAdminPauseConfirm: "Đang tạm dừng hợp đồng. Vui lòng xác nhận trong MetaMask...",
    modalAdminPauseSuccess: "Hợp đồng đã tạm dừng thành công! Tx Hash:",
    modalAdminPauseError: "Lỗi tạm dừng hợp đồng:",
    modalAdminUnpauseConfirm: "Đang khởi động lại hợp đồng. Vui lòng xác nhận trong MetaMask...",
    modalAdminUnpauseSuccess: "Hợp đồng đã khởi động lại thành công! Tx Hash:",
    modalAdminUnpauseError: "Lỗi khởi động lại hợp đồng:",
    errorInsufficientBalance: "Lỗi: Số dư không đủ. Vui lòng kiểm tra số dư của bạn.",
    errorAccountDoesNotExist: "Lỗi: Tài khoản của bạn chưa tồn tại trong hệ thống (chưa có giao dịch gửi tiền).",
    errorDailyLimitExceeded: "Lỗi: Bạn đã vượt quá hạn mức chuyển tiền hàng ngày.",
    errorZeroAddress: "Lỗi: Địa chỉ không hợp lệ (địa chỉ 0x0).",
    errorTransferToSelf: "Lỗi: Không thể chuyển tiền cho chính bạn.",
    errorContractOwnerOnly: "Lỗi: Bạn không phải chủ sở hữu hợp đồng để thực hiện chức năng này.",
    errorContractPaused: "Lỗi: Hợp đồng đang bị tạm dừng. Không thể thực hiện giao dịch.",
    errorContractNotPaused: "Lỗi: Hợp đồng chưa tạm dừng.",
    errorSavingsDurationInvalid: "Lỗi: Kỳ hạn tiết kiệm phải từ 1 đến 60 tháng.",
    errorSavingsAmountZero: "Lỗi: Số tiền gửi tiết kiệm phải lớn hơn 0.",
    errorGenericRevert: "Giao dịch bị từ chối trên blockchain. Vui lòng kiểm tra log chi tiết.",
    errorGenericFetch: "Lỗi khi lấy dữ liệu: Không rõ nguyên nhân.",
    errorGenericTransaction: "Lỗi giao dịch: Không rõ nguyên nhân.",
    errorUnknown: "Không rõ nguyên nhân.",
    errorCheckLogs: "Vui lòng kiểm tra log chi tiết."
  }
};

function App() {
  // --- State Variables ---
  const [language, setLanguage] = useState('vi'); // Default language is Vietnamese
  const t = translations[language]; // Get current language translations

  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentChainId, setCurrentChainId] = useState(null);
  const [networkName, setNetworkName] = useState(t.notConnected); 
  
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [systemBalance, setSystemBalance] = useState('0 VNDT'); // Changed from debankBalance
  const [ethBalance, setEthBalance] = useState('0 ETH');
  const [transactionHistory, setTransactionHistory] = useState([]);
  
  const [activeTab, setActiveTab] = useState('deposit'); 

  const [vndtContract, setVndtContract] = useState(null);
  const [systemContract, setSystemContract] = useState(null); // Changed from debankContract
  
  const [isContractOwner, setIsContractOwner] = useState(false); // Changed from isBankOwner

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const [currentDailyLimit, setCurrentDailyLimit] = useState('0 VNDT');
  const [newDailyLimitInput, setNewDailyLimitInput] = useState('');
  const [currentFeeRate, setCurrentFeeRate] = useState('0%');
  const [newFeeRateInput, setNewFeeRateInput] = useState('');


  // --- Utility function to show modal messages ---
  const showAppModal = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  // Function to close modal
  const closeAppModal = () => {
    setShowModal(false);
    setModalMessage('');
  };

  // --- Helper function to parse and display more specific error messages ---
  const getErrorMessage = (error, defaultMessage = t.errorUnknown) => {
    let errorMessage = defaultMessage;

    if (error.code === 4001) { // User rejected transaction
      errorMessage = t.modalConnectRejected;
    } else if (error.data && typeof error.data === 'object' && (error.data.message || error.data.reason)) {
        const revertReason = error.data.message || error.data.reason;

        if (revertReason.includes("Insufficient balance")) { // Generic insufficient balance
            errorMessage = t.errorInsufficientBalance;
        } else if (revertReason.includes("Account does not exist")) {
            errorMessage = t.errorAccountDoesNotExist;
        } else if (revertReason.includes("VNDT transferFrom failed. Did you approve enough?") || revertReason.includes("ERC20InsufficientAllowance")) {
            errorMessage = t.modalApproveError; // Specific approval error
        } else if (revertReason.includes("ERC20InsufficientBalance")) {
            errorMessage = t.errorInsufficientBalance; // Specific token balance error
        } else if (revertReason.includes("Daily transfer limit exceeded")) {
            errorMessage = t.errorDailyLimitExceeded;
        } else if (revertReason.includes("Zero address not allowed")) {
            errorMessage = t.errorZeroAddress;
        } else if (revertReason.includes("Cannot transfer to yourself")) {
            errorMessage = t.errorTransferToSelf;
        } else if (revertReason.includes("Only bank owner can call this function")) {
            errorMessage = t.errorContractOwnerOnly;
        } else if (revertReason.includes("Pausable: paused")) {
            errorMessage = t.errorContractPaused;
        } else if (revertReason.includes("Pausable: not paused")) {
            errorMessage = t.errorContractNotPaused;
        } else if (revertReason.includes("Savings duration must be between 1 and 60 months")) {
            errorMessage = t.errorSavingsDurationInvalid;
        } else if (revertReason.includes("Savings deposit amount must be greater than zero")) {
            errorMessage = t.errorSavingsAmountZero;
        } else if (revertReason.includes("execution reverted")) {
            errorMessage = t.errorGenericRevert; // Generic revert message
        } else {
            errorMessage = `${t.errorGenericRevert}: ${revertReason}`; // Fallback with specific revert reason
        }
    } else if (error.message) {
        errorMessage = `${t.errorGenericTransaction}: ${error.message}`; // Generic transaction error
    } else {
        errorMessage = defaultMessage;
    }

    return errorMessage;
  };


  // --- Function to register MetaMask event listeners ---
  // These listeners help the application react dynamically when the user changes accounts, network, or disconnects in MetaMask.
  const registerEventListeners = (web3Instance, accs) => {
    if (!window.ethereum) return;

    // Handles changes in MetaMask accounts
    const handleAccountsChanged = (newAccs) => {
      setAccounts(newAccs);
      if (newAccs.length === 0) { // If no account is selected/connected
        setIsConnected(false);
        showAppModal(t.modalDisconnected);
        setEthBalance('0 ETH');
        setSystemBalance('0 VNDT');
        setTransactionHistory([]);
        setVndtContract(null);
        setSystemContract(null);
        setIsContractOwner(false);
        setCurrentPage(1);
      } else { // If account changes to a new one
        showAppModal(`${t.modalAccountChanged} ${newAccs[0]}`);
        fetchEthBalance(web3Instance, newAccs[0]);
        setIsContractOwner(newAccs[0].toLowerCase() === BANK_OWNER_ADDRESS.toLowerCase());
        setCurrentPage(1);
      }
    };

    // Handles changes in the blockchain network in MetaMask
    const handleChainChanged = (newChainId) => {
      const parsedChainId = parseInt(newChainId, 16); // MetaMask returns chainId as a hex string
      setCurrentChainId(parsedChainId);
      updateNetworkName(parsedChainId);
      showAppModal(`${t.modalNetworkChanged} ${parsedChainId}`);
      if (accs.length > 0) {
          fetchEthBalance(web3Instance, accs[0]);
      }
      if (web3Instance) {
        initializeContracts(web3Instance); // IMPORTANT: Re-initialize contract instances for the new network
                                          // as contract addresses may differ between networks.
      }
      setCurrentPage(1);
    };

    // Handles wallet disconnection
    const handleDisconnect = (error) => {
      setIsConnected(false);
      setAccounts([]);
      setWeb3(null);
      showAppModal(`${t.modalDisconnected} ${t.errorCheckLogs}`); // Using a more generic message
      setEthBalance('0 ETH');
      setSystemBalance('0 VNDT');
      setTransactionHistory([]);
      setVndtContract(null);
      setSystemContract(null);
      setIsContractOwner(false);
      setCurrentPage(1);
    };

    // Register event listeners with window.ethereum
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);
  };

  // --- Function to initialize smart contract instances ---
  // This function is called after the `web3` instance is created and contract addresses are loaded from `.env`.
  const initializeContracts = (web3Instance) => {
    if (!web3Instance || !VNDT_CONTRACT_ADDRESS || !DEBANK_CONTRACT_ADDRESS) {
      console.error("Web3 instance or contract addresses not available for initialization.");
      showAppModal(t.modalContractInitError);
      return;
    }

    try {
      // Initialize VNDT contract using its ABI (Application Binary Interface) and address.
      // ABI is necessary for Web3.js to know the contract's functions and how to interact with it.
      const vndt = new web3Instance.eth.Contract(VNDT_ABI.abi, VNDT_CONTRACT_ADDRESS);
      setVndtContract(vndt);

      // Initialize the system contract (formerly DeBank) similarly
      const system = new web3Instance.eth.Contract(DeBank_ABI.abi, DEBANK_CONTRACT_ADDRESS);
      setSystemContract(system);

    } catch (error) {
      console.error("Error initializing contract instances:", error);
      showAppModal(getErrorMessage(error, t.modalContractInitError));
      setVndtContract(null);
      setSystemContract(null);
    }
  };

  // --- Function to connect MetaMask wallet ---
  const connectWallet = async () => {
    if (window.ethereum) { // Check if MetaMask (or compatible provider) is available
      try {
        const web3Instance = new Web3(window.ethereum); // Create Web3.js instance using MetaMask's provider
        setWeb3(web3Instance); // Save Web3 instance to state

        // Request user permission to access their wallet accounts.
        // This will open the MetaMask window for the user to confirm the connection.
        const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccounts(accs); // Save connected accounts to state
        setIsConnected(true); // Set connected status to true
        showAppModal(t.modalConnectSuccess);

        // Get current network information from Web3.js
        const chainId = await web3Instance.eth.getChainId();
        setCurrentChainId(Number(chainId)); // Convert BigInt (from Web3.js v4+) to Number
        updateNetworkName(Number(chainId)); // Update displayed network name

        if (accs.length > 0) { // If accounts are connected
            fetchEthBalance(web3Instance, accs[0]); // Get current wallet's ETH balance
            // Check and update isContractOwner status based on the first account's address
            setIsContractOwner(accs[0].toLowerCase() === BANK_OWNER_ADDRESS.toLowerCase());
        }
        
        initializeContracts(web3Instance); // Initialize contract instances immediately after wallet connection
        
        registerEventListeners(web3Instance, accs); // Register MetaMask event listeners
      } catch (error) {
        if (error.code === 4001) { // Error 4001: User rejected connection request in MetaMask
          showAppModal(t.modalConnectRejected);
        } else { // Other errors during connection
          showAppModal(`${t.modalConnectError} ${error.message}`);
        }
      }
    } else { // If window.ethereum is not found (MetaMask not installed)
      showAppModal(t.modalInstallMetamask);
    }
  };

  // --- Function to disconnect wallet ---
  // This function only resets the frontend application's state; it does not actually disconnect in MetaMask
  // (the user must manually disconnect in the MetaMask extension if they wish).
  const disconnectWallet = () => {
    if (window.ethereum && window.ethereum.selectedAddress) { // Only disconnect if a wallet is selected
      setIsConnected(false); // Set disconnected status
      setAccounts([]); // Clear accounts
      setWeb3(null); // Clear Web3 instance
      // Reset all account-related states
      setEthBalance('0 ETH');
      setSystemBalance('0 VNDT');
      setTransactionHistory([]);
      setVndtContract(null);
      setSystemContract(null);
      setIsContractOwner(false);
      setCurrentPage(1);
      showAppModal(t.modalDisconnected);
    } else { // If no wallet is connected
      showAppModal(t.modalNoAddress); // Reusing message for "no wallet to copy"
    }
  };

  // --- Function to fetch actual ETH balance from MetaMask wallet ---
  // This function calls `getBalance` on Web3.js to get the current account's ETH balance.
  const fetchEthBalance = async (web3Instance, accountAddress) => {
      if (web3Instance && accountAddress) { // Ensure Web3 instance and account address are valid
          try {
              const balanceWei = await web3Instance.eth.getBalance(accountAddress); // Get balance in Wei (smallest unit)
              const balanceEth = web3Instance.utils.fromWei(balanceWei, 'ether'); // Convert from Wei to ETH (1 ETH = 10^18 Wei)
              setEthBalance(`${parseFloat(balanceEth).toFixed(5)} ETH`); // Update state and display with 5 decimal places
          } catch (error) {
              console.error("Error fetching ETH balance:", error); // Log error to console for debugging
              setEthBalance(t.errorGenericFetch); // Display error on UI
          }
      }
  };

  // --- Function to update network name based on Chain ID ---
  const updateNetworkName = (chainId) => {
    switch (chainId) {
      case 1:
        setNetworkName('Ethereum Mainnet'); // Ethereum main network
        break;
      case 11155111:
        setNetworkName('Sepolia Testnet'); // Sepolia test network
        break;
      case 1337:
        setNetworkName('Localhost / Ganache'); // Common Chain ID for Ganache
        break;
      case 31337: // Chain ID for Hardhat Network (our local development network)
        setNetworkName('Localhost Hardhat Network');
        break;
      default:
        setNetworkName(`${t.network} ${t.errorUnknown} (ID: ${chainId})`); // Unknown network
    }
  };

  // --- Function to copy wallet address to clipboard ---
  const copyAddress = () => {
    if (accounts.length > 0) { // Ensure there's an account to copy
      const textarea = document.createElement('textarea'); // Create a temporary textarea
      textarea.value = accounts[0]; // Assign the address value to the textarea
      document.body.appendChild(textarea); // Append the textarea to the DOM
      textarea.select(); // Select all content in the textarea
      try {
        document.execCommand('copy'); // Execute the copy command (deprecated but still used for iframe contexts)
        showAppModal(t.modalCopySuccess);
      } catch (err) {
        console.error("Error copying address:", err); // Log error to console
        showAppModal(t.modalCopyError);
      }
      document.body.removeChild(textarea); // Remove the temporary textarea
    } else {
      showAppModal(t.modalNoAddress);
    }
  };

  // --- Function to fetch system balance from the smart contract ---
  // This function calls the `getBalance` function on the system contract to get the user's VNDT balance.
  const fetchSystemBalance = async () => { // Renamed from fetchDeBankBalance
    // Only execute if connected, accounts exist, web3 and systemContract are initialized
    if (isConnected && accounts.length > 0 && web3 && systemContract) {
      try {
        // Call the `getBalance` function on the system contract, passing the current account's address.
        // `.call()` is used for read-only (view or pure) functions; it doesn't modify state and doesn't cost gas.
        const balanceWei = await systemContract.methods.getBalance(accounts[0]).call();
        
        // Convert the balance from the smallest token unit (wei) to human-readable VNDT
        // (since VNDT has 18 decimals, similar to ETH, 'ether' unit is used for conversion).
        const balanceVNDT = web3.utils.fromWei(balanceWei, 'ether');
        
        // Update the system balance state and format the number for readability (e.g., 100,000 VNDT).
        setSystemBalance(`${parseFloat(balanceVNDT).toLocaleString('vi-VN')} VNDT`);
      } catch (error) {
        console.error("Error fetching system balance:", error);
        let errorMessage = getErrorMessage(error, `${t.errorGenericFetch}: ${t.errorUnknown}`);
        
        if (errorMessage.includes("Account does not exist")) {
            errorMessage = t.errorAccountDoesNotExist;
        } else if (errorMessage.includes("Insufficient balance")) {
            errorMessage = t.errorInsufficientBalance;
        }
        
        setSystemBalance(t.errorFailedToLoad);
        showAppModal(errorMessage);
      }
    } else if (isConnected && accounts.length > 0 && web3 && currentChainId !== null && !systemContract) {
        setSystemBalance(t.errorFailedToLoad);
    } else {
        setSystemBalance('0 VNDT');
    }
  };

  // --- Function to fetch actual transaction history from the smart contract ---
  // This function calls the `getAccountTransactionHistory` function on the system contract to retrieve transaction history.
  const fetchTransactionHistory = async () => {
    // Only execute if connected, accounts exist, web3 and systemContract are initialized
    if (isConnected && accounts.length > 0 && web3 && systemContract) {
      try {
        // Call the `getAccountTransactionHistory` function on the system contract, passing the current account's address.
        // `.call()` is used for view or pure functions.
        const historyData = await systemContract.methods.getAccountTransactionHistory(accounts[0]).call();
        
        // Process and format the history data for display on the UI.
        const formattedHistory = historyData.map(tx => {
            const amountVNDT = web3.utils.fromWei(tx.amount, 'ether'); // Convert amount from wei to VNDT.
            const date = new Date(Number(tx.timestamp) * 1000); // Convert blockchain timestamp (seconds) to JS Date (milliseconds).
            const formattedTime = date.toLocaleString('vi-VN', { // Format date and time for Vietnamese locale.
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });

            return {
                id: `#${tx.id.toString()}`, // Convert BigInt ID to string and prepend '#'.
                type: tx.txType,
                from: tx.from,
                to: tx.to,
                amount: parseFloat(amountVNDT), // Store as a float for easier formatting.
                time: formattedTime,
            };
        });
        
        // Sort history in descending order by time (most recent transactions first).
        // `getTime()` returns milliseconds since Epoch, used for time comparison.
        formattedHistory.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        setTransactionHistory(formattedHistory); // Update the transaction history state.
      } catch (error) {
        console.error("Error fetching transaction history:", error);
        let errorMessage = getErrorMessage(error, `${t.errorGenericFetch}: ${t.errorUnknown}`);

        if (errorMessage.includes("Account does not exist")) {
            setTransactionHistory([]); // Clear history if account does not exist (expected behavior).
        } else {
            showAppModal(errorMessage); // Show modal for other errors.
            setTransactionHistory([]); // Clear history on other errors.
        }
      }
    } else {
        setTransactionHistory([]); // Clear history if not connected.
    }
  };

  // --- Function to handle click event for "Approve VNDT" button (VNDT.approve) ---
  // Allows the user to grant permission to the system contract to move VNDT from their wallet.
  const handleApproveVNDT = async () => {
    // 1. Check necessary conditions: connected, accounts exist, vndtContract and web3 are ready.
    if (!isConnected || accounts.length === 0 || !vndtContract || !web3) {
      showAppModal(t.modalAdminNoPermission); // Reusing admin permission message for clarity.
      return;
    }

    // 2. Get amount from input and validate it.
    const amountInput = document.getElementById('depositAmount').value;
    if (!amountInput || parseFloat(amountInput) <= 0) {
      showAppModal(t.modalAdminInvalidLimit); // Reusing admin invalid limit message.
      return;
    }

    try {
      // Convert the input amount to the token's smallest unit (wei).
      // VNDT has 18 decimals, similar to ETH ('ether' unit in web3.utils.toWei is for 18 decimals).
      const amountWei = web3.utils.toWei(amountInput, 'ether');

      showAppModal(t.modalApproveConfirm.replace('{amount}', amountInput)); // Display confirmation message.
      
      // Call the `approve` function on the VNDT contract.
      // `vndtContract.methods.approve(spenderAddress, amount).send({ from: senderAddress })`
      // `spenderAddress`: The address of the system contract (DEBANK_CONTRACT_ADDRESS), which is granted permission.
      // `amountWei`: The amount of tokens (in wei) to approve for the system.
      // `from: accounts[0]`: Specifies the current user's MetaMask account as the sender of the `approve` transaction.
      const tx = await vndtContract.methods.approve(DEBANK_CONTRACT_ADDRESS, amountWei).send({ from: accounts[0] });

      showAppModal(`${t.modalApproveSuccess} ${tx.transactionHash}`); // Display success message and transaction hash.
      
    } catch (error) {
      console.error("Error approving VNDT:", error);
      let errorMessage = getErrorMessage(error, `${t.modalApproveError} ${t.errorUnknown}`);

      if (errorMessage.includes("ERC20InsufficientBalance")) {
          errorMessage = t.errorInsufficientBalance; // Specific insufficient balance error.
      }
      showAppModal(errorMessage);
    }
  };

  // --- Function to handle click event for "Deposit" button ---
  // Transfers VNDT from the user's MetaMask wallet to their account within the system contract.
  // Requires the user to have approved sufficient funds beforehand.
  const handleDeposit = async () => {
    // 1. Check necessary conditions
    if (!isConnected || accounts.length === 0 || !systemContract || !web3) {
      showAppModal(t.modalAdminNoPermission);
      return;
    }

    // 2. Get amount from input and validate it
    const amountInput = document.getElementById('depositAmount').value;
    if (!amountInput || parseFloat(amountInput) <= 0) {
      showAppModal(t.modalAdminInvalidLimit);
      return;
    }

    try {
      // Get the current VNDT balance in the user's wallet.
      const walletVNDTBalanceWei = await vndtContract.methods.balanceOf(accounts[0]).call();
      // Convert the input amount to the token's smallest unit (wei).
      const amountWei = web3.utils.toWei(amountInput, 'ether');

      // Check if the input amount exceeds the VNDT balance in the user's MetaMask wallet.
      if (web3.utils.toBigInt(amountWei) > web3.utils.toBigInt(walletVNDTBalanceWei)) {
          showAppModal(`${t.errorInsufficientBalance}. ${t.modalDepositError}`); // More specific error message.
          return; // Stop the function if funds are insufficient.
      }

      showAppModal(t.modalDepositConfirm.replace('{amount}', amountInput));
      
      // Call the `deposit` function on the system contract.
      // The `deposit` function internally calls `transferFrom`, which requires prior approval from the user.
      const tx = await systemContract.methods.deposit(amountWei).send({ from: accounts[0] });

      showAppModal(`${t.modalDepositSuccess} ${tx.transactionHash}`);
      
      // After successful transaction, update the displayed system balance.
      fetchSystemBalance(); 
      // Update the wallet's ETH balance as transactions consume gas.
      fetchEthBalance(web3, accounts[0]); 
      // Update transaction history.
      fetchTransactionHistory();

    } catch (error) {
      console.error("Error depositing funds into the system:", error);
      let errorMessage = getErrorMessage(error, `${t.modalDepositError} ${t.errorUnknown}`);

      if (errorMessage.includes("VNDT transferFrom failed. Did you approve enough?") || errorMessage.includes("ERC20InsufficientAllowance")) { 
          errorMessage = t.modalApproveError; // Specific approval error.
      } else if (errorMessage.includes("ERC20InsufficientBalance")) {
          errorMessage = t.errorInsufficientBalance; // Specific token balance error.
      }
      showAppModal(errorMessage);
    }
  };

  // --- Function to handle click event for "Withdraw" button ---
  // Withdraws VNDT from the user's system account to their MetaMask wallet.
  const handleWithdraw = async () => {
    // 1. Check necessary conditions
    if (!isConnected || accounts.length === 0 || !systemContract || !web3) {
      showAppModal(t.modalAdminNoPermission);
      return;
    }

    // 2. Get amount from input and validate it
    const amountInput = document.getElementById('withdrawAmount').value;
    if (!amountInput || parseFloat(amountInput) <= 0) {
      showAppModal(t.modalAdminInvalidLimit);
      return;
    }

    try {
      // Convert the input amount to the token's smallest unit (wei).
      const amountWei = web3.utils.toWei(amountInput, 'ether');

      showAppModal(t.modalWithdrawConfirm.replace('{amount}', amountInput));
      
      // Call the `withdraw` function on the system contract.
      // This function will check the balance within the system before execution.
      const tx = await systemContract.methods.withdraw(amountWei).send({ from: accounts[0] });

      showAppModal(`${t.modalWithdrawSuccess} ${tx.transactionHash}`);
      
      fetchSystemBalance(); 
      fetchEthBalance(web3, accounts[0]); 
      fetchTransactionHistory();

    } catch (error) {
      console.error("Error withdrawing funds from the system:", error);
      let errorMessage = getErrorMessage(error, `${t.modalWithdrawError} ${t.errorUnknown}`);

      if (errorMessage.includes("Insufficient balance")) {
          errorMessage = t.errorInsufficientBalance;
      } else if (errorMessage.includes("Account does not exist")) {
          errorMessage = t.errorAccountDoesNotExist;
      }
      showAppModal(errorMessage);
    }
  };

  // --- Function to handle click event for "Transfer" button ---
  // Transfers VNDT between two accounts within the system (internal contract transfer).
  const handleTransfer = async () => {
    // 1. Check necessary conditions
    if (!isConnected || accounts.length === 0 || !systemContract || !web3) {
      showAppModal(t.modalAdminNoPermission);
      return;
    }

    // 2. Get recipient address and amount from input
    const recipientAddress = document.getElementById('recipientAddress').value;
    const amountInput = document.getElementById('transferAmount').value;

    // 3. Validate input
    if (!recipientAddress || !web3.utils.isAddress(recipientAddress)) {
      showAppModal(t.errorZeroAddress); // Reusing zero address error for invalid format.
      return;
    }
    if (recipientAddress.toLowerCase() === accounts[0].toLowerCase()) {
      showAppModal(t.errorTransferToSelf);
      return;
    }
    if (!amountInput || parseFloat(amountInput) <= 0) {
      showAppModal(t.modalAdminInvalidLimit); // Reusing admin invalid limit message.
      return;
    }

    try {
      // Convert the input amount to the token's smallest unit (wei).
      const amountWei = web3.utils.toWei(amountInput, 'ether');

      showAppModal(t.modalTransferConfirm.replace('{amount}', amountInput).replace('{recipient}', recipientAddress));
      
      // Call the `transfer` function on the system contract.
      // This function will check balance, limits, account existence, etc.
      const tx = await systemContract.methods.transfer(recipientAddress, amountWei).send({ from: accounts[0] });

      showAppModal(`${t.modalTransferSuccess} ${tx.transactionHash}`);
      
      fetchSystemBalance(); 
      fetchEthBalance(web3, accounts[0]); 
      fetchTransactionHistory();

    } catch (error) {
      console.error("Error transferring funds:", error);
      let errorMessage = getErrorMessage(error, `${t.modalTransferError} ${t.errorUnknown}`);

      if (errorMessage.includes("Insufficient balance")) {
          errorMessage = t.errorInsufficientBalance;
      } else if (errorMessage.includes("Account does not exist")) {
          errorMessage = t.errorAccountDoesNotExist;
      } else if (errorMessage.includes("Daily transfer limit exceeded")) {
          errorMessage = t.errorDailyLimitExceeded;
      } else if (errorMessage.includes("Zero address not allowed")) {
          errorMessage = t.errorZeroAddress;
      } else if (errorMessage.includes("Cannot transfer to yourself")) {
          errorMessage = t.errorTransferToSelf;
      }
      showAppModal(errorMessage);
    }
  };


  // --- useEffect hook: Runs once after the component mounts to auto-connect wallet ---
  // Purpose: Automatically reconnects the wallet if the user has previously granted permission and MetaMask still has the account selected.
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum) { // Check if MetaMask is available
        const web3Instance = new Web3(window.ethereum); // Create Web3.js instance
        setWeb3(web3Instance);

        const accs = await web3Instance.eth.getAccounts(); // Get previously granted accounts
        if (accs.length > 0) { // If accounts are connected
          setAccounts(accs); // Update accounts
          setIsConnected(true); // Set connected status
          const chainId = await web3Instance.eth.getChainId(); // Get Chain ID
          setCurrentChainId(Number(chainId)); // Update Chain ID
          updateNetworkName(Number(chainId)); // Update network name
          fetchEthBalance(web3Instance, accs[0]); // Get ETH balance

          setIsContractOwner(accs[0].toLowerCase() === BANK_OWNER_ADDRESS.toLowerCase());

          initializeContracts(web3Instance);

          registerEventListeners(web3Instance, accs);
        }
      }
    };

    autoConnect(); // Call auto-connect function when component mounts
  }, []); // Empty dependency array ensures useEffect runs only once after initial render (similar to componentDidMount).

  // --- useEffect to update system balance and history when account or connection changes ---
  // This function runs whenever its dependencies (isConnected, accounts, web3, systemContract, currentChainId) change.
  useEffect(() => {
    if (isConnected && accounts.length > 0 && web3 && currentChainId !== null) {
      if (systemContract) { // Only fetch system balance if the contract is initialized
          fetchSystemBalance();
          fetchTransactionHistory();
          if (isContractOwner) { // Fetch admin configs if connected account is contract owner
              fetchAdminConfig();
          }
      } else { // If systemContract is not ready, try to initialize again (might be due to state update later)
          initializeContracts(web3); 
      }
    } else { // Reset balances/history when not connected or no account selected
        setSystemBalance('0 VNDT');
        setTransactionHistory([]);
        setCurrentDailyLimit('0 VNDT');
        setCurrentFeeRate('0%');
    }
  }, [isConnected, accounts, web3, systemContract, currentChainId, isContractOwner]); // Dependencies for useEffect.

  // --- Function to manage Tab UI (Switching between transaction tabs) ---
  const handleTabClick = (tabName) => {
    setActiveTab(tabName); // Update active tab
  };

  // --- Function to get paginated history data for the current page ---
  const getPaginatedHistory = () => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return transactionHistory.slice(startIndex, endIndex);
  };

  // Calculate total number of pages
  const totalPages = Math.ceil(transactionHistory.length / recordsPerPage);

  // --- Function to handle page change events ---
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // --- Function to fetch Admin configuration from the smart contract ---
  const fetchAdminConfig = async () => {
      if (isConnected && systemContract && isContractOwner) {
          try {
              const dailyLimitWei = await systemContract.methods.dailyTransferLimit().call();
              const feeRateBp = await systemContract.methods.transferFeeRate().call();

              const dailyLimitVNDT = web3.utils.fromWei(dailyLimitWei, 'ether');
              setCurrentDailyLimit(`${parseFloat(dailyLimitVNDT).toLocaleString('vi-VN')} VNDT`);
              setNewDailyLimitInput(dailyLimitVNDT.toString());

              const feeRatePercent = parseFloat(feeRateBp.toString()) / 100;
              setCurrentFeeRate(`${feeRatePercent.toFixed(2)}%`);
              setNewFeeRateInput(feeRateBp.toString());
          } catch (error) {
              console.error("Error fetching admin configuration:", error);
              showAppModal(getErrorMessage(error, `${t.errorGenericFetch}: ${t.errorUnknown}`));
              setCurrentDailyLimit(t.errorFailedToLoad);
              setCurrentFeeRate(t.errorFailedToLoad);
          }
      }
  };

  // --- Function to handle click event for "Update Daily Transfer Limit" button ---
  const handleSetDailyLimit = async () => {
      if (!isConnected || !isContractOwner || !systemContract || !web3) {
          showAppModal(t.modalAdminNoPermission);
          return;
      }
      if (!newDailyLimitInput || parseFloat(newDailyLimitInput) <= 0) {
          showAppModal(t.modalAdminInvalidLimit);
          return;
      }

      try {
          const amountWei = web3.utils.toWei(newDailyLimitInput, 'ether');
          showAppModal(t.modalAdminUpdateLimitConfirm.replace('{amount}', parseFloat(newDailyLimitInput).toLocaleString('vi-VN')));
          
          const tx = await systemContract.methods.setDailyTransferLimit(amountWei).send({ from: accounts[0] });
          showAppModal(`${t.modalAdminUpdateLimitSuccess} ${tx.transactionHash}`);
          fetchAdminConfig(); // Update UI after success
      } catch (error) {
          console.error("Error updating daily limit:", error);
          let errorMessage = getErrorMessage(error, `${t.modalAdminUpdateLimitError} ${t.errorUnknown}`);
          if (errorMessage.includes("Only bank owner can call this function")) {
            errorMessage = t.errorContractOwnerOnly;
          }
          showAppModal(errorMessage);
      }
  };

  // --- Function to handle click event for "Update Transfer Fee Rate" button ---
  const handleSetFeeRate = async () => {
      if (!isConnected || !isContractOwner || !systemContract || !web3) {
          showAppModal(t.modalAdminNoPermission);
          return;
      }
      if (!newFeeRateInput || parseFloat(newFeeRateInput) < 0 || parseFloat(newFeeRateInput) > 10000) {
          showAppModal(t.modalAdminInvalidFeeRate);
          return;
      }

      try {
          const feeRateBp = parseInt(newFeeRateInput);
          showAppModal(t.modalAdminUpdateFeeRateConfirm.replace('{rate}', (feeRateBp / 100).toFixed(2)));
          
          const tx = await systemContract.methods.setTransferFeeRate(feeRateBp).send({ from: accounts[0] });
          showAppModal(`${t.modalAdminUpdateFeeRateSuccess} ${tx.transactionHash}`);
          fetchAdminConfig();
      } catch (error) {
          console.error("Error updating fee rate:", error);
          let errorMessage = getErrorMessage(error, `${t.modalAdminUpdateFeeRateError} ${t.errorUnknown}`);
          if (errorMessage.includes("Only bank owner can call this function")) {
            errorMessage = t.errorContractOwnerOnly;
          }
          showAppModal(errorMessage);
      }
  };

  // --- Function to handle click event for "Pause Contract" button ---
  const handlePauseContract = async () => {
    if (!isConnected || !isContractOwner || !systemContract || !web3) {
      showAppModal(t.modalAdminNoPermission);
      return;
    }

    try {
      showAppModal(t.modalAdminPauseConfirm);
      const tx = await systemContract.methods.pause().send({ from: accounts[0] });
      showAppModal(`${t.modalAdminPauseSuccess} ${tx.transactionHash}`);
    } catch (error) {
      console.error("Error pausing contract:", error);
      let errorMessage = getErrorMessage(error, `${t.modalAdminPauseError} ${t.errorUnknown}`);
      if (errorMessage.includes("Only bank owner can call this function")) {
          errorMessage = t.errorContractOwnerOnly;
      } else if (errorMessage.includes("Pausable: paused")) {
          errorMessage = t.errorContractPaused;
      }
      showAppModal(errorMessage);
    }
  };

  // --- Function to handle click event for "Unpause Contract" button ---
  const handleUnpauseContract = async () => {
    if (!isConnected || !isContractOwner || !systemContract || !web3) {
      showAppModal(t.modalAdminNoPermission);
      return;
    }

    try {
      showAppModal(t.modalAdminUnpauseConfirm);
      const tx = await systemContract.methods.unpause().send({ from: accounts[0] });
      showAppModal(`${t.modalAdminUnpauseSuccess} ${tx.transactionHash}`);
    } catch (error) {
      console.error("Error unpausing contract:", error);
      let errorMessage = getErrorMessage(error, `${t.modalAdminUnpauseError} ${t.errorUnknown}`);
      if (errorMessage.includes("Only bank owner can call this function")) {
          errorMessage = t.errorContractOwnerOnly;
      } else if (errorMessage.includes("Pausable: not paused")) {
          errorMessage = t.errorContractNotPaused;
      }
      showAppModal(errorMessage);
    }
  };

  // --- Function to handle click event for "Deposit Savings" button ---
  // Deposits VNDT into the user's savings account.
  const handleDepositSavings = async () => {
    if (!isConnected || accounts.length === 0 || !systemContract || !web3) {
      showAppModal(t.modalAdminNoPermission);
      return;
    }

    const amountInput = document.getElementById('savingsAmount').value;
    const durationInput = document.getElementById('savingsDuration').value;

    if (!amountInput || parseFloat(amountInput) <= 0) {
      showAppModal(t.errorSavingsAmountZero);
      return;
    }
    if (!durationInput || parseInt(durationInput) <= 0) {
      showAppModal(t.errorSavingsDurationInvalid);
      return;
    }

    try {
      const amountWei = web3.utils.toWei(amountInput, 'ether');
      const durationMonths = parseInt(durationInput);

      showAppModal(t.modalSavingsConfirm.replace('{amount}', amountInput).replace('{duration}', durationMonths));
      
      const tx = await systemContract.methods.depositSavings(amountWei, durationMonths).send({ from: accounts[0] });

      showAppModal(`${t.modalSavingsSuccess} ${tx.transactionHash}`);
      
      fetchSystemBalance(); 
      fetchTransactionHistory();

    } catch (error) {
      console.error("Error depositing savings:", error);
      let errorMessage = getErrorMessage(error, `${t.modalSavingsError} ${t.errorUnknown}`);

      if (errorMessage.includes("Insufficient balance")) {
          errorMessage = t.errorInsufficientBalance;
      } else if (errorMessage.includes("Account does not exist")) {
          errorMessage = t.errorAccountDoesNotExist;
      } else if (errorMessage.includes("Savings duration must be between 1 and 60 months")) {
          errorMessage = t.errorSavingsDurationInvalid;
      } else if (errorMessage.includes("Savings deposit amount must be greater than zero")) {
          errorMessage = t.errorSavingsAmountZero;
      } else if (errorMessage.includes("Pausable: paused")) {
          errorMessage = t.errorContractPaused;
      }
      showAppModal(errorMessage);
    }
  };


  return (
    <div className="bg-[#005082] text-gray-800 min-h-screen flex flex-col font-inter">
      {showModal && (
        <div id="appModal" className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={closeAppModal}>&times;</span>
            <p id="modalMessage" className="text-lg my-4">{modalMessage}</p>
            <button className="bg-[#00A1E4] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#0077B6] transition-colors" onClick={closeAppModal}>{t.update}</button> {/* Reusing update for close button */}
          </div>
        </div>
      )}

      <header className="bg-[#0077B6] p-4 text-white shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t.appName} 🏦</h1> {/* Use translated app name */}
          <div className="flex items-center space-x-4">
            <select 
              className="bg-white text-[#005082] px-3 py-1 rounded-md text-sm font-semibold"
              onChange={(e) => setLanguage(e.target.value)}
              value={language}
            >
              <option value="en">English</option>
              <option value="vi">Tiếng Việt</option>
            </select>
            <button
              id="connectWalletBtn"
              onClick={isConnected ? disconnectWallet : connectWallet}
              className="bg-[#00A1E4] hover:bg-[#90E0EF] text-white hover:text-[#005082] font-semibold py-2 px-6 rounded-lg shadow-md transition-colors"
            >
              {isConnected ? t.disconnectWallet : t.connectWallet}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        <section className="lg:col-span-1 bg-white rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-[#005082] mb-4">{t.accountSummary}</h2>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-medium">{t.status}:</span>
            <span className={`font-semibold ${isConnected ? 'text-green-600' : 'text-red-500'}`}>
              {isConnected ? t.connected : t.notConnected}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-medium">{t.network}:</span>
            <span className="text-sm font-semibold text-gray-700">{networkName}</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium">{t.walletAddress}:</span>
            <span id="userAddress" className="text-sm font-mono bg-gray-100 p-2 rounded-md truncate max-w-[100px]">
              {accounts.length > 0 ? `${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}` : t.notConnected}
            </span>
            <button
              id="copyAddressBtn"
              onClick={copyAddress}
              className="ml-2 bg-[#90E0EF] text-[#005082] px-3 py-1 rounded-md text-sm hover:bg-[#CAF0F8] transition-colors"
              title={t.copyAddress}
            >
              📋
            </button>
          </div>
          <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-medium">{t.walletBalanceEth}</span>
              <span id="ethBalance" className="text-xl font-bold text-gray-700">{ethBalance}</span>
          </div>
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg font-medium">{t.systemBalance}</span> 
            <span id="systemBalance" className="text-2xl font-bold text-[#00A1E4]">{systemBalance}</span>
          </div>
          <p className="text-sm text-gray-500 italic">{t.balanceDescription}</p>
        </section>

        <section className="lg:col-span-2 bg-white rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-[#005082] mb-4">{t.transactions}</h2>

          <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                className={`tab-button whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg text-gray-500 hover:text-gray-700 hover:border-gray-300 ${activeTab === 'deposit' ? 'active' : ''}`}
                onClick={() => handleTabClick('deposit')}
              >{t.depositTab}</button>
              <button
                className={`tab-button whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg text-gray-500 hover:text-gray-700 hover:border-gray-300 ${activeTab === 'withdraw' ? 'active' : ''}`}
                onClick={() => handleTabClick('withdraw')}
              >{t.withdrawTab}</button>
              <button
                className={`tab-button whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg text-gray-500 hover:text-gray-700 hover:border-gray-300 ${activeTab === 'transfer' ? 'active' : ''}`}
                onClick={() => handleTabClick('transfer')}
              >{t.transferTab}</button>
              <button
                className={`tab-button whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg text-gray-500 hover:text-gray-700 hover:border-gray-300 ${activeTab === 'savings' ? 'active' : ''}`}
                onClick={() => handleTabClick('savings')}
              >{t.savingsTab}</button>
            </nav>
          </div>

          <div id="depositContent" className={`tab-content ${activeTab === 'deposit' ? 'active' : ''}`}>
            <h3 className="text-xl font-semibold text-[#0077B6] mb-4">{t.depositTitle}</h3>
            <p className="text-gray-600 mb-4">{t.depositApprovalNeeded}</p>
            <div className="mb-4">
              <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700 mb-2">{t.depositAmount}</label>
              <input type="number" id="depositAmount" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-[#00A1E4] focus:border-[#00A1E4]" placeholder={t.enterVNDT} min="0.001" />
            </div>
            <div className="flex space-x-4">
              <button
                id="approveBtn"
                className="flex-1 bg-[#00A1E4] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0077B6] transition-colors shadow-md"
                onClick={handleApproveVNDT}
              >
                {t.approveVNDT}
              </button>
              <button
                id="depositBtn"
                className="flex-1 bg-[#0077B6] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#005082] transition-colors shadow-md"
                onClick={handleDeposit}
              >
                {t.sendFunds}
              </button>
            </div>
          </div>

          <div id="withdrawContent" className={`tab-content ${activeTab === 'withdraw' ? 'active' : ''}`}>
            <h3 className="text-xl font-semibold text-[#0077B6] mb-4">{t.withdrawTitle}</h3>
            <div className="mb-4">
              <label htmlFor="withdrawAmount" className="block text-sm font-medium text-gray-700 mb-2">{t.withdrawAmount}</label>
              <input type="number" id="withdrawAmount" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-[#00A1E4] focus:border-[#00A1E4]" placeholder={t.enterVNDT} min="0.001" />
            </div>
            <button
              id="withdrawBtn"
              className="w-full bg-[#00A1E4] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0077B6] transition-colors shadow-md"
              onClick={handleWithdraw}
            >
              {t.withdrawTab}
            </button>
          </div>

          <div id="transferContent" className={`tab-content ${activeTab === 'transfer' ? 'active' : ''}`}>
            <h3 className="text-xl font-semibold text-[#0077B6] mb-4">{t.transferTitle}</h3>
            <div className="mb-4">
              <label htmlFor="recipientAddress" className="block text-sm font-medium text-gray-700 mb-2">{t.recipientAddress}</label>
              <input type="text" id="recipientAddress" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-[#00A1E4] focus:border-[#00A1E4]" placeholder="Ví dụ: 0xAbC...123" />
            </div>
            <div className="mb-4">
              <label htmlFor="transferAmount" className="block text-sm font-medium text-gray-700 mb-2">{t.transferAmount}</label>
              <input type="number" id="transferAmount" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-[#00A1E4] focus:border-[#00A1E4]" placeholder={t.enterVNDT} min="0.001" />
            </div>
            <button
              id="transferBtn"
              className="w-full bg-[#00A1E4] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0077B6] transition-colors shadow-md"
              onClick={handleTransfer}
            >
              {t.transferTab}
            </button>
          </div>

          <div id="savingsContent" className={`tab-content ${activeTab === 'savings' ? 'active' : ''}`}>
            <h3 className="text-xl font-semibold text-[#0077B6] mb-4">{t.savingsTitle}</h3>
            <p className="text-gray-600 mb-4">{t.savingsDescription}</p>
            <div className="mb-4">
              <label htmlFor="savingsAmount" className="block text-sm font-medium text-gray-700 mb-2">{t.savingsAmount}</label>
              <input type="number" id="savingsAmount" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-[#00A1E4] focus:border-[#00A1E4]" placeholder={t.enterVNDT} min="0.001" />
            </div>
            <div className="mb-4">
              <label htmlFor="savingsDuration" className="block text-sm font-medium text-gray-700 mb-2">{t.savingsDuration}</label>
              <select id="savingsDuration" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-[#00A1E4] focus:border-[#00A1E4]">
                <option value="3">{t.months3}</option>
                <option value="6">{t.months6}</option>
                <option value="12">{t.months12}</option>
              </select>
            </div>
            <button
              id="depositSavingsBtn"
              className="w-full bg-[#00A1E4] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0077B6] transition-colors shadow-md"
              onClick={handleDepositSavings}
            >
              {t.depositSavings}
            </button>
          </div>

        </section>

        <section className="lg:col-span-3 bg-white rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-[#005082] mb-4">{t.transactionHistory}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#CAF0F8]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.id}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.type}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.from}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.to}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.amountVNDT}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.time}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getPaginatedHistory().map((tx, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-[100px]">
                      {tx.from && tx.from.startsWith('0x') ? `${tx.from.substring(0, 6)}...${tx.from.substring(tx.from.length - 4)}` : tx.from}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-[100px]">
                      {tx.to && tx.to.startsWith('0x') ? `${tx.to.substring(0, 6)}...${tx.to.substring(tx.to.length - 4)}` : tx.to}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      (tx.type === 'Gửi Tiền' || tx.type === 'Nhận Tiền') ? 'text-[#00A1E4]' : 'text-[#0077B6]'
                    } font-semibold`}>
                      {tx.amount.toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactionHistory.length > 0 && (
              <div className="flex justify-center items-center mt-4 space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-[#90E0EF] text-[#005082] rounded-lg disabled:opacity-50 hover:bg-[#CAF0F8] transition-colors"
                >
                  {t.previous}
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === i + 1 ? 'bg-[#00A1E4] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-[#90E0EF] text-[#005082] rounded-lg disabled:opacity-50 hover:bg-[#CAF0F8] transition-colors"
                >
                  {t.next}
                </button>
              </div>
            )}
            {transactionHistory.length === 0 && isConnected && (
                <p className="text-center text-gray-500 py-4">{t.noTransactions}</p>
            )}
            {transactionHistory.length === 0 && !isConnected && (
                <p className="text-center text-gray-500 py-4">{t.connectToViewHistory}</p>
            )}
          </div>
        </section>

        {isContractOwner && (
          <section className="lg:col-span-3 bg-white rounded-xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-[#005082] mb-4">{t.adminPanel}</h2>
            <p className="text-gray-600 mb-4">{t.adminDescription}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#CAF0F8] p-4 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-[#0077B6] mb-4">{t.updateDailyLimit}</h3>
                  <div className="mb-4">
                      <label htmlFor="newDailyLimit" className="block text-sm font-medium text-gray-700 mb-2">{t.newLimit}</label>
                      <input 
                        type="number" 
                        id="newDailyLimit" 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#00A1E4] focus:border-[#00A1E4]" 
                        placeholder="Ví dụ: 100000000"
                        value={newDailyLimitInput}
                        onChange={(e) => setNewDailyLimitInput(e.target.value)}
                      />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{t.current} <span className="font-semibold text-[#0077B6]">{currentDailyLimit}</span></p>
                  <button 
                    id="setDailyLimitBtn" 
                    className="w-full bg-[#00A1E4] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#0077B6] transition-colors shadow-md" 
                    onClick={handleSetDailyLimit}
                  >
                      {t.update}
                  </button>
              </div>

              <div className="bg-[#CAF0F8] p-4 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-[#0077B6] mb-4">{t.updateFeeRate}</h3>
                  <div className="mb-4">
                      <label htmlFor="newFeeRate" className="block text-sm font-medium text-gray-700 mb-2">{t.newFeeRate}</label>
                      <input 
                        type="number" 
                        id="newFeeRate" 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#00A1E4] focus:border-[#00A1E4]" 
                        placeholder="Ví dụ: 100 (tức 1%)" min="0" 
                        value={newFeeRateInput}
                        onChange={(e) => setNewFeeRateInput(e.target.value)}
                      />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{t.current} <span className="font-semibold text-[#0077B6]">{currentFeeRate}</span></p>
                  <button 
                    id="setFeeRateBtn" 
                    className="w-full bg-[#00A1E4] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#0077B6] transition-colors shadow-md" 
                    onClick={handleSetFeeRate}
                  >
                      {t.update}
                  </button>
              </div>
            </div>
            
            <div className="mt-6">
                <h3 className="text-xl font-semibold text-[#0077B6] mb-4">{t.contractManagement}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button 
                      id="pauseContractBtn" 
                      className="w-full bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-md" 
                      onClick={handlePauseContract}
                    >
                        {t.pauseContract}
                    </button>
                    <button 
                      id="unpauseContractBtn" 
                      className="w-full bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-md" 
                      onClick={handleUnpauseContract}
                    >
                        {t.unpauseContract}
                    </button>
                </div>
            </div>

          </section>
        )}
      </main>

      <footer className="bg-[#0077B6] p-4 text-center text-white mt-auto">
        <p className="text-sm">{t.appFooter}</p>
      </footer>
    </div>
  );
}

export default App;
