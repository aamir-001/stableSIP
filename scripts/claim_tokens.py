# scripts/claim_tokens.py

from dotenv import load_dotenv
load_dotenv()

from brownie import accounts, config, SIPManager, StableSPY, network

def get_account():
    return accounts.add(config["wallets"]["from_key"])

def main():
    print(f"📡 Active network: {network.show_active()}")

    account = get_account()
    print(f"🔐 Using account: {account.address}")

    # Replace with current contract addresses
    sip_address = "0x543DA7DC8aAD790Bbc15bdE915351790c18B1AA4"
    token_address = "0x7C67Fd632bbF82f5eFfE91904e9bA20929ae4dfF"

    sip = SIPManager.at(sip_address)
    token = StableSPY.at(token_address)

    print("⏳ Claiming allocated tokens...")
    tx = sip.claimTokens({"from": account})
    tx.wait(1)
    print("✅ Tokens claimed!")

    balance = token.balanceOf(account.address)
    print(f"🪙 New SPY Balance: {balance / 1e18:.6f} SPYS")
