import mysql from 'mysql2';

const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST ,
  user: process.env.DATABASE_USER, // MySQL kullanıcı adı
  password: process.env.DATABASE_PASSWORD, // MySQL şifresi
  database: process.env.DATABASE_NAME, // Veritabanı adı
});

export const db =connection