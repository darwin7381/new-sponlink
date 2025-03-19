import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents, getEventById } from '@/services/eventService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const event = await getEventById(id);
      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      return NextResponse.json(event);
    }
    
    const events = await getAllEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
} 