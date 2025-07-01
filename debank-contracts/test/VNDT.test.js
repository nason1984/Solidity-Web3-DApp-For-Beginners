// Yêu cầu thư viện 'chai' để thực hiện các khẳng định (assertions) trong bài kiểm thử.
// 'expect' là một phần của Chai, giúp viết các điều kiện kiểm tra dễ đọc, dễ hiểu.
const { expect } = require("chai");

// Yêu cầu thư viện 'ethers' từ 'hardhat'. Ethers.js là một thư viện JavaScript mạnh mẽ
// để tương tác với blockchain Ethereum. Hardhat tích hợp nó để cung cấp các tiện ích
// cho việc triển khai, gọi hàm, và kiểm tra trạng thái contract trong môi trường test.
const { ethers } = require("hardhat");

// 'describe' dùng để nhóm các bài kiểm thử liên quan. Ở đây, chúng ta nhóm tất cả các test cho contract VNDT.
// Chuỗi đầu tiên là tên của suite test.
describe("VNDT", function () {
    let VNDT; // Biến này sẽ lưu trữ ContractFactory cho contract VNDT.
              // ContractFactory là một abstraction (lớp trừu tượng) được sử dụng để deploy các smart contract mới.
    let vndToken; // Biến này sẽ lưu trữ instance của contract VNDT đã được deploy trong mỗi bài test.
    let owner; // Biến này lưu trữ tài khoản mặc định (người triển khai contract)
    let addr1; // Một tài khoản test khác
    let addr2; // Một tài khoản test khác nữa
    let addrs; // Một mảng chứa các tài khoản test còn lại

    // Định nghĩa tổng cung ban đầu của token (100,000,000 VNDT với 18 số thập phân).
    // ethers.parseUnits("value", "decimals") chuyển đổi số thập phân thành số nguyên lớn
    // mà Solidity sử dụng nội bộ (ví dụ: 1 VNDT với 18 decimals = 1 * 10^18).
    const initialSupply = ethers.parseUnits("100000000", 18); // 100,000,000 VNDT

    // 'beforeEach' là một hook của Mocha (được Hardhat sử dụng).
    // Hàm này sẽ chạy TRƯỚC MỖI bài test ('it') trong suite test này.
    // Điều này đảm bảo mỗi bài test bắt đầu với một contract VNDT mới được deploy
    // và một trạng thái blockchain sạch sẽ, độc lập với các test khác.
    beforeEach(async function () {
        // Lấy ContractFactory cho contract có tên "VNDT".
        VNDT = await ethers.getContractFactory("VNDT");

        // Lấy danh sách các 'signers' (tài khoản test) được Hardhat cung cấp.
        // Mặc định, Hardhat tạo ra 20 tài khoản test với một lượng ETH lớn.
        // Chúng ta gán tài khoản đầu tiên cho 'owner', hai tài khoản tiếp theo cho 'addr1', 'addr2',
        // và phần còn lại vào mảng 'addrs'.
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        // Triển khai contract VNDT lên mạng Hardhat Network (mạng blockchain cục bộ, tạm thời).
        // Hàm 'deploy()' thực hiện việc gửi một giao dịch tạo contract.
        vndToken = await VNDT.deploy();
        // 'await vndToken.waitForDeployment()' đảm bảo rằng contract đã được deploy hoàn tất
        // và có địa chỉ trước khi các test tiếp theo được chạy.
        await vndToken.waitForDeployment();
    });

    // --- Bộ test Case 1: Triển khai contract và tổng cung ban đầu ---
    describe("Deployment", function () {
        // 'it' định nghĩa một bài kiểm thử riêng lẻ. Chuỗi là mô tả của bài test.
        it("Should assign the total supply of tokens to the owner", async function () {
            // Lấy số dư của tài khoản 'owner' bằng cách gọi hàm 'balanceOf' trên contract 'vndToken'.
            // 'await' vì đây là một thao tác bất đồng bộ (tương tác với blockchain).
            const ownerBalance = await vndToken.balanceOf(owner.address);

            // Sử dụng expect của Chai để khẳng định rằng số dư của owner phải bằng tổng cung ban đầu.
            expect(ownerBalance).to.equal(initialSupply);
        });

        it("Should have the correct name and symbol", async function () {
            // Kiểm tra tên token và ký hiệu token có đúng như mong đợi không.
            expect(await vndToken.name()).to.equal("Vietnam Dong Token");
            expect(await vndToken.symbol()).to.equal("VNDT");
        });
    });

    // --- Bộ test Case 2: Chức năng Mint (tạo thêm token) ---
    describe("Minting", function () {
        it("Should allow the owner to mint tokens to an address", async function () {
            const mintAmount = ethers.parseUnits("1000", 18); // 1000 VNDT
            
            // Gọi hàm 'mint' trên contract 'vndToken', cấp 1000 VNDT cho 'addr1'.
            // Vì hàm 'mint' có modifier 'onlyOwner', nó được gọi bởi 'owner' mặc định.
            await vndToken.mint(addr1.address, mintAmount);

            // Khẳng định rằng số dư của 'addr1' đã tăng lên đúng bằng lượng được mint.
            expect(await vndToken.balanceOf(addr1.address)).to.equal(mintAmount);
            // Khẳng định rằng tổng cung của token đã tăng lên đúng bằng lượng được mint.
            // SỬA LỖI: Sử dụng toán tử '+' thay vì '.add()' cho BigInt
            expect(await vndToken.totalSupply()).to.equal(initialSupply + mintAmount);
        });

        it("Should revert if a non-owner tries to mint tokens", async function () {
            const mintAmount = ethers.parseUnits("1000", 18);
            
            // expect(...).to.be.revertedWithCustomError(...) được sử dụng để kiểm tra xem
            // giao dịch có bị revert (thất bại) với một lỗi tùy chỉnh (custom error) cụ thể hay không.
            // Trong trường hợp này, `OwnableUnauthorizedAccount` là lỗi mà OpenZeppelin's Ownable phát ra.
            // '.withArgs(addr1.address)' kiểm tra thêm rằng đối số của lỗi có đúng là địa chỉ của 'addr1' không.
            await expect(vndToken.connect(addr1).mint(addr1.address, mintAmount))
                .to.be.revertedWithCustomError(VNDT, "OwnableUnauthorizedAccount")
                .withArgs(addr1.address);
        });
    });

    // --- Bộ test Case 3: Chức năng Burn (tiêu hủy token) ---
    describe("Burning", function () {
        it("Should allow the owner to burn tokens from their own balance", async function () {
            const burnAmount = ethers.parseUnits("1000", 18);
            const ownerInitialBalance = await vndToken.balanceOf(owner.address);
            
            // Gọi hàm 'burn' để tiêu hủy 1000 VNDT từ số dư của 'owner'.
            await vndToken.burn(burnAmount);
            
            // SỬA LỖI: Sử dụng toán tử '-' thay vì '.sub()' cho BigInt
            expect(await vndToken.balanceOf(owner.address)).to.equal(ownerInitialBalance - burnAmount);
            // SỬA LỖI: Sử dụng toán tử '-' thay vì '.sub()' cho BigInt
            expect(await vndToken.totalSupply()).to.equal(initialSupply - burnAmount);
        });

        it("Should revert if a non-owner tries to burn tokens", async function () {
            const burnAmount = ethers.parseUnits("100", 18);
            // First, send some tokens to addr1 so it has a balance to burn (even if unauthorized)
            await vndToken.transfer(addr1.address, burnAmount);
            
            // Khẳng định rằng 'addr1' không thể đốt token vì không phải owner.
            await expect(vndToken.connect(addr1).burn(burnAmount))
                .to.be.revertedWithCustomError(VNDT, "OwnableUnauthorizedAccount")
                .withArgs(addr1.address);
        });

        it("Should revert if burning more tokens than owned", async function () {
            // SỬA LỖI: Sử dụng toán tử '+' thay vì '.add()' cho BigInt
            const burnAmount = initialSupply + ethers.parseUnits("1", 18); // More than owned
            // SỬA LỖI: Kiểm tra Custom Error "ERC20InsufficientBalance" (hoặc "ERC20InvalidAccount") thay vì chuỗi lỗi.
            // Tùy thuộc phiên bản OZ, lỗi khi burn vượt quá balance có thể là ERC20InsufficientBalance.
            await expect(vndToken.burn(burnAmount))
                .to.be.revertedWithCustomError(VNDT, "ERC20InsufficientBalance");
        });
    });

    // --- Bộ test Case 4: Chức năng Transfer (chuyển token) ---
    describe("Transfers", function () {
        it("Should transfer tokens between accounts", async function () {
            const transferAmount = ethers.parseUnits("5000", 18);
            
            // Chuyển 5000 VNDT từ owner sang addr1
            await vndToken.transfer(addr1.address, transferAmount);
            expect(await vndToken.balanceOf(addr1.address)).to.equal(transferAmount);

            // Chuyển 2000 VNDT từ addr1 sang addr2
            await vndToken.connect(addr1).transfer(addr2.address, ethers.parseUnits("2000", 18));
            expect(await vndToken.balanceOf(addr2.address)).to.equal(ethers.parseUnits("2000", 18));
            // SỬA LỖI: Sử dụng toán tử '-' thay vì '.sub()' cho BigInt
            expect(await vndToken.balanceOf(addr1.address)).to.equal(transferAmount - ethers.parseUnits("2000", 18)); // 5000 - 2000
        });

        it("Should revert if sender does not have enough tokens", async function () {
            // SỬA LỖI: Sử dụng toán tử '+' thay vì '.add()' cho BigInt
            const transferAmount = initialSupply + ethers.parseUnits("1", 18); // More than owner has
            // SỬA LỖI: Kiểm tra Custom Error "ERC20InsufficientBalance" thay vì chuỗi lỗi.
            await expect(vndToken.transfer(addr1.address, transferAmount))
                .to.be.revertedWithCustomError(VNDT, "ERC20InsufficientBalance");
        });

        it("Should revert if transfer to the zero address", async function () {
            const transferAmount = ethers.parseUnits("100", 18);
            // SỬA LỖI: Kiểm tra Custom Error "ERC20InvalidReceiver" thay vì chuỗi lỗi.
            await expect(vndToken.transfer(ethers.ZeroAddress, transferAmount))
                .to.be.revertedWithCustomError(VNDT, "ERC20InvalidReceiver");
        });
        
        it("Should emit Transfer events", async function () {
            const transferAmount = ethers.parseUnits("100", 18);
            await expect(vndToken.transfer(addr1.address, transferAmount))
                .to.emit(vndToken, "Transfer")
                .withArgs(owner.address, addr1.address, transferAmount);
        });
    });

    // --- Bộ test Case 5: Approve và TransferFrom functionality ---
    describe("Approve/TransferFrom", function () {
        it("Should allow setting and checking allowances", async function () {
            const approveAmount = ethers.parseUnits("10000", 18);
            await vndToken.approve(addr1.address, approveAmount);
            expect(await vndToken.allowance(owner.address, addr1.address)).to.equal(approveAmount);
        });

        it("Should allow a spender to transfer tokens on behalf of the owner", async function () {
            const approveAmount = ethers.parseUnits("10000", 18);
            const transferFromAmount = ethers.parseUnits("5000", 18);
            
            // Owner approves addr1 to spend 10000 VNDT
            await vndToken.approve(addr1.address, approveAmount);
            
            // addr1 transfers 5000 VNDT from owner to addr2
            await vndToken.connect(addr1).transferFrom(owner.address, addr2.address, transferFromAmount);

            // SỬA LỖI: Sử dụng toán tử '-' thay vì '.sub()' cho BigInt
            expect(await vndToken.balanceOf(owner.address)).to.equal(initialSupply - transferFromAmount);
            expect(await vndToken.balanceOf(addr2.address)).to.equal(transferFromAmount);
            // SỬA LỖI: Sử dụng toán tử '-' thay vì '.sub()' cho BigInt
            expect(await vndToken.allowance(owner.address, addr1.address)).to.equal(approveAmount - transferFromAmount);
        });

        it("Should revert if transferFrom amount exceeds allowance", async function () {
            const approveAmount = ethers.parseUnits("1000", 18);
            const transferFromAmount = ethers.parseUnits("2000", 18);

            await vndToken.approve(addr1.address, approveAmount); // Only approve 1000
            
            // SỬA LỖI: Kiểm tra Custom Error "ERC20InsufficientAllowance" thay vì chuỗi lỗi.
            await expect(vndToken.connect(addr1).transferFrom(owner.address, addr2.address, transferFromAmount))
                .to.be.revertedWithCustomError(VNDT, "ERC20InsufficientAllowance");
        });

        it("Should revert if transferFrom amount exceeds sender's balance", async function () {
            const ownerInitialBalance = await vndToken.balanceOf(owner.address);
            // SỬA LỖI: Sử dụng toán tử '+' thay vì '.add()' cho BigInt
            const transferFromAmount = ownerInitialBalance + ethers.parseUnits("1", 18);
            
            await vndToken.approve(addr1.address, transferFromAmount); // Approve a large amount
            
            // SỬA LỖI: Kiểm tra Custom Error "ERC20InsufficientBalance" thay vì chuỗi lỗi.
            await expect(vndToken.connect(addr1).transferFrom(owner.address, addr2.address, transferFromAmount))
                .to.be.revertedWithCustomError(VNDT, "ERC20InsufficientBalance");
        });
    });
});