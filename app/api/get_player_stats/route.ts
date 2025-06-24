import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService, User } from '@/lib/supabase'; // Import DatabaseService and User interface

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const statsType = searchParams.get('type') || 'overview';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // In production, fetch from database
    const playerStats = await getPlayerStatistics(userId, statsType);

    return NextResponse.json({
      success: true,
      userId,
      stats: playerStats,
      lastUpdated: Date.now()
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Get player stats error:', error);
    return NextResponse.json( // Added details for debugging
      { error: 'Failed to retrieve player statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, statUpdate } = await request.json();

    if (!userId || !statUpdate) {
      return NextResponse.json(
        { error: 'User ID and stat update are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Update player statistics
    const updatedStats = await updatePlayerStatistics(userId, statUpdate);

    return NextResponse.json({
      success: true,
      userId,
      updatedStats,
      message: 'Player statistics updated successfully'
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Update player stats error:', error);
    return NextResponse.json( // Added details for debugging
      { error: 'Failed to update player statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// --- Database-backed implementations ---

async function getPlayerStatistics(userId: string, statsType: string) {
  const { data: user, error: dbError } = await DatabaseService.getUserStats(userId);

  if (dbError || !user) {
    console.error(`Error fetching user stats for ${userId}:`, dbError);
    // Return default/empty stats if user not found or error
    return {
      profile: {
        username: `Player_${userId.slice(-6)}`,
        level: 1,
        experience: 0,
        experienceToNext: 500,
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString()
      },
      hunting: {
        totalHunts: 0,
        completedHunts: 0,
        successRate: 0,
        averageTime: 0,
        bestTime: 0,
        currentStreak: 0,
        bestStreak: 0,
        favoriteTheme: 'general',
        preferredDifficulty: 'beginner'
      },
      rewards: {
        totalAlgoEarned: 0,
        totalNFTs: 0,
        achievements: 0,
        rareNFTs: 0,
        legendaryNFTs: 0
      },
      rankings: {
        globalRank: 99999,
        weeklyRank: 9999,
        categoryRanks: {
          science: 999,
          technology: 999,
          gaming: 999,
          general: 999
        }
      }
    };
  }

  // Map Supabase User data to frontend PlayerStats interface
  const totalHuntsCompleted = user.total_hunts_completed || 0;
  const totalAlgoEarned = user.total_testnet_algo_earned || 0;
  const avgCompletionTime = user.avg_completion_time || 0;

  // Simple leveling system based on completed hunts
  const currentLevel = Math.floor(totalHuntsCompleted / 5) + 1;
  const experience = totalHuntsCompleted * 100;
  const experienceToNext = (currentLevel * 5 * 100) - experience; // 500 XP per level

  // Placeholder/mock values for fields not in DB
  const mockSuccessRate = totalHuntsCompleted > 0 ? 100 : 0; // Assuming total_hunts_completed are successful
  const mockCurrentStreak = 0; // Streaks need separate logic/DB column
  const mockBestStreak = 0;
  const mockRank = 0; // Rank needs a leaderboard query
  const mockAchievements = 0; // Achievements need separate DB table

  const playerStats = {
    profile: {
      username: `Player_${user.wallet_address.slice(-6)}`,
      level: currentLevel,
      experience: experience,
      experienceToNext: experienceToNext,
      joinDate: user.created_at,
      lastActive: new Date().toISOString() // Assuming last active is now
    },
    hunting: {
      totalHunts: totalHuntsCompleted,
      completedHunts: totalHuntsCompleted, // Assuming all completed hunts are successful
      successRate: mockSuccessRate,
      averageTime: avgCompletionTime,
      bestTime: 0, // Not in DB
      currentStreak: mockCurrentStreak,
      bestStreak: mockBestStreak,
      favoriteTheme: 'general', // Not in DB
      preferredDifficulty: 'beginner' // Not in DB
    },
    rewards: {
      totalAlgoEarned: totalAlgoEarned,
      totalNFTs: 0, // Not in DB
      achievements: mockAchievements,
      rareNFTs: 0, // Not in DB
      legendaryNFTs: 0 // Not in DB
    },
    rankings: {
      globalRank: mockRank,
      weeklyRank: 0, // Not in DB
      categoryRanks: { // Not in DB
        science: 0,
        technology: 0,
        gaming: 0,
        general: 0
      }
    }
  };

  // Return specific stats based on type
  switch (statsType) {
    case 'profile':
      return { profile: playerStats.profile };
    case 'hunting':
      return { hunting: playerStats.hunting };
    case 'rewards':
      return { rewards: playerStats.rewards };
    case 'rankings':
      return { rankings: playerStats.rankings };
    case 'detailed':
      return {
        ...playerStats,
        recentHunts: [], // Needs separate DB query for game_sessions
        achievements: [], // Needs separate DB query for achievements
        progressToNextLevel: {
          currentExperience: playerStats.profile.experience,
          experienceToNext: playerStats.profile.experienceToNext,
          totalForNextLevel: playerStats.profile.experience + playerStats.profile.experienceToNext,
          progressPercentage: Math.round(playerStats.profile.experience / (playerStats.profile.experience + playerStats.profile.experienceToNext) * 100)
        }
      };
    default: // overview
      return {
        profile: playerStats.profile,
        hunting: playerStats.hunting, // Return the full hunting object for overview
        rewards: {
          totalAlgoEarned: playerStats.rewards.totalAlgoEarned,
          totalNFTs: playerStats.rewards.totalNFTs,
          achievements: playerStats.rewards.achievements
        },
        rankings: {
          globalRank: playerStats.rankings.globalRank
        }
      };
  }
}

async function updatePlayerStatistics(userId: string, statUpdate: any) {
  // This function assumes statUpdate contains fields relevant to updating user stats.
  // It will prioritize using updateUserStatsAfterHunt if specific hunt completion
  // data is provided, otherwise it will use upsertUser for general updates.

  if (statUpdate.huntCompleted !== undefined && statUpdate.completionTime !== undefined && statUpdate.algoEarned !== undefined) {
    // This looks like a post-hunt update
    const { data, error } = await DatabaseService.updateUserStatsAfterHunt(
      userId,
      statUpdate.completionTime,
      statUpdate.algoEarned,
      statUpdate.huntCompleted
    );

    if (error) {
      console.error('Error updating user stats after hunt:', error);
      throw new Error(`Failed to update user stats after hunt: ${error.message}`);
    }
    return data;
  } else {
    // For general updates, use upsertUser
    // Ensure the statUpdate keys match the User interface
    const userUpdates: Partial<User> = {};
    if (statUpdate.last_general_fact !== undefined) {
      userUpdates.last_general_fact = statUpdate.last_general_fact;
    }
    // Add other fields if they are expected to be updated directly
    // e.g., if (statUpdate.some_new_field !== undefined) { userUpdates.some_new_field = statUpdate.some_new_field; }

    if (Object.keys(userUpdates).length > 0) {
      const { data, error } = await DatabaseService.upsertUser({
        wallet_address: userId,
        ...userUpdates
      });

      if (error) {
        console.error('Error upserting user for general update:', error);
        throw new Error(`Failed to update user: ${error.message}`);
      }
      return data;
    } else {
      // No recognized update fields
      return { message: 'No valid statistics to update' };
    }
  }
}

// These mock functions are no longer used but are kept for context if needed for future expansion.
/*
function generateRecentHunts(userId: string) {
  const themes = ['science', 'technology', 'gaming', 'general'];
  const difficulties = ['beginner', 'intermediate', 'expert'];
  
  return Array.from({ length: 5 }, (_, i) => ({
    huntId: `HUNT_${Date.now() - i * 3600000}_${Math.random().toString(36).substr(2, 6)}`,
    theme: themes[Math.floor(Math.random() * themes.length)],
    difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
    completed: Math.random() > 0.2, // 80% completion rate
    score: Math.floor(Math.random() * 100) + 1,
    timeSpent: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
    algoEarned: Math.floor(Math.random() * 500) + 50,
    completedAt: new Date(Date.now() - i * 3600000).toISOString()
  }));
}

function generateAchievements() {
  const achievements = [
    { id: 'first_hunt', name: 'First Discovery', unlocked: true, unlockedAt: '2024-01-15' },
    { id: 'speed_demon', name: 'Speed Demon', unlocked: true, unlockedAt: '2024-01-20' },
    { id: 'science_explorer', name: 'Science Explorer', unlocked: true, unlockedAt: '2024-01-25' },
    { id: 'perfect_week', name: 'Perfect Week', unlocked: false, progress: 85 },
    { id: 'knowledge_sage', name: 'Knowledge Sage', unlocked: false, progress: 60 }
  ];
  
  return achievements;
}

function calculateLevelProgress(experience: number, experienceToNext: number) {
  const totalNeeded = experience + experienceToNext;
  const progress = (experience / totalNeeded) * 100;
  
  return {
    currentExperience: experience,
    experienceToNext,
    totalForNextLevel: totalNeeded,
    progressPercentage: Math.round(progress)
  };
}
*/
//     userId,
//     profile: {
//       username: `Player_${userId.slice(-6)}`,
//       level: Math.floor(Math.random() * 20) + 1,
//       experience: Math.floor(Math.random() * 10000) + 1000,
//       experienceToNext: Math.floor(Math.random() * 1000) + 500,
//       joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
//       lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
//     },
//     hunting: {
//       totalHunts: Math.floor(Math.random() * 100) + 10,
//       completedHunts: Math.floor(Math.random() * 80) + 5,
//       successRate: Math.floor(Math.random() * 40) + 60, // 60-100%
//       averageTime: Math.floor(Math.random() * 1200) + 600, // 10-30 minutes
//       bestTime: Math.floor(Math.random() * 300) + 180, // 3-8 minutes
//       currentStreak: Math.floor(Math.random() * 15),
//       bestStreak: Math.floor(Math.random() * 25) + 5,
//       favoriteTheme: ['science', 'technology', 'gaming', 'general'][Math.floor(Math.random() * 4)],
//       preferredDifficulty: ['beginner', 'intermediate', 'expert'][Math.floor(Math.random() * 3)]
//     },
//     rewards: {
//       totalAlgoEarned: Math.floor(Math.random() * 5000) + 500,
//       totalNFTs: Math.floor(Math.random() * 20) + 2,
//       achievements: Math.floor(Math.random() * 30) + 5,
//       rareNFTs: Math.floor(Math.random() * 5),
//       legendaryNFTs: Math.floor(Math.random() * 2)
//     },
//     rankings: {
//       globalRank: Math.floor(Math.random() * 10000) + 100,
//       weeklyRank: Math.floor(Math.random() * 1000) + 50,
//       categoryRanks: {
//         science: Math.floor(Math.random() * 500) + 25,
//         technology: Math.floor(Math.random() * 500) + 25,
//         gaming: Math.floor(Math.random() * 500) + 25,
//         general: Math.floor(Math.random() * 500) + 25
//       }
//     }
//   };

//   // Return specific stats based on type
//   switch (statsType) {
//     case 'profile':
//       return { profile: baseStats.profile };
//     case 'hunting':
//       return { hunting: baseStats.hunting };
//     case 'rewards':
//       return { rewards: baseStats.rewards };
//     case 'rankings':
//       return { rankings: baseStats.rankings };
//     case 'detailed':
//       return {
//         ...baseStats,
//         recentHunts: generateRecentHunts(userId),
//         achievements: generateAchievements(),
//         progressToNextLevel: calculateLevelProgress(baseStats.profile.experience, baseStats.profile.experienceToNext)
//       };
//     default:
//       return {
//         profile: baseStats.profile,
//         hunting: {
//           totalHunts: baseStats.hunting.totalHunts,
//           completedHunts: baseStats.hunting.completedHunts,
//           successRate: baseStats.hunting.successRate,
//           currentStreak: baseStats.hunting.currentStreak
//         },
//         rewards: {
//           totalAlgoEarned: baseStats.rewards.totalAlgoEarned,
//           totalNFTs: baseStats.rewards.totalNFTs,
//           achievements: baseStats.rewards.achievements
//         },
//         rankings: {
//           globalRank: baseStats.rankings.globalRank
//         }
//       };
//   }
// }

// async function updatePlayerStatistics(userId: string, statUpdate: any) {
//   // Mock stat update - in production, update database
//   console.log(`Updating stats for user ${userId}:`, statUpdate);
  
//   const updatedFields = {
//     ...statUpdate,
//     lastUpdated: Date.now()
//   };

//   // Calculate derived stats
//   if (statUpdate.huntCompleted) {
//     updatedFields.totalHunts = (statUpdate.totalHunts || 0) + 1;
//     updatedFields.completedHunts = (statUpdate.completedHunts || 0) + 1;
//     updatedFields.experience = (statUpdate.experience || 0) + (statUpdate.experienceGained || 100);
//   }

//   if (statUpdate.algoEarned) {
//     updatedFields.totalAlgoEarned = (statUpdate.totalAlgoEarned || 0) + statUpdate.algoEarned;
//   }

//   return updatedFields;
// }

// function generateRecentHunts(userId: string) {
//   const themes = ['science', 'technology', 'gaming', 'general'];
//   const difficulties = ['beginner', 'intermediate', 'expert'];
  
//   return Array.from({ length: 5 }, (_, i) => ({
//     huntId: `HUNT_${Date.now() - i * 3600000}_${Math.random().toString(36).substr(2, 6)}`,
//     theme: themes[Math.floor(Math.random() * themes.length)],
//     difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
//     completed: Math.random() > 0.2, // 80% completion rate
//     score: Math.floor(Math.random() * 100) + 1,
//     timeSpent: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
//     algoEarned: Math.floor(Math.random() * 500) + 50,
//     completedAt: new Date(Date.now() - i * 3600000).toISOString()
//   }));
// }

// function generateAchievements() {
//   const achievements = [
//     { id: 'first_hunt', name: 'First Discovery', unlocked: true, unlockedAt: '2024-01-15' },
//     { id: 'speed_demon', name: 'Speed Demon', unlocked: true, unlockedAt: '2024-01-20' },
//     { id: 'science_explorer', name: 'Science Explorer', unlocked: true, unlockedAt: '2024-01-25' },
//     { id: 'perfect_week', name: 'Perfect Week', unlocked: false, progress: 85 },
//     { id: 'knowledge_sage', name: 'Knowledge Sage', unlocked: false, progress: 60 }
//   ];
  
//   return achievements;
// }

// function calculateLevelProgress(experience: number, experienceToNext: number) {
//   const totalNeeded = experience + experienceToNext;
//   const progress = (experience / totalNeeded) * 100;
  
//   return {
//     currentExperience: experience,
//     experienceToNext,
//     totalForNextLevel: totalNeeded,
//     progressPercentage: Math.round(progress)
//   };
// }