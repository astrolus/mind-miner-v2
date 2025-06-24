'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react'; // Import useRouter
import { NavHeader } from '@/components/nav-header';
import { useRouter } from 'next/navigation';
import { useWallet } from './providers/WalletProvider';

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isStartingHunt, setIsStartingHunt] = useState(false); // New state for hunt loading

  const {
    connectedWallet,
    walletAddress,
    isPeraLoading,
    handleConnectWallet,
    showMessageBox,
  } = useWallet();
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    setIsLoaded(true);
  }, []); // Empty dependency array ensures this runs once on mount

  const handleStartHunt = async () => {
    if (!walletAddress) {
      showMessageBox('Wallet Not Connected', 'Please connect your Algorand wallet to start a hunt.');
      return;
    }

    setIsStartingHunt(true);
    showMessageBox('Starting Hunt...', 'Please wait while we prepare your knowledge hunt.');

    try {
      const response = await fetch('/api/start_hunt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wallet_address: walletAddress }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        sessionStorage.setItem(`huntData-${data.game_id}`, JSON.stringify(data));
        showMessageBox('Hunt Started!', 'Redirecting you to your new hunt...');
        router.push(`/hunt/${data.game_id}`);
      } else {
        throw new Error(data.message || data.error || 'Failed to start hunt');
      }
    } catch (error: any) {
      console.error('Error starting hunt:', error);
      // Handle errors (e.g., API issues, network problems)
      showMessageBox('Error Starting Hunt', error.message || 'An unexpected error occurred.');
    } finally {
      setIsStartingHunt(false);
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
      <NavHeader />

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
                  {/* Modified button 1 */}
                  <Button
                    onClick={handleStartHunt}
                    disabled={isStartingHunt}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Play className="mr-3 w-5 h-5" />
                    {isStartingHunt ? 'Starting Hunt...' : 'Start Your First Hunt'}
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
                  </Button> {/* Closing tag for the Button */}
                </div> /* Closing tag for the div */
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Built with curiosity by Zulu in San Francisco.
        </p>
      </footer>
    </div>
  );
}
