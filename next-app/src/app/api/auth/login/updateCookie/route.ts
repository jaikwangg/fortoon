import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { credit } = await request.json();
    const cookieStore = cookies();
    const userCookie = cookieStore.get('user');
    
    if (userCookie) {
      const userData = JSON.parse(userCookie.value);
      userData.credit = credit;
      
      // Set the updated cookie
      cookieStore.set('user', JSON.stringify(userData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update cookie' }, { status: 500 });
  }
}