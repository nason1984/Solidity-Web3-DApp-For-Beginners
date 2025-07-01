const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DeBank", function () {
    // Khai báo các biến sẽ được sử dụng trong suốt các bài kiểm thử.
    let VNDT; // ContractFactory cho VNDT token contract
    let DeBank; // ContractFactory cho DeBank contract
    let vndToken; // Instance của VNDT token đã được triển khai
    let deBank; // Instance của DeBank contract đã được triển khai
    let owner; // Tài khoản triển khai các contract, cũng là bankOwner mặc định
    let user1; // Tài khoản người dùng test 1
    let user2; // Tài khoản người dùng test 2
    let feeReceiverAccount; // Tài khoản nhận phí (có thể khác owner)
    let addrs; // Các tài khoản test còn lại

    // Định nghĩa các hằng số dùng trong test
    const initialVNDTSupply = ethers.parseUnits("100000000", 18); // Tổng cung ban đầu của VNDT
    const userDepositAmount = ethers.parseUnits("100000", 18); // Lượng VNDT mà người dùng sẽ gửi vào DeBank
    const transferAmount = ethers.parseUnits("10000", 18); // Lượng VNDT chuyển khoản

    // Hook 'beforeEach' sẽ chạy trước MỖI bài test.
    // Điều này đảm bảo mỗi test case bắt đầu với một trạng thái blockchain độc lập và sạch sẽ.
    beforeEach(async function () {
        // 1. Lấy ContractFactory và các tài khoản (signers)
        VNDT = await ethers.getContractFactory("VNDT");
        DeBank = await ethers.getContractFactory("DeBank");
        [owner, user1, user2, feeReceiverAccount, ...addrs] = await ethers.getSigners();

        // 2. Triển khai VNDT token contract
        vndToken = await VNDT.deploy();
        await vndToken.waitForDeployment(); // Chờ contract được deploy hoàn tất

        // 3. Triển khai DeBank contract
        // Constructor của DeBank yêu cầu địa chỉ của VNDT token.
        deBank = await DeBank.deploy(await vndToken.getAddress());
        await deBank.waitForDeployment(); // Chờ contract được deploy hoàn tất

        // Cấp phát một lượng VNDT cho user1 và user2 để họ có thể gửi vào DeBank.
        // Chỉ owner của VNDT (cũng là 'owner' trong test này) mới có thể mint.
        // SỬA LỖI: Thay đổi `* 2` thành `* 2n` để đảm bảo phép toán BigInt
        await vndToken.mint(user1.address, userDepositAmount * 2n); // user1 có đủ để gửi và chuyển
        await vndToken.mint(user2.address, userDepositAmount); // user2 có đủ để gửi

        // SỬA LỖI: Cấu hình feeReceiver cho DeBank để không phải là owner mặc định
        // Điều này giúp tách biệt số dư của owner với số dư phí, dễ test hơn.
        await deBank.connect(owner).setFeeReceiver(feeReceiverAccount.address);
    });

    // --- Bộ test Case 1: Triển khai DeBank Contract ---
    describe("Deployment", function () {
        it("Should set the right bankOwner", async function () {
            // Kiểm tra xem 'bankOwner' của DeBank contract có đúng là địa chỉ của người triển khai ('owner') không.
            expect(await deBank.bankOwner()).to.equal(owner.address);
        });

        it("Should set the correct VNDT token address", async function () {
            // Kiểm tra xem DeBank contract có lưu đúng địa chỉ của VNDT token không.
            expect(await deBank.vndToken()).to.equal(await vndToken.getAddress());
        });

        it("Should set default dailyTransferLimit and transferFeeRate", async function () {
            // Kiểm tra các giá trị mặc định được thiết lập trong constructor.
            // Số lượng VNDT token decimals là 18.
            const expectedDailyLimit = ethers.parseUnits("1000000000", 18); // 1 tỷ VNDT
            expect(await deBank.dailyTransferLimit()).to.equal(expectedDailyLimit);
            expect(await deBank.transferFeeRate()).to.equal(10); // 0.1%
            // SỬA LỖI: Kiểm tra feeReceiver sau khi nó đã được set trong beforeEach
            expect(await deBank.feeReceiver()).to.equal(feeReceiverAccount.address);
        });
    });

    // --- Bộ test Case 2: Chức năng Deposit (Gửi tiền) ---
    describe("Deposit", function () {
        it("Should allow a user to deposit VNDT into DeBank", async function () {
            // Kiểm tra số dư VNDT của user1 trước khi gửi (trong ví cá nhân của user1).
            const user1InitialVNDTBalance = await vndToken.balanceOf(user1.address);
            // Kiểm tra số dư của user1 trong DeBank trước khi gửi.
            const user1InitialDeBankBalance = await deBank.balances(user1.address);

            // Bước 1: user1 cấp quyền cho DeBank contract chi tiêu VNDT của mình.
            // Điều này là BẮT BUỘC trước khi gọi deposit().
            await vndToken.connect(user1).approve(await deBank.getAddress(), userDepositAmount);

            // Bước 2: user1 gọi hàm deposit() trên DeBank contract.
            await deBank.connect(user1).deposit(userDepositAmount);

            // Khẳng định số dư VNDT của user1 trong ví đã giảm.
            // SỬA LỖI: Thay thế .sub() bằng toán tử trừ thông thường -
            expect(await vndToken.balanceOf(user1.address)).to.equal(user1InitialVNDTBalance - userDepositAmount);
            // Khẳng định số dư của user1 trong DeBank đã tăng lên.
            // SỬA LỖI: Thay thế .add() bằng toán tử cộng thông thường +
            expect(await deBank.balances(user1.address)).to.equal(user1InitialDeBankBalance + userDepositAmount);
            // Khẳng định tổng số tiền gửi vào DeBank contract đã tăng.
            // SỬA LỖI: Thay thế .add() bằng toán tử cộng thông thường +
            expect(await deBank.totalDeposits()).to.equal(userDepositAmount);
            // Khẳng định user1 đã được đánh dấu là tài khoản tồn tại trong DeBank.
            expect(await deBank.isAccount(user1.address)).to.be.true;
        });

        it("Should revert if deposit amount is zero", async function () {
            await expect(deBank.connect(user1).deposit(0))
                .to.be.revertedWith("DeBank: Deposit amount must be greater than zero");
        });

        it("Should revert if user has not approved enough VNDT", async function () {
            // user1 KHÔNG approve hoặc approve số tiền nhỏ hơn
            // SỬA LỖI: Kiểm tra custom error ERC20InsufficientAllowance của OpenZeppelin.
            await expect(deBank.connect(user1).deposit(userDepositAmount))
                .to.be.revertedWithCustomError(VNDT, "ERC20InsufficientAllowance");
        });

        it("Should emit Deposited event on successful deposit", async function () {
            await vndToken.connect(user1).approve(await deBank.getAddress(), userDepositAmount);
            await expect(deBank.connect(user1).deposit(userDepositAmount))
                .to.emit(deBank, "Deposited")
                .withArgs(user1.address, userDepositAmount, userDepositAmount); // Số dư sau deposit = userDepositAmount
        });

        it("Should emit AccountOpened event for new account", async function () {
            await vndToken.connect(user1).approve(await deBank.getAddress(), userDepositAmount);
            await expect(deBank.connect(user1).deposit(userDepositAmount))
                .to.emit(deBank, "AccountOpened")
                .withArgs(user1.address);
        });
    });

    // --- Bộ test Case 3: Chức năng Withdraw (Rút tiền) ---
    describe("Withdraw", function () {
        // Trước khi rút, cần gửi tiền vào DeBank trước.
        beforeEach(async function () {
            await vndToken.connect(user1).approve(await deBank.getAddress(), userDepositAmount);
            await deBank.connect(user1).deposit(userDepositAmount);
        });

        it("Should allow a user to withdraw VNDT from DeBank", async function () {
            const withdrawAmount = ethers.parseUnits("50000", 18); // Rút 50,000 VNDT
            const user1InitialVNDTBalance = await vndToken.balanceOf(user1.address); // Số dư VNDT trong ví user1 sau deposit
            
            // user1 rút tiền
            await deBank.connect(user1).withdraw(withdrawAmount);

            // Khẳng định số dư của user1 trong DeBank đã giảm.
            // SỬA LỖI: Thay thế .sub() bằng toán tử trừ thông thường -
            expect(await deBank.balances(user1.address)).to.equal(userDepositAmount - withdrawAmount);
            // Khẳng định số dư VNDT trong ví của user1 đã tăng trở lại.
            // SỬA LỖI: Thay thế .add() bằng toán tử cộng thông thường +
            expect(await vndToken.balanceOf(user1.address)).to.equal(user1InitialVNDTBalance + withdrawAmount);
            // Khẳng định tổng số tiền gửi trong DeBank đã giảm.
            // SỬA LỖI: Thay thế .sub() bằng toán tử trừ thông thường -
            expect(await deBank.totalDeposits()).to.equal(userDepositAmount - withdrawAmount);
        });

        it("Should revert if withdraw amount is zero", async function () {
            await expect(deBank.connect(user1).withdraw(0))
                .to.be.revertedWith("DeBank: Withdraw amount must be greater than zero");
        });

        it("Should revert if user tries to withdraw more than their DeBank balance", async function () {
            // SỬA LỖI: Thay thế .add() bằng toán tử cộng thông thường +
            const excessiveWithdrawAmount = userDepositAmount + ethers.parseUnits("1", 18);
            await expect(deBank.connect(user1).withdraw(excessiveWithdrawAmount))
                .to.be.revertedWith("DeBank: Insufficient balance");
        });

        it("Should revert if non-existent account tries to withdraw", async function () {
            await expect(deBank.connect(user2).withdraw(ethers.parseUnits("100", 18)))
                .to.be.revertedWith("DeBank: Account does not exist");
        });

        it("Should emit Withdrawn event on successful withdrawal", async function () {
            const withdrawAmount = ethers.parseUnits("50000", 18);
            await expect(deBank.connect(user1).withdraw(withdrawAmount))
                .to.emit(deBank, "Withdrawn")
                .withArgs(user1.address, withdrawAmount, userDepositAmount - withdrawAmount);
        });
    });

    // --- Bộ test Case 4: Chức năng Transfer (Chuyển tiền nội bộ) ---
    describe("Transfer", function () {
        // Trước khi chuyển, cả user1 và user2 đều cần có tiền trong DeBank.
        beforeEach(async function () {
            // user1 gửi tiền
            await vndToken.connect(user1).approve(await deBank.getAddress(), userDepositAmount);
            await deBank.connect(user1).deposit(userDepositAmount);
            // user2 gửi tiền (để test chuyển khoản 2 chiều nếu cần, hoặc test người nhận mới)
            await vndToken.connect(user2).approve(await deBank.getAddress(), ethers.parseUnits("50000", 18));
            await deBank.connect(user2).deposit(ethers.parseUnits("50000", 18));
        });

        it("Should allow a user to transfer VNDT to another existing DeBank account", async function () {
            const user1InitialDeBankBalance = await deBank.balances(user1.address);
            const user2InitialDeBankBalance = await deBank.balances(user2.address);
            const feeRate = await deBank.transferFeeRate(); // Lấy phí hiện tại (mặc định 10 basis points = 0.1%)
            // SỬA LỖI: Thay thế .mul() và .div() bằng toán tử nhân/chia thông thường * /
            const expectedFee = transferAmount * feeRate / 10000n; // Phí dự kiến
            // SỬA LỖI: Thay thế .sub() bằng toán tử trừ thông thường -
            const expectedAmountForReceiver = transferAmount - expectedFee; // Số tiền người nhận thực nhận

            // user1 chuyển tiền cho user2
            await deBank.connect(user1).transfer(user2.address, transferAmount);

            // Khẳng định số dư của người gửi đã giảm đúng số tiền chuyển (bao gồm cả phí).
            // SỬA LỖI: Thay thế .sub() bằng toán tử trừ thông thường -
            expect(await deBank.balances(user1.address)).to.equal(user1InitialDeBankBalance - transferAmount);
            // Khẳng định số dư của người nhận đã tăng đúng số tiền sau phí.
            // SỬA LỖI: Thay thế .add() bằng toán tử cộng thông thường +
            expect(await deBank.balances(user2.address)).to.equal(user2InitialDeBankBalance + expectedAmountForReceiver);
            // Kiểm tra tài khoản nhận phí đã nhận được phí.
            expect(await vndToken.balanceOf(feeReceiverAccount.address)).to.equal(expectedFee); // SỬA LỖI: Kiểm tra trực tiếp số dư của feeReceiverAccount
        });

        it("Should create a new DeBank account if recipient does not exist", async function () {
            const nonExistentUser = addrs[0]; // Lấy một tài khoản chưa từng tương tác với DeBank
            expect(await deBank.isAccount(nonExistentUser.address)).to.be.false; // Khẳng định chưa tồn tại

            // user1 chuyển tiền cho nonExistentUser
            await deBank.connect(user1).transfer(nonExistentUser.address, transferAmount);

            // Khẳng định tài khoản mới đã được tạo.
            expect(await deBank.isAccount(nonExistentUser.address)).to.be.true;
            // Khẳng định số dư của tài khoản mới đúng là số tiền nhận được sau phí.
            const feeRate = await deBank.transferFeeRate();
            // SỬA LỖI: Thay thế .mul() và .div() bằng toán tử nhân/chia thông thường * /
            const expectedFee = transferAmount * feeRate / 10000n;
            // SỬA LỖI: Thay thế .sub() bằng toán tử trừ thông thường -
            expect(await deBank.balances(nonExistentUser.address)).to.equal(transferAmount - expectedFee);
        });

        it("Should revert if transfer amount is zero", async function () {
            await expect(deBank.connect(user1).transfer(user2.address, 0))
                .to.be.revertedWith("DeBank: Transfer amount must be greater than zero");
        });

        it("Should revert if sender does not have enough balance in DeBank", async function () {
            // SỬA LỖI: Thay thế .add() bằng toán tử cộng thông thường +
            const excessiveAmount = userDepositAmount + ethers.parseUnits("1", 18);
            await expect(deBank.connect(user1).transfer(user2.address, excessiveAmount))
                .to.be.revertedWith("DeBank: Insufficient balance");
        });

        it("Should revert if sender transfers to self", async function () {
            await expect(deBank.connect(user1).transfer(user1.address, transferAmount))
                .to.be.revertedWith("DeBank: Cannot transfer to yourself");
        });

        it("Should revert if daily transfer limit is exceeded", async function () {
            const limit = await deBank.dailyTransferLimit();
            // SỬA LỖI: Thay thế .add() bằng toán tử cộng thông thường +
            const excessiveTransfer = limit + ethers.parseUnits("1", 18);
            
            // Thay đổi limit của user1 để test riêng cho trường hợp này
            // Đặt hạn mức tạm thời nhỏ hơn để dễ dàng vượt qua trong test này
            // SỬA LỖI: Thay thế .sub() bằng toán tử trừ thông thường -
            await deBank.connect(owner).setDailyTransferLimit(transferAmount - ethers.parseUnits("1", 18));
            
            await expect(deBank.connect(user1).transfer(user2.address, transferAmount))
                .to.be.revertedWith("DeBank: Daily transfer limit exceeded");
        });

        it("Should emit Transferred event on successful transfer", async function () {
            const feeRate = await deBank.transferFeeRate();
            // SỬA LỖI: Thay thế .mul() và .div() bằng toán tử nhân/chia thông thường * /
            const expectedFee = transferAmount * feeRate / 10000n;
            await expect(deBank.connect(user1).transfer(user2.address, transferAmount))
                .to.emit(deBank, "Transferred")
                .withArgs(user1.address, user2.address, transferAmount, expectedFee);
        });
    });

    // --- Bộ test Case 5: Lịch sử Giao dịch ---
    describe("Transaction History", function () {
        beforeEach(async function () {
            // user1 gửi tiền
            await vndToken.connect(user1).approve(await deBank.getAddress(), userDepositAmount);
            await deBank.connect(user1).deposit(userDepositAmount); // ID = 1
            // user1 chuyển tiền cho user2
            await deBank.connect(user1).transfer(user2.address, transferAmount); // ID = 2 (user1 TransferOut), ID = 3 (user2 TransferIn)
            // user1 rút tiền
            await deBank.connect(user1).withdraw(ethers.parseUnits("20000", 18)); // ID = 4
        });

        it("Should record transaction history for deposits", async function () {
            const history = await deBank.getAccountTransactionHistory(user1.address);
            // Kiểm tra giao dịch gửi tiền đầu tiên
            expect(history[0].id).to.equal(1);
            expect(history[0].txType).to.equal("Deposit");
            expect(history[0].amount).to.equal(userDepositAmount);
            expect(history[0].from).to.equal(user1.address);
            expect(history[0].to).to.equal(await deBank.getAddress());
        });

        it("Should record transaction history for transfers (TransferOut for sender)", async function () {
            const history = await deBank.getAccountTransactionHistory(user1.address);
            // Giao dịch thứ hai của user1 là TransferOut
            // SỬA LỖI: ID sẽ là 2
            expect(history[1].id).to.equal(2); 
            expect(history[1].txType).to.equal("TransferOut");
            expect(history[1].amount).to.equal(transferAmount);
            expect(history[1].from).to.equal(user1.address);
            expect(history[1].to).to.equal(user2.address);
        });

        it("Should record transaction history for transfers (TransferIn for receiver)", async function () {
            const history = await deBank.getAccountTransactionHistory(user2.address);
            // Giao dịch đầu tiên của user2 là TransferIn
            // SỬA LỖI: ID sẽ là 3
            expect(history[0].id).to.equal(3); 
            expect(history[0].txType).to.equal("TransferIn");
            const feeRate = await deBank.transferFeeRate();
            // SỬA LỖI: Thay thế .mul() và .div() bằng toán tử nhân/chia thông thường * /
            const expectedAmountForReceiver = transferAmount - (transferAmount * feeRate / 10000n);
            expect(history[0].amount).to.equal(expectedAmountForReceiver);
            expect(history[0].from).to.equal(user1.address);
            expect(history[0].to).to.equal(user2.address);
        });

        it("Should record transaction history for withdrawals", async function () {
            const history = await deBank.getAccountTransactionHistory(user1.address);
            // Giao dịch thứ ba của user1 là Withdraw
            // SỬA LỖI: ID sẽ là 4
            expect(history[2].id).to.equal(4); 
            expect(history[2].txType).to.equal("Withdraw");
            expect(history[2].amount).to.equal(ethers.parseUnits("20000", 18));
            expect(history[2].from).to.equal(await deBank.getAddress());
            expect(history[2].to).to.equal(user1.address);
        });
    });

    // --- Bộ test Case 6: Chức năng Admin ---
    describe("Admin Functions", function () {
        it("Should allow bank owner to set daily transfer limit", async function () {
            const newLimit = ethers.parseUnits("50000000", 18); // 50 triệu VNDT
            await deBank.connect(owner).setDailyTransferLimit(newLimit);
            expect(await deBank.dailyTransferLimit()).to.equal(newLimit);
        });

        it("Should revert if non-owner tries to set daily transfer limit", async function () {
            const newLimit = ethers.parseUnits("50000000", 18);
            await expect(deBank.connect(user1).setDailyTransferLimit(newLimit))
                .to.be.revertedWith("DeBank: Only bank owner can call this function");
        });

        it("Should allow bank owner to set transfer fee rate", async function () {
            const newFeeRate = 50; // 0.5%
            await deBank.connect(owner).setTransferFeeRate(newFeeRate);
            expect(await deBank.transferFeeRate()).to.equal(newFeeRate);
        });

        it("Should revert if non-owner tries to set transfer fee rate", async function () {
            const newFeeRate = 50;
            await expect(deBank.connect(user1).setTransferFeeRate(newFeeRate))
                .to.be.revertedWith("DeBank: Only bank owner can call this function");
        });

        it("Should allow bank owner to set fee receiver", async function () {
            await deBank.connect(owner).setFeeReceiver(feeReceiverAccount.address);
            expect(await deBank.feeReceiver()).to.equal(feeReceiverAccount.address);
        });

        it("Should revert if non-owner tries to set fee receiver", async function () {
            await expect(deBank.connect(user1).setFeeReceiver(feeReceiverAccount.address))
                .to.be.revertedWith("DeBank: Only bank owner can call this function");
        });

        it("Should allow bank owner to recover accidentally sent VNDT", async function () {
            const accidentalSendAmount = ethers.parseUnits("10000", 18);
            // Gửi trực tiếp VNDT vào DeBank contract (như lỗi của người dùng)
            await vndToken.connect(user1).transfer(await deBank.getAddress(), accidentalSendAmount);
            
            const deBankVNDTBalanceBefore = await vndToken.balanceOf(await deBank.getAddress());
            const ownerVNDTBalanceBefore = await vndToken.balanceOf(owner.address);

            // Bank owner recover
            await deBank.connect(owner).recoverVNDT(accidentalSendAmount);

            // Khẳng định số dư VNDT trong DeBank contract đã giảm
            // SỬA LỖI: Thay thế .sub() bằng toán tử trừ thông thường -
            expect(await vndToken.balanceOf(await deBank.getAddress())).to.equal(deBankVNDTBalanceBefore - accidentalSendAmount);
            // Khẳng định owner đã nhận lại VNDT
            // SỬA LỖI: Thay thế .add() bằng toán tử cộng thông thường +
            expect(await vndToken.balanceOf(owner.address)).to.equal(ownerVNDTBalanceBefore + accidentalSendAmount);
        });

        it("Should revert if bank owner tries to recover more VNDT than held by contract", async function () {
            const excessiveRecoverAmount = ethers.parseUnits("100", 18); // Giả sử contract đang giữ 0 VNDT
            await expect(deBank.connect(owner).recoverVNDT(excessiveRecoverAmount))
                .to.be.revertedWith("DeBank: Not enough VNDT in contract to recover");
        });
    });

    // --- Bộ test Case 7: Lấy số tiền đã chuyển trong ngày ---
    describe("Daily Transferred Amount", function () {
        it("Should accurately track daily transferred amount", async function () {
            await vndToken.connect(user1).approve(await deBank.getAddress(), userDepositAmount);
            await deBank.connect(user1).deposit(userDepositAmount);

            const transfer1 = ethers.parseUnits("1000", 18);
            const transfer2 = ethers.parseUnits("2000", 18);
            const feeRate = await deBank.transferFeeRate();
            // SỬA LỖI: Thay thế .mul() và .div() bằng toán tử nhân/chia thông thường * /
            const transfer1Adjusted = transfer1 - (transfer1 * feeRate / 10000n);
            // SỬA LỖI: Thay thế .mul() và .div() bằng toán tử nhân/chia thông thường * /
            const transfer2Adjusted = transfer2 - (transfer2 * feeRate / 10000n);

            // Chuyển lần 1
            await deBank.connect(user1).transfer(user2.address, transfer1);
            expect(await deBank.getDailyTransferredAmount(user1.address)).to.equal(transfer1);

            // Chuyển lần 2
            await deBank.connect(user1).transfer(addrs[0].address, transfer2);
            // SỬA LỖI: Thay thế .add() bằng toán tử cộng thông thường +
            expect(await deBank.getDailyTransferredAmount(user1.address)).to.equal(transfer1 + transfer2);
        });

        it("Should reset daily transferred amount on a new day", async function () {
            await vndToken.connect(user1).approve(await deBank.getAddress(), userDepositAmount);
            await deBank.connect(user1).deposit(userDepositAmount);

            const transferAmountToday = ethers.parseUnits("1000", 18);
            await deBank.connect(user1).transfer(user2.address, transferAmountToday);
            expect(await deBank.getDailyTransferredAmount(user1.address)).to.equal(transferAmountToday);

            // Simulate moving to the next day
            // Hardhat's time travel feature:
            await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]); // Tăng thời gian lên 24 giờ
            await ethers.provider.send("evm_mine"); // Đào một block mới để thời gian có hiệu lực

            // Số tiền đã chuyển trong ngày mới phải về 0
            expect(await deBank.getDailyTransferredAmount(user1.address)).to.equal(0);

            // Có thể thực hiện thêm giao dịch trong ngày mới để xác nhận
            await deBank.connect(user1).transfer(user2.address, ethers.parseUnits("500", 18));
            expect(await deBank.getDailyTransferredAmount(user1.address)).to.equal(ethers.parseUnits("500", 18));
        });
    });
});