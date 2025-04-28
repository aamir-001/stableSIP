pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./StableSPY.sol";
import "./MockV3Aggregator.sol";

contract SIPManager is Ownable {
    StableSPY public stableSPYToken;
    MockV3Aggregator public spyPriceFeed;
    IERC20 public usdcToken;

    struct Plan {
        uint256 monthlyInvestmentUSD;
        uint256 startTime;
        uint256 lastClaimed;
        uint256 frequency;
        bool active;
    }

    mapping(address => Plan) public userPlans;

    event Subscribed(address indexed user, uint256 amount);
    event TokensClaimed(address indexed user, uint256 tokensMinted);

    constructor(address _token, address _spyPriceFeed, address _usdcToken) {
        stableSPYToken = StableSPY(_token);
        spyPriceFeed = MockV3Aggregator(_spyPriceFeed);
        usdcToken = IERC20(_usdcToken);
    }

    function subscribe(uint256 _monthlyInvestmentUSD) external {
        require(_monthlyInvestmentUSD > 0, "Investment must be greater than 0");
        require(!userPlans[msg.sender].active, "Already subscribed");

        // Transfer USDC from user to contract (user must approve first)
        bool success = usdcToken.transferFrom(msg.sender, address(this), _monthlyInvestmentUSD);
        require(success, "USDC transfer failed");

        userPlans[msg.sender] = Plan({
            monthlyInvestmentUSD: _monthlyInvestmentUSD,
            startTime: block.timestamp,
            lastClaimed: block.timestamp,
            frequency: 1 minutes,
            active: true
        });

        emit Subscribed(msg.sender, _monthlyInvestmentUSD);
    }

    function claimTokens() external {
        Plan storage plan = userPlans[msg.sender];
        require(plan.active, "No active subscription");
        require(block.timestamp >= plan.lastClaimed + plan.frequency, "Not time yet");

        uint256 spyPrice = getCurrentSPYPrice();
        require(spyPrice > 0, "Invalid SPY price");

        uint256 tokensToMint = (plan.monthlyInvestmentUSD * 1e26) / spyPrice;

        plan.lastClaimed = block.timestamp;
        stableSPYToken.mint(msg.sender, tokensToMint);

        emit TokensClaimed(msg.sender, tokensToMint);
    }

    function getCurrentSPYPrice() public view returns (uint256) {
        (, int256 price, , ,) = spyPriceFeed.latestRoundData();
        require(price > 0, "Invalid price");
        return uint256(price);
    }
}
