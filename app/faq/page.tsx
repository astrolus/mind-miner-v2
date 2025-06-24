'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NavHeader } from '@/components/nav-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wallet, Coins, Network, Play, Lightbulb, Search, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900">
      <NavHeader />

      <div className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -20 }}
            className="mb-6"
          >
            <Button asChild variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to know to start your Mind-Miner journey.
            </p>
          </motion.div>

          <div className="space-y-8">
            {/* Wallet Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Wallet className="w-6 h-6 text-blue-500" />
                    What kind of wallet do I need?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    Mind-Miner operates on the Algorand blockchain. To play, you'll need an Algorand-compatible wallet. We highly recommend using <a href="https://perawallet.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400 font-semibold">Pera Wallet</a>, which offers a seamless connection experience.
                  </p>
                  <p className="flex items-start gap-2">
                    <Network className="w-5 h-5 text-purple-500 flex-shrink-0 mt-1" />
                    <strong>Important:</strong> Your wallet must be configured to use the <strong>Algorand TestNet</strong>, not MainNet. Most wallets allow you to switch networks in their settings.
                  </p>
                  <p className="flex items-start gap-2">
                    <Coins className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
                    You'll need a small amount of ALGO (approximately 0.01 ALGO) in your TestNet wallet to cover transaction fees for rewards and NFTs. You can easily request free TestNet ALGO from the <a href="https://bank.testnet.algorand.network/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline dark:text-emerald-400 font-semibold">Algorand TestNet Dispenser</a>.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* How to Play */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Play className="w-6 h-6 text-emerald-500" />
                    How do I play Mind-Miner?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    Mind-Miner is a knowledge hunt game on Reddit. Here's a quick overview:
                  </p>
                  <ul className="list-disc list-inside space-y-2 pl-4">
                    <li className="flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                      <strong>Start a Hunt:</strong> Connect your wallet and click "Start New Hunt". Our AI will generate a unique clue for you.
                    </li>
                    <li className="flex items-start gap-2">
                      <Search className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                      <strong>Hunt for Knowledge:</strong> Use the clue to search through Reddit posts and comments. The goal is to find the specific comment that contains the hidden fact.
                    </li>
                    <li className="flex items-start gap-2">
                      <Trophy className="w-5 h-5 text-purple-500 flex-shrink-0 mt-1" />
                      <strong>Submit & Earn:</strong> Once you find the comment, copy its permalink and submit it. If correct, you'll earn TestNet ALGO and potentially unique NFT trophies!
                    </li>
                  </ul>
                  <p>
                    Hunts have a time limit, so be quick and precise!
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Rewards and NFTs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    What are the rewards?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    For each successful hunt, you'll earn TestNet ALGO directly to your connected wallet. The amount varies based on the hunt's difficulty.
                  </p>
                  <p>
                    Beyond ALGO, you can earn unique Algorand NFT trophies for special achievements, such as your first discovery, completing expert hunts, or achieving perfect scores. These NFTs are stored in your wallet and displayed in your Trophy Cabinet.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}