from brownie import accounts, config, SIPManager, StableSPY

def test_live_contracts():
    account = accounts.add(config["wallets"]["from_key"])

    # Attach to deployed contracts (adjust if redeployed)
    token = StableSPY.at("0xD13c874Fe79Ef2a0Eccc797D08956C184e242Ffe")
    sip = SIPManager.at("0x5f36AdbaeF230AfA9c85002cC7fb0c8fCd38dE03")

    # 1. Subscribe (e.g., 100 USD)
    usd_amount = 100 * 10**18
    tx1 = sip.subscribe(usd_amount, {"from": account})
    assert tx1.status == 1
    print("✅ Subscribed successfully")

    # 2. Fast forward time (Ganache local only) — not usable on Sepolia
    chain.sleep(30 * 24 * 60 * 60)
    chain.mine()

    # 3. Try claiming tokens
    tx2 = sip.claimTokens({"from": account})
    assert tx2.status == 1
    print("✅ Claimed tokens successfully")

    # 4. Check user token balance
    balance = token.balanceOf(account.address)
    print(f"📦 Token Balance: {balance / 10**18:.4f} StableSPY")

    assert balance > 0
