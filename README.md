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
   • Unit Tests: Test individual modules (e.g., controllers, services).
   • Integration Tests: Test API endpoints with the database.

## Notes

1. Default Image URL:
   If no img_url is provided when creating a user, a default placeholder URL will be used.

2. Docker:
   Ensure Docker and Docker Compose are installed and running before starting the project.

3. Database Initialization:
   The database schema and table (users) will be created automatically on the first run if not already present.

## Author

Developed by Ofir Gady. ￼