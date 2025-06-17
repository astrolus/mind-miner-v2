'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Clock, 
  Zap, 
  Award,
  Activity,
  Target
} from 'lucide-react';

export function GameStats() {
  const [stats, setStats] = useState({
    totalHunts: 1247,
    activeUsers: 2847,
    avgCompletionTime: 24,
    successRate: 78
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalHunts: prev.totalHunts + Math.floor(Math.random() * 2),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 5) - 2,
        avgCompletionTime: Math.max(15, prev.avgCompletionTime + (Math.random() - 0.5) * 2),
        successRate: Math.min(95, Math.max(60, prev.successRate + (Math.random() - 0.5) * 3))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const achievements = [
    { title: "Knowledge Seeker", progress: 85, color: "bg-blue-500" },
    { title: "Reddit Explorer", progress: 92, color: "bg-green-500" },
    { title: "Blockchain Pioneer", progress: 67, color: "bg-purple-500" },
    { title: "Community Leader", progress: 45, color: "bg-orange-500" }
  ];

  return (
    <section className="py-20 bg-slate-800/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-cyber font-bold mb-6 glow-text">
            Live Statistics
          </h2>
          <p className="text-xl text-gray-300">
            Real-time insights from the Mind-Miner ecosystem
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Real-time Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="cyber-border h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400 font-cyber">
                  <Activity className="w-5 h-5" />
                  Platform Analytics
                  <Badge variant="outline" className="ml-auto text-green-400 border-green-400">
                    Live
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-slate-800/50">
                    <div className="text-2xl font-bold text-white">{stats.totalHunts.toLocaleString()}</div>
                    <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
                      <Target className="w-3 h-3" />
                      Total Hunts
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-slate-800/50">
                    <div className="text-2xl font-bold text-white">{stats.activeUsers.toLocaleString()}</div>
                    <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Active Users
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Avg. Completion Time
                    </span>
                    <span className="text-green-400 font-semibold">
                      {stats.avgCompletionTime.toFixed(1)} min
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Success Rate</span>
                      <span className="text-green-400">{stats.successRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={stats.successRate} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievement Progress */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="cyber-border h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400 font-cyber">
                  <Award className="w-5 h-5" />
                  Achievement Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-medium">{achievement.title}</span>
                      <span className="text-green-400 text-sm">{achievement.progress}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={achievement.progress} className="h-2" />
                      <div 
                        className={`absolute top-0 left-0 h-2 rounded-full ${achievement.color} transition-all duration-1000`}
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {[
            { 
              title: "Network Performance", 
              value: "99.8%", 
              subtitle: "Uptime", 
              icon: Zap,
              trend: "+0.2%"
            },
            { 
              title: "AI Response Time", 
              value: "1.2s", 
              subtitle: "Average", 
              icon: Clock,
              trend: "-0.3s"
            },
            { 
              title: "Blockchain TPS", 
              value: "1,247", 
              subtitle: "Transactions/sec", 
              icon: TrendingUp,
              trend: "+12%"
            }
          ].map((metric, index) => (
            <Card key={metric.title} className="cyber-border text-center">
              <CardContent className="pt-6">
                <metric.icon className="w-8 h-8 mx-auto mb-3 text-green-400" />
                <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
                <div className="text-sm text-gray-400 mb-2">{metric.subtitle}</div>
                <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                  {metric.trend}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}