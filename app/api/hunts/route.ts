import { NextRequest, NextResponse } from 'next/server';

// Mock hunt database
const hunts = new Map();
const userProgress = new Map();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const huntId = searchParams.get('huntId');
  const userId = searchParams.get('userId');

  try {
    switch (action) {
      case 'list':
        return await listHunts(searchParams);
      case 'details':
        return await getHuntDetails(huntId || '');
      case 'progress':
        return await getUserProgress(userId || '', huntId);
      case 'leaderboard':
        return await getLeaderboard(huntId);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Hunts API error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();

    switch (action) {
      case 'join':
        return await joinHunt(data);
      case 'submit':
        return await submitDiscovery(data);
      case 'create':
        return await createHunt(data);
      case 'complete':
        return await completeHunt(data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function listHunts(searchParams: URLSearchParams) {
  const status = searchParams.get('status') || 'active';
  const difficulty = searchParams.get('difficulty');
  const theme = searchParams.get('theme');
  const limit = parseInt(searchParams.get('limit') || '20');

  // Mock active hunts
  const mockHunts = [
    {
      id: 'HUNT_001',
      title: 'The Science Mystery',
      description: 'Discover hidden scientific discussions in r/science',
      difficulty: 'expert',
      theme: 'science',
      status: 'active',
      participants: 23,
      maxParticipants: 100,
      reward: 500,
      duration: 7200000, // 2 hours in ms
      startTime: Date.now() - 3600000,
      endTime: Date.now() + 3600000,
      progress: 75,
      creator: 'ai_system',
      tags: ['science', 'mystery', 'expert']
    },
    {
      id: 'HUNT_002',
      title: 'AskReddit Gems',
      description: 'Find the most insightful answers in r/AskReddit',
      difficulty: 'intermediate',
      theme: 'community',
      status: 'active',
      participants: 67,
      maxParticipants: 150,
      reward: 250,
      duration: 10800000, // 3 hours in ms
      startTime: Date.now() - 1800000,
      endTime: Date.now() + 9000000,
      progress: 45,
      creator: 'ai_system',
      tags: ['askreddit', 'community', 'intermediate']
    },
    {
      id: 'HUNT_003',
      title: 'Tech Treasure Hunt',
      description: 'Explore the latest in technology subreddits',
      difficulty: 'beginner',
      theme: 'technology',
      status: 'active',
      participants: 142,
      maxParticipants: 200,
      reward: 100,
      duration: 14400000, // 4 hours in ms
      startTime: Date.now() - 900000,
      endTime: Date.now() + 13500000,
      progress: 90,
      creator: 'ai_system',
      tags: ['technology', 'beginner', 'trending']
    }
  ];

  let filteredHunts = mockHunts.filter(hunt => hunt.status === status);
  
  if (difficulty) {
    filteredHunts = filteredHunts.filter(hunt => hunt.difficulty === difficulty);
  }
  
  if (theme) {
    filteredHunts = filteredHunts.filter(hunt => hunt.theme === theme);
  }

  return NextResponse.json({
    hunts: filteredHunts.slice(0, limit),
    total: filteredHunts.length,
    filters: { status, difficulty, theme }
  });
}

async function getHuntDetails(huntId: string) {
  if (!huntId) {
    return NextResponse.json({ error: 'Hunt ID required' }, { status: 400 });
  }

  // Mock detailed hunt data
  const huntDetails = {
    id: huntId,
    title: 'The Science Mystery',
    description: 'Discover hidden scientific discussions and breakthrough papers in r/science',
    longDescription: 'This expert-level hunt challenges you to find the most impactful scientific discussions buried deep in Reddit\'s science communities.',
    difficulty: 'expert',
    theme: 'science',
    status: 'active',
    participants: 23,
    maxParticipants: 100,
    reward: {
      completion: 500,
      bonus: 200,
      nft: true
    },
    duration: 7200000,
    startTime: Date.now() - 3600000,
    endTime: Date.now() + 3600000,
    progress: 75,
    creator: 'ai_system',
    tags: ['science', 'mystery', 'expert'],
    objectives: [
      {
        id: 'OBJ_001',
        title: 'Find Breakthrough Discussion',
        description: 'Locate a post about recent scientific breakthroughs with 500+ upvotes',
        progress: 100,
        completed: true,
        points: 100
      },
      {
        id: 'OBJ_002',
        title: 'Expert Comment Thread',
        description: 'Find a comment thread with verified scientists discussing methodology',
        progress: 60,
        completed: false,
        points: 150
      },
      {
        id: 'OBJ_003',
        title: 'Hidden Gem Paper',
        description: 'Discover an underrated research paper shared in the community',
        progress: 20,
        completed: false,
        points: 200
      }
    ],
    hints: [
      'Focus on posts from the past 48 hours with significant engagement',
      'Look for discussions with [VERIFIED] researcher flair',
      'Check comment threads for links to arxiv.org or doi.org'
    ],
    rules: [
      'All submissions must be from r/science',
      'Content must be posted within the hunt timeframe',
      'Only original discoveries count (no duplicates)',
      'Screenshots required for verification'
    ],
    leaderboard: [
      { rank: 1, username: 'ScienceHunter42', score: 450, submissions: 3 },
      { rank: 2, username: 'ResearchFinder', score: 380, submissions: 2 },
      { rank: 3, username: 'DataMiner99', score: 320, submissions: 4 }
    ]
  };

  return NextResponse.json(huntDetails);
}

async function getUserProgress(userId: string, huntId?: string | null) {
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  const mockProgress = {
    userId,
    totalHunts: 15,
    completedHunts: 12,
    activeHunts: 3,
    totalScore: 4250,
    algoEarned: 1250,
    achievements: [
      { id: 'ACH_001', name: 'First Hunt', unlocked: true },
      { id: 'ACH_002', name: 'Science Explorer', unlocked: true },
      { id: 'ACH_003', name: 'Community Champion', unlocked: false }
    ],
    currentHunts: huntId ? [{
      huntId,
      joinedAt: Date.now() - 1800000,
      progress: 60,
      submissions: 2,
      score: 180,
      objectives: [
        { id: 'OBJ_001', completed: true, score: 100 },
        { id: 'OBJ_002', completed: false, score: 80 },
        { id: 'OBJ_003', completed: false, score: 0 }
      ]
    }] : [],
    stats: {
      averageScore: 354,
      bestHunt: 'HUNT_SPECIAL_001',
      streak: 5,
      successRate: 80
    }
  };

  return NextResponse.json(mockProgress);
}

async function getLeaderboard(huntId?: string | null) {
  const mockLeaderboard = {
    huntId: huntId || 'global',
    type: huntId ? 'hunt' : 'global',
    period: 'all_time',
    updated: Date.now(),
    leaders: [
      {
        rank: 1,
        username: 'MindMaster',
        score: huntId ? 450 : 15420,
        huntsCompleted: huntId ? 1 : 47,
        algoEarned: huntId ? 500 : 2150,
        achievements: 12,
        level: 8
      },
      {
        rank: 2,
        username: 'RedditExplorer',
        score: huntId ? 380 : 12840,
        huntsCompleted: huntId ? 1 : 38,
        algoEarned: huntId ? 250 : 1890,
        achievements: 9,
        level: 7
      },
      {
        rank: 3,
        username: 'KnowledgeSeeker',
        score: huntId ? 320 : 11250,
        huntsCompleted: huntId ? 1 : 35,
        algoEarned: huntId ? 100 : 1620,
        achievements: 8,
        level: 6
      }
    ]
  };

  return NextResponse.json(mockLeaderboard);
}

async function joinHunt({ userId, huntId }: any) {
  if (!userId || !huntId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // Mock hunt joining
  const participation = {
    userId,
    huntId,
    joinedAt: Date.now(),
    status: 'active',
    progress: 0,
    submissions: 0,
    score: 0
  };

  return NextResponse.json({
    success: true,
    participation,
    message: 'Successfully joined the hunt!'
  });
}

async function submitDiscovery({ userId, huntId, discovery }: any) {
  if (!userId || !huntId || !discovery) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // Mock discovery validation
  const submission = {
    id: `SUB_${Date.now()}`,
    userId,
    huntId,
    discovery,
    submittedAt: Date.now(),
    status: 'validating',
    score: 0
  };

  // Simulate validation process
  setTimeout(() => {
    submission.status = Math.random() > 0.3 ? 'approved' : 'rejected';
    submission.score = submission.status === 'approved' ? Math.floor(Math.random() * 200) + 50 : 0;
  }, 2000);

  return NextResponse.json({
    success: true,
    submission,
    message: 'Discovery submitted for validation'
  });
}

async function createHunt({ userId, huntData }: any) {
  if (!userId || !huntData) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  const newHunt = {
    id: `HUNT_${Date.now()}`,
    ...huntData,
    creator: userId,
    createdAt: Date.now(),
    status: 'pending_approval',
    participants: 0
  };

  hunts.set(newHunt.id, newHunt);

  return NextResponse.json({
    success: true,
    hunt: newHunt,
    message: 'Hunt created and submitted for approval'
  });
}

async function completeHunt({ userId, huntId }: any) {
  if (!userId || !huntId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // Mock hunt completion
  const completion = {
    userId,
    huntId,
    completedAt: Date.now(),
    finalScore: Math.floor(Math.random() * 500) + 200,
    rank: Math.floor(Math.random() * 10) + 1,
    rewards: {
      algo: Math.floor(Math.random() * 300) + 100,
      experience: Math.floor(Math.random() * 200) + 50,
      nft: Math.random() > 0.7
    }
  };

  return NextResponse.json({
    success: true,
    completion,
    message: 'Hunt completed successfully!'
  });
}