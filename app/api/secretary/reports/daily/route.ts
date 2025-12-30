import { NextRequest, NextResponse } from 'next/server';
import { createServerApiClient } from '@/lib/api';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiClient = createServerApiClient(token);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const response = await apiClient.get(`/secretary/reports/daily?date=${date}`);
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Secretary daily report API error:', error);
    
    if (error.response?.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error.response?.status === 403) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch daily report' },
      { status: 500 }
    );
  }
}