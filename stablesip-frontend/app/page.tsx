"use client";
import { useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

export default function Home() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [spyBalance, setSpyBalance] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [isClaiming, setIsClaiming] = useState(false); // Add claiming state

  const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  const SPY_ADDRESS = "0x7C67Fd632bbF82f5eFfE91904e9bA20929ae4dfF";
  
  const TOKEN_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const web3Modal = new Web3Modal({ cacheProvider: true });
      const instance = await web3Modal.connect();
      const provider = new ethers.BrowserProvider(instance);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      
      const ethBalance = await provider.getBalance(address);
      setBalance(parseFloat(ethers.formatEther(ethBalance)));
      
      const usdcContract = new ethers.Contract(USDC_ADDRESS, TOKEN_ABI, provider);
      const usdcDecimals = await usdcContract.decimals();
      const usdcBalance = await usdcContract.balanceOf(address);
      setUsdcBalance(parseFloat(ethers.formatUnits(usdcBalance, usdcDecimals)));

      const spyContract = new ethers.Contract(SPY_ADDRESS, TOKEN_ABI, provider);
      const spyBalance = await spyContract.balanceOf(address);
      setSpyBalance(parseFloat(ethers.formatEther(spyBalance)));

    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Error connecting wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSubscribe = async () => {
    if (!account || !investmentAmount || !privateKey) {
      alert("All fields required!");
      return;
    }

    setIsSubscribing(true);
    try {
      const response = await fetch('http://localhost:8000/api/subscribe/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'  // REMOVED INCORRECT CORS HEADER
        },
        body: JSON.stringify({
          amount: parseInt(investmentAmount),
          address: account,
          privateKey: privateKey
        })
      });

      // Add proper response handling
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        alert("Subscribed successfully!");
        // Consider adding balance refresh here
      } else {
        alert(`Failed: ${data.message}`);
      }
      
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Subscription failed");
    } finally {
      setIsSubscribing(false);
    }
  };

  // Add claim tokens handler
  const handleClaim = async () => {
    if (!account || !privateKey) {
      alert("Pro fields required!");
      return;
    }

    setIsClaiming(true);
    try {
      const response = await fetch('http://localhost:8000/api/claim/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: account,
          privateKey: privateKey
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Claim failed');
      }

      const data = await response.json();
      alert(data.status === 'success' 
        ? "Tokens claimed successfully!" 
        : `Failed: ${data.message}`);

      // Refresh balances after claim
      const provider = new ethers.BrowserProvider(window.ethereum);
      const spyContract = new ethers.Contract(SPY_ADDRESS, TOKEN_ABI, provider);
      const spyBalance = await spyContract.balanceOf(account);
      setSpyBalance(parseFloat(ethers.formatEther(spyBalance)));

    } catch (error) {
      console.error("Claim Error:", error);
      alert(error.message || "Claim failed");
    } finally {
      setIsClaiming(false);
    }
  };


  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Wallet Dashboard</h1>
        
        {!account ? (
          <button
            onClick={connectWallet}
            className="w-full p-4 bg-blue-500 text-white rounded-lg"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="p-6 bg-gray-100 rounded-lg space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-4">Wallet Info</h2>
              <p>Address: {account}</p>
              <p>ETH: {balance.toFixed(4)}</p>
              <p>USDC: {usdcBalance.toFixed(2)}</p>
              <p>StableSPY: {spyBalance.toFixed(4)}</p>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Subscribe</h3>
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder="USDC Amount"
                className="w-full p-2 border rounded mb-4"
              />
              <input
                type="text"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter private key (INSECURE)"
                className="w-full p-2 border rounded mb-4 text-red-500"
              />
              <button
                onClick={handleSubscribe}
                className="w-full p-4 bg-green-500 text-white rounded-lg"
              >
                {isSubscribing ? 'Processing...' : 'Subscribe'}
              </button>
            </div>

            <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Claim Tokens</h3>
                <button
                  onClick={handleClaim}
                  className="w-full p-4 bg-purple-500 text-white rounded-lg"
                  disabled={isClaiming}
                >
                  {isClaiming ? 'Claiming...' : 'Claim StableSPY'}
                </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}