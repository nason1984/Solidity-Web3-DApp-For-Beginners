# Ứng dụng Demo: Solidity, Web3, DApp - Ngân Hàng Phi Tập Trung

## Mục lục

1.  [Giới thiệu về ứng dụng](#1-giới-thiệu-về-ứng-dụng)
    * [1.1. Giới thiệu về ứng dụng](#11-giới-thiệu-về-ứng-dụng)
    * [1.2. Mục tiêu và Mục đích](#12-mục-tiêu-và-mục-đích)
    * [1.3. Các chức năng của ứng dụng](#13-các-chức-năng-của-ứng-dụng)
    * [1.4. Kết luận: Lợi ích cho người mới bắt đầu](#14-kết-luận-lợi-ích-cho-người-mới-bắt-đầu)
2.  [Hướng dẫn cài đặt môi trường và công cụ](#2-hướng-dẫn-cài-đặt-môi-trường-và-công-cụ)
    * [2.1. Bảng Tổng Hợp Công Cụ & Stack Công Nghệ](#21-bảng-tổng-hợp-công-cụ--stack-công-nghệ)
    * [2.2. Cài đặt Node.js và npm](#22-cài-đặt-nodejs-và-npm)
    * [2.3. Cài đặt Git](#23-cài-đặt-git)
    * [2.4. Cài đặt Visual Studio Code (VS Code) và Extensions](#24-cài-đặt-visual-studio-code-vs-code-và-extensions)
    * [2.5. Cài đặt và thiết lập tài khoản MetaMask](#25-cài-đặt-và-thiết-lập-tài-khoản-metamask)
    * [2.6. Cài đặt Docker Desktop](#26-cài-đặt-docker-desktop)
    * [2.7. Cài đặt Ngrok (Tùy chọn)](#27-cài-đặt-ngrok-tùy-chọn)
    * [2.8. Thiết lập RPC Provider (Alchemy)](#28-thiết-lập-rpc-provider-alchemy)
    * [2.9. Cài đặt Ganache CLI (Tùy chọn)](#29-cài-đặt-ganache-cli-tùy-chọn)
3.  [Hướng dẫn triển khai, cài đặt ứng dụng và chạy ứng dụng](#3-hướng-dẫn-triển-khai-cài-đặt-ứng-dụng-và-chạy-ứng-dụng)
    * [3.1. Clone Repository](#31-clone-repository)
    * [3.2. Cấu hình & Chạy Dự án trên Localhost (Hardhat Network)](#32-cấu-hình--chạy-dự-án-trên-localhost-hardhat-network)
    * [3.3. Triển khai & Chạy Dự án trên Sepolia Testnet](#33-triển-khai--chạy-dự-án-trên-sepolia-testnet)
    * [3.4. Public ứng dụng ra Internet với Ngrok (Tùy chọn)](#34-public-ứng-dụng-ra-internet-với-ngrok-tùy-chọn)
4.  [Hướng Dẫn Sử Dụng Ứng Dụng](#4-hướng-dẫn-sử-dụng-ứng-dụng)
    * [4.1. Kết nối Ví MetaMask](#41-kết-nối-ví-metamask)
    * [4.2. Gửi Tiền (Deposit)](#42-gửi-tiền-deposit)
    * [4.3. Rút Tiền (Withdraw)](#43-rút-tiền-withdraw)
    * [4.4. Chuyển Tiền (Transfer)](#44-chuyển-tiền-transfer)
    * [4.5. Gửi Tiết Kiệm (Savings)](#45-gửi-tiết-kiệm-savings)
    * [4.6. Lịch Sử Giao Dịch](#46-lịch-sử-giao-dịch)
    * [4.7. Bảng Điều Khiển Quản Trị (Admin Panel)](#47-bảng-điều-khiển-quản-trị-admin-panel)
5.  [Kiểm Thử Tổng Thể](#5-kiểm-thử-tổng-thể)
6.  [Mở Rộng & Cải Tiến Tương Lai](#6-mở-rộng--cải-tiến-tương-lai)
7.  [Đóng Góp](#7-đóng-góp)
8.  [Liên Hệ](#8-liên-hệ)

---

## 1. Giới thiệu về ứng dụng

### 1.1. Giới thiệu về ứng dụng

Ứng dụng này là một dự án demo về **Ngân hàng Phi Tập Trung (Decentralized Application - DApp)** được xây dựng trên nền tảng blockchain Ethereum. Nó mô phỏng các chức năng cơ bản của một ngân hàng truyền thống nhưng hoạt động hoàn toàn phi tập trung thông qua các smart contract.

<img width="1575" alt="Screenshot 2025-07-05 at 11 26 48" src="https://github.com/user-attachments/assets/d20641b7-2676-4267-b30a-bf2e65c5181d" />

<img width="1555" alt="image" src="https://github.com/user-attachments/assets/1aebe754-4280-42ab-b27c-2e34f81edefa" />


### 1.2. Mục tiêu và Mục đích

Dự án này được thiết kế với mục tiêu chính là cung cấp một tài liệu hướng dẫn chi tiết, từng bước, giúp những người mới bắt đầu học Solidity và phát triển Web3 có thể dễ dàng:

* Hiểu rõ quy trình phát triển smart contract từ đầu.
* Thực hành triển khai hợp đồng trên các mạng blockchain khác nhau (cục bộ và testnet).
* Xây dựng một giao diện người dùng (frontend) để tương tác với smart contract.
* Nắm vững các khái niệm cơ bản về DeFi như token ERC-20, phí giao dịch, hạn mức, và quản lý hợp đồng.

### 1.3. Các chức năng của ứng dụng

Ứng dụng Demo này sử dụng **VND Token (VNDT)**, một token ERC-20 tùy chỉnh, để đại diện cho tiền tệ Việt Nam Đồng trên blockchain. Các chức năng chính bao gồm:

* **Quản lý Tài khoản:**
    * **Mở tài khoản:** Tự động khi người dùng gửi tiền (deposit) lần đầu tiên vào hệ thống.
    * **Kiểm tra số dư:** Hiển thị số dư VNDT của bạn trong hệ thống và số dư ETH của ví MetaMask.
* **Giao dịch:**
    * **Phê duyệt (Approve):** Cấp quyền cho hợp đồng ngân hàng di chuyển VNDT từ ví MetaMask của bạn. Đây là bước bắt buộc trước khi gửi tiền.
    * **Gửi tiền (Deposit):** Chuyển VNDT từ ví MetaMask vào tài khoản ngân hàng của bạn.
    * **Rút tiền (Withdraw):** Rút VNDT từ tài khoản ngân hàng về ví MetaMask.
    * **Chuyển tiền (Transfer):** Chuyển VNDT giữa các tài khoản người dùng trong hệ thống (áp dụng phí giao dịch và hạn mức chuyển khoản hàng ngày).
    * **Gửi tiết kiệm (Savings Deposit):** Gửi VNDT vào một khoản tiết kiệm có kỳ hạn (tiền bị khóa trong một khoảng thời gian nhất định).
* **Lịch sử Giao dịch:** Xem chi tiết tất cả các giao dịch đã thực hiện (gửi, rút, chuyển đi, nhận về, gửi tiết kiệm), được sắp xếp theo thời gian giảm dần và có phân trang.
* **Bảng Điều Khiển Quản Trị:** (Chỉ dành cho chủ sở hữu hợp đồng)
    * **Cập nhật Hạn mức Chuyển khoản hàng ngày:** Thiết lập hạn mức tối đa cho mỗi tài khoản.
    * **Cập nhật Tỷ lệ Phí Chuyển khoản:** Thay đổi tỷ lệ phí thu cho các giao dịch chuyển tiền.
    * **Tạm dừng Hợp đồng (`pause()`):** Tạm thời ngừng hoạt động các chức năng giao dịch của hợp đồng.
    * **Khởi động Hợp đồng (`unpause()`):** Kích hoạt lại hợp đồng sau khi tạm dừng.

### 1.4. Kết luận: Lợi ích cho người mới bắt đầu

Dự án Demo này là một công cụ học tập lý tưởng vì:

* **Thực tế:** Mô phỏng một ứng dụng tài chính thực tế trên blockchain.
* **Toàn diện:** Bao gồm cả phát triển smart contract (backend) và giao diện người dùng (frontend).
* **Từng bước:** Hướng dẫn chi tiết từ cài đặt đến triển khai và kiểm thử.
* **Xử lý lỗi:** Trải nghiệm và học cách debug các lỗi phổ biến trong quá trình phát triển DApp.
* **Mã nguồn mở:** Bạn có thể tự do khám phá, sửa đổi và mở rộng dự án.

---

## 2. Hướng dẫn cài đặt môi trường và công cụ

Để bắt đầu với dự án Demo này, bạn cần chuẩn bị môi trường phát triển của mình.

### 2.1. Bảng Tổng Hợp Công Cụ & Stack Công Nghệ

| Stack/Công cụ               | Phiên bản đề xuất | Mô tả & Mục đích                                                                                                                              | Yêu cầu cấu hình/Lưu ý                                                                                                                                                                                                                                                        |
| :-------------------------- | :----------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Node.js** | LTS (v18.x trở lên) | Nền tảng runtime cho JavaScript, cần thiết để chạy Hardhat, cài đặt các gói npm và phát triển frontend (React).                                 | Khuyến nghị phiên bản LTS để đảm bảo ổn định và tương thích. Tải xuống từ [nodejs.org](https://nodejs.org/).                                                                                                                                                                          |
| **npm** | Mới nhất          | Trình quản lý gói cho Node.js, dùng để cài đặt thư viện và dependency cho cả smart contract và frontend.                                         | npm đi kèm với Node.js.                                                                                                                                                                                                                                                        |
| **Git** | Mới nhất          | Hệ thống kiểm soát phiên bản, dùng để clone repository và quản lý mã nguồn.                                                                     | Tải xuống từ [git-scm.com](https://git-scm.com/downloads).                                                                                                                                                                                                                          |
| **Hardhat** | Mới nhất          | Môi trường phát triển Ethereum. Cung cấp các công cụ để viết, biên dịch (compile), kiểm thử (test), triển khai (deploy) và debug smart contract. | Sẽ được cài đặt cục bộ trong dự án `debank-contracts` sau khi clone.                                                                                                                                                                                                                |
| **OpenZeppelin Contracts** | `^5.0.0`           | Thư viện smart contract đã được kiểm toán và an toàn, cung cấp các chuẩn (ERC-20, Ownable, Pausable) giúp tiết kiệm thời gian phát triển và giảm thiểu rủi ro. | Sẽ được cài đặt cục bộ trong dự án `debank-contracts` sau khi clone.                                                                                                                                                                                                                |
| **Visual Studio Code (VS Code)** | Mới nhất     | Môi trường phát triển tích hợp (IDE) được khuyên dùng.                                                                                    | Cài đặt các extension sau: <br/>- **Solidity** (by Juan Blanco): Hỗ trợ syntax highlighting, linting, autocompletion cho Solidity.<br/>- **Hardhat for Visual Studio Code**: Cung cấp các tính năng tích hợp với Hardhat.                                                           |
| **MetaMask** | Mới nhất          | Ví tiền điện tử và cổng giao tiếp với blockchain. Cần thiết để kết nối với DApp frontend và quản lý các tài khoản test.                       | Cài đặt dưới dạng tiện ích mở rộng trình duyệt (Chrome, Firefox, Brave, Edge). Tạo ít nhất 2-3 tài khoản trong MetaMask để mô phỏng người dùng khác nhau khi test.                                                                                                                    |
| **ETH (Sepolia Testnet)** | \-                 | Tiền mã hóa để trả phí gas trên mạng thử nghiệm Sepolia. **Đây là TIỀN TEST, KHÔNG CÓ GIÁ TRỊ THẬT.** | Lấy miễn phí từ các faucet Sepolia (ví dụ: `sepoliafaucet.com`, `cloud.google.com/blockchain/web3/faucet`). Mỗi tài khoản test trong MetaMask sẽ cần một lượng nhỏ ETH testnet.                                                                                  |
| **Alchemy** | \-                 | Nhà cung cấp node blockchain (RPC Provider). Cung cấp quyền truy cập vào mạng Sepolia Testnet để triển khai và tương tác với smart contract.  | Đăng ký tài khoản miễn phí và tạo một dự án mới để lấy RPC URL và API Key cho mạng Sepolia. Đây là thông tin nhạy cảm, sẽ không đưa vào mã nguồn trực tiếp.                                                                                                                              |
| **React.js** | `^18.2.0`          | Thư viện JavaScript để xây dựng giao diện người dùng (frontend) của DApp.                                                                    | Sẽ được cài đặt cục bộ trong dự án `debank-frontend` sau khi clone.                                                                                                                                                                                                                 |
| **Web3.js** | Mới nhất          | Thư viện JavaScript để tương tác với blockchain Ethereum, smart contract và ví Metamask từ phía frontend.                                       | Sẽ được cài đặt cục bộ trong dự án `debank-frontend` sau khi clone.                                                                                                                                                                                                                 |
| **Tailwind CSS** | `^3.4.3`           | Framework CSS utility-first, dùng để xây dựng giao diện người dùng một cách nhanh chóng và responsive.                                         | Sẽ được cài đặt cục bộ trong dự án `debank-frontend` sau khi clone.                                                                                                                                                                                                                 |
| **Docker Desktop** | Mới nhất          | Nền tảng ảo hóa container, dùng để triển khai frontend trên localhost một cách nhất quán và dễ dàng chia sẻ môi trường phát triển/test.       | Tải xuống và cài đặt từ [docker.com](https://www.docker.com/products/docker-desktop/). Đảm bảo Docker Engine đang chạy.                                                                                                                         |
| **Ngrok** | Mới nhất          | Công cụ tạo đường hầm an toàn từ localhost ra internet, giúp bạn public ứng dụng cục bộ để người khác có thể truy cập.                              | Tải xuống từ [ngrok.com/download](https://ngrok.com/download). Cần đăng ký tài khoản miễn phí và cấu hình authtoken.                                                                                                                                                               |
| **Ganache CLI** (Tùy chọn) | Mới nhất          | Mạng blockchain cá nhân cục bộ. Dùng để phát triển và kiểm thử smart contract nhanh chóng mà không cần phí gas thực.                            | Cài đặt toàn cục: `npm install --global ganache`. Hardhat Network cũng cung cấp chức năng tương tự.                                                                                                                                                                                  |

### 2.2. Hướng dẫn Cài đặt Node.js và npm

1.  **Kiểm tra Node.js và npm:**
    Mở Terminal/Command Prompt và gõ: `node -v` và `npm -v`.
    Nếu đã có (phiên bản Node.js LTS v18.x trở lên), bạn có thể bỏ qua bước cài đặt.

2.  **Cài đặt Node.js (nếu cần):**
    * **macOS (khuyến nghị dùng Homebrew):**
        * Cài đặt Homebrew (nếu chưa có): Dán lệnh sau vào Terminal và nhấn Enter. Làm theo hướng dẫn trên màn hình, nhập mật khẩu khi được yêu cầu.
            ```bash
            /bin/bash -c "$(curl -fsSL [https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh](https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh))"
            ```
        * Sau khi Homebrew cài xong, chạy các lệnh mà Homebrew hiển thị để thêm nó vào PATH (thường là 2 dòng `eval "$(/opt/homebrew/bin/brew shellenv)"` và `echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile` hoặc `~/.bash_profile`). Đóng và mở lại Terminal.
        * Cài đặt Node.js:
            ```bash
            brew install node
            ```
    * **Windows:**
        * Truy cập [nodejs.org/vi/](https://nodejs.org/vi/).
        * Tải xuống và chạy trình cài đặt phiên bản **LTS (Recommended for most users)**. Trình cài đặt sẽ bao gồm cả npm.

3.  **Xác nhận cài đặt:**
    Mở Terminal mới và kiểm tra lại:
    ```bash
    node -v
    npm -v
    ```
    Đảm bảo phiên bản Node.js là LTS (ví dụ: `v18.x.x` hoặc `v20.x.x`).

### 2.3. Cài đặt Git

1.  **Kiểm tra Git:** Mở Terminal và gõ: `git --version`.
2.  **Cài đặt Git (nếu cần):** Tải xuống từ [git-scm.com/downloads](https://git-scm.com/downloads).

### 2.4. Cài đặt Visual Studio Code (VS Code) và Extensions

1.  **Cài đặt VS Code:**
    * Truy cập [code.visualstudio.com/](https://code.visualstudio.com/).
    * Tải xuống và cài đặt phiên bản phù hợp với hệ điều hành của bạn.
2.  **Cài đặt Extensions trong VS Code:**
    * Mở VS Code.
    * Vào phần Extensions (biểu tượng hình vuông ở thanh bên trái hoặc `Ctrl+Shift+X`/`Cmd+Shift+X`).
    * Tìm kiếm và cài đặt các extension sau:
        * **Solidity** (by Juan Blanco)
        * **Hardhat for Visual Studio Code**

### 2.5. Cài đặt và thiết lập tài khoản MetaMask

1.  **Cài đặt tiện ích mở rộng MetaMask:**
    * Mở trình duyệt (Chrome, Firefox, Brave, Edge).
    * Truy cập [metamask.io/download/](https://metamask.io/download/).
    * Thêm tiện ích mở rộng vào trình duyệt của bạn.
2.  **Thiết lập ví MetaMask mới:**
    * Làm theo hướng dẫn của MetaMask để tạo ví mới.
    * **CỰC KỲ QUAN TRỌNG:** Ghi lại **Secret Recovery Phrase (Cụm từ Khôi phục Bí mật)** gồm 12 từ và lưu trữ ở nơi an toàn **ngoại tuyến**. Không bao giờ chia sẻ nó.
    * Tạo mật khẩu.
3.  **Tạo thêm tài khoản test (khuyến nghị):**
    * Trong MetaMask, nhấp vào biểu tượng avatar tròn ở góc trên bên phải.
    * Chọn **"Create new account" (Tạo tài khoản mới)**.
    * Đặt tên dễ nhớ (ví dụ: "Test User 2"). Lặp lại để tạo 2-3 tài khoản test.

### 2.6. Cài đặt Docker Desktop

1.  **Tải và cài đặt:** Tải Docker Desktop từ [docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/).
2.  **Xác nhận:** Mở Docker Desktop và đảm bảo nó đang chạy. Kiểm tra trong Terminal: `docker --version`.

### 2.7. Cài đặt Ngrok (Tùy chọn)

1.  **Tải xuống và cài đặt Ngrok:**
    * Truy cập [ngrok.com/download](https://ngrok.com/download).
    * Tải xuống phiên bản phù hợp với hệ điều hành của bạn và giải nén.
2.  **Đăng ký tài khoản Ngrok và lấy Authtoken:**
    * Truy cập [dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup) và đăng ký tài khoản miễn phí.
    * Đăng nhập vào Dashboard và sao chép lệnh `ngrok config add-authtoken your_authtoken_here`.
3.  **Kết nối Ngrok với tài khoản của bạn:**
    * Mở Terminal và dán lệnh đã sao chép. Nhấn Enter.

### 2.8. Thiết lập RPC Provider (Alchemy)

1.  **Đăng ký tài khoản Alchemy:** Truy cập [alchemy.com](https://www.alchemy.com/) và đăng ký tài khoản miễn phí.
2.  **Tạo App mới:** Trong Dashboard, chọn "Create App" -> Chain: `Ethereum` -> Network: `Sepolia`.
3.  **Lấy HTTPS URL:** Sao chép HTTPS URL từ phần "API Key" của App vừa tạo. **Lưu URL này vào một file ghi chú tạm thời.**

### 2.9. Cài đặt Ganache CLI (Tùy chọn)

1.  **Cài đặt:** Mở Terminal và chạy:
    ```bash
    npm install --global ganache
    ```
2.  **Xác nhận cài đặt:**
    ```bash
    ganache --version
    ```

---

## 3. Hướng dẫn triển khai, cài đặt ứng dụng và chạy ứng dụng

### 3.1. Clone Repository

1.  **Mở Terminal** và điều hướng đến thư mục mà bạn muốn lưu trữ dự án (ví dụ: `~/Projects/`).
2.  **Clone repository của dự án:**
    ```bash
    git clone [https://github.com/your-username/DeBank-DApp-For-Beginners.git](https://github.com/your-username/DeBank-DApp-For-Beginners.git)
    ```
    * Thay thế `your-username` bằng GitHub username của bạn và `DeBank-DApp-For-Beginners` bằng tên repository của bạn.
3.  **Điều hướng vào thư mục dự án:**
    ```bash
    cd DeBank-DApp-For-Beginners
    ```

### 3.2. Cấu hình & Chạy Dự án trên Localhost (Hardhat Network)

Môi trường cục bộ là lý tưởng để phát triển và kiểm thử nhanh chóng.

1.  **Cài đặt Dependencies cho Smart Contract:**
    * Trong Terminal, điều hướng vào thư mục smart contract:
        ```bash
        cd debank-contracts
        npm install
        ```
    * **Lưu ý:** Thư mục `contracts` đã có sẵn `VNDT.sol` và `DeBank.sol`. Thư mục `scripts` đã có `deploy.js`. Thư mục `test` đã có các file test.

2.  **Cài đặt Dependencies cho Frontend:**
    * Trong Terminal, điều hướng vào thư mục frontend:
        ```bash
        cd ../debank-frontend
        npm install
        ```
    * **Lưu ý:** Thư mục `src/contracts` đã có sẵn `VNDT.json` và `DeBank.json` (ABI files).

3.  **Khởi động Hardhat Network (Localhost):**
    * **Mở một Terminal MỚI.**
    * Điều hướng đến `DeBank-Project/debank-contracts`.
    * Chạy:
        ```bash
        npx hardhat node
        ```
    * **GIỮ TERMINAL NÀY LUÔN MỞ trong suốt quá trình phát triển cục bộ.** Nó sẽ hiển thị danh sách 20 tài khoản test (ví dụ: `Account #0`, `Account #1`, ...).

4.  **Triển khai Smart Contracts lên Localhost:**
    * **Mở một Terminal MỚI khác.**
    * Điều hướng đến `DeBank-Project/debank-contracts`.
    * **Cấu hình `debank-contracts/hardhat.config.js`:**
        * Mở file `debank-contracts/hardhat.config.js`.
        * Đảm bảo cấu hình `localhost` và `sepolia` (sẽ dùng sau) đã đúng.
        ```javascript
        // ... (phần trên của file)
        networks: {
          hardhat: {},
          localhost: {
            url: "[http://127.0.0.1:8545](http://127.0.0.1:8545)",
          },
          sepolia: {
            url: process.env.ALCHEMY_SEPOLIA_RPC_URL,
            accounts: [process.env.METAMASK_PRIVATE_KEY],
            chainId: 11155111,
          },
        },
        // ... (phần dưới của file)
        ```
        * **Lưu file `hardhat.config.js`**.
    * **Cấu hình `debank-contracts/.env`:**
        * Mở file `debank-contracts/.env` (nếu chưa có, tạo nó).
        * Dán vào đó (Alchemy URL và Private Key có thể để trống hoặc dùng giá trị giả cho localhost):
            ```
            ALCHEMY_SEPOLIA_RPC_URL=[http://127.0.0.1:8545](http://127.0.0.1:8545)
            METAMASK_PRIVATE_KEY=0xac0974...f2ff80 # Private Key của Account #0 từ npx hardhat node
            ```
        * **Lưu file `.env`**.
    * **Biên dịch Smart Contracts:**
        ```bash
        npx hardhat compile
        ```
    * **Triển khai Smart Contracts lên Localhost:**
        ```bash
        npx hardhat run scripts/deploy.js --network localhost
        ```
        * **SAO CHÉP CHÍNH XÁC địa chỉ của `VNDT deployed to:` và `DeBank deployed to:` từ Terminal này.** Đây là địa chỉ contract trên localhost.

5.  **Cập nhật file `.env` của Frontend:**
    * Mở file `DeBank-Project/debank-frontend/.env`.
    * Dán các địa chỉ contract localhost bạn vừa sao chép. `VITE_BANK_OWNER_ADDRESS` là địa chỉ `Account #0` từ `npx hardhat node`.
        ```
        VITE_VNDT_CONTRACT_ADDRESS=ĐỊA_CHỈ_VNDT_CONTRACT_TRÊN_LOCALHOST
        VITE_DEBANK_CONTRACT_ADDRESS=ĐỊA_CHỈ_DEBANK_CONTRACT_TRÊN_LOCALHOST
        VITE_BANK_OWNER_ADDRESS=ĐỊA_CHỈ_ACCOUNT_0_TỪ_HARDHAT_NODE
        ```
    * **Lưu file `.env`**.

6.  **Cấu hình MetaMask cho Localhost:**
    * Mở MetaMask.
    * Thêm mạng tùy chỉnh: **Network name:** `Localhost Hardhat Network`, **New RPC URL:** `http://127.0.0.1:8545`, **Chain ID:** `31337`, **Currency symbol:** `ETH`. Nhấp "Save".
    * Import tài khoản: Trong MetaMask, nhấp avatar -> "Import account" -> "Private Key". Dán Private Key của `Account #0` (từ Terminal chạy `npx hardhat node`). Lặp lại cho `Account #1` nếu muốn test chuyển tiền.

7.  **Cấp VNDT cho tài khoản test (trên Localhost):**
    * **Mở một Terminal MỚI khác.**
    * Điều hướng đến `DeBank-Project/debank-contracts`.
    * Chạy: `npx hardhat console --network localhost`
    * Trong console, sử dụng các lệnh sau để mint VNDT cho ví MetaMask của bạn (thay địa chỉ bằng ví của bạn và địa chỉ VNDT contract từ `.env` của frontend):
        ```javascript
        const VNDT = await ethers.getContractFactory("VNDT");
        const vndToken = await VNDT.attach("ĐỊA_CHỈ_VNDT_CONTRACT_TRÊN_LOCALHOST"); 
        const [owner] = await ethers.getSigners();
        const mintAmount = ethers.parseUnits("5000000", 18); // Ví dụ 5 triệu VNDT
        const yourMetamaskAddress = "ĐỊA_CHỈ_VÍ_METAMASK_CỦA_BẠN_TRÊN_LOCALHOST";
        await vndToken.connect(owner).mint(yourMetamaskAddress, mintAmount);
        console.log(`Đã mint ${ethers.formatUnits(mintAmount, 18)} VNDT cho ${yourMetamaskAddress}`);
        ```
    * Gõ `.exit`.

8.  **Chạy ứng dụng Frontend:**
    * **Mở một Terminal MỚI khác.**
    * Điều hướng đến `DeBank-Project/debank-frontend`.
    * Chạy: `npm run dev`
    * Mở trình duyệt: `http://localhost:5173`.
    * **Kết nối ví MetaMask** (chọn `Localhost Hardhat Network` và tài khoản đã mint VNDT).
    * **THỰC HIỆN GIAO DỊCH GỬI TIỀN (DEPOSIT) ĐẦU TIÊN** để tài khoản của bạn tồn tại trong hệ thống trên hợp đồng mới này.

### 3.3. Triển khai trên Sepolia Testnet và chạy Frontend bằng Docker Desktop

Đây là môi trường công khai, cho phép người khác truy cập ứng dụng của bạn.

1.  **Triển khai Smart Contracts lên Sepolia Testnet:**
    * **Đảm bảo không có `npx hardhat node` chạy.**
    * **Mở một Terminal MỚI.**
    * Điều hướng đến `DeBank-Project/debank-contracts`.
    * **Cấu hình `.env` cho Hardhat (nếu chưa có hoặc muốn cập nhật):**
        * Đảm bảo `ALCHEMY_SEPOLIA_RPC_URL` và `METAMASK_PRIVATE_KEY` trong `debank-contracts/.env` là thông tin thật của bạn cho Sepolia.
    * Chạy:
        ```bash
        npx hardhat run scripts/deploy.js --network sepolia
        ```
    * **SAO CHÉP CHÍNH XÁC địa chỉ của `VNDT deployed to:` và `DeBank deployed to:` từ Terminal này.** Đây là địa chỉ contract trên Sepolia.

2.  **Cập nhật file `.env` của Frontend (cho Sepolia):**
    * Mở file `DeBank-Project/debank-frontend/.env`.
    * **Dán đè** địa chỉ contract Sepolia bạn vừa sao chép.
    * **Lưu file `.env`**.

3.  **Cấp ETH Sepolia và Mint VNDT trên Sepolia:**
    * **Lấy ETH Sepolia:** Mở MetaMask, chọn `Sepolia Testnet`. Sao chép địa chỉ ví. Truy cập [cloud.google.com/blockchain/web3/faucet](https://cloud.google.com/blockchain/web3/faucet) để yêu cầu ETH.
    * **Mint VNDT trên Sepolia:**
        * **Mở một Terminal MỚI.**
        * Điều hướng đến `DeBank-Project/debank-contracts`.
        * Chạy: `npx hardhat console --network sepolia`
        * Trong console, sử dụng các lệnh sau để mint VNDT cho tài khoản MetaMask của bạn trên Sepolia (thay địa chỉ bằng ví của bạn và địa chỉ VNDT contract từ `.env` của frontend):
            ```javascript
            const VNDT = await ethers.getContractFactory("VNDT");
            const vndToken = await VNDT.attach("ĐỊA_CHỈ_VNDT_CONTRACT_TRÊN_SEPOLIA");
            const [owner] = await ethers.getSigners();
            const mintAmount = ethers.parseUnits("5000000", 18);
            const yourMetamaskAddress = "ĐỊA_CHỈ_VÍ_METAMASK_CỦA_BẠN_TRÊN_SEPOLIA";
            await vndToken.connect(owner).mint(yourMetamaskAddress, mintAmount);
            console.log(`Đã mint ${ethers.formatUnits(mintAmount, 18)} VNDT cho ${yourMetamaskAddress}`);
            ```
        * Gõ `.exit`.
    * **Import VNDT token vào MetaMask** cho tài khoản đó trên mạng Sepolia Testnet.

4.  **Tạo Dockerfile và nginx.conf cho Frontend:**
    * Trong thư mục `DeBank-Project/debank-frontend`, tạo file `Dockerfile` và dán nội dung sau:
        ```dockerfile
        # Sử dụng Node.js bản LTS làm image cơ sở để build ứng dụng React
        FROM node:lts-alpine as builder

        # Đặt thư mục làm việc bên trong container
        WORKDIR /app

        # Sao chép file package.json và package-lock.json để cài đặt dependencies
        COPY package*.json ./

        # Cài đặt các dependencies của dự án
        RUN npm install --force

        # Sao chép toàn bộ mã nguồn của ứng dụng React vào thư mục làm việc trong container
        COPY . .

        # Build ứng dụng React cho môi trường production
        RUN npm run build

        # Sử dụng image Nginx Alpine làm image cơ sở cho giai đoạn production
        FROM nginx:alpine

        # Xóa cấu hình Nginx mặc định
        RUN rm /etc/nginx/conf.d/default.conf

        # Sao chép file cấu hình Nginx tùy chỉnh của chúng ta vào đúng vị trí trong container
        COPY nginx.conf /etc/nginx/conf.d/default.conf

        # Sao chép các file ứng dụng React đã được build từ giai đoạn 'builder' vào thư mục phục vụ của Nginx
        COPY --from=builder /app/dist /usr/share/nginx/html

        # Mở cổng 80 trong container để Nginx có thể lắng nghe các kết nối HTTP
        EXPOSE 80

        # Lệnh mặc định khi container khởi chạy: Khởi động Nginx ở chế độ foreground
        CMD ["nginx", "-g", "daemon off;"]
        ```
    * Trong thư mục `DeBank-Project/debank-frontend`, tạo file `nginx.conf` và dán nội dung sau:
        ```nginx
        server {
            listen 80;
            root /usr/share/nginx/html;
            index index.html index.htm;
            location / {
                try_files $uri $uri/ /index.html;
            }
            error_page 500 502 503 504 /50x.html;
            location = /50x.html {
                root /usr/share/nginx/html;
            }
        }
        ```

5.  **Build và Chạy Docker Container:**
    * **Mở một Terminal MỚI.**
    * Điều hướng đến `DeBank-Project/debank-frontend`.
    * Chạy: `npm run build` (để tạo thư mục `dist` chứa bản build production).
    * **Dừng server phát triển** nếu đang chạy (`Ctrl + C`).
    * **Build Docker Image:**
        ```bash
        docker build -t app-demo-frontend-app .
        ```
    * **Chạy Docker Container:**
        ```bash
        docker run -p 8080:80 app-demo-frontend-app
        ```
    * Mở trình duyệt: `http://localhost:8080`.
    * **Kết nối ví MetaMask** (chọn `Sepolia Testnet` và tài khoản đã nạp ETH/VNDT).
    * **THỰC HIỆN GIAO DỊCH GỬI TIỀN (DEPOSIT) ĐẦU TIÊN** để tài khoản của bạn tồn tại trong hệ thống trên Sepolia.

### 3.4. Public ứng dụng ra Internet với Ngrok (Tùy chọn)

Để chia sẻ ứng dụng đang chạy trên Docker với người khác qua internet.

1.  **Tải và cài đặt Ngrok:** Từ [ngrok.com/download](https://ngrok.com/download).
2.  **Đăng ký tài khoản Ngrok** và lấy Authtoken từ Dashboard của bạn.
3.  **Kết nối Ngrok với tài khoản:** Mở Terminal, chạy lệnh `ngrok config add-authtoken your_authtoken_here`.
4.  **Chạy đường hầm Ngrok:**
    * **Đảm bảo Docker Container của frontend đang chạy** trên cổng 8080 (`docker run -p 8080:80 app-demo-frontend-app`).
    * **Mở một Terminal MỚI khác.**
    * Chạy: `ngrok http 8080`
    * Ngrok sẽ cung cấp một URL công khai (ví dụ: `https://[random_string].ngrok-free.app`). Chia sẻ URL này với người khác để họ truy cập ứng dụng của bạn.

---

## 4. Hướng Dẫn Sử Dụng Ứng Dụng

Sau khi ứng dụng đã chạy thành công trên localhost hoặc thông qua Ngrok, bạn có thể tương tác với nó:

### 4.1. Kết nối Ví MetaMask

* Nhấp vào nút **"Kết Nối Ví"** ở góc trên bên phải.
* Chọn tài khoản MetaMask bạn muốn sử dụng và xác nhận kết nối.
* Ứng dụng sẽ hiển thị địa chỉ ví, trạng thái kết nối, mạng lưới và số dư ETH của ví.

### 4.2. Gửi Tiền (Deposit)

1.  Chuyển sang tab **"Gửi Tiền"**.
2.  Nhập số lượng VNDT muốn gửi vào hệ thống.
3.  **Bước 1: Phê duyệt (Approve):** Nhấn nút **"Phê Duyệt VNDT"** và xác nhận giao dịch trong MetaMask. (Bạn cần có đủ VNDT trong ví MetaMask của mình).
4.  **Bước 2: Gửi Tiền (Deposit):** Sau khi phê duyệt thành công, nhấn nút **"Gửi Tiền"** và xác nhận giao dịch trong MetaMask.
    * Số dư VNDT trong ví MetaMask của bạn sẽ giảm, và số dư trong hệ thống của bạn sẽ tăng.

### 4.3. Rút Tiền (Withdraw)

1.  Chuyển sang tab **"Rút Tiền"**.
2.  Nhập số lượng VNDT muốn rút từ hệ thống về ví MetaMask.
3.  Nhấn nút **"Rút Tiền"** và xác nhận giao dịch trong MetaMask.
    * Số dư VNDT trong hệ thống của bạn sẽ giảm, và số dư VNDT trong ví MetaMask của bạn sẽ tăng.

### 4.4. Chuyển Tiền (Transfer)

1.  Chuyển sang tab **"Chuyển Tiền"**.
2.  Nhập địa chỉ ví của người nhận (một tài khoản MetaMask khác đã có hoặc sẽ có tài khoản trong hệ thống).
3.  Nhập số lượng VNDT muốn chuyển.
4.  Nhấn nút **"Chuyển Tiền"** và xác nhận giao dịch trong MetaMask.
    * Số tiền sẽ được trừ từ tài khoản của bạn (cộng thêm phí giao dịch 0.1%) và cộng vào tài khoản của người nhận.

### 4.5. Gửi Tiết Kiệm (Savings)

1.  Chuyển sang tab **"Tiết Kiệm"**.
2.  Nhập số lượng VNDT muốn gửi tiết kiệm.
3.  Chọn kỳ hạn (tháng).
4.  Nhấn nút **"Gửi Tiết Kiệm"** và xác nhận giao dịch trong MetaMask.
    * Số tiền sẽ bị trừ khỏi số dư thông thường của bạn và được ghi nhận là khoản tiết kiệm bị khóa.

### 4.6. Lịch Sử Giao Dịch

* Bảng "Lịch Sử Giao Dịch" sẽ tự động hiển thị các giao dịch của tài khoản MetaMask hiện tại.
* Bạn có thể sử dụng các nút phân trang **"Trước"**, **"Sau"**, và các nút số trang để điều hướng qua lịch sử.

### 4.7. Bảng Điều Khiển Quản Trị (Admin Panel)

* Phần này chỉ hiển thị nếu tài khoản MetaMask bạn đang kết nối là **Chủ sở hữu hợp đồng** (tài khoản đã deploy hợp đồng, thường là `Account #0` từ Hardhat Network hoặc tài khoản deploy trên Sepolia).
* Bạn có thể:
    * Cập nhật hạn mức chuyển khoản hàng ngày.
    * Cập nhật tỷ lệ phí chuyển khoản.
    * Tạm dừng hoặc khởi động lại hợp đồng.

---

## 5. Kiểm Thử Tổng Thể

Sau khi triển khai lên Sepolia Testnet, bạn có thể mời bạn bè hoặc đồng nghiệp tham gia kiểm thử:

1.  Chia sẻ URL Ngrok của bạn (nếu dùng).
2.  Hướng dẫn họ cài đặt MetaMask và chuyển sang mạng Sepolia Testnet.
3.  Hướng dẫn họ lấy ETH Sepolia từ faucet.
4.  Bạn cần mint VNDT cho ví MetaMask của họ trên Sepolia (qua Hardhat Console với `--network sepolia`).
5.  Họ có thể kết nối ví và bắt đầu test các chức năng.

## 6. Mở Rộng & Cải Tiến Tương Lai

Dự án Demo này là một nền tảng tuyệt vời để tiếp tục học hỏi và phát triển. Một số ý tưởng mở rộng bao gồm:

* **Triển khai chức năng rút tiền tiết kiệm (`withdrawSavings`)** và tính toán lãi suất phức tạp hơn.
* Thêm các loại tài khoản tiết kiệm khác (ví dụ: không kỳ hạn, lãi suất lũy tiến).
* Phát triển các tính năng DeFi khác như cho vay (lending) hoặc đi vay (borrowing).
* Cải thiện UI/UX, thêm các thông báo loading, trạng thái giao dịch.
* Tích hợp các tiêu chuẩn bảo mật nâng cao hơn.
* Xây dựng một hệ thống quản lý người dùng off-chain (nếu cần cho ứng dụng thực tế).
* Thêm các bài kiểm thử tự động cho các chức năng mới.

## 7. Đóng Góp

Mọi đóng góp đều được hoan nghênh! Nếu bạn tìm thấy lỗi, có đề xuất cải tiến, hoặc muốn thêm tính năng mới, vui lòng tạo một "Issue" hoặc gửi "Pull Request" trên GitHub repository.

## 8. Liên Hệ

* **Tác giả:** Sơn Nguyễn
* **GitHub:** https://github.com/nason1984/Solidity-Web3-DApp-For-Beginners
* **Email:** 
