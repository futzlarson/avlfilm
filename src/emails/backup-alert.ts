export const metadata = {
  name: 'Database Backup Alert',
  description: 'Sent when automated database backup fails',
  slug: 'backup-alert',
  audience: 'internal',
};

export function generate(timestamp: string, runUrl: string): string {
  return `<pre>The automated database backup failed at ${timestamp}.

Please check the GitHub Actions logs for more details:
${runUrl}</pre>`;
}
