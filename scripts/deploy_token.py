from brownie import StableSPY, accounts, config, network

def get_account():
    if network.show_active() in ["development", "ganache-local"]:
        return accounts[0]
    else:
        return accounts.add(config["wallets"]["from_key"])

def main():
    account = get_account()
    stable_spy = StableSPY.deploy({"from": account})
    print(f"StableSPY Token deployed at: {stable_spy.address}")
    return stable_spy
