import serverlessMySQL from 'serverless-mysql';

export const mySQLClient = (() => {
  const client = serverlessMySQL({
    config: {
      host: process.env.MYSQL_HOST,
      user: 'root',
      password: process.env.MYSQL_PASSWORD,
      database: 'fake_accounts',
      port: 3306,
      connectionLimit: 10,
    },
  });

  const query = async (sql) => {
    const results = await client.query(sql);
    await client.end();
    return results;
  };

  return { query };
})();
