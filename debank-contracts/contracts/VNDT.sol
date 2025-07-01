// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VNDT is ERC20, Ownable {
    // Constructor: Khởi tạo token với tên và ký hiệu, đồng thời mint tổng cung ban đầu cho người triển khai.
    constructor()
        ERC20("Vietnam Dong Token", "VNDT")
        Ownable(msg.sender) // Người triển khai contract sẽ là owner
    {
        // Mint 100,000,000 VNDT ban đầu cho người triển khai contract.
        // 100 * (10 ** 6) là 100 triệu, nhân thêm (10 ** decimals) để có số lượng token thực tế.
        // ERC20 mặc định có 18 decimals, nên 10**6 * 10**18 = 10**24
        _mint(msg.sender, 100_000_000 * (10 ** decimals()));
    }

    // Hàm mint: Chỉ owner mới có thể tạo thêm token.
    // Đây sẽ là hàm chúng ta dùng để cấp phát VNDT cho các tài khoản test.
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Hàm burn: Chỉ owner mới có thể tiêu hủy token.
    // Có thể dùng trong kịch bản người dùng rút VND thực khỏi hệ thống (prototype).
    function burn(uint256 amount) public onlyOwner {
        _burn(msg.sender, amount);
    }
}