"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_utils_1 = require("@connext/vector-utils");
const bignumber_1 = require("@ethersproject/bignumber");
const constants_1 = require("@ethersproject/constants");
const units_1 = require("@ethersproject/units");
const wallet_1 = require("@ethersproject/wallet");
const hardhat_1 = require("hardhat");
const constants_2 = require("../../constants");
const commitments_1 = require("../../commitments");
const utils_1 = require("../../utils");
describe("CMCWithdraw.sol", function () {
    this.timeout(120000);
    const recipient = wallet_1.Wallet.createRandom().address;
    let channel;
    let failingToken;
    beforeEach(async () => {
        await hardhat_1.deployments.fixture();
        channel = await utils_1.createChannel();
        failingToken = await utils_1.getContract("FailingToken", constants_2.alice);
        await failingToken.mint(constants_2.alice.address, units_1.parseEther("0.001"));
        const ethTx = await constants_2.alice.sendTransaction({ to: channel.address, value: units_1.parseEther("0.001") });
        await ethTx.wait();
        const tokenTx = await failingToken.mint(channel.address, units_1.parseEther("0.001"));
        await tokenTx.wait();
        const dontRevert = await failingToken.setTransferShouldRevert(false);
        await dontRevert.wait();
        const dontFail = await failingToken.setTransferShouldFail(false);
        await dontFail.wait();
        const dontRejectEther = await failingToken.setRejectEther(false);
        await dontRejectEther.wait();
    });
    it("should work for Ether", async () => {
        const preWithdrawRecipient = await constants_2.provider.getBalance(recipient);
        const preWithdrawChannel = await constants_2.provider.getBalance(channel.address);
        const withdrawAmount = bignumber_1.BigNumber.from(1000);
        const nonce = bignumber_1.BigNumber.from(1);
        const commitment = new commitments_1.WithdrawCommitment(channel.address, constants_2.alice.address, constants_2.bob.address, recipient, constants_1.AddressZero, withdrawAmount.toString(), nonce.toString());
        const aliceSig = await new vector_utils_1.ChannelSigner(constants_2.alice.privateKey).signMessage(commitment.hashToSign());
        const bobSig = await new vector_utils_1.ChannelSigner(constants_2.bob.privateKey).signMessage(commitment.hashToSign());
        const withdrawData = commitment.getWithdrawData();
        vector_utils_1.expect(await channel.getWithdrawalTransactionRecord(withdrawData)).to.be.false;
        const tx = await channel.withdraw(withdrawData, aliceSig, bobSig);
        await tx.wait();
        vector_utils_1.expect(await constants_2.provider.getBalance(recipient)).to.be.eq(preWithdrawRecipient.add(withdrawAmount));
        vector_utils_1.expect(await constants_2.provider.getBalance(channel.address)).to.be.eq(preWithdrawChannel.sub(withdrawAmount));
        vector_utils_1.expect(await channel.getTotalTransferred(constants_1.AddressZero)).to.be.eq(withdrawAmount);
        vector_utils_1.expect(await channel.getWithdrawalTransactionRecord(withdrawData)).to.be.true;
    });
    it("should work for standard-compliant tokens", async () => {
        const preWithdrawRecipient = await failingToken.balanceOf(recipient);
        const preWithdrawChannel = await failingToken.balanceOf(channel.address);
        const withdrawAmount = bignumber_1.BigNumber.from(1000);
        const nonce = bignumber_1.BigNumber.from(1);
        const commitment = new commitments_1.WithdrawCommitment(channel.address, constants_2.alice.address, constants_2.bob.address, recipient, failingToken.address, withdrawAmount.toString(), nonce.toString());
        const aliceSig = await new vector_utils_1.ChannelSigner(constants_2.alice.privateKey).signMessage(commitment.hashToSign());
        const bobSig = await new vector_utils_1.ChannelSigner(constants_2.bob.privateKey).signMessage(commitment.hashToSign());
        const withdrawData = commitment.getWithdrawData();
        vector_utils_1.expect(await channel.getWithdrawalTransactionRecord(withdrawData)).to.be.false;
        const tx = await channel.withdraw(withdrawData, aliceSig, bobSig);
        await tx.wait();
        vector_utils_1.expect(await failingToken.balanceOf(recipient)).to.be.eq(preWithdrawRecipient.add(withdrawAmount));
        vector_utils_1.expect(await failingToken.balanceOf(channel.address)).to.be.eq(preWithdrawChannel.sub(withdrawAmount));
        vector_utils_1.expect(await channel.getTotalTransferred(failingToken.address)).to.be.eq(withdrawAmount);
        vector_utils_1.expect(await channel.getWithdrawalTransactionRecord(withdrawData)).to.be.true;
    });
    it("should work for missing-return-value-bug tokens", async () => {
        const nonconformingToken = await utils_1.getContract("NonconformingToken", constants_2.alice);
        await nonconformingToken.mint(constants_2.alice.address, units_1.parseEther("0.001"));
        const tokenTx = await nonconformingToken.mint(channel.address, units_1.parseEther("0.001"));
        await tokenTx.wait();
        const preWithdrawRecipient = await nonconformingToken.balanceOf(recipient);
        const preWithdrawChannel = await nonconformingToken.balanceOf(channel.address);
        const withdrawAmount = bignumber_1.BigNumber.from(1000);
        const nonce = bignumber_1.BigNumber.from(1);
        const commitment = new commitments_1.WithdrawCommitment(channel.address, constants_2.alice.address, constants_2.bob.address, recipient, nonconformingToken.address, withdrawAmount.toString(), nonce.toString());
        const aliceSig = await new vector_utils_1.ChannelSigner(constants_2.alice.privateKey).signMessage(commitment.hashToSign());
        const bobSig = await new vector_utils_1.ChannelSigner(constants_2.bob.privateKey).signMessage(commitment.hashToSign());
        const withdrawData = commitment.getWithdrawData();
        vector_utils_1.expect(await channel.getWithdrawalTransactionRecord(withdrawData)).to.be.false;
        const tx = await channel.withdraw(withdrawData, aliceSig, bobSig);
        await tx.wait();
        vector_utils_1.expect(await nonconformingToken.balanceOf(recipient)).to.be.eq(preWithdrawRecipient.add(withdrawAmount));
        vector_utils_1.expect(await nonconformingToken.balanceOf(channel.address)).to.be.eq(preWithdrawChannel.sub(withdrawAmount));
        vector_utils_1.expect(await channel.getTotalTransferred(nonconformingToken.address)).to.be.eq(withdrawAmount);
        vector_utils_1.expect(await channel.getWithdrawalTransactionRecord(withdrawData)).to.be.true;
    });
    it("should fail for wrong channel address", async () => {
        const withdrawAmount = bignumber_1.BigNumber.from(1000);
        const nonce = bignumber_1.BigNumber.from(1);
        const commitment = new commitments_1.WithdrawCommitment(vector_utils_1.getRandomAddress(), constants_2.alice.address, constants_2.bob.address, recipient, constants_1.AddressZero, withdrawAmount.toString(), nonce.toString());
        const aliceSig = await new vector_utils_1.ChannelSigner(constants_2.alice.privateKey).signMessage(commitment.hashToSign());
        const bobSig = await new vector_utils_1.ChannelSigner(constants_2.bob.privateKey).signMessage(commitment.hashToSign());
        const withdrawData = commitment.getWithdrawData();
        await vector_utils_1.expect(channel.withdraw(withdrawData, aliceSig, bobSig)).revertedWith("CMCWithdraw: CHANNEL_MISMATCH");
    });
    it("should fail if it is a no-op (callTo == address(0) && amount == 0)", async () => {
        const withdrawAmount = bignumber_1.BigNumber.from(0);
        const nonce = bignumber_1.BigNumber.from(1);
        const commitment = new commitments_1.WithdrawCommitment(channel.address, constants_2.alice.address, constants_2.bob.address, recipient, constants_1.AddressZero, withdrawAmount.toString(), nonce.toString());
        const aliceSig = await new vector_utils_1.ChannelSigner(constants_2.alice.privateKey).signMessage(commitment.hashToSign());
        const bobSig = await new vector_utils_1.ChannelSigner(constants_2.bob.privateKey).signMessage(commitment.hashToSign());
        const withdrawData = commitment.getWithdrawData();
        await vector_utils_1.expect(channel.withdraw(withdrawData, aliceSig, bobSig)).revertedWith("CMCWithdraw: NO_OP");
    });
    it("should fail if alice signature is invalid", async () => {
        const withdrawAmount = bignumber_1.BigNumber.from(1000);
        const nonce = bignumber_1.BigNumber.from(1);
        const commitment = new commitments_1.WithdrawCommitment(channel.address, constants_2.alice.address, constants_2.bob.address, recipient, constants_1.AddressZero, withdrawAmount.toString(), nonce.toString());
        const aliceSig = await new vector_utils_1.ChannelSigner(constants_2.alice.privateKey).signMessage(vector_utils_1.getRandomBytes32());
        const bobSig = await new vector_utils_1.ChannelSigner(constants_2.bob.privateKey).signMessage(commitment.hashToSign());
        const withdrawData = commitment.getWithdrawData();
        await vector_utils_1.expect(channel.withdraw(withdrawData, aliceSig, bobSig)).revertedWith("CMCWithdraw: INVALID_ALICE_SIG");
    });
    it("should fail if bob signature is invalid", async () => {
        const withdrawAmount = bignumber_1.BigNumber.from(1000);
        const nonce = bignumber_1.BigNumber.from(1);
        const commitment = new commitments_1.WithdrawCommitment(channel.address, constants_2.alice.address, constants_2.bob.address, recipient, constants_1.AddressZero, withdrawAmount.toString(), nonce.toString());
        const aliceSig = await new vector_utils_1.ChannelSigner(constants_2.alice.privateKey).signMessage(commitment.hashToSign());
        const bobSig = await new vector_utils_1.ChannelSigner(constants_2.bob.privateKey).signMessage(vector_utils_1.getRandomBytes32());
        const withdrawData = commitment.getWithdrawData();
        await vector_utils_1.expect(channel.withdraw(withdrawData, aliceSig, bobSig)).revertedWith("CMCWithdraw: INVALID_BOB_SIG");
    });
    it("should fail if the tx has already been executed", async () => {
        const withdrawAmount = bignumber_1.BigNumber.from(1000);
        const nonce = bignumber_1.BigNumber.from(1);
        const commitment = new commitments_1.WithdrawCommitment(channel.address, constants_2.alice.address, constants_2.bob.address, recipient, constants_1.AddressZero, withdrawAmount.toString(), nonce.toString());
        const aliceSig = await new vector_utils_1.ChannelSigner(constants_2.alice.privateKey).signMessage(commitment.hashToSign());
        const bobSig = await new vector_utils_1.ChannelSigner(constants_2.bob.privateKey).signMessage(commitment.hashToSign());
        const withdrawData = commitment.getWithdrawData();
        await channel.withdraw(withdrawData, aliceSig, bobSig);
        await vector_utils_1.expect(channel.withdraw(withdrawData, aliceSig, bobSig)).revertedWith("CMCWithdraw: ALREADY_EXECUTED");
    });
    it("should fail if Ether transfer reverts", async () => {
        const rejectEtherRecipient = failingToken.address;
        const rejectEther = await failingToken.setRejectEther(true);
        await rejectEther.wait();
        const withdrawAmount = bignumber_1.BigNumber.from(1000);
        const nonce = bignumber_1.BigNumber.from(1);
        const commitment = new commitments_1.WithdrawCommitment(channel.address, constants_2.alice.address, constants_2.bob.address, rejectEtherRecipient, constants_1.AddressZero, withdrawAmount.toString(), nonce.toString());
        const aliceSig = await new vector_utils_1.ChannelSigner(constants_2.alice.privateKey).signMessage(commitment.hashToSign());
        const bobSig = await new vector_utils_1.ChannelSigner(constants_2.bob.privateKey).signMessage(commitment.hashToSign());
        const withdrawData = commitment.getWithdrawData();
        await vector_utils_1.expect(channel.withdraw(withdrawData, aliceSig, bobSig)).revertedWith("ERC20: ETHER_REJECTED");
    });
    it("should fail if token transfer fails", async () => {
        const failing = await failingToken.setTransferShouldFail(true);
        await failing.wait();
        const withdrawAmount = bignumber_1.BigNumber.from(1000);
        const nonce = bignumber_1.BigNumber.from(1);
        const commitment = new commitments_1.WithdrawCommitment(channel.address, constants_2.alice.address, constants_2.bob.address, recipient, failingToken.address, withdrawAmount.toString(), nonce.toString());
        const aliceSig = await new vector_utils_1.ChannelSigner(constants_2.alice.privateKey).signMessage(commitment.hashToSign());
        const bobSig = await new vector_utils_1.ChannelSigner(constants_2.bob.privateKey).signMessage(commitment.hashToSign());
        const withdrawData = commitment.getWithdrawData();
        await vector_utils_1.expect(channel.withdraw(withdrawData, aliceSig, bobSig)).revertedWith("CMCAsset: TRANSFER_FAILED");
    });
    it("should fail if token transfer reverts", async () => {
        const reverting = await failingToken.setTransferShouldRevert(true);
        await reverting.wait();
        const withdrawAmount = bignumber_1.BigNumber.from(1000);
        const nonce = bignumber_1.BigNumber.from(1);
        const commitment = new commitments_1.WithdrawCommitment(channel.address, constants_2.alice.address, constants_2.bob.address, recipient, failingToken.address, withdrawAmount.toString(), nonce.toString());
        const aliceSig = await new vector_utils_1.ChannelSigner(constants_2.alice.privateKey).signMessage(commitment.hashToSign());
        const bobSig = await new vector_utils_1.ChannelSigner(constants_2.bob.privateKey).signMessage(commitment.hashToSign());
        const withdrawData = commitment.getWithdrawData();
        await vector_utils_1.expect(channel.withdraw(withdrawData, aliceSig, bobSig)).revertedWith("FAIL: Failing token");
    });
    it.skip("should call helper contract if given non-zero address", async () => { });
});
//# sourceMappingURL=withdraw.spec.js.map