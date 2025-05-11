from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from brownie import Contract, accounts, network, config
import json

# Contract setup
SIP_MANAGER_ADDRESS = "0x543DA7DC8aAD790Bbc15bdE915351790c18B1AA4"
USDC_TOKEN_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
STABLESPY_ADDRESS = "0xD13c874Fe79Ef2a0Eccc797D08956C184e242Ffe"

USDC_ABI = [
    {
        "constant": False,
        "inputs": [
            {"name": "spender", "type": "address"},
            {"name": "amount", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function"
    }
]

@csrf_exempt
def subscribe_to_sip(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            amount = int(data['amount'])
            private_key = data['privateKey']
            
            # Setup account and contracts
            account = accounts.add(private_key)
            usdc = Contract.from_abi("USDC", USDC_TOKEN_ADDRESS, USDC_ABI)
            sip = Contract(SIP_MANAGER_ADDRESS)
            
            # Convert amount
            decimals = usdc.decimals()
            amount_scaled = amount * 10 ** decimals
            
            # Execute transactions
            usdc.approve(sip.address, amount_scaled, {'from': account}).wait(1)
            tx = sip.subscribe(amount_scaled, {'from': account})
            
            return JsonResponse({
                'status': 'success',
                'tx_hash': tx.txid
            })
            
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)
    elif request.method == 'OPTIONS':
            # Handle preflight requests
            response = JsonResponse({}, status=200)
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Headers'] = 'Content-Type'
            return response
    return JsonResponse({'status': 'method_not_allowed'}, status=405)

@csrf_exempt
def claim_tokens(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            private_key = data['privateKey']
            
            # Initialize account with provided private key
            account = accounts.add(private_key)
            
            # Connect to contracts
            sip = Contract(SIP_MANAGER_ADDRESS)
            token = Contract(STABLESPY_ADDRESS)
            
            # Claim tokens
            tx = sip.claimTokens({'from': account})
            tx.wait(1)
            
            # Get updated balance
            balance = token.balanceOf(account.address)
            
            return JsonResponse({
                'status': 'success',
                'transaction_hash': tx.txid,
                'new_balance': balance / 10**18
            })

        except Exception as e:
            # Improved error message parsing
            error_msg = str(e)
            if "revert" in error_msg:
                error_msg = error_msg.split("revert: ")[-1]
            return JsonResponse({
                'status': 'error',
                'message': error_msg
            }, status=400)
    
    elif request.method == 'OPTIONS':
        response = JsonResponse({}, status=200)
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
        
    return JsonResponse({'message': 'Method not allowed'}, status=405)