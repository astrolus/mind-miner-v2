import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key'
});

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();

    switch (action) {
      case 'generate_hint':
        return await generateHint(data);
      case 'analyze_content':
        return await analyzeContent(data);
      case 'validate_discovery':
        return await validateDiscovery(data);
      case 'create_hunt':
        return await createHunt(data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'AI service error' }, { status: 500 });
  }
}

async function generateHint({ huntType, difficulty, target, context }: any) {
  // Mock AI hint generation - replace with actual OpenAI API call
  const hints = {
    beginner: [
      "Look for posts with high engagement in popular subreddits",
      "Check the trending topics from the past 24 hours",
      "Search for keywords related to technology and gaming"
    ],
    intermediate: [
      "Find the connection between two seemingly unrelated posts",
      "Look for hidden patterns in user activity",
      "Analyze the sentiment of comments to find the golden thread"
    ],
    expert: [
      "Decode the cryptic message hidden in the post metadata",
      "Find the user who posted exactly 42 comments on this topic",
      "Discover the subreddit that shares a secret with this one"
    ]
  };

  const hintPool = hints[difficulty as keyof typeof hints] || hints.beginner;
  const selectedHint = hintPool[Math.floor(Math.random() * hintPool.length)];

  return NextResponse.json({
    hint: selectedHint,
    confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
    difficulty,
    huntType,
    timestamp: Date.now()
  });
}

async function analyzeContent({ content, analysisType }: any) {
  // Mock content analysis - replace with actual AI analysis
  const analysis = {
    sentiment: {
      score: Math.random() * 2 - 1, // -1 to 1
      label: Math.random() > 0.5 ? 'positive' : 'negative',
      confidence: Math.random() * 0.3 + 0.7
    },
    topics: [
      'technology',
      'gaming',
      'blockchain',
      'artificial intelligence',
      'social media'
    ].slice(0, Math.floor(Math.random() * 3) + 2),
    complexity: Math.floor(Math.random() * 10) + 1,
    readability: Math.floor(Math.random() * 100),
    keywords: extractKeywords(content),
    summary: generateSummary(content),
    entities: [
      { text: 'Reddit', type: 'PLATFORM', confidence: 0.95 },
      { text: 'Algorand', type: 'BLOCKCHAIN', confidence: 0.89 },
      { text: 'AI', type: 'TECHNOLOGY', confidence: 0.92 }
    ]
  };

  return NextResponse.json(analysis);
}

async function validateDiscovery({ userSubmission, huntCriteria, context }: any) {
  // Mock discovery validation
  const validation = {
    valid: Math.random() > 0.3, // 70% success rate
    score: Math.floor(Math.random() * 100),
    feedback: generateValidationFeedback(),
    criteria: {
      urlMatch: Math.random() > 0.2,
      contentMatch: Math.random() > 0.3,
      timingValid: Math.random() > 0.1,
      uniqueness: Math.random() > 0.4
    },
    bonusPoints: Math.random() > 0.5 ? Math.floor(Math.random() * 50) : 0,
    timestamp: Date.now()
  };

  return NextResponse.json(validation);
}

async function createHunt({ theme, difficulty, subreddits, duration }: any) {
  // Mock hunt creation
  const huntTypes = ['treasure_hunt', 'mystery_solve', 'pattern_find', 'community_quest'];
  const selectedType = huntTypes[Math.floor(Math.random() * huntTypes.length)];

  const hunt = {
    id: `HUNT_${Date.now()}`,
    title: generateHuntTitle(theme, difficulty),
    description: generateHuntDescription(selectedType, theme),
    type: selectedType,
    difficulty,
    theme,
    targetSubreddits: subreddits,
    duration: duration * 60 * 1000, // Convert minutes to milliseconds
    rewards: {
      completion: Math.floor(Math.random() * 500) + 100,
      bonus: Math.floor(Math.random() * 200) + 50,
      nft: Math.random() > 0.7 // 30% chance for NFT reward
    },
    criteria: generateHuntCriteria(selectedType, difficulty),
    hints: await generateHuntHints(selectedType, difficulty),
    createdAt: Date.now(),
    status: 'active'
  };

  return NextResponse.json(hunt);
}

function extractKeywords(content: string): string[] {
  // Simple keyword extraction - replace with actual NLP
  const commonWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'as', 'in'];
  const words = content.toLowerCase().split(/\W+/)
    .filter(word => word.length > 3 && !commonWords.includes(word))
    .slice(0, 10);
  
  return Array.from(new Set(words));
}

function generateSummary(content: string): string {
  // Mock summary generation
  const summaries = [
    "This content discusses emerging technologies and their impact on social platforms.",
    "The text explores blockchain applications in gaming and reward systems.",
    "Analysis reveals trends in community engagement and user behavior patterns.",
    "Content focuses on AI integration in modern web applications and services."
  ];
  
  return summaries[Math.floor(Math.random() * summaries.length)];
}

function generateValidationFeedback(): string {
  const feedbacks = [
    "Excellent discovery! You found exactly what we were looking for.",
    "Good find, but there might be an even better match out there.",
    "Close, but this doesn't quite meet all the hunt criteria.",
    "Great effort! Consider looking deeper into the community discussions."
  ];
  
  return feedbacks[Math.floor(Math.random() * feedbacks.length)];
}

function generateHuntTitle(theme: string, difficulty: string): string {
  const titles = {
    technology: [`Tech ${difficulty} Hunt`, `Digital Discovery Quest`, `Innovation Trail`],
    gaming: [`Gaming ${difficulty} Quest`, `Player's Journey`, `Game Theory Hunt`],
    science: [`Scientific Discovery`, `Research Trail`, `Knowledge Quest`],
    community: [`Community Connection`, `Social Discovery`, `Network Hunt`]
  };
  
  const themeTitle = titles[theme as keyof typeof titles] || titles.technology;
  return themeTitle[Math.floor(Math.random() * themeTitle.length)];
}

function generateHuntDescription(type: string, theme: string): string {
  return `Embark on a ${type.replace('_', ' ')} focused on ${theme}. Use your skills to uncover hidden gems in Reddit's vast ecosystem.`;
}

function generateHuntCriteria(type: string, difficulty: string) {
  return {
    minScore: difficulty === 'expert' ? 100 : difficulty === 'intermediate' ? 50 : 10,
    timeWindow: difficulty === 'expert' ? 24 : difficulty === 'intermediate' ? 48 : 72,
    requiredKeywords: Math.floor(Math.random() * 3) + 1,
    uniqueness: Math.random() > 0.5
  };
}

async function generateHuntHints(type: string, difficulty: string) {
  return [
    `Start your search in communities related to your theme`,
    `Look for posts with meaningful engagement, not just high scores`,
    `Pay attention to comment threads - they often contain hidden gems`
  ];
}