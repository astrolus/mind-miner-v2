'use client';

import { useState, useEffect, useRef } from 'react'; // Import useRef for PeraWalletConnect instance
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  Trophy,
  Coins,
  Users,
  Target,
  Search,
  ArrowRight,
  Sparkles,
  Play,
  ChevronDown,
} from 'lucide-react';
import { NavHeader } from '@/components/nav-header';
import Link from 'next/link'

// Dynamically import PeraWalletConnect to ensure it runs only on the client
// let PeraWalletConnect: any;
// if (typeof window !== 'undefined') {
//   import('@perawallet/connect')
//     .then((module) => {
//       PeraWalletConnect = module.default;
//       // No need to initialize here, will do in useEffect
//     })
//     .catch((error) =>
//       console.error('Failed to load PeraWalletConnect:', error)
//     );
// }

// Algorand SDK import
// Note: While algosdk is imported, it's not strictly necessary for just connecting the wallet.
// It would be used for creating and signing transactions later.
import algosdk from 'algosdk';

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isPeraLoading, setIsPeraLoading] = useState(true); // To store the connected address

  // State for custom message box
  const [messageBoxVisible, setMessageBoxVisible] = useState(false);
  const [messageBoxTitle, setMessageBoxTitle] = useState('');
  const [messageBoxContent, setMessageBoxContent] = useState('');

  // Use useRef to store the PeraWalletConnect instance
  const peraWalletRef = useRef<any>(null);
  const isPeraInitialized = useRef(false);

  useEffect(() => {
    setIsLoaded(true);

    // Initialize Pera Wallet Connect when component mounts on the client
    // and handle the dynamic import within useEffect for better control
    const loadPeraWallet = async () => {
      if (typeof window !== 'undefined' && !isPeraInitialized.current) {
        isPeraInitialized.current = true; // Mark as initialized
        console.log("Attempting to load Pera Wallet Connect...");
        try {
          const { PeraWalletConnect } = await import('@perawallet/connect');
          peraWalletRef.current = new PeraWalletConnect({
              chainId: 416002
          }); 
          
          console.log("Pera Wallet Connect initialized:", peraWalletRef.current);

          // Optional: Reconnect session if already connected
          console.log("Attempting to reconnect Pera Wallet session...");

          peraWalletRef.current
            .reconnectSession()
            .then((accounts: string[]) => {
              if (accounts.length > 0) {
                setConnectedWallet(true);
                setWalletAddress(accounts[0]);
                console.log('Reconnected to accounts:', accounts);
                showMessageBox('Wallet Reconnected!', `Reconnected with account: ${accounts[0]?.substring(0, 8)}...${accounts[0]?.substring(accounts[0].length - 8)}`);

              } else {
                console.log('No existing Pera Wallet session found.');
              }
            })
            .catch((e: any) => {
              console.warn('Pera Wallet reconnect failed:', e);
            })
            .finally(() => {
              setIsPeraLoading(false); // Set loading to false after reconnect attempt
              console.log("Pera Wallet loading complete.");
            });
        } catch (error) {
          console.error('Failed to load PeraWalletConnect:', error);
          setIsPeraLoading(false); // Ensure loading is false even on error
          showMessageBox(
            'Error',
            'Failed to load wallet connector. Please refresh and try again.'
          );
        }
      } else if (isPeraInitialized.current) {
        console.log("Pera Wallet already initialized, skipping re-load.");
        setIsPeraLoading(false); // Ensure loading is false if already initialized
      }
    };

    loadPeraWallet();
  }, []); // Empty dependency array ensures this runs once on mount

  // Function to show custom message box
  const showMessageBox = (title: string, content: string) => {
    setMessageBoxTitle(title);
    setMessageBoxContent(content);
    setMessageBoxVisible(true);
  };

  // Function to hide custom message box
  const hideMessageBox = () => {
    setMessageBoxVisible(false);
  };

  const handleConnectWallet = async () => {
    if (isPeraLoading || !peraWalletRef.current) {
      showMessageBox(
        'Please Wait',
        'Pera Wallet library is still loading. Please try again in a moment.'
      );
      return;
    }

    showMessageBox(
      'Connecting Wallet...',
      'Please open your Pera Wallet to approve the connection.'
    );
    try {
      // Connect to Pera Wallet
      const accounts: string[] = await peraWalletRef.current.connect();
      console.log('Connected accounts:', accounts);
      if (accounts.length > 0) {
        setConnectedWallet(true);
        setWalletAddress(accounts[0]);
        showMessageBox(
          'Wallet Connected!',
          `Successfully connected with account: ${accounts[0]?.substring(
            0,
            8
          )}...${accounts[0]?.substring(accounts[0].length - 8)}`
        );
        // You can store the connected account here (e.g., in localStorage, context, or Redux)
      } else {
        showMessageBox(
          'Connection Failed',
          'No accounts found. Please try again.'
        );
      }
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      // Handle errors (e.g., user rejected connection, network issues)
      if (error.message && error.message.includes('User denied connection')) {
        showMessageBox(
          'Connection Denied',
          'Wallet connection was denied by the user.'
        );
      } else {
        showMessageBox(
          'Connection Error',
          `Failed to connect wallet: ${error.message || 'Unknown error'}.`
        );
      }
    }
  };

  const features = [
    {
      icon: Search,
      title: 'Discover Hidden Facts',
      description:
        "Use AI-powered hints to uncover fascinating content buried deep in Reddit's communities.",
    },
    {
      icon: Coins,
      title: 'Win Testnet Crypto',
      description:
        'Earn ALGO tokens for successful discoveries and completing challenging hunts.',
    },
    {
      icon: Trophy,
      title: 'Collect NFT Trophies',
      description:
        'Unlock unique Algorand NFT achievements that showcase your knowledge mining skills.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900">
      <NavHeader
        isWalletConnected={connectedWallet}
        walletAddress={walletAddress}
        onConnectWallet={handleConnectWallet}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center"
          >
            {/* Main Title */}
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                Mind-Miner
              </span>
              <br />
              <span className="text-gray-800 dark:text-gray-200 text-4xl md:text-5xl lg:text-6xl font-medium">
                The Reddit Knowledge Hunt
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Uncover hidden facts on Reddit, win testnet crypto, and earn
              unique Algorand NFT trophies.
              <br className="hidden md:block" />
              <span className="font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Powered by AI.
              </span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              {!connectedWallet ? (
                <Button
                  onClick={handleConnectWallet}
                  disabled={isPeraLoading}
                  className={`flex items-center justify-center font-semibold px-8 py-4 rounded-full text-lg shadow-lg transition-all duration-300 ${
                    isPeraLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl hover:scale-105'
                  }`}
                >
                  <Wallet className="mr-3 w-5 h-5" />
                  {isPeraLoading ? 'Loading Wallet...' : 'Connect Your Wallet'}
                  {!isPeraLoading && <ArrowRight className="ml-3 w-5 h-5" />}
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/hunt" passHref>
                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <a> {/* Anchor tag is important for Link */}
                        <Play className="mr-3 w-5 h-5" />
                        Start Your First Hunt
                      </a>
                    </Button>
                  </Link>
                  <Button className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 hover:scale-105">
                    <Trophy className="mr-3 w-5 h-5" />
                    View Leaderboard
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Status Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              <Badge className="px-4 py-2 text-sm font-medium border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300">
                <Users className="w-4 h-4 mr-2" />
                2,847 Active Hunters
              </Badge>
              <Badge className="px-4 py-2 text-sm font-medium border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">
                <Target className="w-4 h-4 mr-2" />
                42 Live Hunts
              </Badge>
              <Badge className="px-4 py-2 text-sm font-medium border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300">
                <Coins className="w-4 h-4 mr-2" />
                15,847 ALGO Distributed
              </Badge>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gray-400 dark:text-gray-500"
          >
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Three simple steps to start your knowledge mining adventure
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-3xl p-1"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center">
              <div className="flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-purple-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  Ready to Start Mining?
                </h2>
                <Sparkles className="w-8 h-8 text-blue-600 ml-3" />
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Join thousands of knowledge miners exploring Reddit's depths,
                earning rewards, and building the ultimate collection of
                discovery achievements.
              </p>
              {!connectedWallet ? (
                <Button
                  onClick={handleConnectWallet}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Wallet className="mr-3 w-5 h-5" />
                  Connect Your Wallet
                  <ArrowRight className="ml-3 w-5 h-5" />
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Play className="mr-3 w-5 h-5" />
                    Start Your First Hunt
                  </Button>
                  <Button className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 hover:scale-105">
                    <Trophy className="mr-3 w-5 h-5" />
                    View Leaderboard
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Custom Message Box HTML (inline styles for simplicity) */}
      {messageBoxVisible && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center max-w-sm w-full animate-fade-in-up">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {messageBoxTitle}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {messageBoxContent}
            </p>
            <button
              onClick={hideMessageBox}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
