'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Trophy,
  Search,
  Filter,
  Clock,
  Coins,
  Award,
  Star,
  Target,
  Brain,
  Zap,
  Crown,
  Gem,
  Shield,
  Flame,
  ArrowLeft,
  Grid3X3,
  List,
  SortAsc,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { NavHeader } from '@/components/nav-header';
import { useWallet } from '@/app/providers/WalletProvider'; // Import the useWallet hook
import { NFT } from '@/lib/supabase'; // Import NFT interface from your Supabase lib
import Link from 'next/link';

interface TrophyDisplayData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'achievement' | 'hunt_completion' | 'milestone' | 'special'; // Derived from achievement_type or metadata
  earnedDate: string;
  avgTime: number; // in seconds, from metadata
  totalAlgoEarned: number; // from metadata
  huntType?: string; // from metadata
  difficulty?: 'beginner' | 'intermediate' | 'expert'; // from metadata
}

export default function TrophyCabinetPage() {
  const [trophies, setTrophies] = useState<TrophyDisplayData[]>([]);
  const [filteredTrophies, setFilteredTrophies] = useState<TrophyDisplayData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerOverallStats, setPlayerOverallStats] = useState<{
    totalAlgoEarned: number;
    avgCompletionTime: number; // in minutes from API
    totalHunts: number;
  } | null>(null);
  const { walletAddress } = useWallet(); // Get the wallet address from the provider

  useEffect(() => {
    const fetchTrophies = async () => {
      setLoading(true);
      setError(null);
      try {
        // IMPORTANT: Replace with actual user wallet address from your auth system
        const userWallet = walletAddress;

        if (!userWallet) {
          setError('Please connect your wallet.');
          setLoading(false);
          return;
        }

        // Fetch Player Overall Stats from the users table
        const statsResponse = await fetch(`/api/get_player_stats?userId=${userWallet}&type=overview`);
        if (!statsResponse.ok) {
          const errorData = await statsResponse.json();
          throw new Error(errorData.error || 'Failed to fetch player stats');
        }
        const statsData = await statsResponse.json();
        setPlayerOverallStats({
          totalAlgoEarned: statsData.stats.rewards.totalAlgoEarned || 0,
          avgCompletionTime: statsData.stats.hunting.averageTime || 0,
          totalHunts: statsData.stats.hunting.totalHunts || 0,
        });

        const response = await fetch(`/api/get_nfts?userId=${userWallet}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch NFTs');
        }
        const data = await response.json();

        // Helper functions (ideally in a shared utility file)
        const formatAchievementName = (type: string): string => {
          return type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        };

        const getAchievementDescription = (type: string): string => {
          const descriptions = {
            first_discovery: 'Commemorates your very first successful knowledge hunt on MindMiner.',
            speed_demon: 'Awarded for completing multiple hunts with exceptional speed and accuracy.',
            science_explorer: 'Recognizes mastery in discovering scientific knowledge and research.',
            perfect_streak: 'Celebrates an impressive streak of consecutive successful hunts.',
            community_champion: 'Honors outstanding contributions to the MindMiner community.',
            knowledge_sage: 'The highest honor for accumulated wisdom and discovery achievements.',
            crypto_detective: 'Specialized achievement for uncovering blockchain and crypto insights.',
            tech_pioneer: 'Awarded for discovering cutting-edge technology discussions and innovations.',
            perfect_expert: 'Awarded for a perfect completion of an expert-level hunt.'
          };
          return descriptions[type as keyof typeof descriptions] || `Special achievement earned through exceptional performance in MindMiner hunts.`;
        };

        const determineRarity = (type: string): 'common' | 'rare' | 'epic' | 'legendary' => {
          const rarityMap = {
            first_discovery: 'common',
            speed_demon: 'rare',
            science_explorer: 'rare',
            perfect_streak: 'epic',
            community_champion: 'epic',
            knowledge_sage: 'legendary',
            crypto_detective: 'rare',
            tech_pioneer: 'rare',
            perfect_expert: 'legendary'
          };
          return (rarityMap[type as keyof typeof rarityMap] || 'common') as 'common' | 'rare' | 'epic' | 'legendary';
        };

        const generateNFTImageUrl = (type: string): string => {
          const imageMap = {
            first_discovery: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400',
            speed_demon: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
            science_explorer: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=400',
            perfect_streak: 'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=400',
            community_champion: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400',
            knowledge_sage: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400',
            crypto_detective: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=400',
            tech_pioneer: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=400',
            perfect_expert: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400'
          };
          return imageMap[type as keyof typeof imageMap] || 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400';
        };

        const mappedTrophies: TrophyDisplayData[] = data.nfts.map((nft: NFT) => {
          const metadata = nft.metadata || {};
          const achievementType = nft.achievement_type;

          // Helper to get value, prioritizing direct metadata property, then attributes
          const getValue = (key: string, defaultValue: any = 0) => {
            if (metadata[key] !== undefined) return metadata[key];
            const attr = metadata.attributes?.find((a: any) => a.trait_type === key);
            return attr ? attr.value : defaultValue;
          };

          const completionTime = getValue('completion_time', 0);
          const algoEarned = getValue('algo_earned', 0);
          const huntDifficulty = getValue('hunt_difficulty');
          const huntType = getValue('hunt_type');

          let category: TrophyDisplayData['category'] = 'achievement';
          if (metadata.category) { // If a specific category is set in metadata
            category = metadata.category;
          } else { // Fallback based on achievement_type
            if (achievementType.includes('hunt') || achievementType.includes('expert') || achievementType.includes('detective') || achievementType.includes('explorer') || achievementType.includes('pioneer')) {
              category = 'hunt_completion';
            } else if (achievementType.includes('milestone') || achievementType.includes('sage')) {
              category = 'milestone';
            } else if (achievementType.includes('community') || achievementType.includes('special') || achievementType.includes('champion')) {
              category = 'special';
            }
          }

          return {
            id: nft.id,
            title: metadata.name || formatAchievementName(achievementType),
            description: metadata.description || getAchievementDescription(achievementType),
            imageUrl: metadata.image || generateNFTImageUrl(achievementType),
            rarity: determineRarity(achievementType),
            category: category,
            earnedDate: nft.mint_date ? new Date(nft.mint_date).toISOString().split('T')[0] : 'N/A',
            avgTime: completionTime,
            totalAlgoEarned: algoEarned,
            huntType: huntType,
            difficulty: huntDifficulty,
          };
        });

        setTrophies(mappedTrophies);
        setFilteredTrophies(mappedTrophies); // Initialize filtered trophies
      } catch (err) {
        console.error('Error fetching trophies:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
        setIsLoaded(true); // Indicate that initial load is complete for animations
      }
    };

    fetchTrophies();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    let filtered = trophies;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(trophy =>
        trophy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trophy.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply rarity filter
    if (selectedRarity !== 'all') {
      filtered = filtered.filter(trophy => trophy.rarity === selectedRarity);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(trophy => trophy.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime();
        case 'rarity':
          const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        case 'algo':
          return b.totalAlgoEarned - a.totalAlgoEarned;
        case 'time':
          return a.avgTime - b.avgTime;
        default:
          return 0;
      }
    });

    setFilteredTrophies(filtered);
  }, [searchTerm, selectedRarity, selectedCategory, sortBy, trophies]);

  // Add loading and error UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900">
        <div className="text-center text-gray-600 dark:text-gray-300">
          <Trophy className="w-16 h-16 mx-auto mb-4 animate-bounce" />
          <p className="text-xl">Loading your trophy cabinet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900">
        <div className="text-center text-red-500">
          <p className="text-xl">Error: {error}</p>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Please try again later.</p>
        </div>
      </div>
    );
  }


  const formatTime = (seconds: number) => {
    if (seconds === 0) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getRarityConfig = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return {
          color: 'from-yellow-400 to-orange-500',
          textColor: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-300 dark:border-yellow-700',
          icon: Crown
        };
      case 'epic':
        return {
          color: 'from-purple-400 to-pink-500',
          textColor: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-300 dark:border-purple-700',
          icon: Gem
        };
      case 'rare':
        return {
          color: 'from-blue-400 to-cyan-500',
          textColor: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-300 dark:border-blue-700',
          icon: Shield
        };
      default:
        return {
          color: 'from-gray-400 to-gray-500',
          textColor: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-300 dark:border-gray-700',
          icon: Star
        };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'achievement': return Award;
      case 'hunt_completion': return Target;
      case 'milestone': return TrendingUp;
      case 'special': return Flame;
      default: return Trophy;
    }
  };

  const totalStats = {
    totalTrophies: playerOverallStats?.totalHunts || 0, // Use total_hunts_completed from API
    totalAlgo: playerOverallStats?.totalAlgoEarned || 0, // Use total_testnet_algo_earned from API
    avgTime: (playerOverallStats?.avgCompletionTime || 0) * 60, // Use avg_completion_time from API (in minutes, convert to seconds)
    rareCount: trophies.filter(t => ['rare', 'epic', 'legendary'].includes(t.rarity)).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900">
      <NavHeader />
      
      <div className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Back Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -20 }}
            className="mb-6"
          >
            <Button asChild variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Lobby
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
              <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Trophy Cabinet
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Your collection of earned NFT achievements and milestones
            </p>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="pt-4 text-center">
                  <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{totalStats.totalTrophies}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Hunts</div>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="pt-4 text-center">
                  <Coins className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{totalStats.totalAlgo.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total ALGO</div>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="pt-4 text-center">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{formatTime(totalStats.avgTime)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Time</div>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="pt-4 text-center">
                  <Gem className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{totalStats.rareCount}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Rare+</div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}