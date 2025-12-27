// Type definition matching database schema
// Single source of truth for Filmmaker type used across the application
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
  status: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}
