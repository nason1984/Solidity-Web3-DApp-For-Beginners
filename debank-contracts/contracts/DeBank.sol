// SPDX-License-Identifier: MIT
// Đây là chỉ định giấy phép của mã nguồn. MIT License là một giấy phép mã nguồn mở phổ biến,
// cho phép người khác sử dụng, sửa đổi và phân phối mã nguồn một cách tự do.

pragma solidity ^0.8.20;
// Khai báo phiên bản trình biên dịch Solidity mà contract này yêu cầu.
// Dấu "^" (caret) có nghĩa là mã nguồn tương thích với phiên bản 0.8.20 trở lên,
// nhưng không vượt quá 0.9.0 (tức là không bao gồm 0.9.0 trở đi).
// Điều này giúp đảm bảo mã của bạn sẽ biên dịch thành công với các phiên bản tương lai nhỏ.

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// Import giao diện IERC20 từ thư viện OpenZeppelin.
// IERC20 là một tập hợp các hàm (interface) mà mọi token ERC-20 phải triển khai.
// Contract DeBank của chúng ta sẽ không phải là một token ERC-20, nhưng nó sẽ tương tác
// với token VNDT (là một ERC-20), vì vậy chúng ta cần giao diện này để gọi các hàm của VNDT.

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
// Import giao diện IERC20Metadata từ thư viện OpenZeppelin.
// Giao diện này mở rộng IERC20 để bao gồm các hàm đọc metadata như `name()`, `symbol()`, và `decimals()`.
// Chúng ta cần nó để truy cập hàm `decimals()` của VNDT token trong constructor khi thiết lập hạn mức mặc định.

import "@openzeppelin/contracts/access/Ownable.sol";
// Import contract Ownable từ thư viện OpenZeppelin.
// Contract này cung cấp một cơ chế đơn giản để quản lý quyền sở hữu (owner).
// Bất kỳ contract nào kế thừa Ownable sẽ có một địa chỉ 'owner' (chủ sở hữu)
// và một modifier `onlyOwner` để giới hạn quyền truy cập vào các hàm nhạy cảm, chỉ cho phép chủ sở hữu gọi.

import "@openzeppelin/contracts/utils/Pausable.sol";
// Import thư viện Pausable từ OpenZeppelin.
// Contract này cung cấp các chức năng để tạm dừng (pause) và khởi động lại (unpause) hợp đồng.
// Nó bao gồm các modifier như `whenNotPaused` (chỉ chạy khi không tạm dừng) và `whenPaused` (chỉ chạy khi tạm dừng).

import "@openzeppelin/contracts/utils/Strings.sol";
// Import thư viện Strings từ OpenZeppelin.
// Thư viện này cung cấp các tiện ích xử lý chuỗi, bao gồm hàm `toHexString()`
// để chuyển đổi địa chỉ thành chuỗi hex, phục vụ việc nối chuỗi trong mô tả giao dịch.

// Không cần import SafeMath.sol vì Solidity 0.8.0+ đã tích hợp sẵn cơ chế kiểm tra tràn số (overflow)
// và thiếu số (underflow) cho các phép toán số học mặc định trên kiểu số nguyên (uint).
// Điều này làm cho các phép toán `+`, `-`, `*`, `/` trên `uint256` an toàn hơn mà không cần thư viện bổ sung.

contract DeBank is Ownable, Pausable {
    // Khai báo contract DeBank.
    // `is Ownable`: contract này kế thừa tất cả các hàm, biến và modifier của contract Ownable,
    // cung cấp cơ chế chủ sở hữu (owner) và kiểm soát quyền truy cập.
    // `is Pausable`: contract này kế thừa tất cả các hàm, biến và modifier của contract Pausable,
    // cung cấp khả năng tạm dừng và khởi động lại hoạt động của hợp đồng.

    // Không cần `using SafeMath for uint256;` vì SafeMath không còn được import và các phép toán cơ bản đã an toàn.

    // --- Biến Trạng Thái (State Variables) ---
    // Các biến trạng thái được lưu trữ vĩnh viễn trên blockchain.
    // Giá trị của chúng sẽ được duy trì giữa các giao dịch.

    address public bankOwner;
    // Địa chỉ của chủ sở hữu hợp đồng DeBank.
    // Chủ sở hữu này là người có quyền thực hiện các chức năng quản trị.
    // `public` tạo ra một hàm getter tự động `bankOwner()` để đọc giá trị này từ bên ngoài contract.

    IERC20Metadata public vndToken;
    // Một instance của giao diện IERC20Metadata, đại diện cho smart contract VNDT token đã được triển khai.
    // Biến này cho phép hợp đồng DeBank tương tác với hợp đồng VNDT (ví dụ: gọi `transferFrom`, `transfer`).

    mapping(address => bool) public isAccount;
    // Một mapping (bản đồ) để kiểm tra xem một địa chỉ đã có tài khoản trong hệ thống DeBank chưa.
    // Key: địa chỉ (address). Value: boolean (true nếu tài khoản tồn tại, false nếu chưa).
    // Một tài khoản được coi là "tồn tại" trong DeBank khi nó thực hiện giao dịch `deposit` đầu tiên.

    mapping(address => uint256) public balances;
    // Một mapping lưu trữ số dư VNDT của mỗi tài khoản trong hợp đồng DeBank.
    // Key: địa chỉ người dùng (address). Value: số dư VNDT (uint256, tính bằng đơn vị nhỏ nhất của token).
    // LƯU Ý QUAN TRỌNG: Số dư này là số tiền mà hợp đồng DeBank đang giữ THAY MẶT cho người dùng,
    // chứ không phải số dư trực tiếp trong ví cá nhân của họ (ví Metamask).

    uint256 public totalDeposits;
    // Tổng số lượng VNDT hiện đang được giữ bởi hợp đồng DeBank.
    // Đây là tổng của tất cả `balances` của người dùng.

    uint256 public dailyTransferLimit;
    // Hạn mức chuyển khoản tối đa mà mỗi người dùng có thể thực hiện trong một ngày (tính bằng đơn vị nhỏ nhất của VNDT).
    // Giá trị này có thể được cập nhật bởi `bankOwner`.

    mapping(address => mapping(uint256 => uint256)) public dailyTransferredAmount;
    // Một mapping lồng nhau để theo dõi tổng số tiền mà một người dùng đã chuyển trong một ngày cụ thể.
    // Key ngoài cùng: địa chỉ người dùng (address).
    // Key bên trong: timestamp của ngày hiện tại (uint256, được tính bằng `block.timestamp / 1 days`).
    // Value: tổng số tiền đã chuyển trong ngày đó (uint256).

    uint256 public transferFeeRate;
    // Tỷ lệ phí chuyển khoản. Giá trị này được biểu thị bằng "basis points" (phần vạn).
    // Ví dụ: 10000 basis points = 100%. Nếu `transferFeeRate = 10`, nghĩa là phí là 0.1% (10 / 10000 = 0.001).
    // Có thể được cập nhật bởi `bankOwner`.

    address public feeReceiver;
    // Địa chỉ ví sẽ nhận các khoản phí giao dịch. Thường là địa chỉ của ngân hàng (owner).
    // Có thể được cập nhật bởi `bankOwner`.

    // Cấu trúc (struct) để định nghĩa chi tiết một bản ghi giao dịch.
    // Các struct này được lưu trữ trong mapping `accountTransactions`.
    struct Transaction {
        uint256 id;                 // ID duy nhất cho mỗi giao dịch, tự động tăng
        address from;               // Địa chỉ người gửi của giao dịch
        address to;                 // Địa chỉ người nhận của giao dịch
        uint256 amount;             // Số tiền/token của giao dịch (trước khi trừ phí cho người gửi, sau khi trừ phí cho người nhận)
        uint256 timestamp;          // Thời điểm giao dịch được thực hiện (Unix timestamp)
        string txType;              // Loại giao dịch: "Deposit", "Withdraw", "TransferOut", "TransferIn", "SavingsDeposit", etc.
        string description;         // Mô tả ngắn gọn về giao dịch, bao gồm địa chỉ rút gọn để dễ đọc
    }

    mapping(address => Transaction[]) public accountTransactions;
    // Một mapping để lưu trữ lịch sử giao dịch cho mỗi tài khoản.
    // Key: địa chỉ người dùng (address). Value: một mảng (array) các struct Transaction.

    uint256 public nextTransactionId;
    // Một bộ đếm được sử dụng để tạo các ID duy nhất cho mỗi giao dịch mới.
    // Sẽ tăng lên sau mỗi lần có giao dịch được ghi.

    // --- Các thành phần cho chức năng Tiết kiệm (Advanced) ---
    // Cấu trúc để lưu trữ thông tin của mỗi khoản tiết kiệm của người dùng.
    struct SavingsAccount {
        uint256 amount;             // Số tiền gốc gửi tiết kiệm
        uint256 startTime;          // Thời điểm bắt đầu gửi tiết kiệm (Unix timestamp của block khi giao dịch được xác nhận)
        uint256 durationMonths;     // Kỳ hạn gửi tiết kiệm tính bằng tháng (ví dụ: 3, 6, 12 tháng)
        uint256 interestRate;       // Lãi suất hàng năm (tính bằng basis points) áp dụng cho khoản tiết kiệm này tại thời điểm gửi
        bool isActive;              // Trạng thái của tài khoản tiết kiệm (true: đang hoạt động/chưa rút, false: đã rút)
    }
    mapping(address => SavingsAccount[]) public userSavingsAccounts; // Mapping lưu trữ các khoản tiết kiệm của mỗi người dùng
    // Key: địa chỉ người dùng (address). Value: một mảng (array) các struct SavingsAccount.

    uint256 public savingsInterestRate; // Lãi suất tiết kiệm toàn cầu (hàng năm, tính bằng basis points) cho các khoản gửi mới
    // Giá trị này có thể được cập nhật bởi `bankOwner`.


    // --- Sự kiện (Events) ---
    // Các sự kiện là cách để smart contract "thông báo" về những gì đã xảy ra trên blockchain.
    // Chúng được ghi vào blockchain logs và có thể được các ứng dụng frontend lắng nghe để cập nhật giao diện trong thời gian thực.
    // Tham số `indexed` giúp tối ưu việc tìm kiếm và lọc các sự kiện trong log.

    event AccountOpened(address indexed account);
    // Phát ra khi một tài khoản mới được mở trong DeBank (lần đầu tiên có tương tác, ví dụ deposit).

    event Deposited(address indexed account, uint256 amount, uint256 balance);
    // Phát ra khi người dùng gửi VNDT vào DeBank.
    // `account`: địa chỉ của người gửi. `amount`: số tiền gửi. `balance`: số dư mới của tài khoản.

    event Withdrawn(address indexed account, uint256 amount, uint256 balance);
    // Phát ra khi người dùng rút VNDT từ DeBank.
    // `account`: địa chỉ của người rút. `amount`: số tiền rút. `balance`: số dư mới của tài khoản.

    event Transferred(address indexed from, address indexed to, uint256 amount, uint256 fee);
    // Phát ra khi VNDT được chuyển giữa các tài khoản trong DeBank.
    // `from`: địa chỉ người gửi. `to`: địa chỉ người nhận. `amount`: số tiền chuyển. `fee`: phí đã thu.

    event DailyLimitUpdated(uint256 newLimit);
    // Phát ra khi hạn mức chuyển khoản hàng ngày được cập nhật bởi owner.

    event FeeRateUpdated(uint256 newRate);
    // Phát ra khi tỷ lệ phí chuyển khoản được cập nhật bởi owner.

    event FeeReceiverUpdated(address indexed newReceiver);
    // Phát ra khi địa chỉ nhận phí được cập nhật bởi owner.

    event SavingsDeposited(address indexed account, uint256 amount, uint256 durationMonths);
    // Phát ra khi người dùng gửi tiền vào tiết kiệm.
    // `account`: địa chỉ người gửi. `amount`: số tiền gửi. `durationMonths`: kỳ hạn gửi.

    event SavingsWithdrawn(address indexed account, uint256 amount, uint256 interestEarned);
    // Phát ra khi người dùng rút tiền từ tiết kiệm, bao gồm cả lãi suất kiếm được.

    // --- Constructor ---
    // Hàm này được thực thi DUY NHẤT MỘT LẦN khi contract được triển khai (deploy) lên blockchain.
    // Nó dùng để khởi tạo các biến trạng thái ban đầu của contract.
    constructor(address _vndTokenAddress) Ownable(msg.sender) Pausable() {
        // `Ownable(msg.sender)`: Gọi constructor của contract Ownable để gán địa chỉ của người triển khai contract
        // (`msg.sender`) làm chủ sở hữu (owner) của contract DeBank này.
        // `Pausable()`: Gọi constructor của contract Pausable. (Không nhận đối số trong OZ v5.x)
        
        bankOwner = msg.sender;
        // Gán biến `bankOwner` bằng địa chỉ của người đã triển khai contract.

        vndToken = IERC20Metadata(_vndTokenAddress);
        // Khởi tạo biến `vndToken` bằng cách ép kiểu địa chỉ `_vndTokenAddress`
        // thành một đối tượng IERC20Metadata. Điều này cho phép hợp đồng DeBank gọi các hàm ERC20
        // trên hợp đồng VNDT token.

        // Thiết lập các giá trị mặc định ban đầu cho các biến:
        dailyTransferLimit = 1_000_000_000 * (10 ** vndToken.decimals());
        // Thiết lập hạn mức chuyển khoản hàng ngày mặc định là 1 tỷ VNDT.
        // `10 ** vndToken.decimals()` để chuyển đổi từ đơn vị thực tế (1 tỷ VNDT)
        // sang đơn vị nhỏ nhất mà token (VNDT) sử dụng (ví dụ: 10^18 nếu decimals là 18).

        transferFeeRate = 10;
        // Thiết lập tỷ lệ phí chuyển khoản mặc định là 0.1% (10 basis points).

        feeReceiver = msg.sender;
        // Địa chỉ nhận phí mặc định là địa chỉ của chủ sở hữu hợp đồng DeBank.

        nextTransactionId = 1;
        // Khởi tạo ID giao dịch tiếp theo là 1.

        savingsInterestRate = 500; // Mặc định 5% lãi suất hàng năm cho tiết kiệm (500 basis points)
    }

    // --- Bộ Biến Đổi (Modifiers) ---
    // Modifiers là các hàm được gắn vào các hàm khác để thêm các điều kiện kiểm tra trước khi
    // hàm chính được thực thi. Nếu điều kiện không được thỏa mãn, giao dịch sẽ bị revert.
    // Điều này giúp tái sử dụng mã và tăng tính bảo mật cho hợp đồng.

    modifier onlyBankOwner() {
        // Modifier này đảm bảo rằng chỉ `bankOwner` (người triển khai contract) mới có thể gọi hàm.
        require(msg.sender == bankOwner, "DeBank: Only bank owner can call this function");
        // `require`: kiểm tra điều kiện. Nếu điều kiện sai, giao dịch sẽ bị revert với thông báo lỗi.
        _; // Dấu gạch dưới (underscore) là nơi mã của hàm chính sẽ được chèn vào và thực thi.
    }

    modifier accountExists(address _account) {
        // Modifier này kiểm tra xem tài khoản `_account` có tồn tại (đã từng tương tác/deposit) trong hệ thống DeBank không.
        require(isAccount[_account], "DeBank: Account does not exist");
        _;
    }

    modifier sufficientBalance(uint256 _amount) {
        // Modifier này kiểm tra xem người gọi hàm (`msg.sender`) có đủ số dư (`balances[msg.sender]`)
        // để thực hiện giao dịch với số tiền `_amount` hay không.
        // Trong Solidity 0.8.0+, phép trừ sẽ tự động revert nếu kết quả âm (underflow),
        // nên việc kiểm tra `balances[msg.sender] >= _amount` là an toàn và cần thiết.
        require(balances[msg.sender] >= _amount, "DeBank: Insufficient balance");
        _;
    }

    modifier notZeroAddress(address _addr) {
        // Modifier này đảm bảo rằng địa chỉ `_addr` không phải là địa chỉ "zero address" (0x0).
        // Địa chỉ 0x0 là một địa chỉ đặc biệt thường dùng làm giá trị mặc định hoặc địa chỉ đốt token.
        // Gửi tiền đến 0x0 coi như là đốt bỏ tiền.
        require(_addr != address(0), "DeBank: Zero address not allowed");
        _;
    }

    modifier checkDailyLimit(address _sender, uint256 _amount) {
        uint256 today = block.timestamp / 1 days; // Tính toán timestamp của ngày hiện tại (làm tròn xuống ngày).
        // `1 days` là một hằng số toàn cục tương đương 24 * 60 * 60 giây.
        // Phép chia số nguyên (integer division) sẽ loại bỏ phần giờ/phút/giây, chỉ giữ lại phần ngày.
        require(dailyTransferredAmount[_sender][today] + _amount <= dailyTransferLimit, "DeBank: Daily transfer limit exceeded");
        _;
    }

    // --- Hàm Người Dùng (User Functions) ---
    // Các hàm mà người dùng thông thường có thể gọi để tương tác với ngân hàng.

    /**
     * @dev Cho phép người dùng gửi VNDT vào tài khoản DeBank của họ.
     * Người dùng PHẢI gọi hàm `approve()` trên contract VNDT trước đó để cấp quyền cho contract DeBank
     * được phép di chuyển một lượng VNDT từ ví của họ. Nếu không có `approve` hoặc `approve` không đủ,
     * giao dịch `transferFrom` sẽ thất bại.
     * @param _amount Số lượng VNDT muốn gửi (tính bằng đơn vị nhỏ nhất của token).
     */
    function deposit(uint256 _amount) public notZeroAddress(msg.sender) whenNotPaused {
        // `public`: hàm có thể được gọi từ bất kỳ đâu.
        // `notZeroAddress(msg.sender)`: sử dụng modifier để đảm bảo người gọi không phải là địa chỉ 0x0.
        // `whenNotPaused`: modifier từ Pausable, đảm bảo hàm chỉ chạy khi hợp đồng không bị tạm dừng.
        require(_amount > 0, "DeBank: Deposit amount must be greater than zero");
        // Đảm bảo số tiền gửi phải lớn hơn 0 để tránh các giao dịch vô nghĩa.

        // Nếu đây là lần đầu tiên tài khoản này tương tác với DeBank (chưa có trong `isAccount`),
        // đánh dấu là tài khoản tồn tại và phát ra sự kiện `AccountOpened`.
        if (!isAccount[msg.sender]) {
            isAccount[msg.sender] = true;
            emit AccountOpened(msg.sender); // Phát ra sự kiện báo hiệu tài khoản mới được mở.
        }

        // Chuyển VNDT từ ví của người dùng (msg.sender) sang contract DeBank (address(this)).
        // Lệnh này CHỈ THÀNH CÔNG nếu người dùng đã gọi `vndToken.approve(DeBankContractAddress, _amount)` trước đó.
        require(vndToken.transferFrom(msg.sender, address(this), _amount), "DeBank: VNDT transferFrom failed. Did you approve enough?");
        // `address(this)`: là địa chỉ của chính contract DeBank.

        // Cập nhật số dư VNDT của người dùng trong contract DeBank.
        balances[msg.sender] = balances[msg.sender] + _amount; // Sử dụng toán tử cộng native
        // Cập nhật tổng số tiền gửi vào DeBank mà contract đang giữ.
        totalDeposits = totalDeposits + _amount; // Sử dụng toán tử cộng native

        // Ghi lại giao dịch vào lịch sử của người gửi.
        accountTransactions[msg.sender].push(
            Transaction({
                id: nextTransactionId++, // Sử dụng và tăng ID giao dịch duy nhất
                from: msg.sender,
                to: address(this), // Địa chỉ contract DeBank là người nhận trong giao dịch gửi tiền
                amount: _amount,
                timestamp: block.timestamp, // Thời điểm giao dịch (Unix timestamp)
                txType: "Deposit", // Loại giao dịch: "Deposit"
                description: "Deposit to DeBank account" // Mô tả ngắn gọn
            })
        );
        emit Deposited(msg.sender, _amount, balances[msg.sender]);
        // Phát ra sự kiện `Deposited` để frontend có thể lắng nghe và cập nhật giao diện.
    }

    /**
     * @dev Cho phép người dùng rút VNDT từ tài khoản DeBank của họ về ví cá nhân.
     * @param _amount Số lượng VNDT muốn rút (tính bằng đơn vị nhỏ nhất của token).
     */
    function withdraw(uint256 _amount) public accountExists(msg.sender) sufficientBalance(_amount) whenNotPaused {
        // `accountExists(msg.sender)`: Đảm bảo người gọi có tài khoản trong DeBank.
        // `sufficientBalance(_amount)`: Đảm bảo người gọi có đủ số dư trong DeBank để rút.
        // `whenNotPaused`: đảm bảo hàm chỉ chạy khi hợp đồng không bị tạm dừng.
        require(_amount > 0, "DeBank: Withdraw amount must be greater than zero");
        // Đảm bảo số tiền rút lớn hơn 0.

        // Giảm số dư của người dùng trong contract DeBank.
        balances[msg.sender] = balances[msg.sender] - _amount; // Sử dụng toán tử trừ native
        // `totalDeposits` không cần giảm ở đây vì tiền vẫn nằm trong hợp đồng, chỉ là thay đổi chủ sở hữu.

        // Chuyển VNDT từ contract DeBank về ví cá nhân của người dùng.
        require(vndToken.transfer(msg.sender, _amount), "DeBank: VNDT transfer failed during withdrawal");

        // Giảm tổng số tiền mà contract DeBank đang giữ (vì tiền đã ra khỏi hợp đồng).
        totalDeposits = totalDeposits - _amount; // Sử dụng toán tử trừ native

        // Ghi lại giao dịch vào lịch sử của người rút.
        accountTransactions[msg.sender].push(
            Transaction({
                id: nextTransactionId++,
                from: address(this), // Contract DeBank là người gửi trong giao dịch rút tiền
                to: msg.sender,
                amount: _amount,
                timestamp: block.timestamp,
                txType: "Withdraw",
                description: "Withdraw from DeBank account"
            })
        );
        emit Withdrawn(msg.sender, _amount, balances[msg.sender]);
        // Phát ra sự kiện `Withdrawn` để frontend lắng nghe.
    }

    /**
     * @dev Cho phép người dùng chuyển VNDT đến một tài khoản khác trong hệ thống DeBank.
     * Áp dụng hạn mức chuyển khoản hàng ngày và tính phí giao dịch.
     * @param _to Địa chỉ của người nhận.
     * @param _amount Số lượng VNDT muốn chuyển (tính bằng đơn vị nhỏ nhất của token).
     */
    function transfer(address _to, uint256 _amount)
        public
        accountExists(msg.sender) // Đảm bảo người gửi có tài khoản trong DeBank
        notZeroAddress(_to)        // Đảm bảo địa chỉ người nhận không phải là 0x0
        sufficientBalance(_amount) // Đảm bảo người gửi có đủ số dư trong DeBank
        checkDailyLimit(msg.sender, _amount) // Kiểm tra hạn mức chuyển khoản hàng ngày
        whenNotPaused // đảm bảo hàm chỉ chạy khi hợp đồng không bị tạm dừng.
    {
        require(_amount > 0, "DeBank: Transfer amount must be greater than zero");
        require(msg.sender != _to, "DeBank: Cannot transfer to yourself");
        // Đảm bảo người gửi và người nhận không phải là cùng một địa chỉ để tránh các giao dịch không cần thiết.

        // Tính toán phí giao dịch.
        // Phí = (số tiền * tỷ lệ phí) / 10000 (vì tỷ lệ phí là basis points)
        uint256 fee = _amount * transferFeeRate / 10000; // Sử dụng toán tử nhân và chia native
        // Số tiền thực tế người nhận sẽ nhận được sau khi trừ phí.
        uint256 amountAfterFee = _amount - fee; // Sử dụng toán tử trừ native

        // Giảm số dư của người gửi bằng TỔNG số tiền (bao gồm cả phí) trong contract DeBank.
        balances[msg.sender] = balances[msg.sender] - _amount; // Sử dụng toán tử trừ native

        // Nếu người nhận chưa có tài khoản trong DeBank, tạo tài khoản mới cho họ.
        if (!isAccount[_to]) {
            isAccount[_to] = true;
            emit AccountOpened(_to); // Phát ra sự kiện báo hiệu tài khoản mới được mở.
        }
        // Tăng số dư của người nhận bằng số tiền sau khi trừ phí.
        balances[_to] = balances[_to] + amountAfterFee; // Sử dụng toán tử cộng native

        // Chuyển phí giao dịch đến địa chỉ `feeReceiver`.
        if (fee > 0) {
            // Chỉ thực hiện chuyển phí nếu phí > 0.
            // `vndToken.transfer` là một hàm gửi token từ hợp đồng DeBank đến địa chỉ nhận phí.
            require(vndToken.transfer(feeReceiver, fee), "DeBank: Failed to transfer fee to receiver");
        }

        // Cập nhật tổng số tiền đã chuyển trong ngày của người gửi để áp dụng hạn mức.
        uint256 today = block.timestamp / 1 days; // Lấy timestamp của ngày hiện tại
        dailyTransferredAmount[msg.sender][today] = dailyTransferredAmount[msg.sender][today] + _amount; // Cộng dồn số tiền đã chuyển

        // Ghi lại giao dịch vào lịch sử của NGƯỜI GỬI.
        accountTransactions[msg.sender].push(
            Transaction({
                id: nextTransactionId++, // Sử dụng và tăng ID giao dịch duy nhất
                from: msg.sender,
                to: _to,
                amount: _amount, // Ghi lại số tiền ban đầu (trước khi trừ phí) cho người gửi
                timestamp: block.timestamp,
                txType: "TransferOut",
                description: string.concat("Transfer to ", Strings.toHexString(_to)) // Nối chuỗi để có mô tả chi tiết, sử dụng Strings.toHexString()
            })
        );
        accountTransactions[_to].push(
            Transaction({
                id: nextTransactionId++,
                from: msg.sender,
                to: _to,
                amount: amountAfterFee, // Ghi lại số tiền thực nhận cho người nhận
                timestamp: block.timestamp,
                txType: "TransferIn",
                description: string.concat("Received from ", Strings.toHexString(msg.sender)) // Nối chuỗi
            })
        );
        emit Transferred(msg.sender, _to, _amount, fee);
        // Phát ra sự kiện `Transferred` để frontend lắng nghe.
    }

    function getBalance(address _account) public view returns (uint256) {
        // `view`: hàm này không thay đổi trạng thái của blockchain, chỉ đọc dữ liệu.
        // Do đó, gọi hàm `view` không tốn phí gas (khi được gọi từ bên ngoài).
        // Hàm này không yêu cầu `accountExists` để có thể trả về 0 cho tài khoản chưa tồn tại.
        return balances[_account];
    }

    function getAccountTransactionHistory(address _account) public view accountExists(_account) returns (Transaction[] memory) {
        // `memory`: chỉ định rằng mảng được trả về là một bản sao tạm thời trong bộ nhớ,
        // không được lưu trữ vĩnh viễn trên storage của contract.
        // Hàm này yêu cầu tài khoản phải tồn tại vì việc truy vấn lịch sử cho tài khoản không tồn tại là không có ý nghĩa.
        return accountTransactions[_account];
    }

    function getDailyTransferredAmount(address _account) public view returns (uint256) {
        uint256 today = block.timestamp / 1 days;
        return dailyTransferredAmount[_account][today];
    }

    /**
     * @dev Cho phép người dùng gửi VNDT vào tài khoản tiết kiệm với một kỳ hạn cố định.
     * Số tiền gửi sẽ bị khóa trong hợp đồng và không thể rút cho đến khi kỳ hạn kết thúc.
     * @param _amount Số lượng VNDT muốn gửi (tính bằng đơn vị nhỏ nhất của token).
     * @param _durationMonths Kỳ hạn của khoản tiết kiệm tính bằng tháng (ví dụ: 3, 6, 12).
     */
    function depositSavings(uint256 _amount, uint256 _durationMonths) public accountExists(msg.sender) sufficientBalance( _amount) whenNotPaused {
        require(_amount > 0, "DeBank: Savings deposit amount must be greater than zero");
        require(_durationMonths > 0 && _durationMonths <= 60, "DeBank: Savings duration must be between 1 and 60 months"); // Giới hạn kỳ hạn để tránh lỗi số lớn

        // Giảm số dư chính của người dùng (tiền được chuyển từ balances sang userSavingsAccounts)
        // Số dư trong `balances` giảm, nhưng `totalDeposits` không đổi vì tiền vẫn nằm trong contract,
        // chỉ là trạng thái quản lý của nó thay đổi (từ số dư giao dịch sang số dư tiết kiệm).
        balances[msg.sender] = balances[msg.sender] - _amount;

        // Ghi lại thông tin khoản tiết kiệm mới vào mảng `userSavingsAccounts` của người dùng.
        userSavingsAccounts[msg.sender].push(
            SavingsAccount({
                amount: _amount,
                startTime: block.timestamp, // Thời điểm bắt đầu tính lãi
                durationMonths: _durationMonths,
                interestRate: savingsInterestRate, // Sử dụng lãi suất toàn cầu hiện tại
                isActive: true // Đánh dấu khoản tiết kiệm đang hoạt động
            })
        );

        // Ghi lại giao dịch vào lịch sử của người gửi.
        accountTransactions[msg.sender].push(
            Transaction({
                id: nextTransactionId++,
                from: msg.sender,
                to: address(this), // Đại diện cho tài khoản tiết kiệm nội bộ (tiền vẫn trong hợp đồng)
                amount: _amount,
                timestamp: block.timestamp,
                txType: "SavingsDeposit",
                description: string.concat("Deposit to savings for ", Strings.toString(_durationMonths), " months")
            })
        );
        emit SavingsDeposited(msg.sender, _amount, _durationMonths); // Phát ra sự kiện SavingsDeposited
    }

    /**
     * @dev Cho phép người dùng rút tiền từ tài khoản tiết kiệm sau khi kỳ hạn kết thúc.
     * Số tiền gốc và lãi sẽ được chuyển về số dư chính của người dùng.
     * @param _index Chỉ số của khoản tiết kiệm trong mảng `userSavingsAccounts` của người dùng.
     */
    function withdrawSavings(uint256 _index) public accountExists(msg.sender) whenNotPaused {
        // Lấy tham chiếu đến khoản tiết kiệm cụ thể
        require(_index < userSavingsAccounts[msg.sender].length, "DeBank: Invalid savings account index"); // Kiểm tra index hợp lệ
        SavingsAccount storage sAccount = userSavingsAccounts[msg.sender][_index];
        
        require(sAccount.isActive, "DeBank: Savings account is not active"); // Đảm bảo khoản tiết kiệm đang hoạt động

        // Tính toán thời điểm kết thúc kỳ hạn
        // Sử dụng 30 ngày/tháng để đơn giản hóa, có thể dùng chính xác số giây trong tháng nếu cần.
        uint256 endTime = sAccount.startTime + (sAccount.durationMonths * 30 days);
        require(block.timestamp >= endTime, "DeBank: Savings period has not ended yet"); // Đảm bảo kỳ hạn đã kết thúc

        // Tính toán lãi suất (lãi suất đơn giản hàng năm, chia theo tháng)
        // Lãi = (số tiền * lãi suất / 10000) * (số tháng / 12)
        // Phép chia cuối cùng `/ 12` là để chuyển đổi lãi suất năm sang lãi suất tháng tương ứng với kỳ hạn.
        uint256 interestEarned = (sAccount.amount * sAccount.interestRate / 10000) * sAccount.durationMonths / 12;
        uint256 totalAmount = sAccount.amount + interestEarned; // Tổng số tiền gốc + lãi

        // Chuyển tổng số tiền (gốc + lãi) trở lại số dư chính của người dùng
        balances[msg.sender] = balances[msg.sender] + totalAmount;
        sAccount.isActive = false; // Đánh dấu khoản tiết kiệm đã được rút

        // Ghi lại giao dịch rút tiết kiệm vào lịch sử
        accountTransactions[msg.sender].push(
            Transaction({
                id: nextTransactionId++,
                from: address(this), // Đại diện cho hợp đồng DeBank (nguồn tiền trả lãi)
                to: msg.sender,
                amount: totalAmount,
                timestamp: block.timestamp,
                txType: "SavingsWithdrawal",
                description: string.concat("Withdrawal from savings, interest earned: ", Strings.toString(interestEarned / (10 ** vndToken.decimals()))) // Hiển thị lãi suất đã kiếm được
            })
        );
        emit SavingsWithdrawn(msg.sender, sAccount.amount, interestEarned); // Phát ra sự kiện SavingsWithdrawn
    }


    // --- Hàm Quản Trị (Admin Functions) ---
    // Các hàm này được bảo vệ bởi modifier `onlyBankOwner` để đảm bảo an toàn và quyền kiểm soát.
    // Chúng cũng sử dụng modifier từ Pausable để đảm bảo hoạt động đúng theo trạng thái tạm dừng.

    function pause() public onlyBankOwner whenNotPaused {
        // Chỉ có thể tạm dừng hợp đồng nếu người gọi là bankOwner và hợp đồng chưa bị tạm dừng.
        _pause(); // Hàm nội bộ từ Pausable, thực hiện việc tạm dừng hợp đồng.
    }

    function unpause() public onlyBankOwner whenPaused {
        // Chỉ có thể khởi động lại hợp đồng nếu người gọi là bankOwner và hợp đồng đang bị tạm dừng.
        _unpause(); // Hàm nội bộ từ Pausable, thực hiện việc khởi động lại hợp đồng.
    }

    function setDailyTransferLimit(uint256 _newLimit) public onlyBankOwner {
        require(_newLimit > 0, "DeBank: Daily limit must be greater than zero"); // Hạn mức phải lớn hơn 0
        dailyTransferLimit = _newLimit; // Cập nhật biến trạng thái
        emit DailyLimitUpdated(_newLimit); // Phát ra sự kiện thông báo thay đổi.
    }

    function setFeeRate(uint256 _newRate) public onlyBankOwner {
        require(_newRate <= 10000, "DeBank: Fee rate cannot exceed 100%"); // Đảm bảo tỷ lệ phí không vượt quá 100% (10000 basis points)
        transferFeeRate = _newRate; // Cập nhật biến trạng thái
        emit FeeRateUpdated(_newRate); // Phát ra sự kiện thông báo thay đổi.
    }

    function setFeeReceiver(address _newReceiver) public onlyBankOwner notZeroAddress(_newReceiver) {
        feeReceiver = _newReceiver; // Cập nhật biến trạng thái
        emit FeeReceiverUpdated(_newReceiver); // Phát ra sự kiện thông báo thay đổi.
    }

    function recoverVNDT(uint256 _amount) public onlyBankOwner {
        // Hàm này cho phép chủ sở hữu ngân hàng thu hồi bất kỳ VNDT nào vô tình được gửi trực tiếp
        // vào địa chỉ contract DeBank mà không qua hàm `deposit` (ví dụ: người dùng gửi nhầm).
        // Đây là một cơ chế an toàn để khôi phục tài sản bị mắc kẹt.
        require(vndToken.balanceOf(address(this)) >= _amount, "DeBank: Not enough VNDT in contract to recover"); // Đảm bảo contract có đủ tiền để thu hồi
        require(vndToken.transfer(bankOwner, _amount), "DeBank: Failed to recover VNDT"); // Chuyển VNDT về ví của bankOwner
    }

    /**
     * @dev Đặt lại lãi suất hàng năm toàn cầu cho các tài khoản tiết kiệm mới.
     * Chỉ có chủ sở hữu ngân hàng (`bankOwner`) mới có thể gọi hàm này.
     * @param _newRate Lãi suất hàng năm mới tính bằng basis points (ví dụ: 500 = 5%).
     */
    function setSavingsInterestRate(uint256 _newRate) public onlyBankOwner {
        savingsInterestRate = _newRate; // Cập nhật lãi suất tiết kiệm toàn cầu
    }
}