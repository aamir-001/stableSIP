from brownie import StableSPY

def main():
    token = StableSPY.at("0xD13c874Fe79Ef2a0Eccc797D08956C184e242Ffe")
    print(f"Current owner: {token.owner()}")
