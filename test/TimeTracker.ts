// Libraries
import { ethers } from "hardhat";
import { mine } from "@nomicfoundation/hardhat-network-helpers";
import chai from "chai";
import "@nomicfoundation/hardhat-chai-matchers";
import { Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// Library constants
const expect = chai.expect;

////////////////////
// Test Constants //
////////////////////

const BLOCKS_TO_MINE = 100;

// Custom errors
const OPENED_SESSION_ERROR = "User currently has an opened session";
const SESSION_DOES_NOT_EXIST_ERROR = "Session specified does not exist for this address";

///////////
// TESTS //
///////////
describe("TimeTracker tests", function () {
    // Test vars
    let contractFactory: ContractFactory;
    let contract: Contract;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;

    // `beforeEach` runs before each test, re-deploying the contract every time.
    beforeEach(async () => {
        // Get several accounts to test
        [addr1, addr2] = await ethers.getSigners();

        // Deploy the contract
        contractFactory = await ethers.getContractFactory("TimeTracker");
        contract = await contractFactory.deploy();
    });

    //
    ///////////////////////////
    // Regular Time tracking //
    ///////////////////////////
    //
    describe("Regular Time Tracking", () => {
        it("Should allow anyone to start and end a session after a while", async () => {
            await contract.connect(addr1).startSession();
            await mine(BLOCKS_TO_MINE);

            const sessionId = await contract.getCurrentSessionForUser(addr1.address);
            await contract.connect(addr1).endSession(sessionId);

            const sessionDuration = await contract.getSessionDuration(addr1.address, sessionId);
            expect(sessionDuration).to.equal(BLOCKS_TO_MINE + 1);
        });

        it("Should emit an event when starting and an event when ending", async () => {
            await expect(contract.connect(addr1).startSession())
                .to.emit(contract, "SessionStarted")
                .withArgs(addr1.address, 0);
            
            await mine(BLOCKS_TO_MINE);

            const sessionId = await contract.getCurrentSessionForUser(addr1.address);

            await expect(contract.connect(addr1).endSession(sessionId))
                .to.emit(contract, "SessionEnded")
                .withArgs(addr1.address, sessionId, BLOCKS_TO_MINE + 1);
        });

        it("Should FAIL if anyone tries to start a new session without finishing the previous one", async () => {
            await contract.connect(addr1).startSession();

            await expect(
                contract.connect(addr1).startSession()
            ).to.be.revertedWith(OPENED_SESSION_ERROR);
        });

        it("Should FAIL if anyone tries to end a session that does not exist", async () => {
            await contract.connect(addr1).startSession();
            const sessionId = await contract.getCurrentSessionForUser(addr1.address);
            await contract.connect(addr1).endSession(sessionId);

            await expect(
                contract.connect(addr1).endSession(sessionId + 1)
            ).to.be.revertedWith(SESSION_DOES_NOT_EXIST_ERROR);
        });

        it("Should FAIL if a user tries to end a session of another user", async () => {
            await contract.connect(addr1).startSession();
            const sessionId = await contract.getCurrentSessionForUser(addr1.address);

            await expect(
                contract.connect(addr2).endSession(sessionId)
            ).to.be.revertedWith(SESSION_DOES_NOT_EXIST_ERROR);
        });
    });
});
