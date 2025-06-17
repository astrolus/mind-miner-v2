'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  ExternalLink,
  Send,
  Lightbulb,
  Target,
  Trophy,
  AlertCircle,
  CheckCircle,
  Zap,
  ArrowLeft,
  Copy,
  RefreshCw
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

interface HuntData {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  timeRemaining: number;
  clue: string;
  targetSubreddit: string;
  reward: number;
  progress: number;
  hintsUsed: number;
  maxHints: number;
}

export default function ActiveHuntPage() {
  const params = useParams();
  const huntId = params.id as string;

  const [huntData, setHuntData] = useState<HuntData>({
    id: huntId,
    title: 'The Science Mystery',
    difficulty: 'expert',
    timeRemaining: 300000, // 5 minutes in milliseconds
    clue: 'Look for a recent breakthrough in quantum computing that has been discussed in r/science. The post should have significant engagement (500+ upvotes) and contain comments from verified researchers. Pay special attention to discussions about error correction and practical applications.',
    targetSubreddit: 'r/science',
    reward: 500,
    progress: 65,
    hintsUsed: 1,
    maxHints: 3
  });

  const [permalinkInput, setPermalinkInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    // Update countdown timer
    const interval = setInterval(() => {
      setHuntData(prev => ({
        ...prev,
        timeRemaining: Math.max(0, prev.timeRemaining - 1000)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-500 border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'intermediate': return 'text-yellow-500 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'expert': return 'text-red-500 border-red-500 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-500 border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const handleSubmit = async () => {
    if (!permalinkInput.trim()) return;
    
    setIsSubmitting(true);
    setSubmissionStatus('idle');
    
    // Simulate API call
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate
      setSubmissionStatus(success ? 'success' : 'error');
      setIsSubmitting(false);
      
      if (success) {
        setHuntData(prev => ({ ...prev, progress: Math.min(100, prev.progress + 20) }));
        setPermalinkInput('');
      }
    }, 2000);
  };

  const handleOpenReddit = () => {
    window.open(`https://reddit.com/${huntData.targetSubreddit}`, '_blank');
  };

  const handleRequestHint = () => {
    if (huntData.hintsUsed < huntData.maxHints) {
      setHuntData(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
      // In a real app, this would fetch a new hint from the AI
    }
  };

  const timeIsLow = huntData.timeRemaining < 60000; // Less than 1 minute

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
            <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lobby
            </Button>
          </motion.div>

          {/* Hunt Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-200">
              {huntData.title}
            </h1>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <Badge className={getDifficultyColor(huntData.difficulty)}>
                <Target className="w-3 h-3 mr-1" />
                {huntData.difficulty}
              </Badge>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                {huntData.targetSubreddit}
              </Badge>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800">
                <Trophy className="w-3 h-3 mr-1" />
                {huntData.reward} ALGO
              </Badge>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Hunt Interface */}
            <div className="lg:col-span-2 space-y-6">
              {/* Countdown Timer */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className={`shadow-lg border-0 ${timeIsLow ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white/80 dark:bg-slate-800/80'} backdrop-blur-sm`}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Clock className={`w-6 h-6 ${timeIsLow ? 'text-red-500' : 'text-blue-500'}`} />
                        <span className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                          Time Remaining
                        </span>
                      </div>
                      <div className={`text-6xl md:text-7xl font-bold font-mono ${timeIsLow ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'}`}>
                        {formatTime(huntData.timeRemaining)}
                      </div>
                      {timeIsLow && (
                        <motion.div
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="mt-2 text-red-500 font-semibold flex items-center justify-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          Time is running out!
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* AI Clue */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl text-purple-700 dark:text-purple-300">
                      <Lightbulb className="w-6 h-6" />
                      AI-Generated Clue
                      <Badge className="ml-auto bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                        <Zap className="w-3 h-3 mr-1" />
                        AI Powered
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                      <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
                        {huntData.clue}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        variant="outline"
                        onClick={handleRequestHint}
                        disabled={huntData.hintsUsed >= huntData.maxHints}
                        className="border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
                      >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Request Hint ({huntData.hintsUsed}/{huntData.maxHints})
                      </Button>
                      <Button
                        variant="outline"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Clue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Reddit Access */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="shadow-lg border-0 bg-orange-50 dark:bg-orange-900/20 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-orange-800 dark:text-orange-200 mb-4">
                        Ready to Hunt?
                      </h3>
                      <p className="text-orange-700 dark:text-orange-300 mb-6">
                        Click below to open {huntData.targetSubreddit} in a new tab and start your search!
                      </p>
                      <Button
                        onClick={handleOpenReddit}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <ExternalLink className="w-5 h-5 mr-3" />
                        Open {huntData.targetSubreddit}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Submission Interface */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Send className="w-5 h-5 text-emerald-500" />
                      Submit Your Discovery
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="permalink" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                        Paste Comment Permalink Here
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        Right-click on a comment and select "Copy link" to get the permalink
                      </p>
                      <Input
                        id="permalink"
                        value={permalinkInput}
                        onChange={(e) => setPermalinkInput(e.target.value)}
                        placeholder="https://www.reddit.com/r/science/comments/..."
                        className="text-base py-3 border-2 focus:border-emerald-400 dark:focus:border-emerald-500"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    {submissionStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg"
                      >
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                          Great discovery! Your submission has been validated.
                        </span>
                      </motion.div>
                    )}
                    
                    {submissionStatus === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                      >
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-700 dark:text-red-300 font-medium">
                          This doesn't match the hunt criteria. Try again!
                        </span>
                      </motion.div>
                    )}

                    <Button
                      onClick={handleSubmit}
                      disabled={!permalinkInput.trim() || isSubmitting}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Validating Discovery...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Submit Discovery
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Hunt Progress Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="space-y-6"
            >
              {/* Progress Overview */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5 text-blue-500" />
                    Hunt Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Progress</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{huntData.progress}%</span>
                    </div>
                    <Progress value={huntData.progress} className="h-3" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{huntData.hintsUsed}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Hints Used</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{huntData.reward}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">ALGO Reward</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hunt Tips */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <p>• Look for posts with high engagement (upvotes & comments)</p>
                    <p>• Check for verified researcher flairs</p>
                    <p>• Focus on recent posts (last 48 hours)</p>
                    <p>• Read comment threads thoroughly</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}