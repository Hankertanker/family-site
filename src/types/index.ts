export interface Article {
  id: number;
  title: string;
  content: string;
  cover_image: string | null;
  excerpt: string | null;
  published: number;
  created_at: string;
  updated_at: string;
}

export interface Album {
  id: number;
  title: string;
  description: string | null;
  cover_photo_id: number | null;
  cover_url: string | null;
  photo_count: number;
  sort_order: number;
  created_at: string;
}

export interface Photo {
  id: number;
  album_id: number;
  filename: string;
  original_name: string;
  caption: string | null;
  url: string;
  created_at: string;
}

export interface Event {
  id: number;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  color: string;
  reminder_minutes: number;
  reminder_sent: number;
  person: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  created_at: string;
  expires_at: string;
}

export interface CreateArticleInput {
  title: string;
  content: string;
  excerpt?: string;
  published?: number;
  cover_image?: string | null;
}

export interface CreateAlbumInput {
  title: string;
  description?: string;
}

export interface ShoppingItem {
  id: number;
  title: string;
  note: string | null;
  done: number;
  created_by: string;
  created_at: string;
}

export interface BoardMessage {
  id: number;
  content: string;
  author: string;
  created_at: string;
}

export interface Anniversary {
  id: number;
  title: string;
  event_date: string;
  color: string;
  reminder_minutes: number;
  reminder_sent: number;
  created_at: string;
}

export interface Chore {
  id: number;
  title: string;
  assignee: string;
  due_date: string | null;
  done: number;
  created_at: string;
}

export interface GrowthRecord {
  id: number;
  record_date: string;
  height: number | null;
  weight: number | null;
  milestone: string | null;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
}


export interface Footprint {
  id: number;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  visit_date: string | null;
  color: string;
  created_at: string;
}
export interface HealthReminder {
  id: number;
  title: string;
  description: string | null;
  reminder_date: string;
  person: string;
  done: number;
  reminder_minutes: number;
  reminder_sent: number;
  created_at: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  event_date: string;
  start_time?: string | null;
  end_time?: string | null;
  color?: string;
  reminder_minutes?: number;
  person?: string;
}
