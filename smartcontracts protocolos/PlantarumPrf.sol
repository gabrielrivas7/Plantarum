// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

interface IPlantarum721 {
    event MintConservation(address indexed to, uint256 indexed tokenId, string coords, string tokenURI);
}

interface IPlantarum1155 {
    event MintForestAsset(address indexed to, uint256 indexed tokenId, string coords, string tokenURI);
}

/**
 * @title PlantarumPRF - Protocolo de Prueba de Reserva Forestal
 * @notice Audita activos forestales y de conservación con auditores descentralizados
 * @custom:version 1.0.0
 */
contract PlantarumPRF is
    Initializable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable
{
    bytes32 public constant DAO_ROLE = keccak256("DAO_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    uint256 public constant ACCEPTANCE_TIMEOUT = 3 days;

    // -----------------
    // AUDITORES
    // -----------------
    address[] public auditors;

    // -----------------
    // AUDITORÍAS
    // -----------------
    enum AuditStatus {
        Pending,
        Accepted,
        InProgress,
        Finalized,
        Reassigned
    }

    enum AuditPhase {
        None,
        Analisis,
        Tecnica,
        Inspeccion,
        InformeFinal
    }

    struct Document {
        string ipfsHash;
        AuditPhase phase;
        uint256 timestamp;
    }

    struct Audit {
        uint256 auditId;
        uint256 tokenId;
        address creator;
        address auditor;
        AuditStatus status;
        AuditPhase currentPhase;
        uint256 createdAt;
        uint256 acceptedAt;
        uint256 finalizedAt;
        string finalOpinion; // Conforme / No conforme
        Document[] documents;
    }

    uint256 public auditCounter;
    mapping(uint256 => Audit) public audits; // auditId => Audit

    // -----------------
    // EVENTOS
    // -----------------
    event AuditorRegistered(address auditor);
    event AuditorAssigned(uint256 indexed auditId, address auditor);
    event AuditCreated(uint256 indexed auditId, uint256 tokenId, address creator);
    event AuditAccepted(uint256 indexed auditId, address auditor);
    event DocumentSubmitted(uint256 indexed auditId, AuditPhase phase, string ipfsHash);
    event AuditFinalized(uint256 indexed auditId, address auditor, string opinion);

    // -----------------
    // INIT
    // -----------------
    function initialize(address superAdmin) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, superAdmin);
        _grantRole(DAO_ROLE, superAdmin);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    // -----------------
    // AUDITORES
    // -----------------
    function registerAuditor(address auditor) external onlyRole(DAO_ROLE) {
        require(auditor != address(0), "Auditor invalido");
        _grantRole(AUDITOR_ROLE, auditor);
        auditors.push(auditor);
        emit AuditorRegistered(auditor);
    }

    function getAuditors() external view returns (address[] memory) {
        return auditors;
    }

    // -----------------
    // CREAR AUDITORÍA (disparada por tokenización)
    // -----------------
    function createAudit(uint256 tokenId, address creator) external onlyRole(DAO_ROLE) {
        require(tokenId > 0, "Token invalido");
        auditCounter++;

        uint256 auditId = auditCounter;
        address assignedAuditor = _pickRandomAuditor();

        audits[auditId].auditId = auditId;
        audits[auditId].tokenId = tokenId;
        audits[auditId].creator = creator;
        audits[auditId].auditor = assignedAuditor;
        audits[auditId].status = AuditStatus.Pending;
        audits[auditId].createdAt = block.timestamp;

        emit AuditCreated(auditId, tokenId, creator);
        emit AuditorAssigned(auditId, assignedAuditor);
    }

    // -----------------
    // AUDITOR ACEPTA
    // -----------------
    function acceptAudit(uint256 auditId) external onlyRole(AUDITOR_ROLE) {
        Audit storage a = audits[auditId];
        require(a.status == AuditStatus.Pending, "No esta pendiente");
        require(a.auditor == msg.sender, "No asignado a ti");

        a.status = AuditStatus.Accepted;
        a.acceptedAt = block.timestamp;
        a.currentPhase = AuditPhase.Analisis;

        emit AuditAccepted(auditId, msg.sender);
    }

    // -----------------
    // SUBIR DOCUMENTOS POR FASE
    // -----------------
    function submitDocument(uint256 auditId, AuditPhase phase, string memory ipfsHash) external onlyRole(AUDITOR_ROLE) {
        Audit storage a = audits[auditId];
        require(a.auditor == msg.sender, "No autorizado");
        require(a.status == AuditStatus.Accepted || a.status == AuditStatus.InProgress, "Estado invalido");

        a.status = AuditStatus.InProgress;
        a.currentPhase = phase;

        a.documents.push(Document({ ipfsHash: ipfsHash, phase: phase, timestamp: block.timestamp }));

        emit DocumentSubmitted(auditId, phase, ipfsHash);
    }

    // -----------------
    // FINALIZAR AUDITORÍA
    // -----------------
    function finalizeAudit(uint256 auditId, string memory opinion) external onlyRole(AUDITOR_ROLE) {
        Audit storage a = audits[auditId];
        require(a.auditor == msg.sender, "No autorizado");
        require(a.status == AuditStatus.InProgress, "Estado invalido");

        a.status = AuditStatus.Finalized;
        a.finalizedAt = block.timestamp;
        a.finalOpinion = opinion;

        emit AuditFinalized(auditId, msg.sender, opinion);
    }

    // -----------------
    // CONSULTAS
    // -----------------
    function getAudit(uint256 auditId) external view returns (Audit memory) {
        return audits[auditId];
    }

    function getAllAudits() external view returns (Audit[] memory) {
        Audit[] memory list = new Audit[](auditCounter);
        for (uint256 i = 1; i <= auditCounter; i++) {
            list[i - 1] = audits[i];
        }
        return list;
    }

    // -----------------
    // UTILIDADES
    // -----------------
    function _pickRandomAuditor() internal view returns (address) {
        require(auditors.length > 0, "No hay auditores");
        uint256 index = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, auditCounter))) % auditors.length;
        return auditors[index];
    }
}
