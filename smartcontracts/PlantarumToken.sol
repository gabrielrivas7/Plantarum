// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title PlantarumToken (PLNTX)
 * @author Gabriel Emilio de Jesus Rivas Mier y Teran
 * @notice Trabajo de Fin de Máster (TFM) - Universidad de Salamanca
 * @dev Token ERC20 upgradeable con UUPS y extensión ERC20Votes.
 *      Suministro inicial: 10,000,000,000 PLNTX.
 *      Incluye faucet en modalidad B para entrega controlada de tokens.
 * @custom:version 1.0.0
 * @custom:date 2025-08-17
 * @custom:contact gabrielrivasmieryteran@gmail.com
 */

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract PlantarumToken is 
    Initializable, 
    ERC20VotesUpgradeable, 
    OwnableUpgradeable, 
    UUPSUpgradeable, 
    ReentrancyGuardUpgradeable 
{
    uint256 public constant MAX_SUPPLY = 10_000_000_000 * 10 ** 18;
    uint256 public constant FAUCET_AMOUNT = 50 * 10 ** 18;
    uint256 public constant FAUCET_COOLDOWN = 1 days;

    mapping(address => uint256) public lastClaim;
    uint256 public mintedSupply; // 🔹 control de supply real minteado

    function initialize(address _owner) public initializer {
        __ERC20_init("Plantarum Token", "PLTNX");
        __ERC20Votes_init();
        __Ownable_init(_owner);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        // NO minteamos todo al owner
        mintedSupply = 0;
    }

    /// @notice Faucet: mintea directo al usuario cada 24h
    function faucet() external nonReentrant {
        require(block.timestamp >= lastClaim[msg.sender] + FAUCET_COOLDOWN, "Faucet: wait 24h");
        require(mintedSupply + FAUCET_AMOUNT <= MAX_SUPPLY, "Faucet: max supply reached");

        lastClaim[msg.sender] = block.timestamp;
        mintedSupply += FAUCET_AMOUNT;
        _mint(msg.sender, FAUCET_AMOUNT);
    }

    /// @dev Upgrade control solo owner
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /// @dev Overriding para ERC20Votes
    function _update(address from, address to, uint256 value) 
        internal 
        override(ERC20VotesUpgradeable) 
    {
        super._update(from, to, value);
    }
}
