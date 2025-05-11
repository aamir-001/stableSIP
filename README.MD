# StableSIP (Stable Systematic Investment Plan)

A decentralized application for automated cryptocurrency investments using smart contracts. This project allows users to set up recurring investments in SPY-pegged tokens on the Sepolia testnet.

## Project Structure
```
stableSIP/
├── contracts/               # Smart contracts
├── stablesipapi/           # Django backend
├── stablesip-frontend/     # Next.js frontend
├── scripts/                # Deployment scripts
└── tests/                  # Contract tests
```

## Prerequisites
- Python 3.10+
- Node.js 16+
- Git
- MetaMask wallet
- Sepolia testnet ETH

## Environment Setup

### 1. Backend Setup
Create a Python virtual environment:
```bash
# Create virtual environment
python -m venv venvl
cd stableSIP

# Activate virtual environment
# On Windows:
.\venvl\Scripts\activate
# On Unix/MacOS:
source venvl/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Variables
Create a `.env` file in the root directory:
```plaintext
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
WEB3_INFURA_PROJECT_ID=your_infura_project_id
```

Create a `.env.local` file in `stablesip-frontend/`:
```plaintext
NEXT_PUBLIC_ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. Smart Contract Deployment
```bash
# Compile contracts
brownie compile

# Deploy to Sepolia
brownie run scripts/deploy.py --network newsepolia

# Note the deployed addresses and update them in the frontend
```

### 4. Frontend Setup
```bash
cd stablesip-frontend
npm install
```

## Running the Application

### 1. Start Backend Server
```bash
cd stablesipapi
python manage.py migrate
python manage.py runserver 4200
```

### 2. Start Frontend Development Server
```bash
cd stablesip-frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Using the Application

1. Connect MetaMask to Sepolia testnet
2. Get Sepolia ETH from a faucet
3. Connect wallet in the application
4. Set up an investment plan
5. Approve USDC spending
6. Monitor your investments

## Contract Addresses (Sepolia)
- SIPManager: `0x5f36AdbaeF230AfA9c85002cC7fb0c8fCd38dE03`
- StableSPY: `0x7C67Fd632bbF82f5eFfE91904e9bA20929ae4dfF`
- USDC: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`

## API Documentation

### Subscribe to SIP
```bash
POST /api/subscribe/
{
    "amount": 100,  # Amount in USDC
    "address": "0x..."  # User's wallet address
}
```

### Claim Tokens
```bash
POST /api/claim/
{
    "address": "0x..."  # User's wallet address
}
```

## License
MIT
