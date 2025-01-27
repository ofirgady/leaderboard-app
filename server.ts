import express from 'express'
import pool from './db'

const app = express();
app.use(express.json());

const PORT = 3030; // Port where the server will run

// Root route to check if the server is running
app.get('/', (req : express.Request, res : express.Response)  => {
  res.send('Leaderboard API is running!');
});

// Start the server and listen on the defined port
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});