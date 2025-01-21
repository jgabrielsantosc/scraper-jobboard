import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  username: env.REDIS_USERNAME,
  password: env.REDIS_PASSWORD,
  tls: env.REDIS_TLS ? {
    rejectUnauthorized: false
  } : undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
});

redis.on('connect', () => {
  console.log('Conexão com Redis estabelecida');
});

redis.on('error', (error) => {
  console.error('Erro na conexão com Redis:', error);
});
