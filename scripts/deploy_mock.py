import os
from dotenv import load_dotenv
from brownie import MockV3Aggregator, accounts, config, network

load_dotenv()

def get_account():
    if network.show_active() in ["development", "ganache-local"]:
        return accounts[0]
    else:
        return accounts.add(config["wallets"]["from_key"])

def main():
    account = get_account()
    decimals = 8
    initial_price = 500 * 10**8
    mock_price_feed = MockV3Aggregator.deploy(
        decimals,
        initial_price,
        {"from": account}
    )
    print(f"MockV3Aggregator deployed at: {mock_price_feed.address}")
