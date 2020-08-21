import mysql from 'mysql';

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: 'root',
  password: process.env.MYSQL_PASSWORD,
  database: 'fake_accounts',
  port: 3306,
  connectionLimit: 10,
});

export const mySQLClient = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }
      console.log("MySQL pool connected: threadId " + connection.threadId);
      const query = (sql, binding) => {
        return new Promise((resolve, reject) => {
          connection.query(sql, binding, (err, result) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(result);
          });
        });
      };
      const release = () => {
        return new Promise((resolve, reject) => {
          if (err) {
            reject(err);
          }
          console.log("MySQL pool released: threadId " + connection.threadId);
          resolve(connection.release());
        });
      };
      resolve({ query, release });
    });
  });
};

export const query = (sql, binding) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, binding, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};
