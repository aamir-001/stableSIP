from brownie import StableSPY, SIPManager, accounts, config

def main():
    account = accounts.add(config["wallets"]["from_key"])
    token = StableSPY.at("0x7C67Fd632bbF82f5eFfE91904e9bA20929ae4dfF")
    new_owner = "0x543DA7DC8aAD790Bbc15bdE915351790c18B1AA4"  # SIPManager

    tx = token.transferOwnership(new_owner, {"from": account})
    tx.wait(1)
    print(f"✅ Ownership transferred to SIPManager at {new_owner}")
