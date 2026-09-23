import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

async function run() {
  try {
    const r1 = await pool.query('SELECT 1 as ok');
    console.log('SELECT 1 =>', r1.rows);

    const r2 = await pool.query("SELECT id_usuario,nome,email,role FROM usuario LIMIT 5");
    console.log('SELECT usuario =>', r2.rowCount, r2.rows);

    const r3 = await pool.query("SELECT id_usuario,nome,email,role FROM usuario WHERE email='admin@email.com' AND senha='1234'");
    console.log('SELECT where literal =>', r3.rowCount, r3.rows);

    const r4 = await pool.query('SELECT id_usuario,nome,email,role FROM usuario WHERE email=$1 AND senha=$2', ['admin@email.com','1234']);
    console.log('SELECT where params =>', r4.rowCount, r4.rows);
  } catch (e) {
    console.error('ERROR', e);
  } finally {
    await pool.end();
  }
}

run();
