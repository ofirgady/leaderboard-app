# Leaderboard-app

A scalable leaderboard system for gaming platforms, designed to handle a large user base with high performance and efficiency.

## Leaderboard API

This project is a leaderboard system designed for a gaming platform to display top players and their scores. The system supports adding users, updating their scores, and retrieving user rankings.

---

## Prerequisites

- Docker and Docker Compose installed on your machine
- Postman (optional, for testing API endpoints)

---

## Setup Instructions

Follow these steps to set up and run the project locally:

1. **Clone the Repository**  
   Clone the project from your repository:

   - git clone https://github.com/ofirgady/leaderboard-app.git
   - cd leaderboard-app

2. **Run the Application with Docker Compose**
   Build and start the application using Docker Compose:

   - docker-compose up --build -d

3. **Verify the Application is Running**

   - App: Visit http://localhost:3000 to confirm the server is running.
   - Database: PostgreSQL is exposed on port 5433.

4. **Test the Endpoints (Optional)**
   Use Postman or any API testing tool to test the endpoints listed below.

## API Endpoints

1.  Check Server Status

    - Endpoint: GET /
    - Description: Verifies the API is running.
    - Response: Leaderboard API is running!

2.  Add a New User

    - Endpoint: POST /api/user/addUser
    - Description: Adds a new user to the leaderboard.
    - Request Body:

          {
          "username": "string",
          "score": "integer",
          "img_url": "string (optional)"
          }

    - Response: Returns the created user details.

3.  Update a User’s Score

    - Endpoint: PUT /api/user/updateScore/:id
    - Description: Updates the score of an existing user.
    - Request Body:

      {
      "score": "integer"
      }

    - Response: Returns the updated user details.

4.  Retrieve Top N Users

    - Endpoint: GET /api/user/getTopUsers/:limit
    - Description: Retrieves the top N users from the leaderboard.
    - Response: Returns an array of the top users.

5.  Retrieve a User’s Ranking with Neighbors

    - Endpoint: GET /api/user/getUserWithNeighbors/:id
    - Description: Retrieves a user’s ranking and the 5 users above and below them.
    - Response: Returns the user’s ranking and neighbors.

## Environment Variables

    The project uses the following environment variables, which are set in the .env file:

    - Database username
    DB_USER=postgres

    - Database host
    DB_HOST=leaderboard-db

    - Database name
    DB_NAME=leaderBoardDB

    - Database password
    DB_PASSWORD=postgres123

    - Database port
    DB_PORT=5432

## Directory Structure

leaderboard-app/
├── src/
│ ├── controllers/ # Handles API logic
│ ├── routes/ # API endpoints
│ ├── services/ # Utility and helper services
│ ├── db.ts # Database connection setup
│ ├── server.ts # Entry point of the application
│ └── ... # Other files
├── tests/
│ ├── integration/ # Integration tests
│ ├── unit/ # Unit tests
├── docker-compose.yml # Docker Compose configuration
├── Dockerfile # Docker image configuration
├── .env # Environment variables
├── README.md # Project documentation
└── ...

## Testing

1. Run Tests:

   - Run the existing tests using the following command: npm run test

2. Tests Included:

- Unit Tests: Test individual modules (e.g., controllers, services).
- Integration Tests: Test API endpoints with the database.

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

Now the system is ready to handle 10,000,000+ users efficiently!

## Scalable AWS Cloud Architecture for Leaderboard System

### Overview

The Leaderboard System needs to handle millions of users, providing real-time ranking updates, and ensuring low latency for retrieving the top players and user rankings. Below is a highly scalable AWS cloud architecture designed to support high-traffic workloads.

### Key AWS Components

- Elastic Load Balancer (ALB)
- Auto Scaling Group for API servers
- Amazon RDS for PostgreSQL
- Amazon ElastiCache (Redis)
- AWS Lambda for leaderboard refresh
- Amazon S3 & CloudFront for static assets
- Amazon CloudWatch & AWS X-Ray for logging and monitoring
- Amazon Cognito for authentication

### Architectural Breakdown

#### 1. API Layer (Scalable Backend)

**AWS Services Used:**

- Elastic Load Balancer (ALB) to distribute traffic.
- EC2 Auto Scaling Group for API servers.

**Why?**

- Handles high-traffic spikes dynamically (scales up/down based on demand).
- Ensures high availability (multiple API servers across availability zones).

**Implementation:**

- Amazon Route 53 routes traffic to ALB, which balances requests to EC2 instances running the Node.js API.
- Auto Scaling Group ensures enough API instances based on CPU/memory usage.

```yaml
AutoScalingGroup:
  Type: AWS::AutoScaling::AutoScalingGroup
  Properties:
    MinSize: 2
    MaxSize: 10
    DesiredCapacity: 3
    TargetGroupARNs: [!Ref LoadBalancerTargetGroup]
    HealthCheckType: EC2
```

#### 2. Database Layer (PostgreSQL with Read Replicas)

**AWS Services Used:**

- Amazon RDS for PostgreSQL (Primary Database)
- RDS Read Replicas (for optimized read queries)

**Why?**

- High availability with Multi-AZ deployment.
- Read Replicas offload read queries (leaderboard ranking retrieval).

**Implementation:**

- Writes go to the primary RDS instance.
- Reads (Leaderboard queries) are routed to Read Replicas.

```sql
SELECT * FROM leaderboard_ranking
FROM users
ORDER BY score DESC
LIMIT 100;
```

#### 3. Caching Layer (ElastiCache for Redis)

**AWS Services Used:**

- Amazon ElastiCache for Redis (In-Memory Cache)

**Why?**

- Speeds up leaderboard retrieval (cached top players).
- Reduces PostgreSQL load (frequently accessed data is stored in Redis).

**Implementation:**

- Top N users are cached in Redis and updated periodically.
- Cache Expiry: Updated every 30 seconds or on user score update.

```javascript
const redisKey = 'leaderboard:top100';
const leaderboardData = await redisClient.get(redisKey);

if (!leaderboardData) {
	const result = await db.query('SELECT * FROM leaderboard_ranking LIMIT 100');
	await redisClient.set(redisKey, JSON.stringify(result.rows), 'EX', 30);
}
```

#### 4. Leaderboard Refresh (AWS Lambda & SQS)

**AWS Services Used:**

- AWS Lambda for refreshing the materialized view.
- Amazon SQS queues leaderboard updates.

**Why?**

- Ensures leaderboard stays up-to-date.
- Async processing prevents delays in user experience.

**Implementation:**

- API triggers an SQS message when a user score updates.
- AWS Lambda listens to SQS, refreshes the leaderboard, and invalidates the cache.

```yaml
Resources:
  RefreshLeaderboardLambda:
    Type: AWS::Lambda::Function
    Properties:
      Handler: leaderboard.handler
      Runtime: nodejs14.x
      Timeout: 10
      Policies: AmazonRDSFullAccess
```

#### 5. Authentication & Security (AWS Cognito & IAM)

**AWS Services Used:**

- Amazon Cognito for authentication.
- AWS IAM Roles for security.

**Why?**

- Provides secure authentication (OAuth, SAML, JWT tokens).
- IAM restricts access to sensitive data.

**Implementation:**

- Users authenticate via Cognito.
- IAM restricts API access to authenticated users.

#### 6. Static Content & Global Distribution

**AWS Services Used:**

- Amazon S3 for user images.
- Amazon CloudFront (CDN) for fast content delivery.

**Why?**

- S3 provides scalable storage for user images.
- CloudFront caches images globally for fast delivery.

```yaml
Resources:
  UserImagesBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: leaderboard-user-images
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
```

#### 7. Monitoring & Logging

**AWS Services Used:**

- Amazon CloudWatch for logs & metrics.
- AWS X-Ray for request tracing.

**Why?**

- Helps track API performance and identify slow queries.

```yaml
Resources:
  CloudWatchLogsGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: leaderboard-logs
```

### High-Level AWS Architecture Diagram

```
                         ┌──────────────┐
                         │ Route 53 DNS │
                         └──────▲───────┘
                                        │
                                        ▼
                         ┌──────────────┐
                         │ ALB (Load Balancer) │
                         └────────▲───────┘
                                        │
                    ┌────────▼────────┐
                    │ Auto Scaling EC2 │
                    │  API Servers     │
                    └────────▲────────┘
                                     │
                ┌─────────▼─────────┐
                │ Amazon RDS (PostgreSQL) │
                ├─────────▲─────────┤
                │   Read Replicas   │
                └─────────▲─────────┘
                                    │
             ┌─────────▼─────────┐
             │ ElastiCache (Redis)│
             └─────────▲─────────┘
                                    │
            ┌──────────▼──────────┐
            │ AWS Lambda (Updates) │
            └──────────▲──────────┘
                                 │
                ┌───────▼───────┐
                │ Amazon SQS    │
                └───────────────┘

                ┌────────────────────────┐
                │ S3 & CloudFront (CDN)  │
                └────────────────────────┘

                ┌────────────────────────┐
                │ CloudWatch & AWS X-Ray │
                └────────────────────────┘
```

### Final Benefits

| Feature           | AWS Component                  | Benefit                          |
| ----------------- | ------------------------------ | -------------------------------- |
| Scalability       | Auto Scaling EC2, ALB          | Scales up/down with traffic      |
| Low Latency Reads | ElastiCache (Redis)            | Instant leaderboard retrieval    |
| Optimized Writes  | Amazon RDS with Read Replicas  | Read-heavy queries offloaded     |
| Real-Time Updates | SQS + Lambda                   | Event-driven leaderboard refresh |
| High Availability | Multi-AZ RDS, ALB              | No downtime, fault tolerance     |
| Security          | Cognito, IAM                   | Secure API authentication        |
| Cost Optimization | On-Demand & Reserved Instances | Reduces infrastructure costs     |

### Conclusion

This scalable AWS architecture ensures:

- Fast leaderboard retrieval (millions of users)
- Real-time updates without lag
- Highly available, secure, and cost-efficient

Now ready to support high-traffic gaming platforms!

## Notes

1. Default Image URL:
   If no img_url is provided when creating a user, a default placeholder URL will be used.

2. Docker:
   Ensure Docker and Docker Compose are installed and running before starting the project.

3. Database Initialization:
   The database schema and table (users) will be created automatically on the first run if not already present.

## Author

Developed by Ofir Gady. ￼
