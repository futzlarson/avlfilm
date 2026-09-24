// Shared honeypot spam trap. A hidden field real users never fill;
// bots do, so a non-empty value means the submission is spam.
export const HONEYPOT_FIELD = 'contact_fax';

/** True when the honeypot field was filled — i.e. a bot submission to reject. */
export function isBotSubmission(value: unknown): boolean {
  return typeof value === 'string' && value.trim() !== '';
}
