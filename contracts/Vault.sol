// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from  "@openzeppelin/contracts/access/Ownable.sol";

contract Vault is Ownable { //https://sepolia.etherscan.io/address/0x66E30cB61d0BDC337524D3bc41e52418d729286C

    mapping (address => uint) registry;

    event RefundChecker (address to, uint amount);

    constructor() Ownable(msg.sender) {}

    function donate() external payable {
        require(msg.value != 0, "value is empty");
        registry[msg.sender] = msg.value;

        emit RefundChecker(msg.sender, registry[msg.sender]);
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }

    function refund() external payable{
        address payable to_account = payable(msg.sender);

        require(registry[to_account] != 0, "accout is not donated");

        to_account.transfer(registry[to_account]);
        emit RefundChecker(to_account, registry[to_account]);

        delete registry[to_account];
    }

    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}
