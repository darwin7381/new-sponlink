import { NextRequest, NextResponse } from 'next/server';
import { 
  getSponsorMeetings, 
  getOrganizerMeetings, 
  scheduleMeeting, 
  confirmMeeting, 
  cancelMeeting 
} from '@/lib/services/sponsorService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sponsorId = searchParams.get('sponsorId');
    const organizerId = searchParams.get('organizerId');
    
    if (sponsorId) {
      const meetings = await getSponsorMeetings(sponsorId);
      return NextResponse.json(meetings);
    } else if (organizerId) {
      const meetings = await getOrganizerMeetings(organizerId);
      return NextResponse.json(meetings);
    } else {
      return NextResponse.json({ error: 'Either sponsorId or organizerId is required' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sponsorId, organizerId, eventId, meetingData } = body;
    
    if (!sponsorId || !organizerId || !eventId || !meetingData) {
      return NextResponse.json({ 
        error: 'Missing required fields: sponsorId, organizerId, eventId, meetingData' 
      }, { status: 400 });
    }
    
    const meeting = await scheduleMeeting(sponsorId, organizerId, eventId, meetingData);
    return NextResponse.json(meeting);
  } catch (error) {
    console.error('Error scheduling meeting:', error);
    return NextResponse.json({ error: 'Failed to schedule meeting' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { meetingId, action, confirmedTime, meetingLink } = body;
    
    if (!meetingId || !action) {
      return NextResponse.json({ error: 'Missing required fields: meetingId, action' }, { status: 400 });
    }
    
    if (action === 'confirm') {
      if (!confirmedTime || !meetingLink) {
        return NextResponse.json({ 
          error: 'Missing required fields for confirmation: confirmedTime, meetingLink' 
        }, { status: 400 });
      }
      
      const meeting = await confirmMeeting(meetingId, confirmedTime, meetingLink);
      return NextResponse.json(meeting);
    } else if (action === 'cancel') {
      const meeting = await cancelMeeting(meetingId);
      return NextResponse.json(meeting);
    } else {
      return NextResponse.json({ error: 'Invalid action. Must be "confirm" or "cancel"' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating meeting:', error);
    return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
  }
} 