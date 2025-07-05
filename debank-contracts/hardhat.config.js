require("@nomicfoundation/hardhat-toolbox"); // Imports Hardhat plugins for common development tasks.

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // Solidity compiler configuration.
  // This allows Hardhat to use specific Solidity versions for compilation.
  solidity: {
    compilers: [
      {
        version: "0.8.20", // The primary Solidity version used for DeBank and VNDT contracts.
      },
      {
        version: "0.8.21", // Additional compiler versions can be added here if other contracts or libraries require them.
      },
      {
        version: "0.8.22", // Example: another compatible version.
      },
      // You can add more versions as needed, e.g., "0.8.28" if you were to keep a `Lock.sol` file with that pragma.
    ],
  }, 

  // Network configurations.
  // This section defines the blockchain networks Hardhat can interact with.
  networks: {
    // Default Hardhat Network (in-memory blockchain for fast development and testing).
    // This network is automatically started when running tests or scripts without specifying `--network`.
    hardhat: {
      // No specific configuration needed here for basic usage.
    },
    // Localhost network configuration (for connecting to `npx hardhat node` running persistently).
    localhost: {
      url: "http://127.0.0.1:8545", // The default RPC URL for `npx hardhat node`.
    },
    // Sepolia Testnet configuration.
    // This allows deploying and interacting with contracts on the public Sepolia test network.
    sepolia: {
      // Alchemy/Infura RPC URL for Sepolia Testnet.
      // IMPORTANT: REPLACE "YOUR_ALCHEMY_SEPOLIA_RPC_URL" with your actual Alchemy Sepolia HTTPS URL.
      // Example: "https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
      url: process.env.ALCHEMY_SEPOLIA_RPC_URL, 
      // Array of Private Keys used for deploying contracts.
      // IMPORTANT: REPLACE "YOUR_METAMASK_PRIVATE_KEY" with the actual Private Key of your MetaMask test account.
      // This account must have SepoliaETH to pay for gas fees. NEVER use your mainnet private key here!
      accounts: process.env.METAMASK_PRIVATE_KEY ? [process.env.METAMASK_PRIVATE_KEY] : [],
      chainId: 11155111, // The Chain ID for Sepolia Testnet.
    },
  },

  // Path configurations for Hardhat artifacts and cache.
  paths: {
    artifacts: "./artifacts", // Directory for contract compilation artifacts (ABI, bytecode).
    cache: "./cache",       // Directory for Hardhat's temporary cache files.
  },
};
