'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Trophy,
  Clock,
  Coins,
  Target,
  TrendingUp,
  Award,
  Users,
  Zap,
  Star,
  ChevronRight,
  Activity,
  Calendar,
  Flame
} from 'lucide-react';
import { NavHeader } from '@/components/nav-header';

interface PlayerStats {
  totalHunts: number;
  completedHunts: number;
  avgCompletionTime: number;
  totalAlgoEarned: number;
  currentLevel: number;
  experience: number;
  experienceToNext: number;
  successRate: number;
  currentStreak: number;
  bestStreak: number;
  rank: number;
  achievements: number;
}

interface ActiveHunt {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  timeRemaining: number;
  progress: number;
  reward: number;
}

export default function GameLobby() {
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    totalHunts: 47,
    completedHunts: 38,
    avgCompletionTime: 18.5,
    totalAlgoEarned: 2847,
    currentLevel: 12,
    experience: 3420,
    experienceToNext: 1580,
    successRate: 81,
    currentStreak: 7,
    bestStreak: 15,
    rank: 156,
    achievements: 23
  });

  const [activeHunts, setActiveHunts] = useState<ActiveHunt[]>([
    {
      id: 'HUNT_001',
      title: 'The Science Mystery',
      difficulty: 'expert',
      timeRemaining: 3600000, // 1 hour in ms
      progress: 65,
      reward: 500
    },
    {
      id: 'HUNT_002',
      title: 'Tech Treasure Hunt',
      difficulty: 'intermediate',
      timeRemaining: 7200000, // 2 hours in ms
      progress: 30,
      reward: 250
    }
  ]);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    // Update active hunt timers
    const interval = setInterval(() => {
      setActiveHunts(prev => prev.map(hunt => ({
        ...hunt,
        timeRemaining: Math.max(0, hunt.timeRemaining - 1000)
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-500 border-green-500';
      case 'intermediate': return 'text-yellow-500 border-yellow-500';
      case 'expert': return 'text-red-500 border-red-500';
      default: return 'text-gray-500 border-gray-500';
    }
  };

  const experiencePercentage = (playerStats.experience / (playerStats.experience + playerStats.experienceToNext)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900">
      <NavHeader />
      
      <div className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                Game Lobby
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Ready to discover hidden knowledge? Your next adventure awaits.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Action Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Start New Hunt - Hero Section */}
              <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 p-1">
                <div className="bg-white dark:bg-slate-900 rounded-lg p-8 h-full">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                        Ready for Your Next Hunt?
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                        Dive into Reddit's depths and uncover hidden treasures. AI-powered hints will guide your journey.
                      </p>
                      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-300">
                          <Zap className="w-3 h-3 mr-1" />
                          AI Powered
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300">
                          <Coins className="w-3 h-3 mr-1" />
                          Earn ALGO
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-300">
                          <Trophy className="w-3 h-3 mr-1" />
                          Win NFTs
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <Button 
                        className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold px-8 py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <Play className="mr-3 w-6 h-6" />
                        Start New Hunt
                        <ChevronRight className="ml-3 w-5 h-5" />
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-2 border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20 font-semibold px-6 py-3 rounded-xl"
                      >
                        <Trophy className="mr-2 w-5 h-5" />
                        Trophy Cabinet
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Active Hunts */}
              {activeHunts.length > 0 && (
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Activity className="w-5 h-5 text-orange-500" />
                      Active Hunts
                      <Badge className="ml-auto bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                        {activeHunts.length} Running
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activeHunts.map((hunt, index) => (
                      <motion.div
                        key={hunt.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{hunt.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={getDifficultyColor(hunt.difficulty)}>
                                {hunt.difficulty}
                              </Badge>
                              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(hunt.timeRemaining)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                              {hunt.reward} ALGO
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {hunt.progress}% complete
                            </div>
                          </div>
                        </div>
                        <Progress value={hunt.progress} className="h-2" />
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Player Stats Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-6"
            >
              {/* Player Level & Experience */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Level {playerStats.currentLevel}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Experience</span>
                      <span className="font-semibold">
                        {playerStats.experience.toLocaleString()} / {(playerStats.experience + playerStats.experienceToNext).toLocaleString()}
                      </span>
                    </div>
                    <Progress value={experiencePercentage} className="h-3" />
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                      {playerStats.experienceToNext.toLocaleString()} XP to Level {playerStats.currentLevel + 1}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Core Statistics */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Your Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Total ALGO Earned */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-emerald-600" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">Total ALGO Earned</span>
                    </div>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {playerStats.totalAlgoEarned.toLocaleString()}
                    </span>
                  </div>

                  {/* Average Completion Time */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">Avg. Completion</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {playerStats.avgCompletionTime}m
                    </span>
                  </div>

                  {/* Total Hunts Completed */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">Hunts Completed</span>
                    </div>
                    <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {playerStats.completedHunts}/{playerStats.totalHunts}
                    </span>
                  </div>

                  {/* Success Rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{playerStats.successRate}%</span>
                    </div>
                    <Progress value={playerStats.successRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Achievements & Streaks */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="w-5 h-5 text-orange-500" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                      <Trophy className="w-6 h-6 mx-auto mb-1 text-orange-600" />
                      <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{playerStats.achievements}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Unlocked</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <Flame className="w-6 h-6 mx-auto mb-1 text-red-600" />
                      <div className="text-lg font-bold text-red-600 dark:text-red-400">{playerStats.currentStreak}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Current Streak</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Global Rank</span>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-gray-200">#{playerStats.rank}</span>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20"
                  >
                    <Trophy className="mr-2 w-4 h-4" />
                    View Trophy Cabinet
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}