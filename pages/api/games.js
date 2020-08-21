import { mySQLClient } from './../../util/mysql';

const numGamesPerPage = 50;

export default async (req, res) => {
  const pageNum = req.query.pageNum || 1;
  const startingPage = numGamesPerPage * (pageNum - 1);
  let connection;
  try {
    connection = await mySQLClient();
  } catch (error) {
    const message = `Failed to make MySQL connection: ${error.message}`;
    console.error(message);
    res.statusCode = 500;
    res.json({ error: message });
    return;
  }

  try {
    const games = await connection.query(`
      SELECT * from metaserver_games
        ORDER BY end_datetime DESC
        LIMIT ${startingPage}, ${numGamesPerPage}
      `);
    res.statusCode = 200;
    res.json({ games });
  } catch (error) {
    const message = `Query failed: ${error.message}`;
    console.error(message);
    res.statusCode = 500;
    res.json({ error: message });
  }

  connection.release();
}
