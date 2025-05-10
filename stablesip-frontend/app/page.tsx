"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

export default function Home() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [spyBalance, setSpyBalance] = useState(0);
  const [spyPrices, setSpyPrices] = useState<number[]>([]);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const sipManagerAddress = "0x5f36AdbaeF230AfA9c85002cC7fb0c8fCd38dE03";
  const stableSPYAddress = "0xD13c874Fe79Ef2a0Eccc797D08956C184e242Ffe";
  const sipManagerABI = [
    "function subscribe(uint256 _monthlyInvestmentUSD) external",
    "function getCurrentSPYPrice() public view returns (uint256)",
  ];
  const stableSPYABI = ["function balanceOf(address account) view returns (uint256)"];

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true, // optional
        providerOptions: {} // required if you're using wallet providers
      });

      const instance = await web3Modal.connect();
      const provider = new ethers.BrowserProvider(instance);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setAccount(address);
      const balance = await provider.getBalance(address);
      setBalance(parseFloat(ethers.formatEther(balance)));
      
      // Listen for account changes
      instance.on("accountsChanged", (accounts: string[]) => {
        setAccount(accounts[0] || "");
      });

      // Listen for chain changes
      instance.on("chainChanged", () => {
        window.location.reload();
      });

    } catch (error) {
      console.error("Error connecting wallet:", error);
      if (error === "Modal closed by user") {
        alert("Please connect your wallet to continue");
      } else {
        alert("Error connecting wallet. See console for details.");
      }
    } finally {
      setIsConnecting(false);
    }
  };


  const investInSIP = async () => {
    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const sipManager = new ethers.Contract(sipManagerAddress, sipManagerABI, signer);

      const tx = await sipManager.subscribe(ethers.parseEther(investmentAmount));
      await tx.wait();

      alert("Investment successful!");
      fetchSpyBalance(); // Refresh balance after investment
    } catch (error) {
      console.error("Error investing:", error);
      alert("Investment failed. See console for details.");
    }
  };

  const fetchSpyBalance = async () => {
    if (!account) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const stableSPY = new ethers.Contract(stableSPYAddress, stableSPYABI, provider);

      const balance = await stableSPY.balanceOf(account);
      setSpyBalance(parseFloat(ethers.formatEther(balance)));
    } catch (error) {
      console.error("Error fetching SPY balance:", error);
    }
  };

  const fetchSpyPrices = async () => {
    try {
      const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/85e2f04061cc4d8e883fd4d26b769c60");
      const sipManager = new ethers.Contract(sipManagerAddress, sipManagerABI, provider);

      const price = await sipManager.getCurrentSPYPrice();
      const formattedPrice = parseFloat(ethers.formatEther(price));
      
      setSpyPrices((prevPrices) => {
        const newPrices = [...prevPrices, formattedPrice];
        // Keep only the last 20 prices for better visualization
        return newPrices.slice(-20);
      });
    } catch (error) {
      console.error("Error fetching SPY prices:", error);
    }
  };

  useEffect(() => {
    if (account) {
      fetchSpyBalance();
    }
    
    // Fetch prices initially and then every 30 seconds
    fetchSpyPrices();
    const interval = setInterval(fetchSpyPrices, 30000);
    
    return () => clearInterval(interval);
  }, [account]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold text-center">Stable SIP</h1>
        <p className="text-lg text-center">A simple and secure way to invest in crypto.</p>
      </div>
      <div className="flex flex-col items-center justify-center gap-4">
        {account ? (
          <div className="text-center">
            <p>Connected Wallet: {account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
            <p>ETH Balance: {balance.toFixed(4)} ETH</p>
            <p>StableSPY Balance: {spyBalance.toFixed(4)} SPY</p>
          </div>
        ) : (
          <button
        onClick={connectWallet}
        disabled={isConnecting}
        className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ${
          isConnecting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
        )}
        <div className="flex flex-col gap-2 w-full max-w-md">
          <input
            type="number"
            placeholder="Enter amount in USD"
            className="border p-2 rounded w-full"
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(e.target.value)}
            min="0"
            step="0.01"
          />
          <button
            onClick={investInSIP}
            disabled={!account || !investmentAmount}
            className={`px-4 py-2 text-white rounded w-full ${
              !account || !investmentAmount ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
            } transition-colors`}
          >
            Invest in Stable SIP
          </button>
          <button
            onClick={fetchSpyBalance}
            disabled={!account}
            className={`px-4 py-2 text-white rounded w-full ${
              !account ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'
            } transition-colors`}
          >
            Refresh SPY Balance
          </button>
        </div>
      </div>
      <footer className="text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Stable SIP. All rights reserved.
      </footer>
    </div>
  );
}