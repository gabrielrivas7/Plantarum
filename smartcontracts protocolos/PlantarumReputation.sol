// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title PlantarumReputation
 * @notice Sistema de reputación de miembros de la DAO Plantarum
 * @dev Upgradeable, conectado a DAO y Treasury
 */

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

interface IPlantarumDAO {
    function hasRole(bytes32 role, address account) external view returns (bool);
}

interface IPlantarumTreasury {
    function depositETH() external payable;
}

contract PlantarumReputation is Initializable, UUPSUpgradeable, AccessControlUpgradeable, ReentrancyGuardUpgradeable {
    // ----------------------
    // Roles
    // ----------------------
    bytes32 public constant SUPER_ADMIN_ROLE = keccak256("SUPER_ADMIN_ROLE");
    bytes32 public constant DAO_ROLE = keccak256("DAO_ROLE");

    // ----------------------
    // Referencias externas
    // ----------------------
    address public daoAddress;
    address public treasuryAddress;

    // ----------------------
    // Storage de reputación
    // ----------------------
    mapping(address => uint256) private reputation;
    uint256 public maxReputation;
    uint256 public minReputation;

    // ----------------------
    // Eventos
    // ----------------------
    event ReputationIncreased(address indexed user, uint256 amount, uint256 newScore);
    event ReputationDecreased(address indexed user, uint256 amount, uint256 newScore);
    event ReputationReset(address indexed user);
    event ReputationParamsUpdated(uint256 minRep, uint256 maxRep);

    // ----------------------
    // Inicializador
    // ----------------------
    function initialize(address _superAdmin, address _dao, address _treasury) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _superAdmin);
        _grantRole(SUPER_ADMIN_ROLE, _superAdmin);

        daoAddress = _dao;
        treasuryAddress = _treasury;

        maxReputation = 100;
        minReputation = 0;

        emit ReputationParamsUpdated(minReputation, maxReputation);
    }

    // ----------------------
    // Modificadores
    // ----------------------
    modifier onlyDAOorAdmin() {
        require(
            hasRole(SUPER_ADMIN_ROLE, msg.sender) ||
            msg.sender == daoAddress,
            "No autorizado"
        );
        _;
    }

    // ----------------------
    // Funciones reputación
    // ----------------------
    function increaseReputation(address user, uint256 amount) external onlyDAOorAdmin {
        uint256 newScore = reputation[user] + amount;
        if (newScore > maxReputation) {
            newScore = maxReputation;
        }
        reputation[user] = newScore;
        emit ReputationIncreased(user, amount, newScore);
    }

    function decreaseReputation(address user, uint256 amount) external onlyDAOorAdmin {
        uint256 newScore = (reputation[user] > amount) ? reputation[user] - amount : minReputation;
        reputation[user] = newScore;
        emit ReputationDecreased(user, amount, newScore);
    }

    function resetReputation(address user) external onlyRole(SUPER_ADMIN_ROLE) {
        reputation[user] = minReputation;
        emit ReputationReset(user);
    }

    function getReputation(address user) external view returns (uint256) {
        return reputation[user];
    }

    function isTrusted(address user) external view returns (bool) {
        return reputation[user] >= (maxReputation / 2); // ejemplo: umbral >= 50%
    }

    // ----------------------
    // Configuración
    // ----------------------
    function setReputationBounds(uint256 _min, uint256 _max) external onlyRole(SUPER_ADMIN_ROLE) {
        require(_max > _min, "max debe ser mayor");
        minReputation = _min;
        maxReputation = _max;
        emit ReputationParamsUpdated(_min, _max);
    }

    // ----------------------
    // Upgrade
    // ----------------------
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(SUPER_ADMIN_ROLE) {}
}
