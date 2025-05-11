from brownie import SIPManager, StableSPY, accounts, config
from web3.exceptions import ContractLogicError

def invest_in_sip():
    # Connect account
    account = accounts.add(config["wallets"]["from_key"])
    
    # Connect to deployed contracts
    sip_manager = SIPManager.at("0x5f36AdbaeF230AfA9c85002cC7fb0c8fCd38dE03")
    stable_spy = StableSPY.at("0xD13c874Fe79Ef2a0Eccc797D08956C184e242Ffe")
    
    # Investment amount (in USDC with 6 decimals)
    investment_amount = 100 * 10**6  # 100 USDC
    
    try:
        # Subscribe to SIP
        tx1 = sip_manager.subscribe(investment_amount, {"from": account})
        tx1.wait(1)
        print(f"✅ Subscribed with {investment_amount/10**6} USDC")
        
        # Claim tokens
        tx2 = sip_manager.claimTokens({"from": account})
        tx2.wait(1)
        print(f"✅ Tokens claimed")
        
        # Check balance
        balance = stable_spy.balanceOf(account.address)
        print(f"🏦 Your StableSPY balance: {balance/10**18} sSPY")
        
    except ContractLogicError as e:
        print(f"Error: {e}")

def main():
    invest_in_sip()