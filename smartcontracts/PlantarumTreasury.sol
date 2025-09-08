// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PlantarumTreasury - Tesorería central de la DApp Plantarum
 * @author Gabriel Emilio de Jesus Rivas Mier Y Teran
 * @notice Trabajo de Fin de Máster (TFM) - Universidad de Salamanca - Septiembre 2025
 * @custom:version 1.1.0
 */
contract PlantarumTreasury is 
    Initializable, 
    AccessControlUpgradeable, 
    UUPSUpgradeable, 
    ReentrancyGuardUpgradeable 
{
    bytes32 public constant TREASURY_ADMIN_ROLE = keccak256("TREASURY_ADMIN_ROLE");

    // -------------------
    // Vínculo DAO
    // -------------------
    address public daoAddress;

    // -------------------
    // Tokens soportados
    // -------------------
    mapping(address => bool) public supportedTokens;
    address[] private tokenList;

    // -------------------
    // Eventos
    // -------------------
    event Deposit(address indexed from, address indexed token, uint256 amount, uint256 timestamp);
    event Withdraw(address indexed to, address indexed token, uint256 amount, uint256 timestamp);
    event TokenSupported(address token, bool status);
    event DaoLinked(address indexed dao);
    event MultiTransfer(address indexed token, uint256 total, uint256 count);

    /// @notice Inicializa el contrato vinculado al SuperAdmin (mismo que la DAO)
    function initialize(address superAdmin) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, superAdmin);
        _grantRole(TREASURY_ADMIN_ROLE, superAdmin);
    }

    /// @notice Autorización de upgrades
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    // ---------------- Admin Controls ----------------

    function addSupportedToken(address token) external onlyRole(TREASURY_ADMIN_ROLE) {
        require(!supportedTokens[token], "Already supported");
        supportedTokens[token] = true;
        tokenList.push(token);
        emit TokenSupported(token, true);
    }

    function removeSupportedToken(address token) external onlyRole(TREASURY_ADMIN_ROLE) {
        require(supportedTokens[token], "Not supported");
        supportedTokens[token] = false;
        emit TokenSupported(token, false);
    }

    // ---------------- Vinculación DAO ----------------

    function setDaoAddress(address _dao) external onlyRole(TREASURY_ADMIN_ROLE) {
        require(_dao != address(0), "DAO invalida");
        daoAddress = _dao;
        emit DaoLinked(_dao);
    }

    function getDaoAddress() external view returns (address) {
        return daoAddress;
    }

    // ---------------- ETH ----------------

    function depositETH() external payable {
        emit Deposit(msg.sender, address(0), msg.value, block.timestamp);
    }

    function withdrawETH(address payable to, uint256 amount) 
        external 
        onlyRole(TREASURY_ADMIN_ROLE) 
        nonReentrant 
    {
        require(address(this).balance >= amount, "Insufficient balance");
        to.transfer(amount);
        emit Withdraw(to, address(0), amount, block.timestamp);
    }

    // ---------------- ERC20 ----------------

    function depositToken(address token, uint256 amount) external {
        require(supportedTokens[token], "Token not supported");
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit Deposit(msg.sender, token, amount, block.timestamp);
    }

    function withdrawToken(address token, address to, uint256 amount) 
        external 
        onlyRole(TREASURY_ADMIN_ROLE) 
        nonReentrant 
    {
        require(supportedTokens[token], "Token not supported");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");
        IERC20(token).transfer(to, amount);
        emit Withdraw(to, token, amount, block.timestamp);
    }

    // ---------------- Multi-Transfer ----------------

    function multiTransferETH(address[] calldata recipients, uint256[] calldata amounts) 
        external 
        onlyRole(TREASURY_ADMIN_ROLE) 
        nonReentrant 
    {
        require(recipients.length == amounts.length, "Arrays mismatch");
        uint256 total = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            total += amounts[i];
            payable(recipients[i]).transfer(amounts[i]);
        }
        emit MultiTransfer(address(0), total, recipients.length);
    }

    function multiTransferToken(address token, address[] calldata recipients, uint256[] calldata amounts) 
        external 
        onlyRole(TREASURY_ADMIN_ROLE) 
        nonReentrant 
    {
        require(supportedTokens[token], "Token not supported");
        require(recipients.length == amounts.length, "Arrays mismatch");

        uint256 total = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            total += amounts[i];
            require(IERC20(token).transfer(recipients[i], amounts[i]), "Transfer failed");
        }
        emit MultiTransfer(token, total, recipients.length);
    }

    // ---------------- View Functions ----------------

    function getETHBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getTokenBalance(address token) public view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    function getSupportedTokens() public view returns (address[] memory) {
        return tokenList;
    }

    function getAllBalances() public view returns (uint256 ethBalance, uint256[] memory erc20Balances) {
        ethBalance = address(this).balance;
        uint256 len = tokenList.length;
        erc20Balances = new uint256[](len);
        for (uint256 i = 0; i < len; i++) {
            erc20Balances[i] = IERC20(tokenList[i]).balanceOf(address(this));
        }
    }

//Lote2
	    // ---------------- Escrow Interno ----------------

    struct Reserve {
        address token;        // ETH = address(0), o ERC20 soportado
        address beneficiary;  // Proyecto o creador que recibirá
        uint256 amount;       // Monto en reserva
        bool released;        // Estado de la reserva
        uint256 createdAt;    // Timestamp de creación
        uint256 releaseDate;  // Fecha mínima para liberar
    }

    mapping(bytes32 => Reserve) public reserves;

    event ReserveCreated(bytes32 indexed reserveId, address indexed token, address indexed beneficiary, uint256 amount, uint256 releaseDate);
    event ReserveReleased(bytes32 indexed reserveId, address indexed token, address indexed beneficiary, uint256 amount);

    /// @notice Crear una reserva de fondos (escrow) vinculada a un proyecto
    function createReserve(
        address token,
        address beneficiary,
        uint256 amount,
        uint256 releaseDate
    ) external onlyRole(TREASURY_ADMIN_ROLE) nonReentrant {
        require(beneficiary != address(0), "Beneficiario invalido");
        require(amount > 0, "Monto invalido");

        bytes32 reserveId = keccak256(abi.encodePacked(token, beneficiary, amount, block.timestamp));
        require(reserves[reserveId].amount == 0, "Reserva ya existe");

        if (token == address(0)) {
            require(address(this).balance >= amount, "ETH insuficiente");
        } else {
            require(supportedTokens[token], "Token no soportado");
            require(IERC20(token).balanceOf(address(this)) >= amount, "Saldo insuficiente");
        }

        reserves[reserveId] = Reserve({
            token: token,
            beneficiary: beneficiary,
            amount: amount,
            released: false,
            createdAt: block.timestamp,
            releaseDate: releaseDate
        });

        emit ReserveCreated(reserveId, token, beneficiary, amount, releaseDate);
    }

    /// @notice Liberar fondos previamente reservados
    function releaseReserve(bytes32 reserveId) external nonReentrant {
        Reserve storage r = reserves[reserveId];
        require(r.amount > 0, "Reserva inexistente");
        require(!r.released, "Ya liberada");
        require(block.timestamp >= r.releaseDate, "Aun bloqueada");

        r.released = true;

        if (r.token == address(0)) {
            payable(r.beneficiary).transfer(r.amount);
        } else {
            IERC20(r.token).transfer(r.beneficiary, r.amount);
        }

        emit ReserveReleased(reserveId, r.token, r.beneficiary, r.amount);
    }

    /// @notice Verificar si una reserva está activa
    function isReserveActive(bytes32 reserveId) external view returns (bool) {
        return reserves[reserveId].amount > 0 && !reserves[reserveId].released;
    }
//Lote3
	    // ---------------- Sweep & Emergency Stop ----------------

    event TokenSwept(address indexed token, address indexed to, uint256 amount);
    event EmergencyStopped(address indexed by, uint256 timestamp);
    event EmergencyResumed(address indexed by, uint256 timestamp);

    bool public emergencyStop; // bandera global de bloqueo

    /// @notice Activa el modo de emergencia (bloquea retiros y reservas)
    function activateEmergencyStop() external onlyRole(TREASURY_ADMIN_ROLE) {
        emergencyStop = true;
        emit EmergencyStopped(msg.sender, block.timestamp);
    }

    /// @notice Desactiva el modo de emergencia
    function deactivateEmergencyStop() external onlyRole(TREASURY_ADMIN_ROLE) {
        emergencyStop = false;
        emit EmergencyResumed(msg.sender, block.timestamp);
    }

    /// @notice Sweep de tokens accidentales enviados a la Tesorería
    /// @dev Solo Admin. No afecta tokens soportados oficialmente.
    function sweepToken(address token, address to) external onlyRole(TREASURY_ADMIN_ROLE) nonReentrant {
        require(to != address(0), "Destino invalido");
        require(!supportedTokens[token], "Token soportado: usar withdrawToken");

        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "Sin balance para barrer");

        IERC20(token).transfer(to, balance);
        emit TokenSwept(token, to, balance);
    }

    // ---------------- Overrides de seguridad ----------------

    /// @dev Modificador interno para bloquear funciones críticas si hay emergencyStop
    modifier whenNotEmergency() {
        require(!emergencyStop, "Emergency Stop activo");
        _;
    }

 }