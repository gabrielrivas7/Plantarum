// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @author Gabriel Emilio de Jesus Rivas Mier y Teran
 * @notice Trabajo de Fin de Máster (TFM) - Universidad de Salamanca
 * @title PlantarumRgpd
 * @notice Registro de referencias hashId para cumplimiento del RGPD
 * @dev Solo guarda hashIds (referencias off-chain). Datos personales NUNCA en blockchain.
 *      Compatible con DAO y demás contratos de Plantarum.
 */

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

interface IPlantarumDAO {
    function hasRole(bytes32 role, address account) external view returns (bool);
}

contract PlantarumRGPD is Initializable, UUPSUpgradeable, AccessControlUpgradeable {
    // -------------------------
    // Roles
    // -------------------------
    bytes32 public constant SUPER_ADMIN_ROLE = keccak256("SUPER_ADMIN_ROLE");
    bytes32 public constant ROLE_DPO = keccak256("ROLE_DPO"); // Data Protection Officer

    // -------------------------
    // Referencia DAO
    // -------------------------
    address public daoAddress;

    // -------------------------
    // Registro de hashIds
    // -------------------------
    struct RGPDRecord {
        string hashId;       // hash del dato off-chain
        address creator;     // quién lo registró
        uint256 timestamp;   // cuándo se registró
        bool active;         // estado del registro
    }

    mapping(string => RGPDRecord) public records; // hashId => registro
    string[] public allHashIds; // lista de hashIds registrados

    // -------------------------
    // Eventos
    // -------------------------
    event HashRegistered(string hashId, address indexed creator, uint256 timestamp);
    event HashDeleted(string hashId, address indexed by);

    // -------------------------
    // Inicializador
    // -------------------------
    function initialize(address _dao, address _superAdmin) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        daoAddress = _dao;

        _grantRole(DEFAULT_ADMIN_ROLE, _superAdmin);
        _grantRole(SUPER_ADMIN_ROLE, _superAdmin);
    }

    // -------------------------
    // Registrar hash (sólo miembros DAO)
    // -------------------------
    function registerHash(string memory hashId) external {
        require(
            IPlantarumDAO(daoAddress).hasRole(keccak256("MEMBER_ROLE"), msg.sender) ||
            hasRole(SUPER_ADMIN_ROLE, msg.sender),
            "No autorizado"
        );

        require(!records[hashId].active, "Hash ya registrado");

        records[hashId] = RGPDRecord({
            hashId: hashId,
            creator: msg.sender,
            timestamp: block.timestamp,
            active: true
        });

        allHashIds.push(hashId);

        emit HashRegistered(hashId, msg.sender, block.timestamp);
    }

    // -------------------------
    // Eliminar hash (derecho al olvido)
    // -------------------------
    function deleteHash(string memory hashId) external {
        require(
            hasRole(SUPER_ADMIN_ROLE, msg.sender) ||
            hasRole(ROLE_DPO, msg.sender),
            "Solo DPO/Admin puede eliminar"
        );

        require(records[hashId].active, "Hash no encontrado");

        records[hashId].active = false;

        emit HashDeleted(hashId, msg.sender);
    }

    // -------------------------
    // Consultar estado hash
    // -------------------------
    function isHashActive(string memory hashId) external view returns (bool) {
        return records[hashId].active;
    }

    function getAllHashIds() external view returns (string[] memory) {
        return allHashIds;
    }

    // -------------------------
    // Upgrade
    // -------------------------
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(SUPER_ADMIN_ROLE) {}
}
