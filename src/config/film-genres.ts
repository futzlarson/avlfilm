export const FILM_GENRES = [
  'Action',
  'Animation',
  'Comedy',
  'Documentary',
  'Drama',
  'Experimental',
  'Horror',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'Other',
] as const;

export type FilmGenre = (typeof FILM_GENRES)[number];
