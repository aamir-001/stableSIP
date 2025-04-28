// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockV3Aggregator {
    int256 private _price;
    uint8 public decimals;

    constructor(uint8 _decimals, int256 _initialAnswer) {
        decimals = _decimals;
        _price = _initialAnswer;
    }

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (0, _price, 0, 0, 0);
    }

    function updateAnswer(int256 _newAnswer) external {
        _price = _newAnswer;
    }
}
