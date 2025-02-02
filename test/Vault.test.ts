import { ethers, expect, loadFixture } from "./setup";

describe("Vault", async function() {
    async function deploy() {
        const [user1, user2] = await ethers.getSigners();

        const factory = await ethers.getContractFactory("Vault", user1);
        const contract = await factory.deploy();
        await contract.waitForDeployment();

        return {user1, user2, contract};
    }

    it("should return balance", async function() {
        const { user2, contract} = await loadFixture(deploy);

        expect(await contract.getBalance()).to.eq(0)

        const sum = 1000;
        //вызываем функцию donate на "чистом" пользователе
        const donateTransaction = await contract.connect(user2).donate({value: sum});

        //проверяем списание и начисление денег
        expect(donateTransaction).changeEtherBalance(user2, -sum);
        expect(donateTransaction).changeEtherBalance(contract, sum);

        const acountBalanceTx = await contract.connect(user2).getBalance()

        expect(acountBalanceTx).to.eq(sum)

        await expect(donateTransaction).to.emit(contract, "RefundChecker").withArgs(user2.address, sum)
    })

    it("should not donate", async function() {
        const { user2, contract} = await loadFixture(deploy);

        await expect(contract.connect(user2).donate()).to.be.revertedWithCustomError(contract, "EmptyValueException")
    })

    it("should return money to sender", async function () {
        const { user2, contract} = await loadFixture(deploy);

        const sum = 1000;
        //вызываем функцию donate на "чистом" пользователе
        const donateTransaction = await contract.connect(user2).donate({value: sum});

        //проверяем списание и начисление денег
        expect(donateTransaction).changeEtherBalance(user2, -sum);
        expect(donateTransaction).changeEtherBalance(contract, sum);

        const acountBalanceTx = await contract.connect(user2).getBalance()

        expect(acountBalanceTx).to.eq(sum)
        
        //вызываем функцию refand() ожидаем возврат денег
        const refundTx = await contract.connect(user2).refund()

        expect(refundTx).changeEtherBalance(user2, sum);
        expect(refundTx).changeEtherBalance(contract, -sum);
        await expect(refundTx).to.emit(contract, "RefundChecker").withArgs(user2.address, sum)

        //проверяем что все деньги вывелись
        const acountBalanceTxAfterRefund = await contract.connect(user2).getBalance()

        expect(acountBalanceTxAfterRefund).to.eq(0)

        //попытка еще раз списать деньги - должна провалиться

        await expect(contract.connect(user2).refund()).to.be.revertedWithCustomError(contract, "AccountIsNotDonated")
    })

    it("should withdraw money to owner", async function() {
        const { user1, user2, contract} = await loadFixture(deploy);

        const sum = 10000;

        const donateTx = await contract.connect(user2).donate({value: sum})

        expect(donateTx).to.changeEtherBalance(user2, -sum)
        expect(donateTx).to.changeEtherBalance(contract, sum)

        const witdrawTx = await contract.connect(user1).withdraw()

        expect(witdrawTx).to.changeEtherBalance(user1, sum)
        expect(witdrawTx).to.changeEtherBalance(contract, -sum)
        expect(await contract.getBalance()).to.eq(0)

        // проверяем, что дургой не может списать деньги
        await expect(contract.connect(user2).withdraw()).to.be.reverted
    })
})