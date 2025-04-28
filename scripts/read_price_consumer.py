from brownie import SPYPriceConsumer, Contract, accounts

def read_price():
    account = accounts[0]
    
    # Connect manually
    consumer_address = "0xe4328B520c7327600eA9c37f74df955803b53dc5"
    consumer = Contract.from_abi("SPYPriceConsumer", consumer_address, SPYPriceConsumer.abi)

    latest_price = consumer.getLatestPrice({"from": account})
    print(f"The latest SPY price is: {latest_price / 1e8} USD")

def main():
    read_price()
