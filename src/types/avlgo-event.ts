/**
 * Type definition for events from AVL GO API
 * Used for calendar integration and event display
 */
export interface AvlGoEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  url?: string;
  source?: string;
  tags?: string[];
  imageUrl?: string;
}
