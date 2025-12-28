// Type definition matching database schema
// Single source of truth for Filmmaker type used across the application

export type FilmmakerStatus = 'pending' | 'approved' | 'archived';

export interface Filmmaker {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  roles: string;
  company: string | null;
  website: string | null;
  socialMedia: string | null;
  gear: string | null;
  status: FilmmakerStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// Public filmmaker type - excludes contact info for anti-scraping protection
export type PublicFilmmaker = Omit<Filmmaker, 'email' | 'phone'>;
