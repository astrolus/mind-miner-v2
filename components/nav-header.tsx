'use client'

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Wallet, 
  Menu,
  X,
  Trophy,
  Target,
  Users,
  Coins
} from 'lucide-react';
import Link from 'next/link'
import { useWallet } from '@/app/providers/WalletProvider';
import Image from 'next/image';
import { useState } from 'react';

export function NavHeader() {
  // If mobile menu state is needed, it should be managed locally or via another context

  const {
    connectedWallet,
    walletAddress,
    isPeraLoading,
    handleConnectWallet,
    totalAlgoEarned, // Consume new state
  } = useWallet();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between relative"> {/* Added relative positioning */}
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Link href="/" passHref className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mind-Miner
              </span>
          </Link>
        </motion.div>

        {/* Desktop Navigation - Centered */}
        <div className="hidden md:flex items-center gap-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <nav className="flex items-center gap-6">
            <Link href="/lobby" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              Lobby
            </Link>
            <Link href="/faq" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              FAQ
            </Link>
            <Link href="/trophy-cabinet" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              Trophy Cabinet
            </Link>
          </nav>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {connectedWallet && totalAlgoEarned !== null && (
            <Badge variant="outline" className="hidden sm:flex text-emerald-600 border-emerald-200 dark:border-emerald-800 dark:text-emerald-400">
              <Coins className="w-3 h-3 mr-1" />
              {totalAlgoEarned.toLocaleString()} ALGO
            </Badge>
          )}

          {/* New Image Link */}
          <Link href="https://bolt.new/" target="_blank" rel="noopener noreferrer" className="flex items-center">
            <Image
              src="/white_circle_360x360.png"
              alt="Bolt.new Link"
              width={50}
              height={50}
              className="rounded-full"
            />
          </Link>
          <Button 
            variant={connectedWallet ? "outline" : "default"}
            size="sm" 
            onClick={handleConnectWallet} // Use handleConnectWallet from context
            disabled={isPeraLoading || connectedWallet} // Disable if loading or already connected
            className={connectedWallet 
              ? "border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400" 
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            }
          >
            <Wallet className="w-4 h-4 mr-2" />
            {isPeraLoading ? 'Loading...' : (connectedWallet ? (walletAddress ? `${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}` : 'Connected') : 'Connect')}
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
        >
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link href="/lobby" className="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              Lobby
            </Link>
            <Link href="/faq" className="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              FAQ
            </Link>
            <Link href="/trophy-cabinet" className="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              Trophy Cabinet
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}