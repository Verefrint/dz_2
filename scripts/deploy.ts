import {ethers} from "hardhat";

async function deploy() {
    try {
        const myContract = await ethers.getContractFactory("Vault")
        const contract = await myContract.deploy()
        await contract.waitForDeployment()

        console.log(`contract address: ${await contract.getAddress()}`)
    } catch (error) {
        console.log(error)
    }
}

deploy();