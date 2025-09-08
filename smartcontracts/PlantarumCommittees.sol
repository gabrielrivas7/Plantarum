// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract PlantarumCommittees is Initializable, AccessControlUpgradeable {
    // ----------------------
    // Roles
    // ----------------------
    bytes32 public constant SUPER_ADMIN_ROLE = keccak256("SUPER_ADMIN_ROLE");

    // ----------------------
    // Dirección de la DAO
    // ----------------------
    address public daoAddress;

    // ----------------------
    // Structs
    // ----------------------
    struct Committee {
        uint256 id;
        string name;
        string description;
        string status; // Pendiente | Activo | Rechazado
        string image;
        uint256 createdAt;
        address[] committeeMembers;
        mapping(address => bool) isCommitteeMember;
        mapping(address => bool) joinRequests;
        uint256 membersCount;
    }

    struct CommitteeProposal {
        uint256 id;
        uint256 committeeId;
        address creator;
        string title;
        string description;
        string status; // vigente | aceptada | rechazada
        uint256 createdAt;
        uint256 deadline;
        string hashId;
        string fileHash;
        uint256 votesFor;
        uint256 votesAgainst;
    }

    // 🔹 Vista simplificada (para evitar mappings en retornos)
    struct CommitteeView {
        uint256 id;
        string name;
        string description;
        string status;
        string image;
        uint256 createdAt;
        uint256 membersCount;
    }

    // ----------------------
    // Storage
    // ----------------------
    uint256 public committeeCount;
    uint256 public committeeProposalCount;

    mapping(uint256 => Committee) public committees;
    mapping(uint256 => CommitteeProposal) public committeeProposals;

    // Anti-doble voto
    mapping(uint256 => mapping(address => bool)) public committeeHasVoted;

    // ----------------------
    // Eventos
    // ----------------------
    event CommitteeCreated(uint256 indexed id, string name);
    event CommitteeApproved(uint256 indexed id);
    event CommitteeRejected(uint256 indexed id);
    event CommitteeRemoved(uint256 indexed id);
    event CommitteeImageUpdated(uint256 indexed id, string newImage);

    event CommitteeJoinRequested(uint256 indexed id, address indexed applicant);
    event CommitteeJoinApproved(uint256 indexed id, address indexed applicant, address indexed approver);
    event CommitteeJoinRejected(uint256 indexed id, address indexed applicant, address indexed rejector);
    event CommitteeMemberRemoved(uint256 indexed id, address indexed member);

    event CommitteeProposalCreated(uint256 indexed proposalId, uint256 indexed committeeId, string title, address indexed creator);
    event CommitteeProposalVoted(uint256 indexed proposalId, uint256 indexed committeeId, address indexed voter, bool support);
    event CommitteeProposalExecuted(uint256 indexed proposalId, uint256 indexed committeeId, string status);

    // ----------------------
    // Inicializador
    // ----------------------
    function initialize(address _daoAddress, address superAdmin) public initializer {
        __AccessControl_init();
        daoAddress = _daoAddress;

        _grantRole(DEFAULT_ADMIN_ROLE, superAdmin);
        _grantRole(SUPER_ADMIN_ROLE, superAdmin);
    }

    // ----------------------
    // Modifiers
    // ----------------------
    modifier onlyDao() {
        require(msg.sender == daoAddress, "Solo DAO autorizado");
        _;
    }

    modifier onlyActiveCommittee(uint256 id) {
        require(keccak256(bytes(committees[id].status)) == keccak256("Activo"), "Comite inactivo");
        _;
    }

    modifier onlyCommitteeMember(uint256 id) {
        require(committees[id].isCommitteeMember[msg.sender], "No es miembro del comite");
        _;
    }

	    // ----------------------
    // Funciones de Comités
    // ----------------------
    function createCommittee(
        string memory _name,
        string memory _description,
        string memory _image
    ) external onlyDao {
        committeeCount++;
        Committee storage c = committees[committeeCount];
        c.id = committeeCount;
        c.name = _name;
        c.description = _description;
        c.status = "Pendiente";
        c.image = _image;
        c.createdAt = block.timestamp;
        c.membersCount = 0;

        emit CommitteeCreated(committeeCount, _name);
    }

    function approveCommittee(uint256 id) external onlyDao {
        require(committees[id].id != 0, "No existe");
        committees[id].status = "Activo";
        emit CommitteeApproved(id);
    }

    function rejectCommittee(uint256 id) external onlyDao {
        require(committees[id].id != 0, "No existe");
        committees[id].status = "Rechazado";
        emit CommitteeRejected(id);
    }

    function updateCommitteeImage(uint256 id, string memory newImage) external onlyDao {
        committees[id].image = newImage;
        emit CommitteeImageUpdated(id, newImage);
    }

    function removeCommittee(uint256 id) external onlyDao {
        delete committees[id];
        emit CommitteeRemoved(id);
    }

    // 🔹 Consultar todos los comités
    function getAllCommittees() external view returns (CommitteeView[] memory) {
        CommitteeView[] memory list = new CommitteeView[](committeeCount);
        for (uint i = 1; i <= committeeCount; i++) {
            Committee storage c = committees[i];
            list[i - 1] = CommitteeView({
                id: c.id,
                name: c.name,
                description: c.description,
                status: c.status,
                image: c.image,
                createdAt: c.createdAt,
                membersCount: c.membersCount
            });
        }
        return list;
    }

    // 🔹 Consultar comité por ID
    function getCommitteeById(uint256 id) external view returns (CommitteeView memory) {
        Committee storage c = committees[id];
        return CommitteeView({
            id: c.id,
            name: c.name,
            description: c.description,
            status: c.status,
            image: c.image,
            createdAt: c.createdAt,
            membersCount: c.membersCount
        });
    }

    // ----------------------
    // Funciones de miembros de comité
    // ----------------------
    function requestJoinCommittee(uint256 id) external onlyActiveCommittee(id) {
        require(!committees[id].isCommitteeMember[msg.sender], "Ya miembro");
        committees[id].joinRequests[msg.sender] = true;
        emit CommitteeJoinRequested(id, msg.sender);
    }

    function approveJoinCommittee(uint256 id, address applicant) 
        external onlyActiveCommittee(id) onlyCommitteeMember(id) 
    {
        require(committees[id].joinRequests[applicant], "No solicitado");
        committees[id].isCommitteeMember[applicant] = true;
        committees[id].committeeMembers.push(applicant);
        committees[id].membersCount++;
        committees[id].joinRequests[applicant] = false;
        emit CommitteeJoinApproved(id, applicant, msg.sender);
    }

    function rejectJoinCommittee(uint256 id, address applicant) 
        external onlyActiveCommittee(id) onlyCommitteeMember(id) 
    {
        require(committees[id].joinRequests[applicant], "No solicitado");
        committees[id].joinRequests[applicant] = false;
        emit CommitteeJoinRejected(id, applicant, msg.sender);
    }

    function removeCommitteeMember(uint256 id, address member) external onlyDao {
        require(committees[id].isCommitteeMember[member], "No miembro");
        committees[id].isCommitteeMember[member] = false;
        emit CommitteeMemberRemoved(id, member);
    }

    // ----------------------
    // Propuestas internas de comité
    // ----------------------
    function createCommitteeProposal(
        uint256 id,
        string memory title,
        string memory description,
        uint256 deadline,
        string memory hashId,
        string memory fileHash
    ) external onlyCommitteeMember(id) onlyActiveCommittee(id) {
        committeeProposalCount++;
        committeeProposals[committeeProposalCount] = CommitteeProposal(
            committeeProposalCount,
            id,
            msg.sender,
            title,
            description,
            "vigente",
            block.timestamp,
            deadline,
            hashId,
            fileHash,
            0,
            0
        );
        emit CommitteeProposalCreated(committeeProposalCount, id, title, msg.sender);
    }

    function voteCommitteeProposal(uint256 propId, bool support) external {
        CommitteeProposal storage cp = committeeProposals[propId];
        require(block.timestamp <= cp.deadline, "Caducada");
        require(committees[cp.committeeId].isCommitteeMember[msg.sender], "No miembro comite");
        require(!committeeHasVoted[propId][msg.sender], "Ya votaste");

        committeeHasVoted[propId][msg.sender] = true;
        if (support) {
            cp.votesFor++;
        } else {
            cp.votesAgainst++;
        }
        emit CommitteeProposalVoted(propId, cp.committeeId, msg.sender, support);
    }

    function executeCommitteeProposal(uint256 propId) external {
        CommitteeProposal storage cp = committeeProposals[propId];
        require(block.timestamp > cp.deadline, "Aun vigente");
        if (cp.votesFor > cp.votesAgainst) {
            cp.status = "aceptada";
        } else {
            cp.status = "rechazada";
        }
        emit CommitteeProposalExecuted(propId, cp.committeeId, cp.status);
    }

    function getAllCommitteeProposals(uint256 committeeId) external view returns (CommitteeProposal[] memory) {
        uint count=0;
        for(uint i=1; i<=committeeProposalCount; i++){ 
            if(committeeProposals[i].committeeId == committeeId){ count++; } 
        }
        CommitteeProposal[] memory list = new CommitteeProposal[](count);
        uint idx=0;
        for(uint i=1; i<=committeeProposalCount; i++){ 
            if(committeeProposals[i].committeeId == committeeId){ 
                list[idx] = committeeProposals[i]; 
                idx++; 
            } 
        }
        return list;
    }

    function getCommitteeProposalById(uint256 id) external view returns (CommitteeProposal memory) {
        return committeeProposals[id];
    }
}

