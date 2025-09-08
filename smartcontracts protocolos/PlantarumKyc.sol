// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract PlantarumKYC is Initializable, UUPSUpgradeable, AccessControlUpgradeable {
    // -----------------
    // Roles
    // -----------------
    bytes32 public constant SUPER_ADMIN_ROLE = keccak256("SUPER_ADMIN_ROLE");
    bytes32 public constant KYC_AUTHORITY_ROLE = keccak256("KYC_AUTHORITY_ROLE");

    // -----------------
    // DAO reference
    // -----------------
    address public daoAddress;

    // -----------------
    // KYC storage
    // -----------------
    enum Status { None, Verified, Revoked }

    struct KYCData {
        string hashId;   // hash de la info off-chain
        Status status;
    }

    mapping(address => KYCData) private kycRegistry;

    // -----------------
    // Eventos
    // -----------------
    event KYCRegistered(address indexed user, string hashId);
    event KYCRevoked(address indexed user);

    // -----------------
    // Inicializador
    // -----------------
    function initialize(address _superAdmin, address _dao) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        daoAddress = _dao;

        _grantRole(DEFAULT_ADMIN_ROLE, _superAdmin);
        _grantRole(SUPER_ADMIN_ROLE, _superAdmin);
    }

    // -----------------
    // Funciones críticas
    // -----------------

    /// @notice Registra un usuario con hashId de su KYC off-chain
    function registerKYC(address user, string memory hashId) external onlyRole(KYC_AUTHORITY_ROLE) {
        require(user != address(0), "Direccion invalida");
        require(bytes(hashId).length > 0, "HashId requerido");

        kycRegistry[user] = KYCData({
            hashId: hashId,
            status: Status.Verified
        });

        emit KYCRegistered(user, hashId);
    }

    /// @notice Consulta si el usuario tiene KYC válido
    function isKYCVerified(address user) external view returns (bool) {
        return kycRegistry[user].status == Status.Verified;
    }

    /// @notice Revoca el KYC (derecho al olvido)
    function revokeKYC(address user) external onlyRole(SUPER_ADMIN_ROLE) {
        require(kycRegistry[user].status == Status.Verified, "No verificado");
        kycRegistry[user].status = Status.Revoked;
        emit KYCRevoked(user);
    }

    /// @notice Devuelve el estado actual del KYC
    function getKYCStatus(address user) external view returns (string memory) {
        if (kycRegistry[user].status == Status.Verified) return "Verified";
        if (kycRegistry[user].status == Status.Revoked) return "Revoked";
        return "None";
    }

    // -----------------
    // Upgrade
    // -----------------
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(SUPER_ADMIN_ROLE) {}
}
