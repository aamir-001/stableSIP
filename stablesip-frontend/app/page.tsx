"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { format } from "path";

export default function Home() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [spyBalance, setSpyBalance] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false); // Add claiming state
  const [ethPriceData, setEthPriceData] = useState([]);
  const [sspyBalanceData, setSspyBalanceData] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false); // New state for subscription status

  const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  const SPY_ADDRESS = "0x7C67Fd632bbF82f5eFfE91904e9bA20929ae4dfF";
  const SIP_MANAGER_ADDRESS = "0x543DA7DC8aAD790Bbc15bdE915351790c18B1AA4";

  const SIP_ABI = [
    "function subscribe(uint256 amount) external",
    "function claimTokens() external"
  ];

  const TOKEN_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];

  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=7&interval=daily'
        );
        const formattedData = response.data.prices.map(([timestamp, price]) => ({
          time: new Date(timestamp).toLocaleDateString(),
          price: price.toFixed(2),
        }));
        setEthPriceData(formattedData);
      } catch (error) {
        console.error('Error fetching ETH price:', error);
      }
    };

    const interval = setInterval(fetchEthPrice, 60000);
    fetchEthPrice();
    return () => clearInterval(interval);
  }, []);

  

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

  const fetchBalances = async (provider, address) => {
    try {
      // Fetch ETH balance
      const ethBalance = await provider.getBalance(address);
      setBalance(parseFloat(ethers.formatEther(ethBalance)));

      // Fetch USDC balance
      const usdcContract = new ethers.Contract(USDC_ADDRESS, TOKEN_ABI, provider);
      const usdcDecimals = await usdcContract.decimals();
      const usdcBalance = await usdcContract.balanceOf(address);
      setUsdcBalance(parseFloat(ethers.formatUnits(usdcBalance, usdcDecimals)));

      // Fetch SPY balance
      const spyContract = new ethers.Contract(SPY_ADDRESS, TOKEN_ABI, provider);
      const spyBalance = await spyContract.balanceOf(address);
      setSpyBalance(parseFloat(ethers.formatEther(spyBalance)));
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  useEffect(() => {
    const fetchSSPYHistory = async () => {
      if (!account) return;
  
      try {
        const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
        const response = await axios.get(
          `https://api-sepolia.etherscan.io/api?module=account&action=tokentx&contractaddress=${SPY_ADDRESS}&address=${account}&page=1&offset=100&sort=asc&apikey=${apiKey}`
        );
  
        let balance = 0;
        const dailyBalances = new Map();
  
        response.data.result.forEach(tx => {
          const decimals = parseInt(tx.tokenDecimal, 10);
          const value = parseFloat(ethers.formatUnits(tx.value, decimals));
          const isIncoming = tx.to.toLowerCase() === account.toLowerCase();
          balance += isIncoming ? value : -value;
  
          const date = new Date(parseInt(tx.timeStamp) * 1000);
          const dateKey = date.toLocaleDateString();
          // Store the latest balance for each day
          dailyBalances.set(dateKey, balance);
        });
  
        // Convert map to sorted array
        const balanceHistory = Array.from(dailyBalances, ([time, balance]) => ({
          time: new Date(time).toLocaleDateString(),
          balance: Number(balance.toFixed(4))
        })).sort((a, b) => new Date(a.time) - new Date(b.time));
  
        setSspyBalanceData(balanceHistory);
      } catch (error) {
        console.error('Error fetching sSPY history:', error);
      }
    };
  
    fetchSSPYHistory();
  }, [account, spyBalance]);

  const handleSubscribe = async () => {
    if (!account || !investmentAmount) {
      alert("Please connect your wallet and enter an investment amount.");
      return;
    }

    setIsSubscribing(true);
    try {
      const web3Modal = new Web3Modal({ cacheProvider: true });
      const instance = await web3Modal.connect();
      const provider = new ethers.BrowserProvider(instance);
      const signer = await provider.getSigner();

      const usdcContract = new ethers.Contract(
        USDC_ADDRESS,
        ["function approve(address spender, uint256 amount) public returns (bool)"],
        signer
      );

      const amountInWei = ethers.parseUnits(investmentAmount, 6); // USDC has 6 decimals
      const approvalTx = await usdcContract.approve(SIP_MANAGER_ADDRESS, amountInWei);
      await approvalTx.wait();

      const sipContract = new ethers.Contract(SIP_MANAGER_ADDRESS, SIP_ABI, signer);
      const subscribeTx = await sipContract.subscribe(amountInWei);
      await subscribeTx.wait();

      alert("Successfully subscribed to SIP!");

      setIsSubscribed(true); // Update subscription status

      await fetchBalances(provider, account);
    } catch (error) {
      console.error("Error subscribing to SIP:", error);
      alert("Subscription failed. See console for details.");
    } finally {
      setIsSubscribing(false);
    }
  };

  // Add claim tokens handler
  const handleClaim = async () => {
    if (!account) {
      alert("Please connect wallet!");
      return;
    }

    setIsClaiming(true);
    try {
      const web3Modal = new Web3Modal({ cacheProvider: true });
      const instance = await web3Modal.connect();
      const provider = new ethers.BrowserProvider(instance);
      const signer = await provider.getSigner();

      const sipContract = new ethers.Contract(SIP_MANAGER_ADDRESS, SIP_ABI, signer);
      
      // Execute claim
      const claimTx = await sipContract.claimTokens();
      await claimTx.wait();

      // Refresh sSPY balance
      const spyContract = new ethers.Contract(SPY_ADDRESS, TOKEN_ABI, provider);
      const newBalance = await spyContract.balanceOf(account);
      const formattedBalance = parseFloat(ethers.formatEther(newBalance));

      setSpyBalance(formattedBalance);

      const currentDate = new Date();
      const dateString = currentDate.toLocaleDateString();
      setSspyBalanceData((prevData) => {
        const existingEntryIndex = prevData.findIndex(entry => 
          entry.time === dateString
        );
  
        // Fix 3: Create a NEW array reference to force re-render
        const newData = [...prevData];
        
        if (existingEntryIndex !== -1) {
          // Update existing entry
          newData[existingEntryIndex] = {
            time: dateString,
            balance: formattedBalance
          };
        } else {
          // Add new entry
          newData.push({
            time: dateString,
            balance: formattedBalance
          });
        }
  
        // Fix 4: Sort by actual Date objects, not strings
        return newData.sort((a, b) => new Date(a.time) - new Date(b.time));
      });

      alert("Tokens claimed successfully!");
      await fetchBalances(provider, account);

    } catch (error) {
      console.error("Claim Error:", error);
      alert(error.reason || error.message || "Claim failed");
    } finally {
      setIsClaiming(false);
    }
  };


  return (
   <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Stable SPY SIP Investment Dashboard
        </h1>

        {!account ? (
          <div className="text-center">
            <button
              onClick={connectWallet}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        ) : (
          <>
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

              <div className="bg-gray-800 p-6 rounded-3xl shadow-2xl">
                <h3 className="text-xl font-semibold mb-4 text-white">Ethereum Price (USD)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ethPriceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                        itemStyle={{ color: '#E5E7EB' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#818cf8"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            <div className="bg-gray-800 p-6 rounded-3xl shadow-2xl">
            <h3 className="text-xl font-semibold mb-4 text-white">sSPY Balance History</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%" key={sspyBalanceData.length} // Add this key prop
              >
                <LineChart data={sspyBalanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9CA3AF"
                    tickFormatter={(time) => {
                      const date = new Date(time);
                      return `${date.getMonth()+1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => new Intl.NumberFormat('en-US', {
                      notation: value > 10000 ? 'compact' : 'standard'
                    }).format(value)}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                    itemStyle={{ color: '#E5E7EB' }}
                    formatter={(value) => [Number(value).toFixed(4), 'Balance']}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

            </div>

            {/* Wallet Info */}
            <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl mb-12">
              <h2 className="text-2xl font-bold mb-6 text-white">Wallet Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white">
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Address</p>
                  <p className="font-mono truncate text-blue-400">{account}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">ETH Balance</p>
                  <p className="text-xl font-semibold">{balance.toFixed(4)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">USDC Balance</p>
                  <p className="text-xl font-semibold">{usdcBalance.toFixed(2)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">sSPY Balance</p>
                  <p className="text-xl font-semibold text-emerald-400">{spyBalance.toFixed(4)}</p>
                </div>
              </div>
            </div>

          {/* Action Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl">
              <h3 className="text-xl font-bold mb-6 text-white">Subscribe</h3>
              {isSubscribed ? (
                  <p className="text-green-400 text-lg font-semibold">You are already subscribed to the SIP!</p>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">USDC Amount</label>
                      <input
                        type="number"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        className="w-full p-4 bg-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Enter amount"
                      />
                    </div>
                    <button
                      onClick={handleSubscribe}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300"
                      disabled={isSubscribing}
                    >
                      {isSubscribing ? "Processing..." : "Subscribe"}
                    </button>
                  </div>
                )}
            </div>

            <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl">
              <h3 className="text-xl font-bold mb-6 text-white">Claim Tokens</h3>
              <div className="space-y-6">
                <button
                  onClick={handleClaim}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300"
                  disabled={isClaiming}
                >
                  {isClaiming ? 'Claiming...' : 'Claim sSPY Tokens'}
                </button>
              </div>
              </div>

          </div>
        </>
        )}
      </div>
    </div>
  );
}