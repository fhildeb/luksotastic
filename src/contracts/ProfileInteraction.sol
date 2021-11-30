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
             * than any of the current top 9.
             */

            for (uint8 i = 0; i <= 8; i++) {
                if (
                    assetInteraction[_asset].upvoteAmount >=
                    topAssetUpvote[i].unit
                ) {
                    if (_asset == topAssetUpvote[i].asset) {
                        // Asset is at the right place, do nothing (i.e. break)
                        break;
                    }

                    bool inTopAssetBefore = false;

                    // Replace something
                    for (uint8 s = i + 1; s <= 8; s++) {
                        if (_asset == topAssetUpvote[s].asset) {
                            // asset was in topAssets before
                            // only shift items below i (new position) and above
                            // s (old position)
                            for (uint8 j = s; j > i; j--) {
                                topAssetUpvote[j].unit = topAssetUpvote[j - 1]
                                    .unit;
                                topAssetUpvote[j].asset = topAssetUpvote[j - 1]
                                    .asset;
                            }
                            inTopAssetBefore = true;
                            break;
                        }
                    }

                    if (!inTopAssetBefore) {
                        // shift all items from 8 (length of topAssets) to i (new
                        // position)
                        for (uint8 j = 8; j > i; j--) {
                            topAssetUpvote[j].unit = topAssetUpvote[j - 1].unit;
                            topAssetUpvote[j].asset = topAssetUpvote[j - 1]
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

        // Interaction: Hype
        if (_action == 1) {
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
             * Check if new hype amount is higher or equal
             * than any of the current top 9.
             */

            for (uint8 i = 0; i <= 8; i++) {
                if (
                    assetInteraction[_asset].hypeAmount >= topAssetHype[i].unit
                ) {
                    if (_asset == topAssetHype[i].asset) {
                        // Asset is at the right place, do nothing (i.e. break)
                        break;
                    }

                    bool inTopAssetBefore = false;

                    // Replace something
                    for (uint8 s = i + 1; s <= 8; s++) {
                        if (_asset == topAssetHype[s].asset) {
                            // asset was in topAssets before
                            // only shift items below i (new position) and above
                            // s (old position)
                            for (uint8 j = s; j > i; j--) {
                                topAssetHype[j].unit = topAssetHype[j - 1].unit;
                                topAssetHype[j].asset = topAssetHype[j - 1]
                                    .asset;
                            }
                            inTopAssetBefore = true;
                            break;
                        }
                    }

                    if (!inTopAssetBefore) {
                        // shift all items from 8 (length of topAssets) to i (new
                        // position)
                        for (uint8 j = 8; j > i; j--) {
                            topAssetHype[j].unit = topAssetHype[j - 1].unit;
                            topAssetHype[j].asset = topAssetHype[j - 1].asset;
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
        if (_action == 2) {
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
             * Check if new support amount is higher or equal
             * than any of the current top 9.
             */

            for (uint8 i = 0; i <= 8; i++) {
                if (
                    assetInteraction[_asset].supportAmount >=
                    topAssetSupport[i].unit
                ) {
                    if (_asset == topAssetSupport[i].asset) {
                        // Asset is at the right place, do nothing (i.e. break)
                        break;
                    }

                    bool inTopAssetBefore = false;

                    // Replace something
                    for (uint8 s = i + 1; s <= 8; s++) {
                        if (_asset == topAssetSupport[s].asset) {
                            // asset was in topAssets before
                            // only shift items below i (new position) and above
                            // s (old position)
                            for (uint8 j = s; j > i; j--) {
                                topAssetSupport[j].unit = topAssetSupport[j - 1]
                                    .unit;
                                topAssetSupport[j].asset = topAssetSupport[
                                    j - 1
                                ].asset;
                            }
                            inTopAssetBefore = true;
                            break;
                        }
                    }

                    if (!inTopAssetBefore) {
                        // shift all items from 8 (length of topAssets) to i (new
                        // position)
                        for (uint8 j = 8; j > i; j--) {
                            topAssetSupport[j].unit = topAssetSupport[j - 1]
                                .unit;
                            topAssetSupport[j].asset = topAssetSupport[j - 1]
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

        // RANKING ACCOUNTS (Owner of asset or message sender)

        /**
         * Check if new LSTC balance of OWNER is higher or equal
         * than any of the current top 9.
         */
        for (uint8 i = 0; i <= 8; i++) {
            if (balanceOf[_owner] >= balanceOf[topAccounts[i]]) {
                if (_owner == topAccounts[i]) {
                    // account is at the right place, change nothing (i.e. break)
                    break;
                }

                bool inTopAccountsBefore = false;

                // Replace something
                for (uint8 s = i + 1; s <= 8; s++) {
                    if (_owner == topAccounts[s]) {
                        // account was in topAccounts before
                        // only shift accounts below i (new position) and above
                        // s (old position)
                        for (uint8 j = s; j > i; j--) {
                            topAccounts[j] = topAccounts[j - 1];
                        }
                        inTopAccountsBefore = true;
                        break;
                    }
                }

                if (!inTopAccountsBefore) {
                    // shift all items from 8 (length of topAssets) to i (new
                    // position)
                    for (uint8 j = 8; j > i; j--) {
                        topAccounts[j] = topAccounts[j - 1];
                    }
                }

                // Set new entry
                topAccounts[i] = _owner;
                break;
            }
        }

        /**
         * Check if new LSTC balance of MSG.SENDER is higher or equal
         * than any of the current top 9.
         */
        for (uint8 i = 0; i <= 8; i++) {
            if (balanceOf[msg.sender] >= balanceOf[topAccounts[i]]) {
                if (msg.sender == topAccounts[i]) {
                    // account is at the right place, change nothing (i.e. break)
                    break;
                }

                bool inTopAccountsBefore = false;

                // Replace something
                for (uint8 s = i + 1; s <= 8; s++) {
                    if (msg.sender == topAccounts[s]) {
                        // account was in topAccounts before
                        // only shift accounts below i (new position) and above
                        // s (old position)
                        for (uint8 j = s; j > i; j--) {
                            topAccounts[j] = topAccounts[j - 1];
                        }
                        inTopAccountsBefore = true;
                        break;
                    }
                }

                if (!inTopAccountsBefore) {
                    // shift all items from 8 (length of topAssets) to i (new
                    // position)
                    for (uint8 j = 8; j > i; j--) {
                        topAccounts[j] = topAccounts[j - 1];
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
