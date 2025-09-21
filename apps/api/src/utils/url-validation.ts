const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

const PRIVATE_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
]);

const PRIVATE_IPV4_RANGES: Array<[number, number]> = [
  [ipToNumber('10.0.0.0'), ipToNumber('10.255.255.255')],
  [ipToNumber('172.16.0.0'), ipToNumber('172.31.255.255')],
  [ipToNumber('192.168.0.0'), ipToNumber('192.168.255.255')],
  [ipToNumber('127.0.0.0'), ipToNumber('127.255.255.255')],
];

const DEFAULT_MAX_URL_LENGTH = 2048;

const parseAllowedHosts = () => {
  const fromEnv = process.env.FAL_ALLOWED_IMAGE_HOSTS;

  if (!fromEnv) {
    return null;
  }

  return fromEnv
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0);
};

const ALLOWED_HOSTS = parseAllowedHosts();

function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, part) => (acc << 8) + Number(part), 0);
}

function isPrivateIPv4(host: string): boolean {
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return false;
  }

  const numeric = ipToNumber(host);

  return PRIVATE_IPV4_RANGES.some(([start, end]) => numeric >= start && numeric <= end);
}

export interface UrlValidationOptions {
  maxLength?: number;
}

export type UrlValidationFailureReason =
  | 'URL_INVALID_LENGTH'
  | 'URL_MALFORMED'
  | 'URL_PROTOCOL_NOT_ALLOWED'
  | 'URL_PRIVATE_HOST'
  | 'URL_HOST_NOT_WHITELISTED';

export type UrlValidationResult =
  | { valid: true; parsed: URL }
  | { valid: false; reason: UrlValidationFailureReason };

export const isValidRemoteUrl = (
  value: string,
  { maxLength = DEFAULT_MAX_URL_LENGTH }: UrlValidationOptions = {},
): UrlValidationResult => {
  if (!value || value.length > maxLength) {
    return { valid: false, reason: 'URL_INVALID_LENGTH' } as const;
  }

  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    return { valid: false, reason: 'URL_MALFORMED' } as const;
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return { valid: false, reason: 'URL_PROTOCOL_NOT_ALLOWED' } as const;
  }

  const hostname = parsed.hostname.toLowerCase();

  if (PRIVATE_HOSTNAMES.has(hostname) || isPrivateIPv4(hostname)) {
    return { valid: false, reason: 'URL_PRIVATE_HOST' } as const;
  }

  if (ALLOWED_HOSTS && !ALLOWED_HOSTS.includes(hostname)) {
    return { valid: false, reason: 'URL_HOST_NOT_WHITELISTED' } as const;
  }

  return { valid: true, parsed } as const;
};
