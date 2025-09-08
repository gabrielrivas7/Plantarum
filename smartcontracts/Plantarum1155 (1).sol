// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title Plantarum1155 - Tokenización de Créditos de Carbono y Proyectos Forestales
 * @author Gabriel Emilio de Jesús Rivas Mier y Terán
 * @notice Trabajo de Fin de Máster (TFM) - Universidad de Salamanca. Septiembre 2025
 * @notice Contrato ERC1155 upgradeable para tokenizar créditos de carbono y proyectos de inversión forestal
 * @dev Incluye validaciones por roles de la DAO, tesorería para fees, venta directa y pagos multimoneda.
 *      Diferencia lógica de negocio entre Carbon (estándares ambientales) y Projects (rendimiento financiero).
 */

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @notice Interfaz mínima de la DAO para validar roles
interface IPlantarumDAO {
    function hasRole(bytes32 role, address account) external view returns (bool);
}

/// @notice Interfaz mínima de la Tesorería para registrar fees en ETH
interface IPlantarumTreasury {
    function depositETH() external payable;
}

contract Plantarum1155 is 
    ERC1155Upgradeable,
    ERC1155URIStorageUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable, 
    UUPSUpgradeable
{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    using SafeERC20Upgradeable for IERC20Upgradeable;

    // --------------------------
    // Roles DAO
    // --------------------------
    bytes32 public constant SUPER_ADMIN_ROLE = keccak256("SUPER_ADMIN_ROLE");
    bytes32 public constant ROLE_MEMBER = keccak256("ROLE_MEMBER");
    bytes32 public constant ROLE_COMMITTEE_CARBON = keccak256("ROLE_COMMITTEE_CARBON");
    bytes32 public constant ROLE_COMMITTEE_PROJECTS = keccak256("ROLE_COMMITTEE_PROJECTS");

    // --------------------------
    // DAO + Treasury
    // --------------------------
    address public daoAddress;
    address public treasury;

    // --------------------------
    // Metadata Créditos de Carbono
    // --------------------------
    struct CarbonMeta {
        address creator;
        string hashId;           
        string coords;           
        uint256 timestamp;       
        uint256 price;           
        uint256 supply;          
        string standard;         
        string projectType;      
        uint256 vintage;         
        string verificationBody; 
        uint256 expiryDate;      
        bool listed;             
        bool retired;            
    }

    // --------------------------
    // Metadata Proyectos Forestales
    // --------------------------
    struct ProjectMeta {
        address creator;
        string hashId;         
        string coords;         
        uint256 timestamp;     
        uint256 price;         
        uint256 supply;        
        uint256 maturityDate;  
        uint256 yieldPercent;  
        uint8 phases;          
        bool listed;           
        bool finalized;        
    }

    // --------------------------
    // Storage principal
    // --------------------------
    mapping(uint256 => CarbonMeta) public carbonMetas;
    mapping(uint256 => ProjectMeta) public projectMetas;
    mapping(string => bool) private usedHashIds;

    // --------------------------
    // Fees y Tokens Permitidos
    // --------------------------
    uint256 public feeVenta;    
    mapping(address => bool) public allowedTokens;

    // --------------------------
    // Eventos
    // --------------------------
    event CarbonMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string hashId,
        uint256 supply,
        uint256 price,
        string standard,
        string projectType,
        uint256 vintage,
        string verificationBody,
        uint256 expiryDate
    );

    event ProjectMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string hashId,
        uint256 supply,
        uint256 price,
        uint256 maturityDate,
        uint256 yieldPercent,
        uint8 phases
    );

    event AssetListed(uint256 indexed tokenId, uint256 price);
    event AssetSold(uint256 indexed tokenId, address buyer, uint256 amount);
    event AssetSoldERC20(uint256 indexed tokenId, address indexed buyer, address indexed token, uint256 amount);
    event TokenBurned(uint256 indexed tokenId, address by);
    event FeeUpdated(string tipo, uint256 nuevoFee);
    event TokenAllowed(address token, bool allowed);

    // --------------------------
    // Initialize
    // --------------------------
    function initialize(address _superAdmin, address _dao, address _treasury) public initializer {
        __ERC1155_init("");
        __ERC1155URIStorage_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        daoAddress = _dao;
        treasury = _treasury;

        _grantRole(DEFAULT_ADMIN_ROLE, _superAdmin);
        _grantRole(SUPER_ADMIN_ROLE, _superAdmin);

        feeVenta = 100;    // 1% (basis points)

        emit FeeUpdated("venta", feeVenta);
    }

//lote 2
    // --------------------------
    // Mint Créditos de Carbono
    // --------------------------
    function mintCarbon(
        address to,
        string memory hashId,
        string memory coords,
        string memory tokenURI,
        uint256 supply,
        uint256 price,
        string memory standard,         // Ej: Verra, Gold Standard
        string memory projectType,      // Ej: Reforestación, REDD+
        uint256 vintage,                // Año del crédito
        string memory verificationBody, // Entidad certificadora
        uint256 expiryDate              // Fecha de expiración del crédito
    ) external {
        // 🔹 Solo Comité de Carbono o SuperAdmin
        require(
            IPlantarumDAO(daoAddress).hasRole(ROLE_COMMITTEE_CARBON, msg.sender) ||
            hasRole(SUPER_ADMIN_ROLE, msg.sender),
            "No autorizado para mintear Carbon"
        );

        require(!usedHashIds[hashId], "hashId ya usado");
        usedHashIds[hashId] = true;
        require(supply > 0, "Supply debe ser > 0");
        require(price > 0, "El precio debe ser > 0");

        _tokenIds.increment();
        uint256 newId = _tokenIds.current();

        // 🔹 Mint del lote ERC1155
        _mint(to, newId, supply, "");
        _setURI(newId, tokenURI);

        // 🔹 Registro metadata on-chain
        carbonMetas[newId] = CarbonMeta({
            creator: to,
            hashId: hashId,
            coords: coords,
            timestamp: block.timestamp,
            price: price,
            supply: supply,
            standard: standard,
            projectType: projectType,
            vintage: vintage,
            verificationBody: verificationBody,
            expiryDate: expiryDate,
            listed: true,     // Por defecto en venta
            retired: false
        });

        emit CarbonMinted(
            newId,
            to,
            hashId,
            supply,
            price,
            standard,
            projectType,
            vintage,
            verificationBody,
            expiryDate
        );
    }

    // --------------------------
    // Mint Proyectos Forestales
    // --------------------------
    function mintProject(
        address to,
        string memory hashId,
        string memory coords,
        string memory tokenURI,
        uint256 supply,
        uint256 price,
        uint256 maturityDate,  // Fecha de vencimiento del proyecto
        uint256 yieldPercent,  // Rendimiento esperado (%)
        uint8 phases           // Número de fases (ej. 3 fases de ejecución)
    ) external {
        // 🔹 Solo Comité de Proyectos o SuperAdmin
        require(
            IPlantarumDAO(daoAddress).hasRole(ROLE_COMMITTEE_PROJECTS, msg.sender) ||
            hasRole(SUPER_ADMIN_ROLE, msg.sender),
            "No autorizado para mintear Project"
        );

        require(!usedHashIds[hashId], "hashId ya usado");
        usedHashIds[hashId] = true;
        require(supply > 0, "Supply debe ser > 0");
        require(price > 0, "El precio debe ser > 0");
        require(maturityDate > block.timestamp, "Maturity debe ser futuro");
        require(yieldPercent > 0, "Yield debe ser > 0");

        _tokenIds.increment();
        uint256 newId = _tokenIds.current();

        // 🔹 Mint del lote ERC1155
        _mint(to, newId, supply, "");
        _setURI(newId, tokenURI);

        // 🔹 Registro metadata on-chain
        projectMetas[newId] = ProjectMeta({
            creator: to,
            hashId: hashId,
            coords: coords,
            timestamp: block.timestamp,
            price: price,
            supply: supply,
            maturityDate: maturityDate,
            yieldPercent: yieldPercent,
            phases: phases,
            listed: true,       // Por defecto en venta
            finalized: false
        });

        emit ProjectMinted(
            newId,
            to,
            hashId,
            supply,
            price,
            maturityDate,
            yieldPercent,
            phases
        );
    }
//lote3
	// --------------------------
    // Gestión de Ventas Carbon
    // --------------------------
    function listCarbonForSale(uint256 tokenId, uint256 price) external {
        CarbonMeta storage meta = carbonMetas[tokenId];
        require(meta.creator == msg.sender, "No eres el creador");
        require(price > 0, "El precio debe ser > 0");

        meta.listed = true;
        meta.price = price;

        emit AssetListed(tokenId, price);
    }

    function cancelCarbonSale(uint256 tokenId) external {
        CarbonMeta storage meta = carbonMetas[tokenId];
        require(meta.creator == msg.sender, "No eres el creador");

        meta.listed = false;
    }

    function buyCarbon(uint256 tokenId, uint256 amountToBuy) external payable nonReentrant {
        CarbonMeta storage meta = carbonMetas[tokenId];
        require(meta.listed, "No listado");
        require(amountToBuy > 0 && amountToBuy <= meta.supply, "Cantidad invalida");
        require(msg.value >= meta.price * amountToBuy, "ETH insuficiente");

        // Transferencia de tokens
        safeTransferFrom(meta.creator, msg.sender, tokenId, amountToBuy, "");

        // Fee dinámico
        uint256 totalPrice = meta.price * amountToBuy;
        uint256 fee = (totalPrice * feeVenta) / 10000;

        payable(meta.creator).transfer(totalPrice - fee);
        IPlantarumTreasury(treasury).depositETH{value: fee}();

        emit AssetSold(tokenId, msg.sender, totalPrice);
    }

    function buyCarbonERC20(
        uint256 tokenId,
        address token,
        uint256 amountToBuy,
        uint256 paymentAmount
    ) external nonReentrant {
        require(allowedTokens[token], "Token no permitido");

        CarbonMeta storage meta = carbonMetas[tokenId];
        require(meta.listed, "No listado");
        require(amountToBuy > 0 && amountToBuy <= meta.supply, "Cantidad invalida");
        require(paymentAmount >= meta.price * amountToBuy, "Monto insuficiente");

        IERC20Upgradeable(token).safeTransferFrom(msg.sender, address(this), paymentAmount);

        uint256 fee = (paymentAmount * feeVenta) / 10000;
        IERC20Upgradeable(token).safeTransfer(meta.creator, paymentAmount - fee);
        IERC20Upgradeable(token).safeTransfer(treasury, fee);

        safeTransferFrom(meta.creator, msg.sender, tokenId, amountToBuy, "");

        emit AssetSold(tokenId, msg.sender, paymentAmount);
        emit AssetSoldERC20(tokenId, msg.sender, token, paymentAmount);
    }

    // --------------------------
    // Gestión de Ventas Project
    // --------------------------
    function listProjectForSale(uint256 tokenId, uint256 price) external {
        ProjectMeta storage meta = projectMetas[tokenId];
        require(meta.creator == msg.sender, "No eres el creador");
        require(price > 0, "El precio debe ser > 0");

        meta.listed = true;
        meta.price = price;

        emit AssetListed(tokenId, price);
    }

    function cancelProjectSale(uint256 tokenId) external {
        ProjectMeta storage meta = projectMetas[tokenId];
        require(meta.creator == msg.sender, "No eres el creador");

        meta.listed = false;
    }

    function buyProject(uint256 tokenId, uint256 amountToBuy) external payable nonReentrant {
        ProjectMeta storage meta = projectMetas[tokenId];
        require(meta.listed, "No listado");
        require(amountToBuy > 0 && amountToBuy <= meta.supply, "Cantidad invalida");
        require(msg.value >= meta.price * amountToBuy, "ETH insuficiente");

        // Transferencia de tokens
        safeTransferFrom(meta.creator, msg.sender, tokenId, amountToBuy, "");

        // Fee dinámico
        uint256 totalPrice = meta.price * amountToBuy;
        uint256 fee = (totalPrice * feeVenta) / 10000;

        payable(meta.creator).transfer(totalPrice - fee);
        IPlantarumTreasury(treasury).depositETH{value: fee}();

        emit AssetSold(tokenId, msg.sender, totalPrice);
    }

    function buyProjectERC20(
        uint256 tokenId,
        address token,
        uint256 amountToBuy,
        uint256 paymentAmount
    ) external nonReentrant {
        require(allowedTokens[token], "Token no permitido");

        ProjectMeta storage meta = projectMetas[tokenId];
        require(meta.listed, "No listado");
        require(amountToBuy > 0 && amountToBuy <= meta.supply, "Cantidad invalida");
        require(paymentAmount >= meta.price * amountToBuy, "Monto insuficiente");

        IERC20Upgradeable(token).safeTransferFrom(msg.sender, address(this), paymentAmount);

        uint256 fee = (paymentAmount * feeVenta) / 10000;
        IERC20Upgradeable(token).safeTransfer(meta.creator, paymentAmount - fee);
        IERC20Upgradeable(token).safeTransfer(treasury, fee);

        safeTransferFrom(meta.creator, msg.sender, tokenId, amountToBuy, "");

        emit AssetSold(tokenId, msg.sender, paymentAmount);
        emit AssetSoldERC20(tokenId, msg.sender, token, paymentAmount);
    }
//lote 4
	// --------------------------
    // Fees y Monedas
    // --------------------------
    function setFeeVenta(uint256 _fee) external onlyRole(SUPER_ADMIN_ROLE) {
        require(_fee <= 1000, "Max 10%"); 
        feeVenta = _fee;
        emit FeeUpdated("venta", _fee);
    }

    function setAllowedToken(address token, bool allowed) external onlyRole(SUPER_ADMIN_ROLE) {
        allowedTokens[token] = allowed;
        emit TokenAllowed(token, allowed);
    }

    function isTokenAllowed(address token) external view returns (bool) {
        return allowedTokens[token];
    }

    // --------------------------
    // DAO Control
    // --------------------------
    function daoBurn(address owner, uint256 tokenId, uint256 amount) external {
        require(
            hasRole(SUPER_ADMIN_ROLE, msg.sender) ||
            IPlantarumDAO(daoAddress).hasRole(SUPER_ADMIN_ROLE, msg.sender),
            "No autorizado"
        );

        _burn(owner, tokenId, amount);
        emit TokenBurned(tokenId, msg.sender);
    }

    // --------------------------
    // Pausable
    // --------------------------
    function pause() external onlyRole(SUPER_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(SUPER_ADMIN_ROLE) {
        _unpause();
    }

    // --------------------------
    // Getters
    // --------------------------
    function getCarbonMeta(uint256 tokenId) external view returns (CarbonMeta memory) {
        return carbonMetas[tokenId];
    }

    function getProjectMeta(uint256 tokenId) external view returns (ProjectMeta memory) {
        return projectMetas[tokenId];
    }

    function getAllTokens() external view returns (uint256[] memory) {
        uint256 total = _tokenIds.current();
        uint256[] memory result = new uint256[](total);
        for (uint256 i = 1; i <= total; i++) {
            result[i - 1] = i;
        }
        return result;
    }

    // --------------------------
    // Upgrade (UUPS)
    // --------------------------
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(SUPER_ADMIN_ROLE)
    {}

    // --------------------------
    // Soporte de interfaces
    // --------------------------
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
	
	// --------------------------
    // Override de URI (resuelve conflicto ERC1155Upgradeable vs ERC1155URIStorageUpgradeable)
    // --------------------------
    function uri(uint256 tokenId)
        public
        view
        virtual
        override(ERC1155Upgradeable, ERC1155URIStorageUpgradeable)
        returns (string memory)
    {
        return super.uri(tokenId);
    }
}