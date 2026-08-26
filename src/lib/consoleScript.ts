import type { Vol } from './vols';

export type ConsoleLine = { text: string; status: 'ok' | 'warn' | 'fail' | 'plain' };

/** The last line must always be the rollback — it is what the fake rejection lands on. */
export function buildConsoleScript(vol: Vol): ConsoleLine[] {
  const custom: ConsoleLine[] = vol.consoleLines.map((text) => ({ text, status: 'ok' }));

  return [
    { text: '$ aws sbg configure --profile technicals', status: 'plain' },
    { text: `PROVISIONING VOL INSTANCE: ${vol.name} (t2.micro)`, status: 'ok' },
    { text: 'REGION: ap-south-1', status: 'plain' },
    { text: 'ATTACHING IAM ROLE: VolunteerFullAccess', status: 'ok' },
    { text: 'SCANNING S3 BUCKET: sbg-technicals-memes', status: 'ok' },
    { text: 'MEASURING VIBE............ 97%', status: 'ok' },
    { text: 'WOULD THEY SURVIVE A 3AM DEBUG?...... PASS', status: 'ok' },
    ...custom,
    { text: 'BILLING ALERT: $0.00 - UNPAID LABOUR DETECTED', status: 'warn' },
    { text: 'CLOUDWATCH: sleep_hours METRIC BELOW THRESHOLD', status: 'warn' },
    { text: 'FINALIZING DECISION............ 99%', status: 'warn' },
    { text: 'CREATE_FAILED - STACK ROLLBACK INITIATED', status: 'fail' },
  ];
}
