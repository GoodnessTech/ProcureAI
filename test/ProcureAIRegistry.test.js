const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProcureAIRegistry", function () {
  let registry;
  let owner;
  let user1;
  let user2;

  const sampleProcurementId = ethers.keccak256(ethers.toUtf8Bytes("PROC-2026-LAPTOPS-50"));
  const sampleSupplierHash = ethers.keccak256(ethers.toUtf8Bytes("TechSource Enterprise"));
  const sampleAmount = 28500n; // $28,500

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const ProcureAIRegistry = await ethers.getContractFactory("ProcureAIRegistry");
    registry = await ProcureAIRegistry.deploy();
    await registry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should deploy with a valid address", async function () {
      const address = await registry.getAddress();
      expect(address).to.properAddress;
    });
  });

  describe("approveProcurement", function () {
    it("should record a valid procurement approval in a single transaction", async function () {
      const tx = await registry.connect(user1).approveProcurement(
        sampleProcurementId,
        sampleSupplierHash,
        sampleAmount
      );
      const receipt = await tx.wait();

      // Verify gas used is minimal
      expect(receipt.gasUsed).to.be.lessThan(75000n);

      // Verify event emission
      await expect(tx)
        .to.emit(registry, "ProcurementApproved")
        .withArgs(
          sampleProcurementId,
          sampleSupplierHash,
          user1.address,
          sampleAmount,
          (timestamp) => timestamp > 0n
        );

      // Verify isApproved view
      expect(await registry.isApproved(sampleProcurementId)).to.be.true;

      // Verify getApproval view
      const [supplierHash, approver, timestamp, amount] = await registry.getApproval(sampleProcurementId);
      expect(supplierHash).to.equal(sampleSupplierHash);
      expect(approver).to.equal(user1.address);
      expect(amount).to.equal(sampleAmount);
      expect(timestamp).to.be.greaterThan(0n);
    });

    it("should prevent duplicate approvals for the same procurement ID", async function () {
      await registry.connect(user1).approveProcurement(
        sampleProcurementId,
        sampleSupplierHash,
        sampleAmount
      );

      // Attempting to approve again with same ID must revert with AlreadyApproved()
      await expect(
        registry.connect(user2).approveProcurement(
          sampleProcurementId,
          sampleSupplierHash,
          sampleAmount
        )
      ).to.be.revertedWithCustomError(registry, "AlreadyApproved");
    });

    it("should revert if procurementId is bytes32(0)", async function () {
      await expect(
        registry.connect(user1).approveProcurement(
          ethers.ZeroHash,
          sampleSupplierHash,
          sampleAmount
        )
      ).to.be.revertedWithCustomError(registry, "InvalidProcurementId");
    });

    it("should revert if supplierHash is bytes32(0)", async function () {
      await expect(
        registry.connect(user1).approveProcurement(
          sampleProcurementId,
          ethers.ZeroHash,
          sampleAmount
        )
      ).to.be.revertedWithCustomError(registry, "InvalidSupplier");
    });

    it("should revert if amount is zero", async function () {
      await expect(
        registry.connect(user1).approveProcurement(
          sampleProcurementId,
          sampleSupplierHash,
          0n
        )
      ).to.be.revertedWithCustomError(registry, "InvalidAmount");
    });

    it("should return false for unapproved procurement IDs", async function () {
      const nonExistentId = ethers.keccak256(ethers.toUtf8Bytes("NON_EXISTENT"));
      expect(await registry.isApproved(nonExistentId)).to.be.false;

      const [supplierHash, approver, timestamp, amount] = await registry.getApproval(nonExistentId);
      expect(supplierHash).to.equal(ethers.ZeroHash);
      expect(approver).to.equal(ethers.ZeroAddress);
      expect(timestamp).to.equal(0n);
      expect(amount).to.equal(0n);
    });
  });
});
