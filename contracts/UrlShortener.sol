// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UrlShortener {
    struct ShortUrl {
        address owner;
        string originalUrl;
        uint256 createdAt;
        uint256 expiresAt;
        bool exists;
    }

    // shortCode => ShortUrl data
    mapping(bytes32 => ShortUrl) public shortUrls;

    // durationId => fee (in wei)
    mapping(uint8 => uint256) public durationToFee;
    // durationId => duration (in seconds)
    mapping(uint8 => uint256) public durationToSeconds;

    address public owner;

    event ShortUrlCreated(
        bytes32 indexed shortCode,
        address indexed urlOwner,
        string originalUrl,
        uint256 createdAt,
        uint256 expiresAt
    );

    event ShortUrlRenewed(
        bytes32 indexed shortCode,
        uint256 newExpiry
    );

    event ShortUrlDeleted(bytes32 indexed shortCode);

    event FeesWithdrawn(address indexed to, uint256 amount);

    modifier onlyContractOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    modifier onlyShortOwner(bytes32 shortCode) {
        require(shortUrls[shortCode].exists, "Short code does not exist");
        require(shortUrls[shortCode].owner == msg.sender, "Not URL owner");
        _;
    }

    constructor() {
        owner = msg.sender;

        // Example: you can tweak these before deployment
        // 1 => 30 days
        durationToSeconds[1] = 30 days;
        durationToFee[1] = 0.001 ether; // example fee

        // 2 => 60 days
        durationToSeconds[2] = 60 days;
        durationToFee[2] = 0.0018 ether; // slightly cheaper than 2 * 0.001

        // you can add more duration tiers if needed
    }

    // Create a new short URL or overwrite an expired one
    function createShortUrl(
        bytes32 shortCode,
        string calldata originalUrl,
        uint8 durationId
    ) external payable {
        uint256 requiredFee = durationToFee[durationId];
        uint256 duration = durationToSeconds[durationId];

        require(requiredFee > 0, "Invalid duration");
        require(duration > 0, "Invalid duration");
        require(msg.value >= requiredFee, "Insufficient fee");

        ShortUrl memory existing = shortUrls[shortCode];

        // allow reuse only if it doesn't exist or it's expired
        require(
            !existing.exists || block.timestamp > existing.expiresAt,
            "Short code already active"
        );

        shortUrls[shortCode] = ShortUrl({
            owner: msg.sender,
            originalUrl: originalUrl,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + duration,
            exists: true
        });

        emit ShortUrlCreated(
            shortCode,
            msg.sender,
            originalUrl,
            block.timestamp,
            block.timestamp + duration
        );
    }

    // Renew an existing short URL
    function renewShortUrl(bytes32 shortCode, uint8 durationId)
        external
        payable
        onlyShortOwner(shortCode)
    {
        uint256 requiredFee = durationToFee[durationId];
        uint256 duration = durationToSeconds[durationId];

        require(requiredFee > 0, "Invalid duration");
        require(duration > 0, "Invalid duration");
        require(msg.value >= requiredFee, "Insufficient fee");

        ShortUrl storage info = shortUrls[shortCode];

        if (block.timestamp > info.expiresAt) {
            // already expired, start from now
            info.expiresAt = block.timestamp + duration;
        } else {
            // extend from current expiry
            info.expiresAt = info.expiresAt + duration;
        }

        emit ShortUrlRenewed(shortCode, info.expiresAt);
    }

    // Delete a short URL (only owner of that URL)
    function deleteShortUrl(bytes32 shortCode)
        external
        onlyShortOwner(shortCode)
    {
        require(shortUrls[shortCode].exists, "Does not exist");
        delete shortUrls[shortCode];
        emit ShortUrlDeleted(shortCode);
    }

    // View functions

    // Get URL + active status; free for anyone
    function getOriginalUrl(bytes32 shortCode)
        external
        view
        returns (string memory url, bool isActive)
    {
        ShortUrl memory info = shortUrls[shortCode];
        if (!info.exists) {
            return ("", false);
        }
        bool active = block.timestamp <= info.expiresAt;
        return (info.originalUrl, active);
    }

    function isActive(bytes32 shortCode) public view returns (bool) {
        ShortUrl memory info = shortUrls[shortCode];
        return info.exists && block.timestamp <= info.expiresAt;
    }

    function getOwner(bytes32 shortCode) external view returns (address) {
        return shortUrls[shortCode].owner;
    }

    function getExpiry(bytes32 shortCode) external view returns (uint256) {
        return shortUrls[shortCode].expiresAt;
    }

    // Admin: set or update duration tiers & fees
    function setDurationConfig(
        uint8 durationId,
        uint256 secondsAmount,
        uint256 feeAmount
    ) external onlyContractOwner {
        durationToSeconds[durationId] = secondsAmount;
        durationToFee[durationId] = feeAmount;
    }

    // Withdraw collected fees
    function withdrawFees(address payable to, uint256 amount)
        external
        onlyContractOwner
    {
        require(amount <= address(this).balance, "Not enough balance");
        to.transfer(amount);
        emit FeesWithdrawn(to, amount);
    }
}
