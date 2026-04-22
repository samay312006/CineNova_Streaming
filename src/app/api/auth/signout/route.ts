import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('userId');
    
    return NextResponse.json(
      { message: 'Signout successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
