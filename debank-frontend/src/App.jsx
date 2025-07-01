import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css'; // Import các style tùy chỉnh cho modal và tabs

// Import ABI của các smart contract
// Đảm bảo bạn đã sao chép VNDT.json và DeBank.json vào thư mục src/contracts/
import VNDT_ABI from './contracts/VNDT.json';
import DeBank_ABI from './contracts/DeBank.json';

// Lấy địa chỉ contract và địa chỉ Bank Owner từ biến môi trường
const VNDT_CONTRACT_ADDRESS = import.meta.env.VITE_VNDT_CONTRACT_ADDRESS;
const DEBANK_CONTRACT_ADDRESS = import.meta.env.VITE_DEBANK_CONTRACT_ADDRESS;
const BANK_OWNER_ADDRESS = import.meta.env.VITE_BANK_OWNER_ADDRESS; // Địa chỉ ví của chủ ngân hàng (admin)

function App() {
  // --- Khai báo các biến trạng thái (State Variables) ---
  const [web3, setWeb3] = useState(null); // Instance của thư viện Web3.js, dùng để tương tác với blockchain
  const [accounts, setAccounts] = useState([]); // Mảng chứa các địa chỉ ví mà người dùng đã kết nối (thường chỉ là accounts[0])
  const [isConnected, setIsConnected] = useState(false); // Trạng thái kết nối ví MetaMask (true/false)
  const [currentChainId, setCurrentChainId] = useState(null); // ID của mạng blockchain hiện tại (ví dụ: Sepolia là 11155111, Hardhat là 31337)
  const [networkName, setNetworkName] = useState('Chưa kết nối'); // Tên hiển thị của mạng blockchain hiện tại
  
  // State quản lý Modal thông báo (thay thế cho alert/confirm truyền thống)
  const [modalMessage, setModalMessage] = useState(''); // Nội dung tin nhắn hiển thị trong modal
  const [showModal, setShowModal] = useState(false); // Trạng thái hiển thị modal (true/false)

  // State cho số dư và lịch sử giao dịch
  const [debankBalance, setDebankBalance] = useState('0 VNDT'); // Số dư VNDT của người dùng trong hợp đồng DeBank
  const [ethBalance, setEthBalance] = useState('0 ETH'); // Số dư ETH (hoặc SepoliaETH trên testnet) trong ví MetaMask của người dùng
  const [transactionHistory, setTransactionHistory] = useState([]); // Mảng chứa các bản ghi lịch sử giao dịch
  
  // State quản lý tab đang hoạt động trong phần "Giao Dịch" (Gửi, Rút, Chuyển, Tiết Kiệm)
  const [activeTab, setActiveTab] = useState('deposit'); 

  // State để lưu trữ instance của smart contract VNDT và DeBank sau khi khởi tạo
  const [vndtContract, setVndtContract] = useState(null); // Instance của hợp đồng VNDT token
  const [debankContract, setDebankContract] = useState(null); // Instance của hợp đồng DeBank
  
  // State để kiểm tra xem tài khoản MetaMask hiện tại có phải là chủ sở hữu ngân hàng (bank owner) không
  const [isBankOwner, setIsBankOwner] = useState(false);

  // State và Constants cho phân trang
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại của lịch sử giao dịch
  const recordsPerPage = 5; // Số bản ghi trên mỗi trang

  // States cho Admin Panel (Hạn mức và Tỷ lệ phí)
  const [currentDailyLimit, setCurrentDailyLimit] = useState('0 VNDT'); // Hạn mức chuyển khoản hàng ngày hiện tại
  const [newDailyLimitInput, setNewDailyLimitInput] = useState(''); // Giá trị input cho hạn mức mới
  const [currentFeeRate, setCurrentFeeRate] = useState('0%'); // Tỷ lệ phí chuyển khoản hiện tại
  const [newFeeRateInput, setNewFeeRateInput] = useState(''); // Giá trị input cho tỷ lệ phí mới


  // --- Hàm tiện ích để hiển thị thông báo modal ---
  const showAppModal = (message) => {
    setModalMessage(message); // Đặt nội dung tin nhắn
    setShowModal(true); // Hiển thị modal
  };

  // Hàm đóng modal
  const closeAppModal = () => {
    setShowModal(false); // Ẩn modal
    setModalMessage(''); // Xóa nội dung tin nhắn
  };

  // --- HÀM HELPER ĐỂ PHÂN TÍCH VÀ HIỂN THỊ LỖI RÕ RÀNG HƠN ---
  // Hàm này cố gắng trích xuất thông báo lỗi cụ thể từ đối tượng lỗi trả về của Web3.js/MetaMask/RPC.
  const getErrorMessage = (error, defaultMessage = "Lỗi không rõ nguyên nhân.") => {
    let errorMessage = defaultMessage; // Thông báo lỗi mặc định

    if (error.code === 4001) { // Người dùng từ chối giao dịch
      errorMessage = "Giao dịch bị từ chối bởi người dùng.";
    } else if (error.data && typeof error.data === 'object' && (error.data.message || error.data.reason)) {
        const revertReason = error.data.message || error.data.reason; // Hardhat/Ganache thường đưa lỗi vào message hoặc reason

        if (revertReason.includes("DeBank: Insufficient balance")) {
            errorMessage = "Lỗi: Số dư DeBank không đủ để thực hiện giao dịch.";
        } else if (revertReason.includes("DeBank: Account does not exist")) {
            errorMessage = "Lỗi: Tài khoản của bạn chưa tồn tại trong DeBank (chưa có giao dịch gửi tiền).";
        } else if (revertReason.includes("VNDT transferFrom failed. Did you approve enough?") || revertReason.includes("ERC20InsufficientAllowance")) {
            errorMessage = "Lỗi: Bạn chưa phê duyệt đủ VNDT cho DeBank.";
        } else if (revertReason.includes("ERC20InsufficientBalance")) {
            errorMessage = "Lỗi: Số dư VNDT trong ví của bạn không đủ."; // Cho trường hợp token không đủ trong ví
        } else if (revertReason.includes("DeBank: Daily transfer limit exceeded")) {
            errorMessage = "Lỗi: Bạn đã vượt quá hạn mức chuyển tiền hàng ngày.";
        } else if (revertReason.includes("DeBank: Zero address not allowed")) {
            errorMessage = "Lỗi: Địa chỉ không hợp lệ (địa chỉ 0x0).";
        } else if (revertReason.includes("DeBank: Cannot transfer to yourself")) {
            errorMessage = "Lỗi: Không thể chuyển tiền cho chính bạn.";
        } else if (revertReason.includes("Only bank owner can call this function")) {
            errorMessage = "Lỗi: Bạn không phải chủ sở hữu ngân hàng để thực hiện chức năng này.";
        } else if (revertReason.includes("Pausable: paused")) {
            errorMessage = "Lỗi: Hợp đồng đã bị tạm dừng. Không thể thực hiện giao dịch.";
        } else if (revertReason.includes("Pausable: not paused")) {
            errorMessage = "Lỗi: Hợp đồng chưa tạm dừng.";
        } else if (revertReason.includes("Savings duration must be between 1 and 60 months")) {
            errorMessage = "Lỗi: Kỳ hạn tiết kiệm phải từ 1 đến 60 tháng.";
        } else if (revertReason.includes("Savings deposit amount must be greater than zero")) {
            errorMessage = "Lỗi: Số tiền gửi tiết kiệm phải lớn hơn 0.";
        } else if (revertReason.includes("execution reverted")) {
            // Fallback cho lỗi revert chung nếu không bắt được các trường hợp cụ thể
            errorMessage = "Giao dịch bị từ chối trên blockchain. Vui lòng kiểm tra log chi tiết.";
        } else {
            errorMessage = `Lỗi từ contract: ${revertReason}`; // Lỗi khác từ contract
        }
    } else if (error.message) {
        // Fallback nếu không có error.data, lấy từ error.message
        errorMessage = `Lỗi: ${error.message}`;
    } else {
        // Fallback cuối cùng
        errorMessage = defaultMessage;
    }

    return errorMessage;
  };


  // --- Hàm để đăng ký các event listener của MetaMask ---
  const registerEventListeners = (web3Instance, accs) => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (newAccs) => {
      setAccounts(newAccs);
      if (newAccs.length === 0) {
        setIsConnected(false);
        showAppModal('Ví MetaMask đã bị ngắt kết nối hoặc không còn tài khoản được chọn.');
        setEthBalance('0 ETH');
        setDebankBalance('0 VNDT');
        setTransactionHistory([]);
        setVndtContract(null);
        setDebankContract(null);
        setIsBankOwner(false);
        setCurrentPage(1);
      } else {
        showAppModal(`Tài khoản MetaMask đã thay đổi sang: ${newAccs[0]}`);
        fetchEthBalance(web3Instance, newAccs[0]);
        setIsBankOwner(newAccs[0].toLowerCase() === BANK_OWNER_ADDRESS.toLowerCase());
        setCurrentPage(1);
      }
    };

    const handleChainChanged = (newChainId) => {
      const parsedChainId = parseInt(newChainId, 16);
      setCurrentChainId(parsedChainId);
      updateNetworkName(parsedChainId);
      showAppModal(`Mạng blockchain đã thay đổi sang Chain ID: ${parsedChainId}`);
      if (accs.length > 0) {
          fetchEthBalance(web3Instance, accs[0]);
      }
      if (web3Instance) {
        initializeContracts(web3Instance);
      }
      setCurrentPage(1);
    };

    const handleDisconnect = (error) => {
      setIsConnected(false);
      setAccounts([]);
      setWeb3(null);
      showAppModal(`Ví MetaMask đã bị ngắt kết nối. Mã: ${error.code}, Lý do: ${error.message}`);
      setEthBalance('0 ETH');
      setDebankBalance('0 VNDT');
      setTransactionHistory([]);
      setVndtContract(null);
      setDebankContract(null);
      setIsBankOwner(false);
      setCurrentPage(1);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);
  };

  // Hàm khởi tạo các instance của smart contract.
  const initializeContracts = (web3Instance) => {
    if (!web3Instance || !VNDT_CONTRACT_ADDRESS || !DEBANK_CONTRACT_ADDRESS) {
      console.error("Web3 instance hoặc địa chỉ contract không khả dụng để khởi tạo.");
      showAppModal("Lỗi: Địa chỉ contract hoặc Web3 chưa sẵn sàng. Vui lòng kiểm tra file .env và kết nối ví.");
      return;
    }

    try {
      const vndt = new web3Instance.eth.Contract(VNDT_ABI.abi, VNDT_CONTRACT_ADDRESS);
      setVndtContract(vndt);

      const debank = new web3Instance.eth.Contract(DeBank_ABI.abi, DEBANK_CONTRACT_ADDRESS);
      setDebankContract(debank);

    } catch (error) {
      console.error("Lỗi khi khởi tạo contract instances:", error);
      showAppModal(getErrorMessage(error, "Lỗi: Không thể khởi tạo smart contract. Vui lòng kiểm tra địa chỉ contract và mạng.")); // Sử dụng getErrorMessage
      setVndtContract(null);
      setDebankContract(null);
    }
  };

  // --- Hàm kết nối ví MetaMask ---
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccounts(accs);
        setIsConnected(true);
        showAppModal('Kết nối ví MetaMask thành công!');

        const chainId = await web3Instance.eth.getChainId();
        setCurrentChainId(Number(chainId));
        updateNetworkName(Number(chainId));

        if (accs.length > 0) {
            fetchEthBalance(web3Instance, accs[0]);
            setIsBankOwner(accs[0].toLowerCase() === BANK_OWNER_ADDRESS.toLowerCase());
        }
        
        initializeContracts(web3Instance);
        
        registerEventListeners(web3Instance, accs);
      } catch (error) {
        if (error.code === 4001) {
          showAppModal('Bạn đã từ chối yêu cầu kết nối ví MetaMask.');
        } else {
          showAppModal(`Lỗi kết nối ví: ${error.message}`);
        }
      }
    } else {
      showAppModal('Vui lòng cài đặt ví MetaMask để sử dụng ứng dụng này. Bạn có thể tìm thấy nó tại: metamask.io');
    }
  };

  // Hàm ngắt kết nối ví
  const disconnectWallet = () => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      setIsConnected(false);
      setAccounts([]);
      setWeb3(null);
      setEthBalance('0 ETH');
      setDebankBalance('0 VNDT');
      setTransactionHistory([]);
      setVndtContract(null);
      setDebankContract(null);
      setIsBankOwner(false);
      setCurrentPage(1);
      showAppModal('Bạn đã ngắt kết nối ví khỏi ứng dụng DeBank.');
    } else {
      showAppModal('Chưa có ví nào được kết nối để ngắt.');
    }
  };

  // Hàm để lấy số dư ETH thực tế từ ví MetaMask
  const fetchEthBalance = async (web3Instance, accountAddress) => {
      if (web3Instance && accountAddress) {
          try {
              const balanceWei = await web3Instance.eth.getBalance(accountAddress);
              const balanceEth = web3Instance.utils.fromWei(balanceWei, 'ether');
              setEthBalance(`${parseFloat(balanceEth).toFixed(5)} ETH`);
          } catch (error) {
              console.error("Lỗi khi lấy số dư ETH:", error);
              setEthBalance('Lỗi khi lấy số dư');
          }
      }
  };

  // Hàm cập nhật tên mạng dựa trên Chain ID
  const updateNetworkName = (chainId) => {
    switch (chainId) {
      case 1:
        setNetworkName('Ethereum Mainnet');
        break;
      case 11155111:
        setNetworkName('Sepolia Testnet');
        break;
      case 1337:
        setNetworkName('Localhost / Ganache');
        break;
      case 31337:
        setNetworkName('Localhost Hardhat Network');
        break;
      default:
        setNetworkName(`Mạng không xác định (ID: ${chainId})`);
    }
  };

  // Hàm sao chép địa chỉ ví vào clipboard
  const copyAddress = () => {
    if (accounts.length > 0) {
      const textarea = document.createElement('textarea');
      textarea.value = accounts[0];
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        showAppModal('Địa chỉ đã được sao chép vào clipboard!');
      } catch (err) {
        console.error("Lỗi khi sao chép địa chỉ:", err);
        showAppModal('Không thể sao chép địa chỉ. Vui lòng sao chép thủ công.');
      }
      document.body.removeChild(textarea);
    } else {
      showAppModal('Không có địa chỉ ví để sao chép.');
    }
  };

  // Hàm lấy số dư DeBank THẬT từ smart contract
  const fetchDeBankBalance = async () => {
    if (isConnected && accounts.length > 0 && web3 && debankContract) {
      try {
        const balanceWei = await debankContract.methods.getBalance(accounts[0]).call();
        const balanceVNDT = web3.utils.fromWei(balanceWei, 'ether');
        setDebankBalance(`${parseFloat(balanceVNDT).toLocaleString('vi-VN')} VNDT`);
      } catch (error) {
        console.error("Lỗi khi lấy số dư DeBank:", error);
        let errorMessage = getErrorMessage(error, "Lỗi khi lấy số dư DeBank: Không rõ nguyên nhân.");
        
        if (errorMessage.includes("DeBank: Account does not exist")) {
            errorMessage = "Tài khoản của bạn chưa tồn tại trong DeBank (chưa có giao dịch gửi tiền).";
        } else if (errorMessage.includes("DeBank: Insufficient balance")) {
            errorMessage = "Số dư DeBank không đủ để thực hiện giao dịch.";
        } else if (errorMessage.includes("VNDT transferFrom failed. Did you approve enough?")) {
            errorMessage = "Lỗi: Bạn chưa phê duyệt đủ VNDT hoặc số dư VNDT trong ví không đủ.";
        }
        
        setDebankBalance('Lỗi khi lấy số dư');
        showAppModal(errorMessage);
      }
    } else if (isConnected && accounts.length > 0 && web3 && currentChainId !== null && !debankContract) {
        setDebankBalance('Không thể tải');
    } else {
        setDebankBalance('0 VNDT');
    }
  };

  // Hàm TẢI LỊCH SỬ GIAO DỊCH THẬT từ smart contract
  const fetchTransactionHistory = async () => {
    if (isConnected && accounts.length > 0 && web3 && debankContract) {
      try {
        const historyData = await debankContract.methods.getAccountTransactionHistory(accounts[0]).call();
        const formattedHistory = historyData.map(tx => {
            const amountVNDT = web3.utils.fromWei(tx.amount, 'ether');
            const date = new Date(Number(tx.timestamp) * 1000);
            const formattedTime = date.toLocaleString('vi-VN', {
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });

            return {
                id: `#${tx.id.toString()}`,
                type: tx.txType,
                from: tx.from,
                to: tx.to,
                amount: parseFloat(amountVNDT),
                time: formattedTime,
            };
        });
        
        formattedHistory.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        setTransactionHistory(formattedHistory);
      } catch (error) {
        console.error("Lỗi khi tải lịch sử giao dịch:", error);
        let errorMessage = getErrorMessage(error, "Lỗi khi tải lịch sử giao dịch: Không rõ nguyên nhân.");

        if (errorMessage.includes("DeBank: Account does not exist")) {
            setTransactionHistory([]);
        } else {
            showAppModal(errorMessage);
            setTransactionHistory([]);
        }
      }
    } else {
        setTransactionHistory([]);
    }
  };

  // Hàm xử lý sự kiện click cho nút "Phê Duyệt VNDT" (VNDT.approve)
  const handleApproveVNDT = async () => {
    if (!isConnected || accounts.length === 0 || !vndtContract || !web3) {
      showAppModal("Vui lòng kết nối ví và đảm bảo contract đã khởi tạo.");
      return;
    }

    const amountInput = document.getElementById('depositAmount').value;
    if (!amountInput || parseFloat(amountInput) <= 0) {
      showAppModal("Vui lòng nhập số tiền hợp lệ để phê duyệt.");
      return;
    }

    try {
      const amountWei = web3.utils.toWei(amountInput, 'ether');

      showAppModal(`Đang phê duyệt ${amountInput} VNDT. Vui lòng xác nhận trong MetaMask...`);
      
      const tx = await vndtContract.methods.approve(DEBANK_CONTRACT_ADDRESS, amountWei).send({ from: accounts[0] });

      showAppModal(`Phê duyệt thành công! Tx Hash: ${tx.transactionHash}`);
      
    } catch (error) {
      console.error("Lỗi khi phê duyệt VNDT:", error);
      let errorMessage = getErrorMessage(error, "Lỗi phê duyệt VNDT: Không rõ nguyên nhân.");

      if (errorMessage.includes("ERC20InsufficientBalance")) {
          errorMessage = "Lỗi: Số dư VNDT trong ví của bạn không đủ để phê duyệt.";
      }
      showAppModal(errorMessage);
    }
  };

  // Hàm xử lý sự kiện click cho nút "Gửi Tiền" (DeBank.deposit)
  const handleDeposit = async () => {
    if (!isConnected || accounts.length === 0 || !debankContract || !web3) {
      showAppModal("Vui lòng kết nối ví và đảm bảo contract đã khởi tạo.");
      return;
    }

    const amountInput = document.getElementById('depositAmount').value;
    if (!amountInput || parseFloat(amountInput) <= 0) {
      showAppModal("Vui lòng nhập số tiền hợp lệ để gửi.");
      return;
    }

    try {
      const walletVNDTBalanceWei = await vndtContract.methods.balanceOf(accounts[0]).call();
      const amountWei = web3.utils.toWei(amountInput, 'ether');

      if (web3.utils.toBigInt(amountWei) > web3.utils.toBigInt(walletVNDTBalanceWei)) {
          showAppModal("Lỗi: Số dư VNDT trong ví của bạn không đủ để gửi. Vui lòng nạp thêm VNDT vào ví của bạn.");
          return;
      }

      showAppModal(`Đang gửi ${amountInput} VNDT vào DeBank. Vui lòng xác nhận trong MetaMask...`);
      
      const tx = await debankContract.methods.deposit(amountWei).send({ from: accounts[0] });

      showAppModal(`Gửi tiền thành công! Tx Hash: ${tx.transactionHash}`);
      
      fetchDeBankBalance(); 
      fetchEthBalance(web3, accounts[0]); 
      fetchTransactionHistory();

    } catch (error) {
      console.error("Lỗi khi gửi tiền vào DeBank:", error);
      let errorMessage = getErrorMessage(error, "Lỗi gửi tiền vào DeBank: Không rõ nguyên nhân.");

      if (errorMessage.includes("VNDT transferFrom failed. Did you approve enough?") || errorMessage.includes("ERC20InsufficientAllowance")) { 
          errorMessage = "Lỗi: Bạn chưa phê duyệt đủ VNDT cho DeBank.";
      } else if (errorMessage.includes("ERC20InsufficientBalance")) {
          errorMessage = "Lỗi: Số dư VNDT trong ví của bạn không đủ để gửi.";
      }
      showAppModal(errorMessage);
    }
  };

  // Hàm xử lý sự kiện click cho nút "Rút Tiền" (DeBank.withdraw)
  const handleWithdraw = async () => {
    if (!isConnected || accounts.length === 0 || !debankContract || !web3) {
      showAppModal("Vui lòng kết nối ví và đảm bảo contract đã khởi tạo.");
      return;
    }

    const amountInput = document.getElementById('withdrawAmount').value;
    if (!amountInput || parseFloat(amountInput) <= 0) {
      showAppModal("Vui lòng nhập số tiền hợp lệ để rút.");
      return;
    }

    try {
      const amountWei = web3.utils.toWei(amountInput, 'ether');

      showAppModal(`Đang rút ${amountInput} VNDT từ DeBank. Vui lòng xác nhận trong MetaMask...`);
      
      const tx = await debankContract.methods.withdraw(amountWei).send({ from: accounts[0] });

      showAppModal(`Rút tiền thành công! Tx Hash: ${tx.transactionHash}`);
      
      fetchDeBankBalance(); 
      fetchEthBalance(web3, accounts[0]); 
      fetchTransactionHistory();

    } catch (error) {
      console.error("Lỗi khi rút tiền từ DeBank:", error);
      let errorMessage = getErrorMessage(error, "Lỗi rút tiền từ DeBank: Không rõ nguyên nhân.");

      if (errorMessage.includes("DeBank: Insufficient balance")) {
          errorMessage = "Lỗi: Số dư DeBank không đủ để rút. Vui lòng kiểm tra số dư của bạn.";
      } else if (errorMessage.includes("DeBank: Account does not exist")) {
          errorMessage = "Lỗi: Tài khoản của bạn chưa tồn tại trong DeBank (chưa có giao dịch gửi tiền).";
      }
      showAppModal(errorMessage);
    }
  };

  // Hàm xử lý sự kiện click cho nút "Chuyển Tiền" (DeBank.transfer)
  const handleTransfer = async () => {
    if (!isConnected || accounts.length === 0 || !debankContract || !web3) {
      showAppModal("Vui lòng kết nối ví và đảm bảo contract đã khởi tạo.");
      return;
    }

    const recipientAddress = document.getElementById('recipientAddress').value;
    const amountInput = document.getElementById('transferAmount').value;

    if (!recipientAddress || !web3.utils.isAddress(recipientAddress)) {
      showAppModal("Vui lòng nhập địa chỉ người nhận hợp lệ.");
      return;
    }
    if (recipientAddress.toLowerCase() === accounts[0].toLowerCase()) {
      showAppModal("Không thể chuyển tiền cho chính bạn.");
      return;
    }
    if (!amountInput || parseFloat(amountInput) <= 0) {
      showAppModal("Vui lòng nhập số tiền hợp lệ để chuyển.");
      return;
    }

    try {
      const amountWei = web3.utils.toWei(amountInput, 'ether');

      showAppModal(`Đang chuyển ${amountInput} VNDT đến ${recipientAddress}. Vui lòng xác nhận trong MetaMask...`);
      
      const tx = await debankContract.methods.transfer(recipientAddress, amountWei).send({ from: accounts[0] });

      showAppModal(`Chuyển tiền thành công! Tx Hash: ${tx.transactionHash}`);
      
      fetchDeBankBalance(); 
      fetchEthBalance(web3, accounts[0]); 
      fetchTransactionHistory();

    } catch (error) {
      console.error("Lỗi khi chuyển tiền:", error);
      let errorMessage = getErrorMessage(error, "Lỗi chuyển tiền: Không rõ nguyên nhân.");

      if (errorMessage.includes("DeBank: Insufficient balance")) {
          errorMessage = "Lỗi: Số dư DeBank không đủ để chuyển. Vui lòng kiểm tra số dư của bạn.";
      } else if (errorMessage.includes("DeBank: Account does not exist")) {
          errorMessage = "Lỗi: Tài khoản của bạn chưa tồn tại trong DeBank (chưa có giao dịch gửi tiền).";
      } else if (errorMessage.includes("DeBank: Daily transfer limit exceeded")) {
          errorMessage = "Lỗi: Bạn đã vượt quá hạn mức chuyển tiền hàng ngày.";
      } else if (errorMessage.includes("DeBank: Zero address not allowed")) {
          errorMessage = "Lỗi: Địa chỉ người nhận không hợp lệ (địa chỉ 0x0).";
      } else if (errorMessage.includes("DeBank: Cannot transfer to yourself")) {
          errorMessage = "Lỗi: Không thể chuyển tiền cho chính bạn.";
      }
      showAppModal(errorMessage);
    }
  };


  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const accs = await web3Instance.eth.getAccounts();
        if (accs.length > 0) {
          setAccounts(accs);
          setIsConnected(true);
          const chainId = await web3Instance.eth.getChainId();
          setCurrentChainId(Number(chainId));
          updateNetworkName(Number(chainId));
          fetchEthBalance(web3Instance, accs[0]);

          setIsBankOwner(accs[0].toLowerCase() === BANK_OWNER_ADDRESS.toLowerCase());

          initializeContracts(web3Instance);

          registerEventListeners(web3Instance, accs);
        }
      }
    };

    autoConnect();
  }, []);

  useEffect(() => {
    if (isConnected && accounts.length > 0 && web3 && currentChainId !== null) {
      if (debankContract) {
          fetchDeBankBalance();
          fetchTransactionHistory();
          if (isBankOwner) {
              fetchAdminConfig();
          }
      } else {
          initializeContracts(web3); 
      }
    } else {
        setDebankBalance('0 VNDT');
        setTransactionHistory([]);
        setCurrentDailyLimit('0 VNDT');
        setCurrentFeeRate('0%');
    }
  }, [isConnected, accounts, web3, debankContract, currentChainId, isBankOwner]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const getPaginatedHistory = () => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return transactionHistory.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(transactionHistory.length / recordsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const fetchAdminConfig = async () => {
      if (isConnected && debankContract && isBankOwner) {
          try {
              const dailyLimitWei = await debankContract.methods.dailyTransferLimit().call();
              const feeRateBp = await debankContract.methods.transferFeeRate().call();

              const dailyLimitVNDT = web3.utils.fromWei(dailyLimitWei, 'ether');
              setCurrentDailyLimit(`${parseFloat(dailyLimitVNDT).toLocaleString('vi-VN')} VNDT`);
              setNewDailyLimitInput(dailyLimitVNDT.toString());

              const feeRatePercent = parseFloat(feeRateBp.toString()) / 100;
              setCurrentFeeRate(`${feeRatePercent.toFixed(2)}%`);
              setNewFeeRateInput(feeRateBp.toString());
          } catch (error) {
              console.error("Lỗi khi lấy cấu hình admin:", error);
              showAppModal(getErrorMessage(error, "Lỗi khi tải cấu hình admin: Không rõ nguyên nhân."));
              setCurrentDailyLimit('Lỗi');
              setCurrentFeeRate('Lỗi');
          }
      }
  };

  const handleSetDailyLimit = async () => {
      if (!isConnected || !isBankOwner || !debankContract || !web3) {
          showAppModal("Bạn không có quyền hoặc chưa kết nối.");
          return;
      }
      if (!newDailyLimitInput || parseFloat(newDailyLimitInput) <= 0) {
          showAppModal("Vui lòng nhập hạn mức hợp lệ.");
          return;
      }

      try {
          const amountWei = web3.utils.toWei(newDailyLimitInput, 'ether');
          showAppModal(`Đang cập nhật hạn mức chuyển khoản hàng ngày thành ${parseFloat(newDailyLimitInput).toLocaleString('vi-VN')} VNDT...`);
          
          const tx = await debankContract.methods.setDailyTransferLimit(amountWei).send({ from: accounts[0] });
          showAppModal(`Cập nhật hạn mức thành công! Tx Hash: ${tx.transactionHash}`);
          fetchAdminConfig();
      } catch (error) {
          console.error("Lỗi khi cập nhật hạn mức:", error);
          let errorMessage = getErrorMessage(error, "Lỗi cập nhật hạn mức: Không rõ nguyên nhân.");
          if (errorMessage.includes("Only bank owner can call this function")) {
            errorMessage = "Lỗi: Bạn không phải chủ sở hữu ngân hàng để thực hiện chức năng này.";
          }
          showAppModal(errorMessage);
      }
  };

  const handleSetFeeRate = async () => {
      if (!isConnected || !isBankOwner || !debankContract || !web3) {
          showAppModal("Bạn không có quyền hoặc chưa kết nối.");
          return;
      }
      if (!newFeeRateInput || parseFloat(newFeeRateInput) < 0 || parseFloat(newFeeRateInput) > 10000) {
          showAppModal("Vui lòng nhập tỷ lệ phí hợp lệ (0-10000 basis points).");
          return;
      }

      try {
          const feeRateBp = parseInt(newFeeRateInput);
          showAppModal(`Đang cập nhật tỷ lệ phí chuyển khoản thành ${feeRateBp / 100}%...`);
          
          const tx = await debankContract.methods.setTransferFeeRate(feeRateBp).send({ from: accounts[0] });
          showAppModal(`Cập nhật tỷ lệ phí thành công! Tx Hash: ${tx.transactionHash}`);
          fetchAdminConfig();
      } catch (error) {
          console.error("Lỗi khi cập nhật tỷ lệ phí:", error);
          let errorMessage = getErrorMessage(error, "Lỗi cập nhật tỷ lệ phí: Không rõ nguyên nhân.");
          if (errorMessage.includes("Only bank owner can call this function")) {
            errorMessage = "Lỗi: Bạn không phải chủ sở hữu ngân hàng để thực hiện chức năng này.";
          }
          showAppModal(errorMessage);
      }
  };

  const handlePauseContract = async () => {
    if (!isConnected || !isBankOwner || !debankContract || !web3) {
      showAppModal("Bạn không có quyền hoặc chưa kết nối.");
      return;
    }

    try {
      showAppModal("Đang tạm dừng hợp đồng DeBank. Vui lòng xác nhận trong MetaMask...");
      const tx = await debankContract.methods.pause().send({ from: accounts[0] });
      showAppModal(`Hợp đồng đã tạm dừng thành công! Tx Hash: ${tx.transactionHash}`);
    } catch (error) {
      console.error("Lỗi khi tạm dừng hợp đồng:", error);
      let errorMessage = getErrorMessage(error, "Lỗi tạm dừng hợp đồng: Không rõ nguyên nhân.");
      if (errorMessage.includes("Only bank owner can call this function")) {
          errorMessage = "Lỗi: Bạn không phải chủ sở hữu ngân hàng để thực hiện chức năng này.";
      } else if (errorMessage.includes("Pausable: paused")) {
          errorMessage = "Lỗi: Hợp đồng đã tạm dừng trước đó.";
      }
      showAppModal(errorMessage);
    }
  };

  const handleUnpauseContract = async () => {
    if (!isConnected || !isBankOwner || !debankContract || !web3) {
      showAppModal("Bạn không có quyền hoặc chưa kết nối.");
      return;
    }

    try {
      showAppModal("Đang khởi động lại hợp đồng DeBank. Vui lòng xác nhận trong MetaMask...");
      const tx = await debankContract.methods.unpause().send({ from: accounts[0] });
      showAppModal(`Hợp đồng đã khởi động lại thành công! Tx Hash: ${tx.transactionHash}`);
    } catch (error) {
      console.error("Lỗi khi khởi động lại hợp đồng:", error);
      let errorMessage = getErrorMessage(error, "Lỗi khởi động lại hợp đồng: Không rõ nguyên nhân.");
      if (errorMessage.includes("Only bank owner can call this function")) {
          errorMessage = "Lỗi: Bạn không phải chủ sở hữu ngân hàng để thực hiện chức năng này.";
      } else if (errorMessage.includes("Pausable: not paused")) {
          errorMessage = "Lỗi: Hợp đồng chưa tạm dừng trước đó.";
      }
      showAppModal(errorMessage);
    }
  };

  // --- Hàm xử lý sự kiện click cho nút "Gửi Tiết Kiệm" (DeBank.depositSavings) ---
  // Gửi VNDT vào tài khoản tiết kiệm của người dùng.
  const handleDepositSavings = async () => {
    // 1. Kiểm tra các điều kiện cần thiết
    if (!isConnected || accounts.length === 0 || !debankContract || !web3) {
      showAppModal("Vui lòng kết nối ví và đảm bảo contract đã khởi tạo.");
      return;
    }

    // 2. Lấy số tiền và kỳ hạn từ input
    const amountInput = document.getElementById('savingsAmount').value;
    const durationInput = document.getElementById('savingsDuration').value;

    // 3. Kiểm tra tính hợp lệ của input
    if (!amountInput || parseFloat(amountInput) <= 0) {
      showAppModal("Vui lòng nhập số tiền hợp lệ để gửi tiết kiệm.");
      return;
    }
    if (!durationInput || parseInt(durationInput) <= 0) {
      showAppModal("Vui lòng chọn kỳ hạn hợp lệ.");
      return;
    }

    try {
      // Chuyển đổi số tiền nhập vào sang đơn vị token nhỏ nhất (wei)
      const amountWei = web3.utils.toWei(amountInput, 'ether');
      const durationMonths = parseInt(durationInput);

      showAppModal(`Đang gửi ${amountInput} VNDT vào tiết kiệm kỳ hạn ${durationMonths} tháng. Vui lòng xác nhận trong MetaMask...`);
      
      // Gọi hàm `depositSavings` trên contract DeBank.
      const tx = await debankContract.methods.depositSavings(amountWei, durationMonths).send({ from: accounts[0] });

      showAppModal(`Gửi tiết kiệm thành công! Tx Hash: ${tx.transactionHash}`);
      
      // Sau khi giao dịch thành công, cập nhật lại số dư DeBank và lịch sử
      fetchDeBankBalance(); 
      fetchTransactionHistory();

    } catch (error) {
      console.error("Lỗi khi gửi tiết kiệm:", error);
      let errorMessage = getErrorMessage(error, "Lỗi gửi tiết kiệm: Không rõ nguyên nhân.");

      if (errorMessage.includes("DeBank: Insufficient balance")) {
          errorMessage = "Lỗi: Số dư DeBank không đủ để gửi tiết kiệm. Vui lòng nạp thêm VNDT vào DeBank.";
      } else if (errorMessage.includes("DeBank: Account does not exist")) {
          errorMessage = "Lỗi: Tài khoản của bạn chưa tồn tại trong DeBank (chưa có giao dịch gửi tiền).";
      } else if (errorMessage.includes("Savings duration must be between 1 and 60 months")) {
          errorMessage = "Lỗi: Kỳ hạn tiết kiệm phải từ 1 đến 60 tháng.";
      } else if (errorMessage.includes("Savings deposit amount must be greater than zero")) {
          errorMessage = "Lỗi: Số tiền gửi tiết kiệm phải lớn hơn 0.";
      } else if (errorMessage.includes("Pausable: paused")) {
          errorMessage = "Lỗi: Hợp đồng đang bị tạm dừng. Không thể gửi tiết kiệm.";
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
            <button className="bg-[#00A1E4] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#0077B6] transition-colors" onClick={closeAppModal}>Đóng</button>
          </div>
        </div>
      )}

      <header className="bg-[#0077B6] p-4 text-white shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">DeBank 🏦</h1>
          <button
            id="connectWalletBtn"
            onClick={isConnected ? disconnectWallet : connectWallet}
            className="bg-[#00A1E4] hover:bg-[#90E0EF] text-white hover:text-[#005082] font-semibold py-2 px-6 rounded-lg shadow-md transition-colors"
          >
            {isConnected ? 'Ngắt Kết Nối Ví' : 'Kết Nối Ví'}
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        <section className="lg:col-span-1 bg-white rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-[#005082] mb-4">Tài Khoản Của Bạn</h2>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-medium">Trạng thái:</span>
            <span className={`font-semibold ${isConnected ? 'text-green-600' : 'text-red-500'}`}>
              {isConnected ? 'Đã Kết Nối' : 'Chưa Kết Nối'}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-medium">Mạng lưới:</span>
            <span className="text-sm font-semibold text-gray-700">{networkName}</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium">Địa chỉ Ví:</span>
            <span id="userAddress" className="text-sm font-mono bg-gray-100 p-2 rounded-md truncate max-w-[100px]">
              {accounts.length > 0 ? `${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}` : 'Chưa kết nối'}
            </span>
            <button
              id="copyAddressBtn"
              onClick={copyAddress}
              className="ml-2 bg-[#90E0EF] text-[#005082] px-3 py-1 rounded-md text-sm hover:bg-[#CAF0F8] transition-colors"
              title="Sao chép địa chỉ"
            >
              📋
            </button>
          </div>
          <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-medium">Số Dư Ví (ETH):</span>
              <span id="ethBalance" className="text-xl font-bold text-gray-700">{ethBalance}</span>
          </div>
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg font-medium">Số Dư DeBank:</span>
            <span id="debankBalance" className="text-2xl font-bold text-[#00A1E4]">{debankBalance}</span>
          </div>
          <p className="text-sm text-gray-500 italic">Số dư hiển thị là VNDT đang có trong tài khoản DeBank của bạn trên blockchain.</p>
        </section>

        <section className="lg:col-span-2 bg-white rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-[#005082] mb-4">Giao Dịch</h2>

          <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                className={`tab-button whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg text-gray-500 hover:text-gray-700 hover:border-gray-300 ${activeTab === 'deposit' ? 'active' : ''}`}
                onClick={() => handleTabClick('deposit')}
              >Gửi Tiền</button>
              <button
                className={`tab-button whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg text-gray-500 hover:text-gray-700 hover:border-gray-300 ${activeTab === 'withdraw' ? 'active' : ''}`}
                onClick={() => handleTabClick('withdraw')}
              >Rút Tiền</button>
              <button
                className={`tab-button whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg text-gray-500 hover:text-gray-700 hover:border-gray-300 ${activeTab === 'transfer' ? 'active' : ''}`}
                onClick={() => handleTabClick('transfer')}
              >Chuyển Tiền</button>
              <button
                className={`tab-button whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg text-gray-500 hover:text-gray-700 hover:border-gray-300 ${activeTab === 'savings' ? 'active' : ''}`}
                onClick={() => handleTabClick('savings')}
              >Tiết Kiệm</button>
            </nav>
          </div>

          <div id="depositContent" className={`tab-content ${activeTab === 'deposit' ? 'active' : ''}`}>
            <h3 className="text-xl font-semibold text-[#0077B6] mb-4">Gửi Tiền vào DeBank</h3>
            <p className="text-gray-600 mb-4">Bạn cần phê duyệt (approve) cho DeBank smart contract quyền chi tiêu VNDT từ ví của bạn trước khi gửi tiền.</p>
            <div className="mb-4">
              <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700 mb-2">Số tiền VNDT muốn gửi:</label>
              <input type="number" id="depositAmount" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-[#00A1E4] focus:border-[#00A1E4]" placeholder="Nhập số VNDT" min="0.001" />
            </div>
            <div className="flex space-x-4">
              <button
                id="approveBtn"
                className="flex-1 bg-[#00A1E4] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0077B6] transition-colors shadow-md"
                onClick={handleApproveVNDT}
              >
                Phê Duyệt VNDT
              </button>
              <button
                id="depositBtn"
                className="flex-1 bg-[#0077B6] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#005082] transition-colors shadow-md"
                onClick={handleDeposit}
              >
                Gửi Tiền
              </button>
            </div>
          </div>

          <div id="withdrawContent" className={`tab-content ${activeTab === 'withdraw' ? 'active' : ''}`}>
            <h3 className="text-xl font-semibold text-[#0077B6] mb-4">Rút Tiền từ DeBank</h3>
            <div className="mb-4">
              <label htmlFor="withdrawAmount" className="block text-sm font-medium text-gray-700 mb-2">Số tiền VNDT muốn rút:</label>
              <input type="number" id="withdrawAmount" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-[#00A1E4] focus:border-[#00A1E4]" placeholder="Nhập số VNDT" min="0.001" />
            </div>
            <button
              id="withdrawBtn"
              className="w-full bg-[#00A1E4] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0077B6] transition-colors shadow-md"
              onClick={handleWithdraw}
            >
              Rút Tiền
            </button>
          </div>

          <div id="transferContent" className={`tab-content ${activeTab === 'transfer' ? 'active' : ''}`}>
            <h3 className="text-xl font-semibold text-[#0077B6] mb-4">Chuyển Tiền Trong DeBank</h3>
            <div className="mb-4">
              <label htmlFor="recipientAddress" className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ người nhận:</label>
              <input type="text" id="recipientAddress" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-[#00A1E4] focus:border-[#00A1E4]" placeholder="Ví dụ: 0xAbC...123" />
            </div>
            <div className="mb-4">
              <label htmlFor="transferAmount" className="block text-sm font-medium text-gray-700 mb-2">Số tiền VNDT muốn chuyển:</label>
              <input type="number" id="transferAmount" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-[#00A1E4] focus:border-[#00A1E4]" placeholder="Nhập số VNDT" min="0.001" />
            </div>
            <button
              id="transferBtn"
              className="w-full bg-[#00A1E4] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0077B6] transition-colors shadow-md"
              onClick={handleTransfer}
            >
              Chuyển Tiền
            </button>
          </div>

          <div id="savingsContent" className={`tab-content ${activeTab === 'savings' ? 'active' : ''}`}>
            <h3 className="text-xl font-semibold text-[#0077B6] mb-4">Gửi Tiết Kiệm</h3>
            <p className="text-gray-600 mb-4">Gửi VNDT vào tài khoản tiết kiệm để nhận lãi suất (chức năng nâng cao).</p>
            <div className="mb-4">
              <label htmlFor="savingsAmount" className="block text-sm font-medium text-gray-700 mb-2">Số tiền VNDT muốn gửi tiết kiệm:</label>
              <input type="number" id="savingsAmount" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-[#00A1E4] focus:border-[#00A1E4]" placeholder="Nhập số VNDT" min="0.001" />
            </div>
            <div className="mb-4">
              <label htmlFor="savingsDuration" className="block text-sm font-medium text-gray-700 mb-2">Kỳ hạn (tháng):</label>
              <select id="savingsDuration" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-[#00A1E4] focus:border-[#00A1E4]">
                <option value="3">3 Tháng</option>
                <option value="6">6 Tháng</option>
                <option value="12">12 Tháng</option>
              </select>
            </div>
            <button
              id="depositSavingsBtn"
              className="w-full bg-[#00A1E4] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0077B6] transition-colors shadow-md"
              onClick={handleDepositSavings} // Gắn hàm xử lý sự kiện
            >
              Gửi Tiết Kiệm
            </button>
          </div>

        </section>

        {/* Lịch sử Giao dịch */}
        <section className="lg:col-span-3 bg-white rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-[#005082] mb-4">Lịch Sử Giao Dịch</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#CAF0F8]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Từ</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đến</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền (VNDT)</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Sử dụng getPaginatedHistory() để hiển thị chỉ các bản ghi của trang hiện tại */}
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
            {/* THÊM: Điều khiển phân trang */}
            {transactionHistory.length > 0 && (
              <div className="flex justify-center items-center mt-4 space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-[#90E0EF] text-[#005082] rounded-lg disabled:opacity-50 hover:bg-[#CAF0F8] transition-colors"
                >
                  Trước
                </button>
                {/* Hiển thị các nút số trang */}
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
                  Sau
                </button>
              </div>
            )}
            {transactionHistory.length === 0 && isConnected && (
                <p className="text-center text-gray-500 py-4">Chưa có giao dịch nào được ghi lại cho tài khoản này.</p>
            )}
            {transactionHistory.length === 0 && !isConnected && (
                <p className="text-center text-gray-500 py-4">Vui lòng kết nối ví để xem lịch sử giao dịch.</p>
            )}
          </div>
        </section>

        {/* Bảng Điều Khiển Quản Trị (Đơn giản) */}
        {/* CHỈ HIỂN THỊ NẾU TÀI KHOẢN KẾT NỐI LÀ BANK OWNER */}
        {isBankOwner && (
          <section className="lg:col-span-3 bg-white rounded-xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-[#005082] mb-4">Bảng Điều Khiển Cấp Quyền và Quản Trị</h2>
            <p className="text-gray-600 mb-4">Bạn đang đăng nhập với tư cách chủ sở hữu ngân hàng. Bạn có thể thực hiện các chức năng quản trị sau.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#CAF0F8] p-4 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-[#0077B6] mb-4">Cập Nhật Hạn Mức Chuyển Hàng Ngày</h3>
                  <div className="mb-4">
                      <label htmlFor="newDailyLimit" className="block text-sm font-medium text-gray-700 mb-2">Hạn mức mới (VNDT):</label>
                      <input 
                        type="number" 
                        id="newDailyLimit" 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#00A1E4] focus:border-[#00A1E4]" 
                        placeholder="Ví dụ: 100000000"
                        value={newDailyLimitInput}
                        onChange={(e) => setNewDailyLimitInput(e.target.value)}
                      />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Hiện tại: <span className="font-semibold text-[#0077B6]">{currentDailyLimit}</span></p>
                  <button 
                    id="setDailyLimitBtn" 
                    className="w-full bg-[#00A1E4] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#0077B6] transition-colors shadow-md" 
                    onClick={handleSetDailyLimit}
                  >
                      Cập Nhật
                  </button>
              </div>

              <div className="bg-[#CAF0F8] p-4 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-[#0077B6] mb-4">Cập Nhật Tỷ Lệ Phí Chuyển Khoản</h3>
                  <div className="mb-4">
                      <label htmlFor="newFeeRate" className="block text-sm font-medium text-gray-700 mb-2">Tỷ lệ phí mới (%):</label>
                      <input 
                        type="number" 
                        id="newFeeRate" 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#00A1E4] focus:border-[#00A1E4]" 
                        placeholder="Ví dụ: 100 (tức 1%)" min="0" 
                        value={newFeeRateInput}
                        onChange={(e) => setNewFeeRateInput(e.target.value)}
                      />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Hiện tại: <span className="font-semibold text-[#0077B6]">{currentFeeRate}</span></p>
                  <button 
                    id="setFeeRateBtn" 
                    className="w-full bg-[#00A1E4] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#0077B6] transition-colors shadow-md" 
                    onClick={handleSetFeeRate}
                  >
                      Cập Nhật
                  </button>
              </div>
            </div>
            
            <div className="mt-6">
                <h3 className="text-xl font-semibold text-[#0077B6] mb-4">Quản Lý Hợp Đồng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button 
                      id="pauseContractBtn" 
                      className="w-full bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-md" 
                      onClick={handlePauseContract}
                    >
                        Tạm Dừng Hợp Đồng
                    </button>
                    <button 
                      id="unpauseContractBtn" 
                      className="w-full bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-md" 
                      onClick={handleUnpauseContract}
                    >
                        Khởi Động Hợp Đồng
                    </button>
                </div>
            </div>

          </section>
        )}
      </main>

      <footer className="bg-[#0077B6] p-4 text-center text-white mt-auto">
        <p class="text-sm">© 2025 DeBank. Được phát triển để học và trải nghiệm Solidity.</p>
      </footer>
    </div>
  );
}

export default App;