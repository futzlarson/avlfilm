import type { AvlGoEvent } from '@app-types/avlgo-event';

interface JsonLdEvent {
  '@type': 'Event';
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location: {
    '@type': 'Place';
    name: string;
    address?: {
      '@type': 'PostalAddress';
      addressLocality: string;
      addressRegion: string;
    };
  };
  organizer: {
    '@type': 'Organization';
    name: string;
  };
  eventStatus: string;
  eventAttendanceMode: string;
  url?: string;
  image?: string;
}

interface JsonLdItemList {
  '@context': 'https://schema.org';
  '@type': 'ItemList';
  itemListElement: JsonLdEvent[];
}

/**
 * Convert an AVL GO event to JSON-LD Event format
 */
export function convertToJsonLd(event: AvlGoEvent): JsonLdEvent | null {
  // Required fields check
  if (!event.title || !event.startDate) {
    return null;
  }

  // Validate dates
  try {
    new Date(event.startDate);
    if (event.endDate) new Date(event.endDate);
  } catch {
    return null;
  }

  const locationName = event.location || 'Asheville, NC';
  const hasAshevilleInLocation = /asheville|avl/i.test(locationName);

  const jsonLdEvent: JsonLdEvent = {
    '@type': 'Event',
    name: event.title,
    startDate: event.startDate,
    location: {
      '@type': 'Place',
      name: locationName,
      ...(hasAshevilleInLocation && {
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Asheville',
          addressRegion: 'NC'
        }
      })
    },
    organizer: {
      '@type': 'Organization',
      name: 'AVL Film'
    },
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode'
  };

  // Optional fields
  if (event.description) {
    // Clean HTML/markdown, truncate to 5000 chars
    const cleanDesc = event.description
      .replace(/<[^>]*>/g, '')
      .replace(/[*_~`]/g, '')
      .trim()
      .substring(0, 5000);

    if (cleanDesc) {
      jsonLdEvent.description = cleanDesc;
    }
  }

  if (event.endDate) {
    jsonLdEvent.endDate = event.endDate;
  }

  if (event.url) {
    jsonLdEvent.url = event.url;
  }

  if (event.imageUrl) {
    // Convert relative URLs to absolute
    const imageUrl = event.imageUrl.startsWith('/')
      ? `https://www.avlgo.com${event.imageUrl}`
      : event.imageUrl;
    jsonLdEvent.image = imageUrl;
  }

  return jsonLdEvent;
}

/**
 * Convert multiple events to JSON-LD ItemList format
 */
export function convertEventsToJsonLd(events: AvlGoEvent[]): JsonLdItemList {
  const jsonLdEvents = events
    .map(convertToJsonLd)
    .filter((e): e is JsonLdEvent => e !== null);

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: jsonLdEvents
  };
}
