export const FILM_GENRES = [
  'Drama',
  'Comedy',
  'Documentary',
  'Horror',
  'Sci-Fi',
  'Animation',
  'Thriller',
  'Action',
  'Romance',
  'Experimental',
  'Other',
] as const;

export type FilmGenre = (typeof FILM_GENRES)[number];
