
## Data Structure Design for Leaderboard System

### Overview

The leaderboard system is designed to efficiently store, update, and retrieve millions of user scores while ensuring high performance and scalability. Below is a breakdown of the data structure choices and how they contribute to optimized performance.

### Database Schema Design

The system uses PostgreSQL as the primary database. The users table stores user information, including their score and ranking.

#### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    score INT NOT NULL DEFAULT 0,
    img_url TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Materialized View: leaderboard_ranking

```sql
CREATE MATERIALIZED VIEW leaderboard_ranking AS
SELECT id, username, score, img_url,
       RANK() OVER (ORDER BY score DESC) AS rank
FROM users;
```

### Key Design Decisions & Optimizations

1. **Indexed score Column for Faster Queries**

   - **Why?**

     - Since leaderboards require sorting users by score, we created an index on the score column in descending order.
     - This speeds up queries when fetching the top N users.

   - **Implementation:**

     ```sql
     CREATE INDEX IF NOT EXISTS idx_score ON users (score DESC);
     ```

   - **Performance Benefit:**
     - Queries like `SELECT * FROM users ORDER BY score DESC LIMIT 10;` run in O(log N) time rather than O(N log N).

2. **Materialized View (leaderboard_ranking) for Faster Reads**

   - **Why?**

     - Fetching a ranked list of users dynamically each time can be slow, especially for millions of users.
     - Using a Materialized View stores precomputed ranking so that leaderboard retrieval is instant.

   - **Implementation:**

     ```sql
     CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard_ranking AS
     SELECT id, username, score, img_url,
            RANK() OVER (ORDER BY score DESC) AS rank
     FROM users;
     ```

   - **Performance Benefit:**
     - Queries to get rankings run in O(1) instead of O(N log N).
     - Using `REFRESH MATERIALIZED VIEW leaderboard_ranking;` ensures updated rankings.

3. **Using RANK() for Efficient Positioning**

   - **Why?**

     - Instead of recalculating a user’s rank every time they request it, we use PostgreSQL’s window function RANK().
     - This ensures constant-time lookup when retrieving a user’s position.

   - **Implementation:**

     ```sql
     SELECT * FROM leaderboard_ranking WHERE id = $1;
     ```

   - **Performance Benefit:**
     - No need to re-sort every time a user requests their position, making it O(1) instead of O(N log N).

4. **Partial Index for Optimized Queries**

   - **Why?**

     - Many leaderboard queries ignore users with score = 0, so we added an index that only applies to users with positive scores.

   - **Implementation:**

     ```sql
     CREATE INDEX IF NOT EXISTS idx_score_positive ON users (score DESC) WHERE score > 0;
     ```

   - **Performance Benefit:**
     - Speeds up queries that filter out inactive or low-score users.

5. **Background Updates with PostgreSQL LISTEN/NOTIFY**

   - **Why?**

     - Instead of constantly refreshing the materialized view manually, we use PostgreSQL’s LISTEN/NOTIFY mechanism.
     - The leaderboard automatically refreshes when scores change.

   - **Implementation:**

     ```javascript
     pool.on('notification', async () => {
     	loggerService.info('Refreshing leaderboard materialized view...');
     	await pool.query('REFRESH MATERIALIZED VIEW leaderboard_ranking');
     });
     ```

   - **Performance Benefit:**
     - Keeps the leaderboard up-to-date without expensive full-table scans.

### Final Performance Gains

| Optimization             | Before         | After                       |
| ------------------------ | -------------- | --------------------------- |
| Sorting Leaderboard      | O(N log N)     | O(log N) (Indexing)         |
| Getting Rank             | O(N)           | O(1) (Materialized View)    |
| Filtering Out Low Scores | O(N)           | O(log N) (Partial Index)    |
| Automatic Updates        | Manual Queries | Real-time via LISTEN/NOTIFY |

### Conclusion

This scalable and high-performance design ensures:

- Fast leaderboard retrieval for millions of users
- Efficient ranking system without recalculating ranks
- Real-time leaderboard updates with minimal database load
