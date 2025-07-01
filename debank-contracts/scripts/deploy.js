// Yêu cầu thư viện 'ethers' từ 'hardhat'. Ethers.js cung cấp các tiện ích
// để tương tác với blockchain, bao gồm triển khai hợp đồng.
const { ethers } = require("hardhat");

async function main() {
    // Lấy ContractFactory cho contract VNDT.
    // ContractFactory là một abstraction được sử dụng để deploy các smart contract mới.
    const VNDT = await ethers.getContractFactory("VNDT");
    console.log("Deploying VNDT token...");

    // Triển khai contract VNDT.
    // Hàm deploy() gửi một giao dịch tạo contract lên mạng.
    const vndToken = await VNDT.deploy();
    // Chờ contract được deploy hoàn tất và có địa chỉ trên blockchain.
    await vndToken.waitForDeployment();

    // Lấy địa chỉ của contract VNDT đã được triển khai.
    const vndTokenAddress = await vndToken.getAddress();
    console.log(`VNDT deployed to: ${vndTokenAddress}`);

    // Lấy ContractFactory cho contract DeBank.
    const DeBank = await ethers.getContractFactory("DeBank");
    console.log("Deploying DeBank contract...");

    // Triển khai contract DeBank.
    // Constructor của DeBank yêu cầu địa chỉ của VNDT token contract.
    // Chúng ta truyền `vndTokenAddress` mà chúng ta vừa lấy được từ bước trên.
    const deBank = await DeBank.deploy(vndTokenAddress);
    // Chờ contract được deploy hoàn tất và có địa chỉ.
    await deBank.waitForDeployment();

    // Lấy địa chỉ của contract DeBank đã được triển khai.
    const deBankAddress = await deBank.getAddress();
    console.log(`DeBank deployed to: ${deBankAddress}`);

    // Để tiện lợi cho việc sử dụng sau này (ví dụ, trong frontend),
    // chúng ta có thể ghi các địa chỉ này vào một file JSON.
    // (Phần này sẽ được thêm khi chúng ta cấu hình frontend)
}

// Hàm main() được gọi và xử lý các lỗi có thể xảy ra.
main()
    .then(() => process.exit(0)) // Nếu thành công, thoát quy trình với mã 0.
    .catch((error) => {
        // Nếu có lỗi, in lỗi ra console và thoát quy trình với mã 1.
        console.error(error);
        process.exit(1);
    });