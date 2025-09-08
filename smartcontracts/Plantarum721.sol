// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title Plantarum721 - Tokenización de Conservación y Activos Forestales
 * @author Gabriel Emilio de Jesus Rivas Mier y Teran
 * @notice Trabajo de Fin de Máster (TFM) - Universidad de Salamanca. Septiembre 2025
 * @notice Contrato ERC721 upgradeable para tokenizar bosques, lotes y activos forestales
 * @dev Integra gobernanza vía PlantarumDAO, tesorería para fees, venta directa y subastas.
 *      Incluye validaciones por roles de la DAO y extensiones upgradeables de OpenZeppelin.
 */

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface IPlantarumDAO {
    function hasRole(bytes32 role, address account) external view returns (bool);
}

interface IPlantarumTreasury {
    function depositETH() external payable;
}

contract Plantarum721 is 
    ERC721URIStorageUpgradeable,
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
    bytes32 public constant ROLE_COMMITTEE_CONSERVATION = keccak256("ROLE_COMMITTEE_CONSERVATION");

    // --------------------------
    // DAO + Treasury
    // --------------------------
    address public daoAddress;
    address public treasury;

    // --------------------------
    // Storage Metadata
    // --------------------------
    struct TokenMeta {
        address walletOwner;
        string hashId;
        string coords;
        uint256 timestamp;
        uint256 price;
        bool listed;
        bool isAuction;
        uint256 auctionDeadline;
    }

    mapping(uint256 => TokenMeta) public tokenMetas;
    mapping(string => bool) private usedHashIds;
    mapping(address => uint256[]) private ownerTokens;

    // --------------------------
    // Subastas
    // --------------------------
    mapping(uint256 => address) public highestBidder;
    mapping(uint256 => uint256) public highestBid;

    // --------------------------
    // Fees y Tokens Permitidos
    // --------------------------
    uint256 public feeVenta;    // en basis points (ej: 200 = 2%)
    uint256 public feeSubasta;  // en basis points
    mapping(address => bool) public allowedTokens;

    // --------------------------
    // Eventos
    // --------------------------
    event ConservationMinted(uint256 indexed tokenId, address indexed owner, string hashId, uint256 timestamp);
    event ForestAssetMinted(uint256 indexed tokenId, address indexed owner, string hashId, uint256 price, uint256 timestamp);
    event AssetListed(uint256 indexed tokenId, uint256 price);
    event AssetSold(uint256 indexed tokenId, address buyer, uint256 price);
    event AssetSoldERC20(uint256 indexed tokenId, address indexed buyer, address indexed token, uint256 amount);
    event AuctionStarted(uint256 indexed tokenId, uint256 basePrice, uint256 deadline);
    event BidPlaced(uint256 indexed tokenId, address bidder, uint256 amount);
    event AuctionFinalized(uint256 indexed tokenId, address winner, uint256 amount);
    event TokenBurned(uint256 indexed tokenId, address by);
    event FeeUpdated(string tipo, uint256 nuevoFee);
    event TokenAllowed(address token, bool allowed);

    // --------------------------
    // Initialize
    // --------------------------
    function initialize(address _superAdmin, address _dao, address _treasury) public initializer {
        __ERC721_init("Plantarum721", "PLNTX721");
        __ERC721URIStorage_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        daoAddress = _dao;
        treasury = _treasury;

        _grantRole(DEFAULT_ADMIN_ROLE, _superAdmin);
        _grantRole(SUPER_ADMIN_ROLE, _superAdmin);

        feeVenta = 100;    // 1% (basis points)
        feeSubasta = 100;  // 1% (basis points)

        emit FeeUpdated("venta", feeVenta);
        emit FeeUpdated("subasta", feeSubasta);
    }
//Lote 2
	// --------------------------
    // Mint metadata On-Chain
    // --------------------------
    function mintConservation(
        address to,
        string memory hashId,
        string memory coords,
        string memory tokenURI
    ) external {
        // 🔹 Solo Comité de Conservación o SuperAdmin
        require(
            IPlantarumDAO(daoAddress).hasRole(ROLE_COMMITTEE_CONSERVATION, msg.sender) ||
            hasRole(SUPER_ADMIN_ROLE, msg.sender),
            "No autorizado para mintear Conservacion"
        );

        require(!usedHashIds[hashId], "hashId ya usado");
        usedHashIds[hashId] = true;

        _tokenIds.increment();
        uint256 newId = _tokenIds.current();
        _mint(to, newId);
        _setTokenURI(newId, tokenURI);

        tokenMetas[newId] = TokenMeta(
            to, hashId, coords, block.timestamp, 0, false, false, 0
        );

        emit ConservationMinted(newId, to, hashId, block.timestamp);
    }

    function mintForestAsset(
        address to,
        string memory hashId,
        string memory coords,
        string memory tokenURI,
        uint256 price
    ) external {
        // 🔹 Solo miembros de la DAO o SuperAdmin
        require(
            IPlantarumDAO(daoAddress).hasRole(ROLE_MEMBER, msg.sender) ||
            hasRole(SUPER_ADMIN_ROLE, msg.sender),
            "No autorizado para mintear Activos Forestales"
        );

        require(!usedHashIds[hashId], "hashId ya usado");
        usedHashIds[hashId] = true;
        require(price > 0, "El precio inicial debe ser > 0");

        _tokenIds.increment();
        uint256 newId = _tokenIds.current();
        _mint(to, newId);
        _setTokenURI(newId, tokenURI);

        tokenMetas[newId] = TokenMeta(
            to, hashId, coords, block.timestamp, price, true, false, 0
        );

        emit ForestAssetMinted(newId, to, hashId, price, block.timestamp);
    }

    // --------------------------
    // Venta directa
    // --------------------------
    function listForSale(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "No eres el propietario");
        require(price > 0, "El precio debe ser > 0");

        TokenMeta storage meta = tokenMetas[tokenId];
        meta.listed = true;
        meta.price = price;

        emit AssetListed(tokenId, price);
    }

    function cancelSale(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "No eres el propietario");
        tokenMetas[tokenId].listed = false;
    }

    function buyNow(uint256 tokenId) external payable nonReentrant {
        TokenMeta storage meta = tokenMetas[tokenId];
        require(meta.listed, "No listado");
        require(msg.value >= meta.price, "Precio insuficiente");

        address owner = ownerOf(tokenId);
        _transfer(owner, msg.sender, tokenId);

        meta.walletOwner = msg.sender;
        meta.listed = false;

        uint256 fee = (msg.value * feeVenta) / 10000;
        payable(owner).transfer(msg.value - fee);
        IPlantarumTreasury(treasury).depositETH{value: fee}();

        emit AssetSold(tokenId, msg.sender, msg.value);
    }

    function buyNowERC20(uint256 tokenId, address token, uint256 amount) external nonReentrant {
    require(allowedTokens[token], "Token no permitido");

    TokenMeta storage meta = tokenMetas[tokenId];
    require(meta.listed, "No listado");
    require(amount >= meta.price, "Monto insuficiente");

    address owner = ownerOf(tokenId);

    // ✅ Usamos directamente IERC20Upgradeable con la librería SafeERC20Upgradeable
    IERC20Upgradeable(token).safeTransferFrom(msg.sender, address(this), amount);

    uint256 fee = (amount * feeVenta) / 10000;

    IERC20Upgradeable(token).safeTransfer(owner, amount - fee);
    IERC20Upgradeable(token).safeTransfer(treasury, fee);

    _transfer(owner, msg.sender, tokenId);

    meta.listed = false;
    meta.walletOwner = msg.sender;

    emit AssetSold(tokenId, msg.sender, amount);
    emit AssetSoldERC20(tokenId, msg.sender, token, amount);
}

    // --------------------------
    // Subastas
    // --------------------------
    function startAuction(uint256 tokenId, uint256 basePrice, uint256 duration) external {
        require(ownerOf(tokenId) == msg.sender, "No eres el propietario");
        require(basePrice > 0, "El precio base debe ser > 0");

        TokenMeta storage meta = tokenMetas[tokenId];
        meta.isAuction = true;
        meta.price = basePrice;
        meta.auctionDeadline = block.timestamp + duration;

        emit AuctionStarted(tokenId, basePrice, meta.auctionDeadline);
    }

    function placeBid(uint256 tokenId) external payable nonReentrant {
        TokenMeta storage meta = tokenMetas[tokenId];
        require(meta.isAuction, "No en subasta");
        require(block.timestamp < meta.auctionDeadline, "Subasta terminada");
        require(msg.value > highestBid[tokenId], "Oferta baja");

        if (highestBidder[tokenId] != address(0)) {
            (bool success, ) = payable(highestBidder[tokenId]).call{value: highestBid[tokenId]}("");
            require(success, "Reembolso fallido");
        }

        highestBidder[tokenId] = msg.sender;
        highestBid[tokenId] = msg.value;

        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    function finalizeAuction(uint256 tokenId) external nonReentrant {
        TokenMeta storage meta = tokenMetas[tokenId];
        require(meta.isAuction, "No en subasta");
        require(block.timestamp >= meta.auctionDeadline, "Subasta vigente");

        address winner = highestBidder[tokenId];
        uint256 amount = highestBid[tokenId];
        address owner = ownerOf(tokenId);

        if (winner != address(0)) {
            _transfer(owner, winner, tokenId);
            meta.walletOwner = winner;

            uint256 fee = (amount * feeSubasta) / 10000;
            payable(owner).transfer(amount - fee);
            IPlantarumTreasury(treasury).depositETH{value: fee}();

            emit AuctionFinalized(tokenId, winner, amount);
        }

        meta.isAuction = false;
        highestBidder[tokenId] = address(0);
        highestBid[tokenId] = 0;
    }
//lote3
	// --------------------------
    // Fees y Monedas
    // --------------------------
    function setFeeVenta(uint256 _fee) external onlyRole(SUPER_ADMIN_ROLE) {
        require(_fee <= 1000, "Max 10%"); 
        feeVenta = _fee;
        emit FeeUpdated("venta", _fee);
    }

    function setFeeSubasta(uint256 _fee) external onlyRole(SUPER_ADMIN_ROLE) {
        require(_fee <= 1000, "Max 10%");
        feeSubasta = _fee;
        emit FeeUpdated("subasta", _fee);
    }

    function setAllowedToken(address token, bool allowed) external onlyRole(SUPER_ADMIN_ROLE) {
        allowedTokens[token] = allowed;
        emit TokenAllowed(token, allowed);
    }

    function isTokenAllowed(address token) external view returns (bool) {
        return allowedTokens[token];
    }

	// --------------------------
	// Overrides ERC721 (con _update en lugar de _mint/_transfer/_burn)
	// --------------------------
	function _update(
		address to,
		uint256 tokenId,
		address auth
	) 
		internal 
		override 
		returns (address) 
	{
		address from = super._update(to, tokenId, auth);

		// 🔹 Quitar token de la lista del antiguo dueño
		if (from != address(0)) {
			uint256[] storage fromTokens = ownerTokens[from];
			for (uint256 i = 0; i < fromTokens.length; i++) {
				if (fromTokens[i] == tokenId) {
					fromTokens[i] = fromTokens[fromTokens.length - 1];
					fromTokens.pop();
					break;
				}
			}
		}

		// 🔹 Agregar token al nuevo dueño
		if (to != address(0)) {
			ownerTokens[to].push(tokenId);
			tokenMetas[tokenId].walletOwner = to;
		}

		// 🔹 Si es burn → limpiar metadatos
		if (to == address(0)) {
			delete tokenMetas[tokenId];
		}

		return from;
	}

    // --------------------------
    // DAO Control
    // --------------------------
    function daoBurn(uint256 tokenId) external {
        require(
            hasRole(SUPER_ADMIN_ROLE, msg.sender) ||
            IPlantarumDAO(daoAddress).hasRole(SUPER_ADMIN_ROLE, msg.sender),
            "No autorizado"
        );

        _burn(tokenId); 
        emit TokenBurned(tokenId, msg.sender);
    }

    function pause() external onlyRole(SUPER_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(SUPER_ADMIN_ROLE) {
        _unpause();
    }

    // --------------------------
    // Getters
    // --------------------------
    function getTokenMeta(uint256 tokenId) external view returns (TokenMeta memory) {
        return tokenMetas[tokenId];
    }

    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        return ownerTokens[owner];
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
        override(ERC721URIStorageUpgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
