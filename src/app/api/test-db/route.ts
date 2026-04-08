import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';

export async function GET() {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      return NextResponse.json({ 
        message: 'Connected to MongoDB successfully!',
        readyState: conn.connection.readyState 
      });
    }
    return NextResponse.json({ message: 'Failed to connect' }, { status: 500 });
  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      message: 'Error connecting to database', 
      error: error.message 
    }, { status: 500 });
  }
}
