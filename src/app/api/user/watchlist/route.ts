import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { movieId } = await request.json();
    if (!movieId) {
      return NextResponse.json({ message: 'Movie ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Add to watchlist using $addToSet to avoid duplicates
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { watchlist: movieId } },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ watchlist: user.watchlist }, { status: 200 });
  } catch (error: any) {
    console.error('Watchlist add error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { movieId } = await request.json();
    if (!movieId) {
      return NextResponse.json({ message: 'Movie ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Remove from watchlist using $pull
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { watchlist: movieId } },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ watchlist: user.watchlist }, { status: 200 });
  } catch (error: any) {
    console.error('Watchlist remove error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
