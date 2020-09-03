import SQLFormat from 'sql-template-strings';
import { mySQLClient } from '../../util/mysql';

const numGamesPerPage = 50;

export default async (req, res) => {
  const pageNum = req.query.pageNum || 1;
  const startingPage = numGamesPerPage * (pageNum - 1);

  try {
    const games = await mySQLClient.query(SQLFormat`
      SELECT * from metaserver_games
        ORDER BY end_datetime DESC
        LIMIT ${startingPage}, ${numGamesPerPage}
      `);
    res.statusCode = 200;
    res.json({ games });
  } catch (error) {
    const message = `Query failed: ${error.message}`;
    // eslint-disable-next-line no-console
    console.error(message);
    res.statusCode = 500;
    res.json({ error: message });
  }
};
