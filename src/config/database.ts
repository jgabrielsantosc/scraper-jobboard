import { Pool } from 'pg';
import { env } from './env';

export const pool = new Pool({
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  host: env.POSTGRES_HOST,
  port: env.POSTGRES_PORT,
  database: env.POSTGRES_DB,
});

// Testar conexão
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Erro ao conectar ao PostgreSQL:', err);
  } else {
    console.log('Conexão com PostgreSQL estabelecida');
  }
});
