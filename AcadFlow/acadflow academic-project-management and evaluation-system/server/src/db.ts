import { PrismaClient } from '@prisma/client';
import net from 'net';

export const prisma = new PrismaClient({
  log: [],
});

// Suppress unhandled stderr dump while preserving error handling in application layer
try {
  // @ts-ignore
  if (typeof prisma.$on === 'function') {
    // @ts-ignore
    prisma.$on('error', () => {});
    // @ts-ignore
    prisma.$on('warn', () => {});
  }
} catch {
  // Ignore
}

export interface DatabaseHealth {
  configured: boolean;
  connected: boolean;
  provider: string;
  message: string;
}

let cachedConnectionState: boolean | null = null;
let lastCheckTimestamp = 0;
const CACHE_TTL_MS = 60000; // 60 seconds cache to avoid repetitive network hangs

/**
 * Checks if a TCP host and port are actively accepting connections before invoking Prisma engine.
 * Prevents Prisma's Rust query engine from dumping connection failure errors to stderr.
 */
function isPortReachable(host: string, port: number, timeoutMs = 300): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const done = (result: boolean) => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve(result);
      }
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));

    try {
      socket.connect(port, host);
    } catch {
      done(false);
    }
  });
}

function parseHostAndPort(dbUrl: string): { host: string; port: number } {
  try {
    const parsed = new URL(dbUrl.replace(/^mysql:\/\//i, 'http://'));
    return {
      host: parsed.hostname || 'localhost',
      port: parsed.port ? parseInt(parsed.port, 10) : 3306,
    };
  } catch {
    return { host: 'localhost', port: 3306 };
  }
}

export async function isDatabaseConnected(): Promise<boolean> {
  const now = Date.now();
  if (cachedConnectionState !== null && (now - lastCheckTimestamp) < CACHE_TTL_MS) {
    return cachedConnectionState;
  }

  const health = await getDatabaseHealth();
  cachedConnectionState = health.connected;
  lastCheckTimestamp = now;
  return cachedConnectionState;
}

export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return {
      configured: false,
      connected: false,
      provider: 'mysql',
      message: 'DATABASE_URL is not configured in environment.',
    };
  }

  const { host, port } = parseHostAndPort(dbUrl);
  const reachable = await isPortReachable(host, port, 300);

  if (!reachable) {
    cachedConnectionState = false;
    lastCheckTimestamp = Date.now();
    return {
      configured: true,
      connected: false,
      provider: 'mysql',
      message: `MySQL server at ${host}:${port} is offline. Seamless in-memory fallback active.`,
    };
  }

  try {
    // Low-overhead query with short execution timeout
    await prisma.$queryRaw`SELECT 1`;
    cachedConnectionState = true;
    lastCheckTimestamp = Date.now();
    return {
      configured: true,
      connected: true,
      provider: 'mysql',
      message: 'Successfully connected to MySQL 8 database.',
    };
  } catch (err: any) {
    cachedConnectionState = false;
    lastCheckTimestamp = Date.now();
    return {
      configured: true,
      connected: false,
      provider: 'mysql',
      message: `MySQL query failed: ${err.message?.split('\n')[0] || 'Connection refused or host unreachable.'}`,
    };
  }
}

export default prisma;
