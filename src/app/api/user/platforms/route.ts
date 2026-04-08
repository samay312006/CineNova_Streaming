import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    const { platforms } = await request.json();
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!Array.isArray(platforms)) {
      return NextResponse.json({ message: 'Invalid platforms data' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findByIdAndUpdate(
      userId,
      { connectedPlatforms: platforms },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ platforms: user.connectedPlatforms }, { status: 200 });
  } catch (error: any) {
    console.error('Update platforms error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
