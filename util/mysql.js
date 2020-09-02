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
    pool.getConnection((poolErr, connection) => {
      if (poolErr) {
        reject(poolErr);
        return;
      }
      // eslint-disable-next-line no-console
      console.log(`MySQL pool connected: threadId ${connection.threadId}`);
      const query = (sql, binding) => {
        return new Promise((resolveQuery, rejectQuery) => {
          connection.query(sql, binding, (queryErr, result) => {
            if (queryErr) {
              rejectQuery(queryErr);
              return;
            }
            resolveQuery(result);
          });
        });
      };
      const release = () => {
        return new Promise((resolveRelease, rejectRelease) => {
          if (poolErr) {
            rejectRelease(poolErr);
          }
          // eslint-disable-next-line no-console
          console.log(`MySQL pool released: threadId ${connection.threadId}`);
          resolveRelease(connection.release());
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
