import os
from dotenv import load_dotenv
from brownie import accounts, network

def main():
    load_dotenv()  # ✅ Load environment variables from .env file
    print(f"Active network: {network.show_active()}")

    private_key = os.getenv("PRIVATE_KEY")  # ✅ Read from environment
    if not private_key:
        raise Exception("❌ PRIVATE_KEY not found in .env file")

    account = accounts.add(private_key)
    print(f"✅ Loaded account address: {account.address}")
    print(f"💰 Balance: {account.balance() / 1e18} ETH")
