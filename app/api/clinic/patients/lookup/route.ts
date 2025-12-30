import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized - No authentication token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get('identifier')?.trim();

    if (!identifier || identifier.length < 3) {
      return NextResponse.json(
        { message: 'Identifier query parameter must be at least 3 characters' },
        { status: 422 }
      );
    }

    const url = `${API_BASE_URL}/clinic/patients/lookup?identifier=${encodeURIComponent(
      identifier
    )}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error looking up patient:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
