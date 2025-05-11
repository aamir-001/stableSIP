from brownie import accounts, config, network, Contract, SIPManager
from dotenv import load_dotenv
import os

def main():
    load_dotenv()

    print(f"📡 Active network: {network.show_active()}")
    private_key = os.getenv("PRIVATE_KEY")
    account = accounts.add(private_key)
    print(f"🔐 Using account: {account.address}")

    # Update these if contracts are redeployed
    sip_manager_address = "0x543DA7DC8aAD790Bbc15bdE915351790c18B1AA4"
    usdc_token_address = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"

    # Minimal ERC20 ABI for approve
    erc20_abi = [
        {
            "constant": False,
            "inputs": [
                {"name": "spender", "type": "address"},
                {"name": "amount", "type": "uint256"}
            ],
            "name": "approve",
            "outputs": [{"name": "", "type": "bool"}],
            "type": "function"
        }
    ]

    # Attach to contracts
    sip = SIPManager.at(sip_manager_address)
    usdc = Contract.from_abi("MockUSDC", usdc_token_address, erc20_abi)

    # Amount = 1 USDC (with 6 decimals)
    amount = 1 * 10**6

    print("🔁 Approving USDC spending...")
    tx1 = usdc.approve(sip.address, amount, {"from": account})
    tx1.wait(1)
    print("✅ Approved")

# ----------------------- run it only once -----------------------------------------
    # print("📥 Subscribing to SIP plan with 1 USDC...")
    # tx2 = sip.subscribe(amount, {"from": account})
    # tx2.wait(1)
    # print("✅ Subscribed to SIP!") 

    # wait for one minute then run the code below, and comment the subscription code

    print("🎁 Claiming tokens...")
    tx3 = sip.claimTokens({"from": account})
    tx3.wait(1)
    print("✅ Tokens claimed!")
