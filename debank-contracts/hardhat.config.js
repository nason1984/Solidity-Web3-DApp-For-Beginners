require("@nomicfoundation/hardhat-toolbox"); // Import Hardhat plugins

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // THAY ĐỔI: Cấu hình để hỗ trợ nhiều phiên bản Solidity compiler
  solidity: {
    compilers: [
      {
        version: "0.8.20", // Phiên bản chúng ta đang sử dụng cho DeBank và VNDT
      },
      {
        version: "0.8.21", // Thêm các phiên bản khác nếu bạn có hợp đồng hoặc thư viện yêu cầu
      },
      {
        version: "0.8.22",
      },
      // Bạn có thể thêm các phiên bản khác nếu cần, ví dụ "0.8.28" nếu bạn muốn giữ Lock.sol
    ],
  }, 

  // Cấu hình các mạng blockchain mà Hardhat có thể tương tác
  networks: {
    hardhat: {
      // Cấu hình để Hardhat Network hoạt động đúng
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/UWECSSed8rItsxEH2eZPjxTeeVx8fMkt", // Đảm bảo URL này là của bạn
      accounts: ["10d246fb59567707f66b466022499143fcc6ff698cf659db4dcd93f0389cdb02"], // Đảm bảo Private Key là của bạn
      chainId: 11155111,
    },
  },

  // Cấu hình đường dẫn artifacts và cache (mặc định của Hardhat)
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
  },
};
