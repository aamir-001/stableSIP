from brownie import SPYPriceConsumer, accounts, config, network

def get_account():
    if network.show_active() in ["development", "ganache-local"]:
        return accounts[0]
    else:
        return accounts.add(config["wallets"]["from_key"])

def deploy_consumer(mock_feed_address):
    account = get_account()
    consumer = SPYPriceConsumer.deploy(
        mock_feed_address,
        {"from": account}
    )
    print(f"SPYPriceConsumer deployed at: {consumer.address}")
    return consumer

def main():
    mock_feed_address = "0x3717d852C68f16B7240DD8c1691fc6046Dbc8f75"  # UPDATE THIS
    deploy_consumer(mock_feed_address)
