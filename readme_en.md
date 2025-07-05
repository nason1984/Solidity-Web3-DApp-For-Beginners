# App Demo: Solidity, Web3, DApp - Decentralized Banking

## Table of Contents

1.  [About the Application](#1-about-the-application)
    * [1.1. Application Introduction](#11-application-introduction)
    * [1.2. Goals and Objectives](#12-goals-and-objectives)
    * [1.3. Application Features](#13-application-features)
    * [1.4. Conclusion: Benefits for Beginners](#14-conclusion-benefits-for-beginners)
2.  [Environment and Tool Setup Guide](#2-environment-and-tool-setup-guide)
    * [2.1. Tools & Tech Stack Overview Table](#21-tools--tech-stack-overview-table)
    * [2.2. Node.js and npm Installation Guide](#22-nodejs-and-npm-installation-guide)
    * [2.3. Git Installation Guide](#23-git-installation-guide)
    * [2.4. Visual Studio Code (VS Code) and Extensions Installation Guide](#24-visual-studio-code-vs-code-and-extensions-installation-guide)
    * [2.5. MetaMask Installation and Account Setup Guide](#25-metamask-installation-and-account-setup-guide)
    * [2.6. Docker Desktop Installation Guide](#26-docker-desktop-installation-guide)
    * [2.7. Ngrok Installation Guide (Optional)](#27-ngrok-installation-guide-optional)
    * [2.8. RPC Provider (Alchemy) Setup Guide](#28-rpc-provider-alchemy-setup-guide)
    * [2.9. Ganache CLI Installation Guide (Optional)](#29-ganache-cli-installation-guide-optional)
3.  [Application Deployment, Installation, and Running Guide](#3-application-deployment-installation-and-running-guide)
    * [3.1. Clone Repository](#31-clone-repository)
    * [3.2. Configure & Run Project on Localhost (Hardhat Network)](#32-configure--run-project-on-localhost-hardhat-network)
    * [3.3. Deploy & Run Project on Sepolia Testnet with Docker Desktop](#33-deploy--run-project-on-sepolia-testnet-with-docker-desktop)
    * [3.4. Public Application to the Internet with Ngrok (Optional)](#34-public-application-to-the-internet-with-ngrok-optional)
4.  [Application Usage Guide](#4-application-usage-guide)
    * [4.1. Connect MetaMask Wallet](#41-connect-metamask-wallet)
    * [4.2. Deposit Funds](#42-deposit-funds)
    * [4.3. Withdraw Funds](#43-withdraw-funds)
    * [4.4. Transfer Funds](#44-transfer-funds)
    * [4.5. Deposit Savings](#45-deposit-savings)
    * [4.6. Transaction History](#46-transaction-history)
    * [4.7. Admin Panel](#47-admin-panel)
5.  [Overall Testing](#5-overall-testing)
6.  [Future Expansion & Improvements](#6-future-expansion--improvements)
7.  [Contributions](#7-contributions)
8.  [Contact](#8-contact)

---

## 1. About the application

### 1.1. Application Introduction

This application is a demo project for **Decentralized Banking (DApp)** built on the Ethereum blockchain. It simulates basic banking functionalities entirely through smart contracts.

<img width="1548" alt="image" src="https://github.com/user-attachments/assets/af2534f4-b3c1-40b7-bc5a-3d3ff30eb1b9" />

<img width="1557" alt="image" src="https://github.com/user-attachments/assets/d8f2f765-8d50-4766-a0d6-33d4a595b1e0" />


### 1.2. Goals and Objectives

This project is designed with the primary goal of providing a detailed, step-by-step guide to help beginners learning Solidity and Web3 development to easily:

* Understand the smart contract development process from scratch.
* Practice deploying contracts on different blockchain networks (local and testnet).
* Build a user interface (frontend) to interact with smart contracts.
* Grasp fundamental DeFi concepts such as ERC-20 tokens, gas fees, transaction limits, and contract management.

### 1.3. Application Features

This Demo application uses **VND Token (VNDT)**, a custom ERC-20 token, to represent Vietnamese Dong on the blockchain. Key features include:

* **Account Management:**
    * **Open Account:** Automatically created when a user makes their first deposit into the system.
    * **Check Balance:** Displays your VNDT balance within the system and your MetaMask wallet's ETH balance.
* **Transactions:**
    * **Approve:** Grants permission to the banking contract to move VNDT from your MetaMask wallet. This is a mandatory step before depositing funds.
    * **Deposit:** Transfers VNDT from your MetaMask wallet to your banking account within the system.
    * **Withdraw:** Withdraws VNDT from your banking account within the system back to your MetaMask wallet.
    * **Transfer:** Transfers VNDT between user accounts within the system (applies transaction fees and daily transfer limits).
    * **Savings Deposit:** Deposits VNDT into a fixed-term savings account (funds are locked for a specified period).
* **Transaction History:** View detailed history of all performed transactions (deposits, withdrawals, transfers out, received transfers, savings deposits), sorted by descending time with pagination.
* **Admin Panel:** (Only for contract owner)
    * **Update Daily Transfer Limit:** Sets the maximum daily transfer limit for each account.
    * **Update Transfer Fee Rate:** Changes the fee rate collected for transfer transactions.
    * **Pause Contract (`pause()`):** Temporarily halts the contract's transaction functionalities.
    * **Unpause Contract (`unpause()`):** Reactivates the contract after it has been paused.

### 1.4. Conclusion: Benefits for Beginners

This Demo project is an ideal learning tool because:

* **Practical:** Simulates a real-world financial application on the blockchain.
* **Comprehensive:** Covers both smart contract development (backend) and user interface (frontend).
* **Step-by-step:** Provides detailed instructions from setup to deployment and testing.
* **Error Handling:** Experience and learn how to debug common errors during DApp development.
* **Open Source:** You are free to explore, modify, and extend the project.

---

## 2. Environment and Tool Setup Guide

To get started with this Demo project, you need to prepare your development environment.

### 2.1. Tools & Tech Stack Overview Table

| Stack/Tool                         | Recommended Version | Description & Purpose                                                                                                                              | Setup/Notes                                                                                                                                                                                                                                                        |
| :--------------------------------- | :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Node.js** | LTS (v18.x or higher) | JavaScript runtime, essential for Hardhat, npm package management, and frontend (React) development.                                         | Recommended LTS version for stability and compatibility. Download from [nodejs.org](https://nodejs.org/).                                                                                                                                                            |
| **npm** | Latest              | Node.js package manager, used to install libraries and dependencies for both smart contracts and frontend.                                         | npm comes bundled with Node.js.                                                                                                                                                                                                                                    |
| **Git** | Latest              | Version control system, used to clone repositories and manage source code.                                                                     | Download from [git-scm.com](https://git-scm.com/downloads).                                                                                                                                                                                                        |
| **Hardhat** | Latest              | Ethereum development environment. Provides tools for writing, compiling, testing, deploying, and debugging smart contracts.                      | Will be installed locally within the `debank-contracts` project after cloning.                                                                                                                                                                                     |
| **OpenZeppelin Contracts** | `^5.0.0`            | Audited and secure smart contract library, providing standards (ERC-20, Ownable, Pausable) to save development time and reduce security risks. | Will be installed locally within the `debank-contracts` project after cloning.                                                                                                                                                                                     |
| **Visual Studio Code (VS Code)** | Latest              | Recommended Integrated Development Environment (IDE).                                                                                    | Install the following extensions: <br/>- **Solidity** (by Juan Blanco): Provides syntax highlighting, linting, autocompletion for Solidity.<br/>- **Hardhat for Visual Studio Code**: Offers integrated features with Hardhat.                                      |
| **MetaMask** | Latest              | Cryptocurrency wallet and gateway to the blockchain. Essential for connecting with the DApp frontend and managing test accounts.             | Install as a browser extension (Chrome, Firefox, Brave, Edge). Create at least 2-3 test accounts in MetaMask to simulate different users during testing.                                                                                                            |
| **ETH (Sepolia Testnet)** | \-                  | Testnet cryptocurrency to pay for gas fees on the Sepolia test network. **This is TEST MONEY, IT HAS NO REAL VALUE.** | Obtain for free from Sepolia faucets (e.g., `sepoliafaucet.com`, `cloud.google.com/blockchain/web3/faucet`). Each MetaMask test account will need a small amount of testnet ETH.                                                                                  |
| **Alchemy** | \-                  | Blockchain node provider (RPC Provider). Provides access to the Sepolia Testnet for deploying and interacting with smart contracts.          | Sign up for a free account and create a new project to get your RPC URL and API Key for the Sepolia network. This is sensitive information and should not be included directly in the source code.                                                                  |
| **React.js** | `^18.2.0`           | JavaScript library for building the user interface (frontend) of the DApp.                                                                   | Will be installed locally within the `debank-frontend` project after cloning.                                                                                                                                                                                      |
| **Web3.js** | Latest              | JavaScript library for interacting with the Ethereum blockchain, smart contracts, and MetaMask from the frontend.                            | Will be installed locally within the `debank-frontend` project after cloning.                                                                                                                                                                                      |
| **Tailwind CSS** | `^3.4.3`            | Utility-first CSS framework, used for rapid and responsive UI development.                                                                   | Will be installed locally within the `debank-frontend` project after cloning.                                                                                                                                                                                      |
| **Docker Desktop** | Latest              | Containerization platform, used to deploy the frontend consistently on localhost and easily share the development/testing environment.       | Download and install from [docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/). Ensure Docker Engine is running.                                                                                                                 |
| **Ngrok** | Latest              | Secure tunneling tool from localhost to the internet, allowing you to public your local application for others to access.                    | Download from [ngrok.com/download](https://ngrok.com/download). Requires a free account signup and authtoken configuration.                                                                                                                                         |
| **Ganache CLI** (Optional)         | Latest              | Local personal blockchain network. Used for rapid smart contract development and testing without real gas fees.                              | Install globally: `npm install --global ganache`. Hardhat Network also provides similar functionality.                                                                                                                                                           |

### 2.2. Node.js and npm Installation Guide

1.  **Check Node.js and npm:**
    Open Terminal/Command Prompt and type:
    ```bash
    node -v
    npm -v
    ```
    If already installed (Node.js LTS v18.x or higher), you can skip the installation step.

2.  **Install Node.js (if not already installed):**
    * **macOS (Homebrew recommended):**
        * Install Homebrew (if not already installed): Paste the following command into Terminal and press Enter. Follow the on-screen instructions, entering your password when prompted.
            ```bash
            /bin/bash -c "$(curl -fsSL [https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh](https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh))"
            ```
        * After Homebrew is installed, run the commands displayed by Homebrew to add it to your PATH (usually two lines like `eval "$(/opt/homebrew/bin/brew shellenv)"` and `echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile` or `~/.bash_profile`). Close and reopen your Terminal.
        * Install Node.js:
            ```bash
            brew install node
            ```
    * **Windows:**
        * Visit [nodejs.org/en/](https://nodejs.org/en/).
        * Download and run the installer for the **LTS (Recommended for most users)** version. The installer will include npm.

3.  **Confirm Installation:**
    Open a new Terminal and re-check:
    ```bash
    node -v
    npm -v
    ```
    Ensure your Node.js version is LTS (e.g., `v18.x.x` or `v20.x.x`).

### 2.3. Git Installation Guide

1.  **Check Git:** Open Terminal and type: `git --version`.
2.  **Install Git (if not already installed):** Download from [git-scm.com/downloads](https://git-scm.com/downloads).

### 2.4. Visual Studio Code (VS Code) and Extensions Installation Guide

1.  **Install VS Code:**
    * Visit [code.visualstudio.com/](https://code.visualstudio.com/).
    * Download and install the version compatible with your operating system.
2.  **Install Extensions in VS Code:**
    * Open VS Code.
    * Go to the Extensions view (square icon in the left sidebar or `Ctrl+Shift+X`/`Cmd+Shift+X`).
    * Search for and install the following extensions:
        * **Solidity** (by Juan Blanco)
        * **Hardhat for Visual Studio Code**

### 2.5. MetaMask Installation and Account Setup Guide

1.  **Install MetaMask browser extension:**
    * Open your browser (Chrome, Firefox, Brave, Edge).
    * Visit [metamask.io/download/](https://metamask.io/download/).
    * Add the extension to your browser.
2.  **Set up a new MetaMask wallet:**
    * Follow the MetaMask instructions to create a new wallet.
    * **CRUCIAL:** Write down your **Secret Recovery Phrase** (12 words) and store it securely **offline**. Never share it.
    * Create a password.
3.  **Create additional test accounts (recommended):**
    * In MetaMask, click the circular avatar icon in the top right corner.
    * Select **"Create new account"**.
    * Give it an easy-to-remember name (e.g., "Test User 2"). Repeat to create 2-3 test accounts.

### 2.6. Docker Desktop Installation Guide

1.  **Download and Install:** Download Docker Desktop from [docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/).
2.  **Verify:** Open Docker Desktop and ensure it is running. In Terminal, check: `docker --version`.

### 2.7. Ngrok Installation Guide (Optional)

1.  **Download and Install Ngrok:**
    * Visit [ngrok.com/download](https://ngrok.com/download).
    * Download the version compatible with your operating system and extract it.
2.  **Sign up for an Ngrok account and get your Authtoken:**
    * Visit [dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup) and sign up for a free account.
    * Log in to your Dashboard and copy the `ngrok config add-authtoken your_authtoken_here` command.
3.  **Connect Ngrok to your account:**
    * Open Terminal and paste the copied command. Press Enter.

### 2.8. RPC Provider (Alchemy) Setup Guide

1.  **Sign up for an Alchemy account:** Visit [alchemy.com](https://www.alchemy.com/) and sign up for a free account.
2.  **Create a new App:** In the Dashboard, select "Create App" -> Chain: `Ethereum` -> Network: `Sepolia`.
3.  **Get HTTPS URL:** Copy the HTTPS URL from the "API Key" section of the newly created App. **Save this URL in a temporary note file.**

### 2.9. Ganache CLI Installation Guide (Optional)

1.  **Install:** Open Terminal and run:
    ```bash
    npm install --global ganache
    ```
2.  **Verify Installation:**
    ```bash
    ganache --version
    ```

---

## 3. Application Deployment, Installation, and Running Guide

This section will guide you through setting up the Demo project after cloning it from GitHub, deploying smart contracts, and running the frontend application.

### 3.1. Clone Repository

1.  **Open Terminal** and navigate to the directory where you want to store the project (e.g., `~/Projects/`).
2.  **Clone the project repository:**
    ```bash
    git clone [https://github.com/your-username/DeBank-DApp-For-Beginners.git](https://github.com/your-username/DeBank-DApp-For-Beginners.git)
    ```
    * Replace `your-username` with your GitHub username and `DeBank-DApp-For-Beginners` with your repository name.
3.  **Navigate into the project directory:**
    ```bash
    cd DeBank-DApp-For-Beginners
    ```

### 3.2. Configure & Run Project on Localhost (Hardhat Network)

The local environment is ideal for rapid development and testing.

1.  **Install Smart Contract Dependencies:**
    * In Terminal, navigate into the smart contract directory:
        ```bash
        cd debank-contracts
        npm install
        ```
    * **Note:** The `contracts` folder already contains `VNDT.sol` and `DeBank.sol`. The `scripts` folder contains `deploy.js`. The `test` folder contains the test files.

2.  **Install Frontend Dependencies:**
    * In Terminal, navigate into the frontend directory:
        ```bash
        cd ../debank-frontend
        npm install
        ```
    * **Note:** The `src/contracts` folder already contains `VNDT.json` and `DeBank.json` (ABI files).

3.  **Start Hardhat Network (Localhost):**
    * **Open a NEW Terminal.**
    * Navigate to `DeBank-DApp-For-Beginners/debank-contracts`.
    * Run:
        ```bash
        npx hardhat node
        ```
    * **KEEP THIS TERMINAL OPEN throughout your local development session. NEVER CLOSE IT UNLESS YOU WANT TO RESET THE ENTIRE BLOCKCHAIN STATE.** It will display a list of 20 test accounts.

4.  **Deploy Smart Contracts to Localhost:**
    * **Open another NEW Terminal.**
    * Navigate to `DeBank-DApp-For-Beginners/debank-contracts`.
    * **Configure `debank-contracts/hardhat.config.js`:**
        * Open the `debank-contracts/hardhat.config.js` file.
        * Ensure the `localhost` and `sepolia` (for later use) configurations are correct.
        ```javascript
        // ... (top part of the file)
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
        // ... (bottom part of the file)
        ```
        * **Save the `hardhat.config.js` file.**
    * **Configure `debank-contracts/.env`:**
        * Open the `debank-contracts/.env` file (create it if it doesn't exist).
        * Paste the following (Alchemy URL and Private Key can be left blank or use dummy values for localhost, as they are not strictly needed for local deployment but good practice for consistency):
            ```
            ALCHEMY_SEPOLIA_RPC_URL=[http://127.0.0.1:8545](http://127.0.0.1:8545)
            METAMASK_PRIVATE_KEY=0xac0974...f2ff80 # Private Key of Hardhat's Account #0 (from npx hardhat node output)
            ```
        * **Save the `.env` file.**
    * **Compile Smart Contracts:**
        ```bash
        npx hardhat compile
        ```
    * **Deploy Smart Contracts to Localhost:**
        ```bash
        npx hardhat run scripts/deploy.js --network localhost
        ```
        * **COPY THE EXACT `VNDT deployed to:` and `DeBank deployed to:` addresses from this Terminal.** These are your contract addresses on localhost.

5.  **Update Frontend `.env` file:**
    * Open the `DeBank-DApp-For-Beginners/debank-frontend/.env` file.
    * Paste the localhost contract addresses you just copied. `VITE_BANK_OWNER_ADDRESS` should be the address of `Account #0` from your `npx hardhat node` output.
        ```
        VITE_VNDT_CONTRACT_ADDRESS=YOUR_VNDT_CONTRACT_ADDRESS_ON_LOCALHOST
        VITE_DEBANK_CONTRACT_ADDRESS=YOUR_DEBANK_CONTRACT_ADDRESS_ON_LOCALHOST
        VITE_BANK_OWNER_ADDRESS=YOUR_ACCOUNT_0_ADDRESS_FROM_HARDHAT_NODE
        ```
    * **Save the `.env` file.**

6.  **Configure MetaMask for Localhost:**
    * Open MetaMask.
    * Add a custom network: **Network name:** `Localhost Hardhat Network`, **New RPC URL:** `http://127.0.0.1:8545`, **Chain ID:** `31337`, **Currency symbol:** `ETH`. Click "Save".
    * Import accounts: In MetaMask, click avatar -> "Import account" -> "Private Key". Paste the Private Key of `Account #0` (from the Terminal running `npx hardhat node`). Repeat for `Account #1` if you want to test transfers.

7.  **Mint VNDT for your test account (on Localhost):**
    * **Open another NEW Terminal.**
    * Navigate to `DeBank-DApp-For-Beginners/debank-contracts`.
    * Run: `npx hardhat console --network localhost`
    * In the console, use commands similar to these to mint VNDT to your MetaMask wallet (replace with your wallet address and VNDT contract address from your frontend's `.env`):
        ```javascript
        const VNDT = await ethers.getContractFactory("VNDT");
        const vndToken = await VNDT.attach("YOUR_VNDT_CONTRACT_ADDRESS_ON_LOCALHOST"); 
        const [owner] = await ethers.getSigners();
        const mintAmount = ethers.parseUnits("5000000", 18); // Example: 5 million VNDT
        const yourMetamaskAddress = "YOUR_METAMASK_WALLET_ADDRESS_ON_LOCALHOST";
        await vndToken.connect(owner).mint(yourMetamaskAddress, mintAmount);
        console.log(`Minted ${ethers.formatUnits(mintAmount, 18)} VNDT to ${yourMetamaskAddress}`);
        ```
    * Type `.exit` to exit the console.

8.  **Run the Frontend Application:**
    * **Open another NEW Terminal.**
    * Navigate to `DeBank-DApp-For-Beginners/debank-frontend`.
    * Run: `npm run dev`
    * Open your browser: `http://localhost:5173`.
    * **Connect your MetaMask wallet** (select `Localhost Hardhat Network` and the account you minted VNDT to).
    * **PERFORM YOUR FIRST DEPOSIT TRANSACTION** to register your account within the system on this new contract instance.

### 3.3. Deploy & Run Project on Sepolia Testnet with Docker Desktop

This is a public environment, allowing others to access your application.

1.  **Deploy Smart Contracts to Sepolia Testnet:**
    * **Ensure `npx hardhat node` is NOT running.**
    * **Open a NEW Terminal.**
    * Navigate to `DeBank-DApp-For-Beginners/debank-contracts`.
    * **Configure `debank-contracts/.env`:**
        * Ensure `ALCHEMY_SEPOLIA_RPC_URL` and `METAMASK_PRIVATE_KEY` in `debank-contracts/.env` are your actual credentials for Sepolia.
    * Run:
        ```bash
        npx hardhat run scripts/deploy.js --network sepolia
        ```
    * **COPY THE EXACT `VNDT deployed to:` and `DeBank deployed to:` addresses from this Terminal.** These are your contract addresses on Sepolia.

2.  **Update Frontend `.env` file (for Sepolia):**
    * Open the `DeBank-DApp-For-Beginners/debank-frontend/.env` file.
    * **Overwrite** the contract addresses with the Sepolia addresses you just copied.
    * **Save the `.env` file.**

3.  **Obtain Sepolia ETH and Mint VNDT on Sepolia:**
    * **Get Sepolia ETH:** Open MetaMask, select `Sepolia Testnet`. Copy your wallet address. Visit [cloud.google.com/blockchain/web3/faucet](https://cloud.google.com/blockchain/web3/faucet) to request ETH.
    * **Mint VNDT on Sepolia:**
        * **Open a NEW Terminal.**
        * Navigate to `DeBank-DApp-For-Beginners/debank-contracts`.
        * Run: `npx hardhat console --network sepolia`
        * In the console, use commands similar to these to mint VNDT to your MetaMask wallet on Sepolia (replace with your wallet address and VNDT contract address from your frontend's `.env`):
            ```javascript
            const VNDT = await ethers.getContractFactory("VNDT");
            const vndToken = await VNDT.attach("YOUR_VNDT_CONTRACT_ADDRESS_ON_SEPOLIA");
            const [owner] = await ethers.getSigners();
            const mintAmount = ethers.parseUnits("5000000", 18);
            const yourMetamaskAddress = "YOUR_METAMASK_WALLET_ADDRESS_ON_SEPOLIA";
            await vndToken.connect(owner).mint(yourMetamaskAddress, mintAmount);
            console.log(`Minted ${ethers.formatUnits(mintAmount, 18)} VNDT to ${yourMetamaskAddress}`);
            ```
        * Type `.exit`.
    * **Import VNDT token into MetaMask** for that account on the Sepolia Testnet.

4.  **Create Dockerfile and nginx.conf for Frontend:**
    * In the `DeBank-DApp-For-Beginners/debank-frontend` directory, create a file named `Dockerfile` and paste the following content:
        ```dockerfile
        # Use Node.js LTS version as the base image for building the React application
        FROM node:lts-alpine as builder

        # Set the working directory inside the container
        WORKDIR /app

        # Copy package.json and package-lock.json to install dependencies
        COPY package*.json ./

        # Install project dependencies
        RUN npm install --force

        # Copy the entire React application source code into the working directory in the container
        COPY . .

        # Build the React application for the production environment
        RUN npm run build

        # Use Nginx Alpine image as the base image for the production stage
        FROM nginx:alpine

        # Remove the default Nginx configuration
        RUN rm /etc/nginx/conf.d/default.conf

        # Copy our custom Nginx configuration file to the correct location in the container
        COPY nginx.conf /etc/nginx/conf.d/default.conf

        # Copy the built React application files from the 'builder' stage to Nginx's serving directory
        COPY --from=builder /app/dist /usr/share/nginx/html

        # Expose port 80 in the container for Nginx to listen for HTTP connections
        EXPOSE 80

        # Default command when the container starts: Start Nginx in foreground mode
        CMD ["nginx", "-g", "daemon off;"]
        ```
    * In the `DeBank-DApp-For-Beginners/debank-frontend` directory, create a file named `nginx.conf` and paste the following content:
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

5.  **Build and Run Docker Container:**
    * **Open a NEW Terminal.**
    * Navigate to `DeBank-DApp-For-Beginners/debank-frontend`.
    * Run: `npm run build` (to create the `dist` folder containing the production build).
    * **Stop the development server** if it's running (`Ctrl + C`).
    * **Build Docker Image:**
        ```bash
        docker build -t app-demo-frontend-app .
        ```
    * **Run Docker Container:**
        ```bash
        docker run -p 8080:80 app-demo-frontend-app
        ```
    * Open your browser: `http://localhost:8080`.
    * **Connect your MetaMask wallet** (select `Sepolia Testnet` and the account you obtained ETH/VNDT for).
    * **PERFORM YOUR FIRST DEPOSIT TRANSACTION** to register your account within the system on Sepolia.

### 3.4. Public Application to the Internet with Ngrok (Optional)

To share your Docker-running application with others over the internet.

1.  **Download and Install Ngrok:** From [ngrok.com/download](https://ngrok.com/download).
2.  **Sign up for an Ngrok account** and get your Authtoken from your Dashboard.
3.  **Connect Ngrok to your account:** Open Terminal, run the command `ngrok config add-authtoken your_authtoken_here`.
4.  **Run Ngrok tunnel:**
    * **Ensure the frontend Docker Container is running** on port 8080 (`docker run -p 8080:80 app-demo-frontend-app`).
    * **Open another NEW Terminal.**
    * Run: `ngrok http 8080`
    * Ngrok will provide a public URL (e.g., `https://[random_string].ngrok-free.app`). Share this URL with others to let them access your application.

---

## 4. Application Usage Guide

Once the application is successfully running on localhost or via Ngrok, you can interact with it:

### 4.1. Connect MetaMask Wallet

* Click the **"Connect Wallet"** button in the top right corner.
* Select the MetaMask account you wish to use and confirm the connection.
* The application will display your wallet address, connection status, network, and ETH balance.

### 4.2. Deposit Funds

1.  Switch to the **"Deposit"** tab.
2.  Enter the amount of VNDT you wish to deposit into the system.
3.  **Step 1: Approve:** Click the **"Approve VNDT"** button and confirm the transaction in MetaMask. (You need to have sufficient VNDT in your MetaMask wallet).
4.  **Step 2: Deposit:** After successful approval, click the **"Send Funds"** button and confirm the transaction in MetaMask.
    * Your VNDT balance in your MetaMask wallet will decrease, and your system balance will increase.

### 4.3. Withdraw Funds

1.  Switch to the **"Withdraw"** tab.
2.  Enter the amount of VNDT you wish to withdraw from the system back to your MetaMask wallet.
3.  Click the **"Withdraw"** button and confirm the transaction in MetaMask.
    * Your VNDT balance in the system will decrease, and your VNDT balance in your MetaMask wallet will increase.

### 4.4. Transfer Funds

1.  Switch to the **"Transfer"** tab.
2.  Enter the recipient's wallet address (another MetaMask account that has or will have an account in the system).
3.  Enter the amount of VNDT you wish to transfer.
4.  Click the **"Transfer"** button and confirm the transaction in MetaMask.
    * The amount will be deducted from your system account (plus a 0.1% transaction fee) and credited to the recipient's system account.

### 4.5. Deposit Savings

1.  Switch to the **"Savings"** tab.
2.  Enter the amount of VNDT you wish to deposit for savings.
3.  Select the term (in months).
4.  Click the **"Deposit Savings"** button and confirm the transaction in MetaMask.
    * The amount will be deducted from your regular system balance and recorded as a locked savings deposit.

### 4.6. Transaction History

* The "Transaction History" table will automatically display transactions for the current MetaMask account.
* You can use the **"Previous"**, **"Next"**, and page number buttons to navigate through the history.

### 4.7. Admin Panel

* This section is only visible if the connected MetaMask account is the **Contract Owner** (the account that deployed the contracts, typically `Account #0` from Hardhat Network or the deployer account on Sepolia).
* You can:
    * Update the daily transfer limit.
    * Update the transfer fee rate.
    * Pause or unpause the contract.

---

## 5. Overall Testing

Once deployed on Sepolia Testnet, you can invite friends or colleagues to test:

1.  Share your Ngrok URL (if used).
2.  Guide them to install MetaMask and switch to the Sepolia Testnet.
3.  Guide them to obtain Sepolia ETH from a faucet.
4.  You will need to mint VNDT for their MetaMask wallets on Sepolia (via Hardhat Console with `--network sepolia`).
5.  They can then connect their wallets and start testing the functionalities.

## 6. Future Expansion & Improvements

This Demo project is an excellent foundation for continued learning and development. Some ideas for expansion include:

* **Implement savings withdrawal (`withdrawSavings`)** and more complex interest calculation.
* Add other types of savings accounts (e.g., flexible, tiered interest).
* Develop other DeFi features like lending or borrowing.
* Improve UI/UX, add loading indicators, and transaction status updates.
* Integrate more advanced security standards.
* Build an off-chain user management system (if needed for a real-world application).
* Add automated tests for new functionalities.

## 7. Contributions

Contributions are welcome! If you find bugs, have suggestions for improvements, or want to add new features, please open an "Issue" or submit a "Pull Request" on the GitHub repository.

## 8. Contact

* **Author:** Sơn Nguyễn
* **GitHub:** https://github.com/nason1984/Solidity-Web3-DApp-For-Beginners
* **Email:** 

