from brownie import SPYPriceConsumer, Contract, accounts, config

def read_price():
    account = accounts.add(config["wallets"]["from_key"])
    
    # Connect manually
    consumer_address = 0x4B5Ea1f604cB8C59B48ca9353EE8b538696E0bC7
    consumer = Contract.from_abi("SPYPriceConsumer", consumer_address, SPYPriceConsumer.abi)

    latest_price = consumer.getLatestPrice({"from": account})
    print(f"The latest SPY price is: {latest_price / 1e8} USD")

def main():
    read_price()
