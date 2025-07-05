// SPDX-License-Identifier: MIT
// This specifies the license for the source code. The MIT License is a popular open-source license
// that allows others to freely use, modify, and distribute the code.

pragma solidity ^0.8.20;
// Declares the Solidity compiler version required for this contract.
// The caret `^` means the code is compatible with version 0.8.20 and up,
// but not including 0.9.0 or later. This ensures your code compiles successfully
// with minor future versions.

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// Imports the ERC20 contract from the OpenZeppelin library.
// This contract provides a standard implementation of the ERC-20 token standard,
// including functions like `transfer`, `balanceOf`, `approve`, `transferFrom`, etc.

import "@openzeppelin/contracts/access/Ownable.sol";
// Imports the Ownable contract from the OpenZeppelin library.
// This contract provides a basic access control mechanism, where there is an 'owner'
// address that has exclusive rights to certain functions (e.g., `mint`, `burn`).

contract VNDT is ERC20, Ownable {
    // Defines the VNDT (Vietnam Dong Token) contract.
    // `is ERC20`: Inherits all functions and state variables from the ERC20 standard.
    // `is Ownable`: Inherits the ownership features, making the deployer the owner.

    // Constructor: This function is executed only once when the contract is deployed to the blockchain.
    // It initializes the token's name, symbol, and mints the initial supply to the deployer.
    constructor()
        ERC20("Vietnam Dong Token", "VNDT") // Calls the ERC20 constructor to set the token's name and symbol.
        Ownable(msg.sender) // Calls the Ownable constructor, setting the contract deployer (msg.sender) as the owner.
    {
        // Mints the initial supply of 100,000,000 VNDT to the contract deployer (msg.sender).
        // `100_000_000` is the human-readable amount.
        // `(10 ** decimals())` converts this human-readable amount to the smallest unit of the token (wei-like units).
        // ERC20 tokens typically have 18 decimals, so 10^6 * 10^18 = 10^24 smallest units.
        _mint(msg.sender, 1_000_000_000 * (10 ** decimals()));
    }

    // Function to mint (create) new tokens.
    // Only the contract owner can call this function.
    // This will be used to issue new VNDT for testing purposes or as part of a controlled supply mechanism.
    // @param to The address to which new tokens will be minted.
    // @param amount The amount of new tokens to mint (in smallest units).
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount); // Calls the internal `_mint` function from the ERC20 contract.
    }

    // Function to burn (destroy) tokens.
    // Only the contract owner can call this function.
    // This can be used in scenarios where tokens need to be removed from circulation (e.g., in a redemption process).
    // @param amount The amount of tokens to burn from the caller's balance (in smallest units).
    function burn(uint256 amount) public onlyOwner {
        _burn(msg.sender, amount); // Calls the internal `_burn` function from the ERC20 contract.
    }
}
