import { NextRequest, NextResponse } from 'next/server';
import { setCache, getCache } from '@/lib/cache'; // Import cache utilities

// Reddit API configuration
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const REDDIT_USER_AGENT = 'MindMiner:1.0.0 (by /u/mindminer)';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const subreddit = searchParams.get('subreddit');
  const query = searchParams.get('query');
  const sort = searchParams.get('sort') || 'hot';
  const limit = parseInt(searchParams.get('limit') || '25');

  try {
    switch (action) {
      case 'search':
        return await searchReddit(subreddit, query, { sort, limit });
      case 'subreddit':
        return await getSubredditPosts(subreddit || 'all', { sort, limit });
      case 'post':
        return await getPost(searchParams.get('id') || '');
      case 'user':
        return await getUserPosts(searchParams.get('username') || '');
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Reddit API error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();

    switch (action) {
      case 'validate_hunt':
        return await validateHuntTarget(data);
      case 'analyze_content':
        return await analyzeContent(data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getRedditAccessToken() {
  // Check cache first for the Reddit access token
  const cachedToken = getCache<string>('reddit_access_token');
  if (cachedToken) {
    console.log('Using cached Reddit access token in reddit API route.');
    return cachedToken;
  }

  const auth = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': REDDIT_USER_AGENT
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json(); // Assuming response.json() returns { access_token: string, ... }
  const token = data.access_token;
  setCache('reddit_access_token', token, 55 * 60); // Cache for 55 minutes
  return token;
}

async function searchReddit(subreddit: string | null, query: string | null, options: any) {
  const token = await getRedditAccessToken();
  const searchUrl = subreddit 
    ? `https://oauth.reddit.com/r/${subreddit}/search`
    : 'https://oauth.reddit.com/search';

  const params = new URLSearchParams({
    q: query || '',
    sort: options.sort,
    limit: options.limit.toString(),
    restrict_sr: subreddit ? 'true' : 'false'
  });

  const response = await fetch(`${searchUrl}?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': REDDIT_USER_AGENT
    }
  });

  const data = await response.json();
  
  return NextResponse.json({
    posts: data.data?.children?.map((child: any) => ({
      id: child.data.id,
      title: child.data.title,
      author: child.data.author,
      subreddit: child.data.subreddit,
      url: child.data.url,
      permalink: child.data.permalink,
      score: child.data.score,
      num_comments: child.data.num_comments,
      created_utc: child.data.created_utc,
      selftext: child.data.selftext,
      thumbnail: child.data.thumbnail
    })) || []
  });
}

async function getSubredditPosts(subreddit: string, options: any) {
  const token = await getRedditAccessToken();
  const url = `https://oauth.reddit.com/r/${subreddit}/${options.sort}`;

  const params = new URLSearchParams({
    limit: options.limit.toString()
  });

  const response = await fetch(`${url}?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': REDDIT_USER_AGENT
    }
  });

  const data = await response.json();
  
  return NextResponse.json({
    posts: data.data?.children?.map((child: any) => ({
      id: child.data.id,
      title: child.data.title,
      author: child.data.author,
      subreddit: child.data.subreddit,
      url: child.data.url,
      permalink: child.data.permalink,
      score: child.data.score,
      num_comments: child.data.num_comments,
      created_utc: child.data.created_utc,
      selftext: child.data.selftext,
      thumbnail: child.data.thumbnail
    })) || []
  });
}

async function getPost(postId: string) {
  const token = await getRedditAccessToken();
  const response = await fetch(`https://oauth.reddit.com/comments/${postId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': REDDIT_USER_AGENT
    }
  });

  const data = await response.json();
  const post = data[0]?.data?.children?.[0]?.data;
  const comments = data[1]?.data?.children || [];

  return NextResponse.json({
    post: post ? {
      id: post.id,
      title: post.title,
      author: post.author,
      subreddit: post.subreddit,
      url: post.url,
      permalink: post.permalink,
      score: post.score,
      num_comments: post.num_comments,
      created_utc: post.created_utc,
      selftext: post.selftext
    } : null,
    comments: comments.map((comment: any) => ({
      id: comment.data.id,
      author: comment.data.author,
      body: comment.data.body,
      score: comment.data.score,
      created_utc: comment.data.created_utc,
      replies: comment.data.replies?.data?.children || []
    }))
  });
}

async function getUserPosts(username: string) {
  const token = await getRedditAccessToken();
  const response = await fetch(`https://oauth.reddit.com/user/${username}/submitted`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': REDDIT_USER_AGENT
    }
  });

  const data = await response.json();
  
  return NextResponse.json({
    posts: data.data?.children?.map((child: any) => ({
      id: child.data.id,
      title: child.data.title,
      subreddit: child.data.subreddit,
      url: child.data.url,
      permalink: child.data.permalink,
      score: child.data.score,
      created_utc: child.data.created_utc
    })) || []
  });
}

async function validateHuntTarget({ targetUrl, criteria }: any) {
  // Extract post ID from Reddit URL
  const postIdMatch = targetUrl.match(/\/comments\/([a-zA-Z0-9]+)/);
  if (!postIdMatch) {
    return NextResponse.json({ valid: false, reason: 'Invalid Reddit URL' });
  }

  const postId = postIdMatch[1];
  const response = await getPost(postId);
  const postData = await response.json();

  if (!postData.post) {
    return NextResponse.json({ valid: false, reason: 'Post not found' });
  }

  // Validate against hunt criteria
  const validations = {
    subreddit: criteria.subreddit ? postData.post.subreddit === criteria.subreddit : true,
    minScore: criteria.minScore ? postData.post.score >= criteria.minScore : true,
    keywords: criteria.keywords ? 
      criteria.keywords.some((keyword: string) => 
        postData.post.title.toLowerCase().includes(keyword.toLowerCase()) ||
        postData.post.selftext.toLowerCase().includes(keyword.toLowerCase())
      ) : true,
    author: criteria.author ? postData.post.author === criteria.author : true
  };

  const isValid = Object.values(validations).every(Boolean);

  return NextResponse.json({
    valid: isValid,
    validations,
    post: postData.post
  });
}

async function analyzeContent({ content, type }: any) {
  // Mock AI analysis - replace with actual AI service
  const analysisResults = {
    sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
    topics: ['technology', 'gaming', 'science'],
    complexity: Math.floor(Math.random() * 10) + 1,
    readability: Math.floor(Math.random() * 100),
    keywords: ['reddit', 'hunt', 'blockchain', 'ai'],
    summary: 'This content discusses various topics related to technology and gaming.'
  };

  return NextResponse.json(analysisResults);
}