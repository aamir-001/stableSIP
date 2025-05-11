from brownie import SPYPriceConsumer, accounts, config

def deploy_price_consumer():
    account = accounts.add(config["wallets"]["from_key"])
    
    # Sepolia Chainlink SPY/USD Price Feed address
    CHAINLINK_PRICE_FEED = "0x13B7F51BD865410c3AcC4d56083C5B56aB38698E"
    
    price_consumer = SPYPriceConsumer.deploy(
        CHAINLINK_PRICE_FEED,
        {"from": account},
        publish_source=False
    )
    print(f"Price Consumer deployed at: {price_consumer.address}")
    return price_consumer

def main():
    deploy_price_consumer()