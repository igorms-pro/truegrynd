import { supabase } from '@/lib/supabase';

export type BookingStatus = 'confirmed' | 'waitlisted';

/** Live state of one class occurrence in a given week (see `week_bookings`). */
export type WeekSlotBooking = {
  classId: string;
  sessionDate: string;
  bookedCount: number;
  waitlistCount: number;
  myStatus: BookingStatus | null;
  myBookingId: string | null;
};

type WeekRow = {
  class_id: string;
  session_date: string;
  booked_count: number;
  waitlist_count: number;
  my_status: BookingStatus | null;
  my_booking_id: string | null;
};

/** ISO `YYYY-MM-DD` of the Monday of the week containing `d` (local time). */
export function mondayOf(d: Date): string {
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(d);
  monday.setDate(d.getDate() - day);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
}

export async function getWeekBookings(monday: string): Promise<Map<string, WeekSlotBooking>> {
  const { data, error } = await supabase.rpc('week_bookings', { p_monday: monday });
  if (error) throw new Error(error.message);
  const map = new Map<string, WeekSlotBooking>();
  for (const r of (data ?? []) as WeekRow[]) {
    map.set(r.class_id, {
      classId: r.class_id,
      sessionDate: r.session_date,
      bookedCount: Number(r.booked_count ?? 0),
      waitlistCount: Number(r.waitlist_count ?? 0),
      myStatus: r.my_status,
      myBookingId: r.my_booking_id,
    });
  }
  return map;
}

export async function bookSession(classId: string, sessionDate: string): Promise<BookingStatus> {
  const { data, error } = await supabase.rpc('book_session', {
    p_class_id: classId,
    p_session_date: sessionDate,
  });
  if (error) throw new Error(error.message);
  return (data as { status: BookingStatus }).status;
}

export async function cancelBooking(bookingId: string): Promise<void> {
  const { error } = await supabase.rpc('cancel_booking', { p_booking_id: bookingId });
  if (error) throw new Error(error.message);
}

/** One athlete on a session's roster, with athletic context for the coach. */
export type RosterEntry = {
  bookingId: string;
  userId: string;
  username: string | null;
  division: string | null;
  faction: string | null;
  rating: number | null;
  status: BookingStatus;
};

type RosterRow = {
  booking_id: string;
  user_id: string;
  username: string | null;
  division: string | null;
  faction: string | null;
  rating: number | null;
  status: BookingStatus;
};

export async function getSessionRoster(
  classId: string,
  sessionDate: string,
): Promise<RosterEntry[]> {
  const { data, error } = await supabase.rpc('session_roster', {
    p_class_id: classId,
    p_session_date: sessionDate,
  });
  if (error) throw new Error(error.message);
  return ((data ?? []) as RosterRow[]).map((r) => ({
    bookingId: r.booking_id,
    userId: r.user_id,
    username: r.username,
    division: r.division,
    faction: r.faction,
    rating: r.rating == null ? null : Number(r.rating),
    status: r.status,
  }));
}
