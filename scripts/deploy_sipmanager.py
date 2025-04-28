from brownie import SIPManager, StableSPY, MockV3Aggregator, config, accounts

def get_account():
    return accounts.add(config["wallets"]["from_key"])

def main():
    account = get_account()

    # 🔧 Replace with actual deployed contract addresses if already deployed
    stable_spy_address = "0x7C67Fd632bbF82f5eFfE91904e9bA20929ae4dfF"  # your StableSPY token
    spy_feed_address = "0x3717d852C68f16B7240DD8c1691fc6046Dbc8f75"   # mock aggregator
    usdc_address = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"        # Circle’s mock USDC on Sepolia

    print("Deploying SIPManager...")

    sip_manager = SIPManager.deploy(
        stable_spy_address,
        spy_feed_address,
        usdc_address,
        {"from": account}
    )

    print(f"SIPManager deployed at: {sip_manager.address}")
