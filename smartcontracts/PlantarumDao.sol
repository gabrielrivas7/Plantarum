// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

contract PlantarumDAO is Initializable, UUPSUpgradeable, AccessControlUpgradeable, ReentrancyGuardUpgradeable {
    // ----------------------
    // Roles base
    // ----------------------
    bytes32 public constant SUPER_ADMIN_ROLE = keccak256("SUPER_ADMIN_ROLE");
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");

    // ----------------------
    // Roles para tokenización
    // ----------------------
    bytes32 public constant ROLE_COMMITTEE_CONSERVATION = keccak256("ROLE_COMMITTEE_CONSERVATION");
    bytes32 public constant ROLE_COMMITTEE_PROJECTS = keccak256("ROLE_COMMITTEE_PROJECTS");
    bytes32 public constant ROLE_COMMITTEE_CARBON = keccak256("ROLE_COMMITTEE_CARBON");

    // ----------------------
    // Token PLNTX
    // ----------------------
    IERC20Upgradeable public plantarumToken;
    uint256 public membershipFee;
    uint256 public membershipRequestValidity; // default 7 días

    // ----------------------
    // Storage estructuras
    // ----------------------
    struct Member {
        address wallet;
        string aliasName;
        string personaType;
        string memberType;
        string status; // Pendiente | Activo | Rechazado | Vencida
        string image;
        uint256 joinedAt;
    }

    struct Proposal {
        uint256 id;
        address creator;
        string title;
        string description;
        string proposalType;
        string fileHash;
        string status;   // vigente | aceptada | rechazada
        uint256 createdAt;
        uint256 deadline;
        string hashId;
        uint256 votesFor;
        uint256 votesAgainst;
    }

    // ----------------------
    // Storage principal
    // ----------------------
    uint256 public proposalCount;
    address[] public memberList;

    mapping(address => Member) public members;
    mapping(uint256 => Proposal) public proposals;

    // Anti-doble voto
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // Duraciones permitidas de propuestas
    uint256[] public proposalDurations;

    bool public paused;

    // ----------------------
    // Multisig propio
    // ----------------------
    address[5] public multisigAdmins;
    bool public multisigActive;
    mapping(bytes32 => mapping(address => bool)) public confirmations;
    mapping(bytes32 => uint256) public confirmationCount;

    // ----------------------
    // Eventos
    // ----------------------
    event MemberJoined(address indexed wallet, string aliasName);
    event MemberImageUpdated(address indexed wallet, string newImage);
    event MemberRemoved(address indexed wallet);
    event MemberApproved(address indexed wallet);
    event MemberRejected(address indexed wallet);
    event MemberExpired(address indexed wallet);

    event ProposalCreated(uint256 indexed id, string title, address indexed creator);
    event ProposalVoted(uint256 indexed id, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed id, string status);
    event ProposalApproved(uint256 indexed id);
    event ProposalRejected(uint256 indexed id);
    event ProposalRemoved(uint256 indexed id);

    event MembershipFeeUpdated(uint256 newFee);
    event MembershipValidityUpdated(uint256 newValidity);
    event ProposalDurationsUpdated(uint256[] newDurations);
    event Paused(address indexed by);
    event Unpaused(address indexed by);
    event TokenAddressChanged(address newToken);

    event MultisigActivated(address[5] admins);

    // ----------------------
    // Eventos nuevos (roles comités)
    // ----------------------
    event CommitteeRoleGranted(address indexed account, bytes32 indexed role);
    event CommitteeRoleRevoked(address indexed account, bytes32 indexed role);

    // ----------------------
    // Inicializador
    // ----------------------
    function initialize(address tokenAddress, address superAdmin) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        plantarumToken = IERC20Upgradeable(tokenAddress);
        membershipFee = 5 * 10 ** 18;
        membershipRequestValidity = 7 days;

        proposalDurations.push(1 days);
        proposalDurations.push(2 days);
        proposalDurations.push(3 days);
        proposalDurations.push(7 days);
        proposalDurations.push(14 days);
        proposalDurations.push(21 days);

        _grantRole(DEFAULT_ADMIN_ROLE, superAdmin);
        _grantRole(SUPER_ADMIN_ROLE, superAdmin);
    }

    modifier notPaused() {
        require(!paused, "DAO pausada");
        _;
    }
	

	// ----------------------
    // Nuevas funciones: roles de comité
    // ----------------------
    function grantCommitteeRole(address account, string memory roleType) external onlyAdmin {
        bytes32 role;
        if (keccak256(bytes(roleType)) == keccak256("CONSERVATION")) {
            role = ROLE_COMMITTEE_CONSERVATION;
        } else if (keccak256(bytes(roleType)) == keccak256("PROJECTS")) {
            role = ROLE_COMMITTEE_PROJECTS;
        } else if (keccak256(bytes(roleType)) == keccak256("CARBON")) {
            role = ROLE_COMMITTEE_CARBON;
        } else {
            revert("Tipo de role invalido");
        }

        _grantRole(role, account);
        emit CommitteeRoleGranted(account, role);
    }

    function revokeCommitteeRole(address account, string memory roleType) external onlyAdmin {
        bytes32 role;
        if (keccak256(bytes(roleType)) == keccak256("CONSERVATION")) {
            role = ROLE_COMMITTEE_CONSERVATION;
        } else if (keccak256(bytes(roleType)) == keccak256("PROJECTS")) {
            role = ROLE_COMMITTEE_PROJECTS;
        } else if (keccak256(bytes(roleType)) == keccak256("CARBON")) {
            role = ROLE_COMMITTEE_CARBON;
        } else {
            revert("Tipo de role invalido");
        }

        _revokeRole(role, account);
        emit CommitteeRoleRevoked(account, role);
    }


	// ----------------------
    // Miembros DAO
    // ----------------------
    function joinDAO(string memory _alias,string memory _personaType,string memory _memberType,string memory _image) 
        external notPaused nonReentrant 
    {
        require(members[msg.sender].wallet == address(0), "Ya es miembro");
        require(plantarumToken.transferFrom(msg.sender, address(this), membershipFee), "Pago fallido");

        members[msg.sender] = Member(msg.sender,_alias,_personaType,_memberType,"Pendiente",_image,block.timestamp);
        memberList.push(msg.sender);
        emit MemberJoined(msg.sender, _alias);
    }

    function approveMember(address account) external onlyAdmin notPaused {
        require(members[account].wallet != address(0), "No existe");
        members[account].status = "Activo";
        _grantRole(MEMBER_ROLE, account);
        emit MemberApproved(account);
    }

    function rejectMember(address account) external onlyAdmin notPaused {
        require(members[account].wallet != address(0), "No existe");
        members[account].status = "Rechazado";
        emit MemberRejected(account);
    }

    function checkAndExpireMember(address account) public {
        if (keccak256(bytes(members[account].status)) == keccak256("Pendiente") &&
            block.timestamp > members[account].joinedAt + membershipRequestValidity) {
            members[account].status = "Vencida";
            emit MemberExpired(account);
        }
    }

    function updateMemberImage(string memory newImage) external notPaused {
        require(members[msg.sender].wallet != address(0), "No es miembro");
        members[msg.sender].image = newImage;
        emit MemberImageUpdated(msg.sender, newImage);
    }

    function getAllMembers() external view returns (Member[] memory) {
        Member[] memory list = new Member[](memberList.length);
        for (uint i = 0; i < memberList.length; i++) {
            list[i] = members[memberList[i]];
        }
        return list;
    }

    function getMemberById(address wallet) external view returns (Member memory) {
        return members[wallet];
    }

    // ----------------------
    // Propuestas DAO global
    // ----------------------
    function createProposal(string memory _title,string memory _description,string memory _proposalType,string memory _fileHash,uint256 durationIndex,string memory _hashId) 
        external onlyRole(MEMBER_ROLE) notPaused 
    {
        require(durationIndex < proposalDurations.length, "Duracion invalida");
        proposalCount++;
        proposals[proposalCount] = Proposal(proposalCount,msg.sender,_title,_description,_proposalType,_fileHash,"vigente",block.timestamp,block.timestamp+proposalDurations[durationIndex],_hashId,0,0);
        emit ProposalCreated(proposalCount, _title, msg.sender);
    }

    function voteProposal(uint256 proposalId,bool support) external onlyRole(MEMBER_ROLE) notPaused {
        Proposal storage p = proposals[proposalId];
        require(block.timestamp <= p.deadline, "Propuesta caducada");
        require(!hasVoted[proposalId][msg.sender], "Ya votaste");
        hasVoted[proposalId][msg.sender] = true;
        if (support) { p.votesFor++; } else { p.votesAgainst++; }
        emit ProposalVoted(proposalId,msg.sender,support);
    }

    function executeProposal(uint256 proposalId) external onlyAdmin notPaused {
        Proposal storage p = proposals[proposalId];
        require(block.timestamp > p.deadline, "Propuesta aun vigente");
        if (p.votesFor > p.votesAgainst) { p.status="aceptada"; } else { p.status="rechazada"; }
        emit ProposalExecuted(proposalId, p.status);
    }

    function approveProposal(uint256 id) external onlyAdmin notPaused {
        require(proposals[id].id != 0, "No existe");
        proposals[id].status = "aceptada";
        emit ProposalApproved(id);
    }

    function rejectProposal(uint256 id) external onlyAdmin notPaused {
        require(proposals[id].id != 0, "No existe");
        proposals[id].status = "rechazada";
        emit ProposalRejected(id);
    }

    function removeProposal(uint256 id) external onlyAdmin notPaused {
        require(proposals[id].id != 0, "No existe");
        delete proposals[id];
        emit ProposalRemoved(id);
    }

    function getAllProposals() external view returns (Proposal[] memory) {
        Proposal[] memory list = new Proposal[](proposalCount);
        for (uint i = 1; i <= proposalCount; i++) {
            list[i - 1] = proposals[i];
        }
        return list;
    }

    function getProposalById(uint256 id) external view returns (Proposal memory) {
        return proposals[id];
    }
			//2da
	// ----------------------
    // Admin / multisig
    // ----------------------
    function removeMember(address m) external onlyAdmin {
        delete members[m];
        _revokeRole(MEMBER_ROLE,m);
        emit MemberRemoved(m);
    }

    function setMembershipFee(uint256 newFee) external onlyAdmin {
        membershipFee=newFee;
        emit MembershipFeeUpdated(newFee);
    }

    function setMembershipRequestValidity(uint256 numDays) external onlyAdmin {
        membershipRequestValidity=numDays*1 days;
        emit MembershipValidityUpdated(membershipRequestValidity);
    }

    function setProposalDurations(uint256[] calldata durationsInDays) external onlyAdmin {
        delete proposalDurations;
        for(uint i=0;i<durationsInDays.length;i++){
            proposalDurations.push(durationsInDays[i]*1 days);
        }
        emit ProposalDurationsUpdated(proposalDurations);
    }

    function pause() external onlyAdmin {
        paused=true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyAdmin {
        paused=false;
        emit Unpaused(msg.sender);
    }

    function setTokenAddress(address newToken) external onlyAdmin {
        plantarumToken=IERC20Upgradeable(newToken);
        emit TokenAddressChanged(newToken);
    }

    function getDaoBalance() external view returns(uint256){
        return plantarumToken.balanceOf(address(this));
    }

    // ----------------------
    // Multisig
    // ----------------------
    function activateMultisig(address[5] calldata admins) external onlyRole(SUPER_ADMIN_ROLE) {
        require(!multisigActive,"Multisig activo");
        multisigAdmins=admins;
        multisigActive=true;
        emit MultisigActivated(admins);
    }

    function confirmAction(bytes32 actionHash) public {
        require(multisigActive,"No activo");
        require(isMultisigAdmin(msg.sender),"No admin");
        require(!confirmations[actionHash][msg.sender],"Ya confirmo");
        confirmations[actionHash][msg.sender]=true;
        confirmationCount[actionHash]++;
    }

    function isMultisigAdmin(address account) internal view returns(bool){
        for(uint i=0;i<5;i++){
            if(multisigAdmins[i]==account) return true;
        }
        return false;
    }

    function isMultisigApproved(bytes32 actionHash) internal view returns(bool){
        return confirmationCount[actionHash]>=3;
    }

    modifier onlyAdmin() {
        if (multisigActive) {
            bytes32 actionHash = keccak256(abi.encodePacked(msg.sig));
            require(isMultisigApproved(actionHash), "Faltan firmas multisig");
        } else {
            require(hasRole(SUPER_ADMIN_ROLE, msg.sender), "No autorizado");
        }
        _;
    }

    // ----------------------
    // UUPS upgrade
    // ----------------------
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(SUPER_ADMIN_ROLE) {}
}