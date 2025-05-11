from brownie import network, config, project
import os
from pathlib import Path
from dotenv import load_dotenv

#    sip_manager_address = "0x543DA7DC8aAD790Bbc15bdE915351790c18B1AA4"
#    usdc_token_address = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"

def initialize_brownie():
    # Get path to Brownie root .env
    brownie_root = Path(__file__).resolve().parent.parent.parent  # Adjust based on your structure
    load_dotenv(brownie_root / ".env")  # Load from Brownie root
    
    # Load project
    project_path = brownie_root  # Path to brownie-config.yaml
    brownie_project = project.load(project_path, name="StableSIP")
    
    # Network setup
    network.connect(os.getenv("WEB3_NETWORK", "sepolia"))
    
    # Load contract
    sip_manager = brownie_project.SIPManager.at(os.getenv("SIP_MANAGER_ADDRESS"))
    
    return sip_manager