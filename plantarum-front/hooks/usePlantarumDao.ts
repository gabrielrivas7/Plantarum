// hooks/usePlantarumDao.ts
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import PlantarumDaoABI from "../abi/PlantarumDao.json";
import addresses from "../utils/addresses_eth";
import { useWallet } from "../src/context/WalletContext";

// 🔹 Tipo literal para evitar strings inválidos
export type CommitteeRoleType = "CONSERVATION" | "PROJECTS" | "CARBON";

export function usePlantarumDao() {
  const { account, signer } = useWallet();
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_RPC_URL
        );

        let base = provider;
        if (!process.env.NEXT_PUBLIC_RPC_URL && (window as any).ethereum) {
          base = new ethers.BrowserProvider((window as any).ethereum);
        }

        const dao = new ethers.Contract(
          addresses.PlantarumDao,
          PlantarumDaoABI,
          signer || base
        );

        setContract(dao);
      } catch (err) {
        console.error("❌ Error inicializando DAO:", err);
      }
    };

    init();
  }, [signer]);

  // --------------------
  // Write
  // --------------------
  const joinDAO = useCallback(
    async (alias: string, personaType: string, memberType: string, image: string) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet antes de unirte a la DAO");
      const tx = await contract.connect(signer).joinDAO(alias, personaType, memberType, image);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const createProposal = useCallback(
    async (
      title: string,
      description: string,
      proposalType: string,
      fileHash: string,
      durationIndex: bigint,
      hashId: string
    ) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet para crear propuestas");
      const tx = await contract.connect(signer).createProposal(
        title,
        description,
        proposalType,
        fileHash,
        durationIndex,
        hashId
      );
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const voteProposal = useCallback(
    async (proposalId: bigint, support: boolean) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet para votar");
      const tx = await contract.connect(signer).voteProposal(proposalId, support);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const executeProposal = useCallback(
    async (proposalId: bigint) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet para ejecutar propuestas");
      const tx = await contract.connect(signer).executeProposal(proposalId);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const removeMember = useCallback(
    async (wallet: string) => {
      if (!contract || !signer) throw new Error("⚠️ Solo admin puede remover miembros");
      const tx = await contract.connect(signer).removeMember(wallet);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const setMembershipFee = useCallback(
    async (newFee: bigint) => {
      if (!contract || !signer) throw new Error("⚠️ Solo admin puede cambiar fee");
      const tx = await contract.connect(signer).setMembershipFee(newFee);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  // --------------------
  // Nuevos: Roles de Comité
  // --------------------
  const grantCommitteeRole = useCallback(
    async (wallet: string, roleType: CommitteeRoleType) => {
      if (!contract || !signer) throw new Error("⚠️ Solo admin puede asignar roles de comité");
      const tx = await contract.connect(signer).grantCommitteeRole(wallet, roleType);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const revokeCommitteeRole = useCallback(
    async (wallet: string, roleType: CommitteeRoleType) => {
      if (!contract || !signer) throw new Error("⚠️ Solo admin puede revocar roles de comité");
      const tx = await contract.connect(signer).revokeCommitteeRole(wallet, roleType);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const hasCommitteeRole = useCallback(
    async (wallet: string, roleType: CommitteeRoleType) => {
      if (!contract) return false;
      let roleHash;
      if (roleType === "CONSERVATION") {
        roleHash = await contract.ROLE_COMMITTEE_CONSERVATION();
      } else if (roleType === "PROJECTS") {
        roleHash = await contract.ROLE_COMMITTEE_PROJECTS();
      } else {
        roleHash = await contract.ROLE_COMMITTEE_CARBON();
      }
      return contract.hasRole(roleHash, wallet);
    },
    [contract]
  );

  // --------------------
  // Read
  // --------------------
  const getDaoBalance = useCallback(async () => {
    if (!contract) return "0";
    const balance: bigint = await contract.getDaoBalance();
    return ethers.formatEther(balance);
  }, [contract]);

  const getAllMembers = useCallback(async () => {
    if (!contract) return [];
    const result = await contract.getAllMembers();
    return result.map((m: any) => ({
      wallet: m.wallet,
      aliasName: m.aliasName,
      personaType: m.personaType,
      memberType: m.memberType,
      status: m.status,
      image: m.image,
      joinedAt: Number(m.joinedAt),
    }));
  }, [contract]);

  const getMemberById = useCallback(async (wallet: string) => {
    if (!contract) return null;
    const m = await contract.getMemberById(wallet);
    return {
      wallet: m.wallet,
      aliasName: m.aliasName,
      personaType: m.personaType,
      memberType: m.memberType,
      status: m.status,
      image: m.image,
      joinedAt: Number(m.joinedAt),
    };
  }, [contract]);

  const getAllProposals = useCallback(async () => {
    if (!contract) return [];
    const result = await contract.getAllProposals();
    return result
      .map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        proposalType: p.proposalType,
        fileHash: p.fileHash,
        status: p.status,
        createdAt: Number(p.createdAt),
        deadline: Number(p.deadline),
        hashId: p.hashId,
        votesFor: Number(p.votesFor),
        votesAgainst: Number(p.votesAgainst),
      }))
      .filter((p: any) => p.id !== 0n && p.title && p.title.trim() !== "" && Number(p.deadline) > 0);
  }, [contract]);

  const getProposalById = useCallback(async (id: bigint) => {
    if (!contract) return null;
    const p = await contract.getProposalById(id);
    if (!p || p.id === 0n) return null;
    return p;
  }, [contract]);

  return {
    account,
    contract,
    // Write
    joinDAO,
    createProposal,
    voteProposal,
    executeProposal,
    removeMember,
    setMembershipFee,
    grantCommitteeRole,
    revokeCommitteeRole,
    // Read
    getDaoBalance,
    getAllMembers,
    getMemberById,
    getAllProposals,
    getProposalById,
    hasCommitteeRole,
  };
}
