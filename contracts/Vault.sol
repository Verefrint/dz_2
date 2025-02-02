// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from  "@openzeppelin/contracts/access/Ownable.sol";

error EmptyValueException();
error AccountIsNotDonated();

contract Vault is Ownable { //https://sepolia.etherscan.io/address/0x66E30cB61d0BDC337524D3bc41e52418d729286C

    mapping (address => uint) registry;

    event RefundChecker (address to, uint amount);

    constructor() Ownable(msg.sender) {}

    function donate() external payable {
        if (msg.value == 0) {
            revert EmptyValueException();
        }

        registry[msg.sender] = msg.value;

        emit RefundChecker(msg.sender, registry[msg.sender]);
    }

    function getBalance() external view returns(uint) {
        return address(this).balance;
    }

    function refund() external payable{
        uint _refundSum = registry[msg.sender];

        if (_refundSum == 0) {
            revert AccountIsNotDonated();
        }
        //reentrancy невозможен, так как сначала чистим справочник, а потом перводим деьги
        delete registry[msg.sender];

        payable(msg.sender).transfer(_refundSum);
        emit RefundChecker(msg.sender, _refundSum);
    }

    function withdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}

// contract Attacker {
//     Vault vault;

//     constructor(address val) {
//         vault = Vault(val);
//     }

//     function proxyBid() external payable {
//         vault.donate{value: msg.value}();
//     }

//     function attack() external {
//         if (vault.getBalance() > 0) {
//             vault.refund();
//         }
//     }

//     receive() external payable {
//         vault.refund();
//     }
    
//     function getBalance() external view returns(uint) {
//         return address(this).balance;
//     }
// }
