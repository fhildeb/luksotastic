// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

/**
 * Contract for the Luksotastic Social Currency System
 *
 * Profiles holding Assets can interact with each other in
 * three different ways to gain the account-bound token LSTC.
 * Every interaction-type is tracked in their own ranking lists.
 *
 * @author fhildeb
 */
contract ProfileInteraction {
    /**
     * Struct to save the amount of
     * different interaction types.
     */
    struct Interactions {
        // Upvote
        uint256 upvoteAmount;
        // Hype
        uint256 hypeAmount;
        // Support
        uint256 supportAmount;
    }

    /**
     * Struct to save asset address
     * with their interaction units.
     */
    struct BestOfBest {
        address asset;
        uint256 unit;
    }

    // Save LSTC Ttken balances
    mapping(address => uint256) public balanceOf;

    // Track the amount of interaction on every asset
    mapping(address => Interactions) public assetInteraction;

    // Check if account already interacted with a asset
    mapping(address => mapping(address => bool)) public voteProof;

    // Statistics of top 10 asset's interaction amounts
    mapping(uint8 => BestOfBest) public topAssetUpvote;
    mapping(uint8 => BestOfBest) public topAssetHype;
    mapping(uint8 => BestOfBest) public topAssetSupport;

    // Statistics of top 10 addresses with the highest LSTC balance
    mapping(uint8 => address) public topAccounts;

    /**
     * Unix-Time of the last statistics reset
     * for following time-bound interactions:
     *      -Hype
     *      -Support
     */
    uint256 public lastHypeResetTime;
    uint256 public lastSupportResetTime;

    // Metadata of the LSTC token
    string public name;
    string public symbol;

    uint8 public decimals;

    uint256 public totalSupply;
    uint256 public totalUsers;

    /**
     * Instanciating Social interaction contract
     * and setting information.
     */
    constructor() {
        // No interactions mean zero social token
        totalSupply = 0;

        // Metadata
        decimals = 0;
        name = 'Luksotastic Social Token';
        symbol = 'LSTC';

        // Statistics are empty and are equal to a reset
        lastHypeResetTime = block.timestamp;
        lastSupportResetTime = block.timestamp;
    }

    /**
     * Handle incoming interaction
     *
     * @param {address}     _asset:   Address of asset to interact with
     * @param {address}     _owner:   Owner of the asset
     * @param {integer}     _action:  Interaction-Type {0, 1, 2}
     *
     * @return {boolean}    Indicator of success or failure of function
     */
    function interaction(
        address _asset,
        address _owner,
        uint8 _action
    ) public returns (bool) {
        // Sender security checks
        require(msg.sender != address(0), 'Sender is zero');
        require(msg.sender != _owner, 'Can not interact with yourself');
        require(msg.sender != _asset, 'Sender equals asset');

        // Asset security checks
        require(_asset != _owner, 'Asset equals owner');
        require(_asset != address(0), 'Asset is zero');

        // Owner security checks
        require(_owner != address(0), 'Owner is zero');

        // Disable double interaction
        require(
            voteProof[msg.sender][_asset] == false,
            'Sender already voted for this asset'
        );

        // Function-related security checks
        require(
            (_action == 0) || (_action == 1) || (_action == 2),
            'Invalid function type'
        );
        if (_action == 2) {
            require(
                balanceOf[msg.sender] >= 10,
                'Sender has not enough LSTC for supporting'
            );
        }

        /**
         * Time-based interactions rely on
         * up-to-date statistic boards, therefore
         * it needs to be calculated how many days
         * the resets were away.
         */
        uint256 HypeWentBy = (block.timestamp - lastHypeResetTime) / 86400;
        uint256 SupportWentBy = (block.timestamp - lastHypeResetTime) / 86400;

        /**
         * Execute resets of statistic boards
         * regardless of the interaction type.
         */
        if (HypeWentBy > 7) {
            // Reset top 10 weekly hype board
            for (uint8 i = 9; i >= 0; i--) {
                topAssetHype[i].unit = 0;
                topAssetHype[i].asset = address(0);
            }
        }

        if (SupportWentBy > 30) {
            // reset top 10 monthly support board
            for (uint8 i = 9; i >= 0; i--) {
                topAssetSupport[i].unit = 0;
                topAssetSupport[i].asset = address(0);
            }
        }

        /**
         * Before executing the interaction, it needs
         * to be marked to prevent reentrancy attack.
         */
        voteProof[msg.sender][_asset] = true;

        // New user detected
        if (balanceOf[msg.sender] == 0) {
            totalUsers++;
        }

        // Interaction: Upvote
        if (_action == 0) {
            // Rise interaction count of asset
            assetInteraction[_asset].upvoteAmount += 1;

            /**
             * Increase social coin according
             * to set up interaction properties
             */
            totalSupply += 10;
            balanceOf[msg.sender] += 2;
            balanceOf[_owner] += 8;

            /**
             * Check if new upvote amount is higher or equal
             * than any of the current top 10.
             */

            for (uint8 i = 0; i <= 8; i++) {
                if (
                    assetInteraction[_asset].upvoteAmount >=
                    topAssetUpvote[i].unit
                ) {
                    if (_asset == topAssetUpvote[i].asset) {
                        topAssetUpvote[i].unit = assetInteraction[_asset]
                            .upvoteAmount;
                        break;
                    }
                    for (uint8 s = 8; s > i; s--) {
                        if (_asset == topAssetUpvote[s].asset) {
                            topAssetUpvote[s].asset = address(0);
                            topAssetUpvote[s].unit = 0;
                        }
                    }
                    // Push down data of ranks past the new entry
                    for (uint8 u = 9; u > i; u--) {
                        if (topAssetHype[u - 1].asset != address(0)) {
                            topAssetUpvote[u].unit = topAssetUpvote[u - 1].unit;
                            topAssetUpvote[u].asset = topAssetUpvote[u - 1]
                                .asset;
                        }
                    }

                    // Set new entry
                    topAssetUpvote[i].unit = assetInteraction[_asset]
                        .upvoteAmount;
                    topAssetUpvote[i].asset = _asset;
                    break;
                }
            }
        }
        // Take interaction: Hype
        else if (_action == 1) {
            // Rise interaction count of asset
            assetInteraction[_asset].hypeAmount += 1;

            /**
             * Increase social coin according
             * to set up interaction properties
             */
            totalSupply += 13;
            balanceOf[msg.sender] += 1;
            balanceOf[_owner] += 12;

            /**
             * Check if new upvote amount is higher or equal
             * than any of the current top 10.
             */
            for (uint8 i = 0; i <= 8; i++) {
                if (
                    assetInteraction[_asset].hypeAmount >= topAssetHype[i].unit
                ) {
                    if (_asset == topAssetHype[i].asset) {
                        topAssetHype[i].unit = assetInteraction[_asset]
                            .hypeAmount;
                        break;
                    }
                    for (uint8 s = 8; s > i; s--) {
                        if (_asset == topAssetHype[s].asset) {
                            topAssetHype[s].asset = address(0);
                            topAssetHype[s].unit = 0;
                        }
                    }
                    // Push down data of ranks past the new entry
                    for (uint8 u = 9; u > i; u--) {
                        if (topAssetHype[u - 1].asset != address(0)) {
                            topAssetHype[u].unit = topAssetHype[u - 1].unit;
                            topAssetHype[u].asset = topAssetHype[u - 1].asset;
                        }
                    }

                    // Set new entry
                    topAssetHype[i].unit = assetInteraction[_asset].hypeAmount;
                    topAssetHype[i].asset = _asset;
                    break;
                }
            }
        }
        // Interaction: Support
        else if (_action == 2) {
            // Rise interaction count of asset
            assetInteraction[_asset].supportAmount += 1;

            /**
             * Increase social coin according
             * to set up interaction properties
             */
            totalSupply += 10;
            balanceOf[msg.sender] -= 10;
            balanceOf[_owner] += 20;

            /**
             * Check if new upvote amount is higher or equal
             * than any of the current top 10.
             */
            for (uint8 i = 0; i <= 8; i++) {
                if (
                    assetInteraction[_asset].supportAmount >=
                    topAssetSupport[i].unit
                ) {
                    if (_asset == topAssetSupport[i].asset) {
                        topAssetSupport[i].unit = assetInteraction[_asset]
                            .supportAmount;
                        break;
                    }

                    for (uint8 s = 8; s > i; s--) {
                        if (_asset == topAssetSupport[s].asset) {
                            topAssetSupport[s].asset = address(0);
                            topAssetSupport[s].unit = 0;
                        }
                    }
                    // Push down data of ranks past the new entry
                    for (uint8 u = 9; u > i; u--) {
                        if (topAssetSupport[u - 1].asset != address(0)) {
                            topAssetSupport[u].unit = topAssetSupport[u - 1]
                                .unit;
                            topAssetSupport[u].asset = topAssetSupport[u - 1]
                                .asset;
                        }
                    }

                    // Set new entry
                    topAssetSupport[i].unit = assetInteraction[_asset]
                        .supportAmount;
                    topAssetSupport[i].asset = _asset;
                    break;
                }
            }
        }
        /**
         * Check if new LSTC balance of owner is higher or equal
         * than any of the current top 9.
         */
        for (uint8 i = 0; i <= 8; i++) {
            if (balanceOf[_owner] >= balanceOf[topAccounts[i]]) {
                if (_owner == topAccounts[i]) {
                    break;
                }
                for (uint8 s = 8; s > i; s--) {
                    if (_owner == topAccounts[s]) {
                        topAccounts[s] = address(0);
                    }
                }

                // Push down data of ranks past the new entry
                for (uint8 u = 9; u > i; u--) {
                    if (topAccounts[u - 1] != address(0)) {
                        topAccounts[u] = topAccounts[u - 1];
                    }
                }

                // Set new entry
                topAccounts[i] = _owner;
                break;
            }
        }

        /**
         * Check if new LSTC balance of sender is higher or equal
         * than any of the current top 9.
         */
        for (uint8 i = 0; i <= 8; i++) {
            if (balanceOf[msg.sender] >= balanceOf[topAccounts[i]]) {
                if (msg.sender == topAccounts[i]) {
                    break;
                }

                for (uint8 s = 8; s > i; s--) {
                    if (msg.sender == topAccounts[s]) {
                        topAccounts[s] = address(0);
                    }
                }
                // Push down data of ranks past the new entry
                for (uint8 u = 9; u > i; u--) {
                    if (topAccounts[u - 1] != address(0)) {
                        topAccounts[u] = topAccounts[u - 1];
                    }
                }

                // Set new entry
                topAccounts[i] = msg.sender;
                break;
            }
        }

        emit Interaction(_asset, _owner, msg.sender, _action);
        return true;
    }

    /**
     * ADDITIONAL INFORMATION
     *      -Contract has no fallback because there is only one public function
     *      -Contract is not a receiver because there is no owner
     *      -Contract can not be destroyed because users may rely on it's token
     */

    // Event to catch data after an interaction
    event Interaction(address asset, address owner, address user, uint8 action);
}
