import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'mind-miner-secret-key';

// Mock user database (replace with actual database)
const users = new Map();

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();

    switch (action) {
      case 'register':
        return await registerUser(data);
      case 'login':
        return await loginUser(data);
      case 'verify':
        return await verifyToken(data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function registerUser({ username, email, password, walletAddress }: any) {
  if (users.has(email)) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = {
    id: Date.now().toString(),
    username,
    email,
    password: hashedPassword,
    walletAddress,
    createdAt: new Date().toISOString(),
    profile: {
      level: 1,
      experience: 0,
      huntsCompleted: 0,
      algoEarned: 0,
      achievements: []
    }
  };

  users.set(email, user);

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return NextResponse.json({
    message: 'User registered successfully',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      walletAddress: user.walletAddress,
      profile: user.profile
    }
  });
}

async function loginUser({ email, password }: any) {
  const user = users.get(email);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return NextResponse.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      walletAddress: user.walletAddress,
      profile: user.profile
    }
  });
}

async function verifyToken({ token }: any) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = Array.from(users.values()).find((u: any) => u.id === decoded.userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: (user as any).id,
        username: (user as any).username,
        email: (user as any).email,
        walletAddress: (user as any).walletAddress,
        profile: (user as any).profile
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}