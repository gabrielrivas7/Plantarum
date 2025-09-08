// hooks/usePlantarumCommittees.ts

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import PlantarumCommitteesABI from "../abi/PlantarumCommittees.json";
import addresses from "../utils/addresses_eth";
import { useWallet } from "../src/context/WalletContext";

export function usePlantarumCommittees() {
  const { account, signer } = useWallet();
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  // Inicializar contrato
  useEffect(() => {
    if (signer) {
      const c = new ethers.Contract(
        addresses.PlantarumCommittees,
        PlantarumCommitteesABI,
        signer
      );
      setContract(c);
    }
  }, [signer]);

  // --------------------
  // Write
  // --------------------
  const createCommittee = useCallback(
    async (name: string, description: string, image: string) => {
      if (!contract) throw new Error("Contrato no inicializado");
      const tx = await contract.createCommittee(name, description, image);
      await tx.wait();
      return tx.hash;
    },
    [contract]
  );

  const approveCommittee = useCallback(
    async (id: bigint) => {
      if (!contract) throw new Error("Contrato no inicializado");
      const tx = await contract.approveCommittee(id);
      await tx.wait();
      return tx.hash;
    },
    [contract]
  );

  const rejectCommittee = useCallback(
    async (id: bigint) => {
      if (!contract) throw new Error("Contrato no inicializado");
      const tx = await contract.rejectCommittee(id);
      await tx.wait();
      return tx.hash;
    },
    [contract]
  );

  const updateCommitteeImage = useCallback(
    async (id: bigint, newImage: string) => {
      if (!contract) throw new Error("Contrato no inicializado");
      const tx = await contract.updateCommitteeImage(id, newImage);
      await tx.wait();
      return tx.hash;
    },
    [contract]
  );

  const requestJoinCommittee = useCallback(
    async (id: bigint) => {
      if (!contract) throw new Error("Contrato no inicializado");
      const tx = await contract.requestJoinCommittee(id);
      await tx.wait();
      return tx.hash;
    },
    [contract]
  );

  const approveJoinCommittee = useCallback(
    async (id: bigint, applicant: string) => {
      if (!contract) throw new Error("Contrato no inicializado");
      const tx = await contract.approveJoinCommittee(id, applicant);
      await tx.wait();
      return tx.hash;
    },
    [contract]
  );

  const rejectJoinCommittee = useCallback(
    async (id: bigint, applicant: string) => {
      if (!contract) throw new Error("Contrato no inicializado");
      const tx = await contract.rejectJoinCommittee(id, applicant);
      await tx.wait();
      return tx.hash;
    },
    [contract]
  );

  const removeCommitteeMember = useCallback(
    async (id: bigint, member: string) => {
      if (!contract) throw new Error("Contrato no inicializado");
      const tx = await contract.removeCommitteeMember(id, member);
      await tx.wait();
      return tx.hash;
    },
    [contract]
  );

  const createCommitteeProposal = useCallback(
    async (
      committeeId: bigint,
      title: string,
      description: string,
      durationIndex: bigint,
      hashId: string,
      fileHash: string
    ) => {
      if (!contract) throw new Error("Contrato no inicializado");
      const tx = await contract.createCommitteeProposal(
        committeeId,
        title,
        description,
        durationIndex,
        hashId,
        fileHash
      );
      await tx.wait();
      return tx.hash;
    },
    [contract]
  );

  const voteCommitteeProposal = useCallback(
    async (proposalId: bigint, support: boolean) => {
      if (!contract) throw new Error("Contrato no inicializado");
      const tx = await contract.voteCommitteeProposal(proposalId, support);
      await tx.wait();
      return tx.hash;
    },
    [contract]
  );

  const executeCommitteeProposal = useCallback(
    async (proposalId: bigint) => {
      if (!contract) throw new Error("Contrato no inicializado");
      const tx = await contract.executeCommitteeProposal(proposalId);
      await tx.wait();
      return tx.hash;
    },
    [contract]
  );

  // --------------------
  // Read
  // --------------------
  const getAllCommittees = useCallback(async () => {
    if (!contract) return [];
    return await contract.getAllCommittees();
  }, [contract]);

  const getCommitteeById = useCallback(async (id: bigint) => {
    if (!contract) return null;
    return await contract.getCommitteeById(id);
  }, [contract]);

  const getAllCommitteeProposals = useCallback(
    async (committeeId: bigint) => {
      if (!contract) return [];
      return await contract.getAllCommitteeProposals(committeeId);
    },
    [contract]
  );

  const getCommitteeProposalById = useCallback(async (id: bigint) => {
    if (!contract) return null;
    return await contract.getCommitteeProposalById(id);
  }, [contract]);

  // --------------------
  return {
    account,
    contract,
    createCommittee,
    approveCommittee,
    rejectCommittee,
    updateCommitteeImage,
    requestJoinCommittee,
    approveJoinCommittee,
    rejectJoinCommittee,
    removeCommitteeMember,
    createCommitteeProposal,
    voteCommitteeProposal,
    executeCommitteeProposal,
    getAllCommittees,
    getCommitteeById,
    getAllCommitteeProposals,
    getCommitteeProposalById,
  };
}
