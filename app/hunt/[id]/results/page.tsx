'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Play,
  Clock,
  Coins,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  Award,
  TrendingUp,
  Share2,
  ArrowLeft,
  Zap,
  Brain,
  Timer,
  Users
} from 'lucide-react';
import { NavHeader } from '@/components/nav-header';

// Required for static export with dynamic routes
export async function generateStaticParams() {
  return [
    { id: 'test-hunt-123' },
    { id: 'HUNT_001' },
    { id: 'HUNT_002' },
    { id: 'HUNT_003' },
    { id: 'science-mystery' },
    { id: 'crypto-detective' },
    { id: 'tech-explorer' }
  ];
}

interface GameResult {
  success: boolean;
  reason: 'completed' | 'timeout' | 'incorrect';
  factLearned?: string;
  algoWon: number;
  timeSpent: number;
  totalTime: number;
  score: number;
  rank?: number;
  bonusPoints: number;
  huntTitle: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  achievements?: string[];
}

export default function HuntResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const huntId = params.id as string;

  // Mock result data - in real app, this would come from URL params or API
  const [gameResult, setGameResult] = useState<GameResult>({
    success: searchParams.get('success') === 'true' || Math.random() > 0.4, // 60% success rate for demo
    reason: searchParams.get('reason') as any || 'completed',
    factLearned: "Quantum computers using error correction can now maintain quantum states for over 100 microseconds, a breakthrough that brings practical quantum computing significantly closer to reality.",
    algoWon: 500,
    timeSpent: 847000, // 14 minutes 7 seconds
    totalTime: 1800000, // 30 minutes
    score: 1250,
    rank: 7,
    bonusPoints: 150,
    huntTitle: "The Science Mystery",
    difficulty: 'expert',
    achievements: ['Speed Demon', 'First Try']
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    if (gameResult.success) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [gameResult.success]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-500 border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'intermediate': return 'text-yellow-500 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'expert': return 'text-red-500 border-red-500 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-500 border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getResultConfig = () => {
    if (gameResult.success) {
      return {
        title: 'Success!',
        subtitle: 'Hunt Completed Successfully',
        color: 'text-emerald-500',
        bgColor: 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20',
        icon: CheckCircle,
        borderColor: 'border-emerald-200 dark:border-emerald-800'
      };
    } else if (gameResult.reason === 'timeout') {
      return {
        title: "Time's Up!",
        subtitle: 'Hunt Timer Expired',
        color: 'text-orange-500',
        bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
        icon: Clock,
        borderColor: 'border-orange-200 dark:border-orange-800'
      };
    } else {
      return {
        title: 'Incorrect!',
        subtitle: 'Better Luck Next Time',
        color: 'text-red-500',
        bgColor: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
        icon: XCircle,
        borderColor: 'border-red-200 dark:border-red-800'
      };
    }
  };

  const resultConfig = getResultConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900">
      <NavHeader />
      
      {/* Confetti Effect for Success */}
      {showConfetti && gameResult.success && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -10,
                rotate: 0,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{
                y: window.innerHeight + 10,
                rotate: 360,
                x: Math.random() * window.innerWidth
              }}
              transition={{
                duration: Math.random() * 2 + 2,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}

      <div className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -20 }}
            className="mb-6"
          >
            <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lobby
            </Button>
          </motion.div>

          {/* Main Result Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <Card className={`shadow-2xl border-2 ${resultConfig.borderColor} bg-gradient-to-br ${resultConfig.bgColor} backdrop-blur-sm`}>
              <CardContent className="pt-12 pb-8">
                {/* Result Icon and Title */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="mb-8"
                >
                  <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center`}>
                    <resultConfig.icon className={`w-12 h-12 ${resultConfig.color}`} />
                  </div>
                  <h1 className={`text-5xl md:text-6xl font-bold mb-4 ${resultConfig.color}`}>
                    {resultConfig.title}
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                    {resultConfig.subtitle}
                  </p>
                </motion.div>

                {/* Hunt Info */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  <Badge className="px-4 py-2 text-base font-semibold bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300">
                    {gameResult.huntTitle}
                  </Badge>
                  <Badge className={`px-4 py-2 text-base font-semibold ${getDifficultyColor(gameResult.difficulty)}`}>
                    <Target className="w-4 h-4 mr-1" />
                    {gameResult.difficulty}
                  </Badge>
                </div>

                {/* Success-specific content */}
                {gameResult.success && gameResult.factLearned && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mb-8"
                  >
                    <Card className="bg-white/60 dark:bg-slate-800/60 border border-emerald-200 dark:border-emerald-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                          <Brain className="w-5 h-5" />
                          Fact Learned
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200 italic">
                          "{gameResult.factLearned}"
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* ALGO Reward Display */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                  className="mb-8"
                >
                  <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full text-white shadow-lg">
                    <Coins className="w-8 h-8" />
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {gameResult.algoWon} ALGO
                      </div>
                      <div className="text-sm opacity-90">
                        {gameResult.success ? 'Earned' : 'Participation Reward'}
                      </div>
                    </div>
                    <Sparkles className="w-8 h-8" />
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Detailed Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <Card className="text-center shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <Timer className="w-8 h-8 mx-auto mb-3 text-blue-500" />
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {formatTime(gameResult.timeSpent)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Time Spent</div>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <TrendingUp className="w-8 h-8 mx-auto mb-3 text-purple-500" />
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {gameResult.score.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Score</div>
              </CardContent>
            </Card>

            {gameResult.rank && (
              <Card className="text-center shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <Users className="w-8 h-8 mx-auto mb-3 text-orange-500" />
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    #{gameResult.rank}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Final Rank</div>
                </CardContent>
              </Card>
            )}

            {gameResult.bonusPoints > 0 && (
              <Card className="text-center shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <Zap className="w-8 h-8 mx-auto mb-3 text-yellow-500" />
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    +{gameResult.bonusPoints}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Bonus Points</div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Achievements */}
          {gameResult.achievements && gameResult.achievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mb-12"
            >
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-center justify-center">
                    <Award className="w-6 h-6 text-yellow-500" />
                    New Achievements Unlocked!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap justify-center gap-3">
                    {gameResult.achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.4 + index * 0.1 }}
                      >
                        <Badge className="px-4 py-2 text-base font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                          <Trophy className="w-4 h-4 mr-2" />
                          {achievement}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Play className="mr-3 w-6 h-6" />
              Play Again
            </Button>

            <Button
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Trophy className="mr-3 w-6 h-6" />
              Go to Trophy Cabinet
            </Button>

            <Button
              variant="outline"
              className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 font-semibold px-6 py-4 rounded-full text-lg transition-all duration-300 hover:scale-105"
            >
              <Share2 className="mr-2 w-5 h-5" />
              Share Result
            </Button>
          </motion.div>

          {/* Motivational Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="text-center mt-12"
          >
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {gameResult.success 
                ? "Excellent work, knowledge miner! Your curiosity and persistence have paid off. Ready for your next discovery?"
                : "Every hunt is a learning experience. The knowledge you've gained is valuable, and your next discovery awaits!"
              }
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}