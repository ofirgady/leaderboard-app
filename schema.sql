CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL,
    img_url TEXT DEFAULT 'https://res.cloudinary.com/ofirgady/image/upload/v1738051542/f0x6hos7igasxxjlmoj8.jpg'
);