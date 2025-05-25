-- Create cameras table
CREATE TABLE cameras (
                         id SERIAL PRIMARY KEY,
                         name VARCHAR(50) NOT NULL,
                         location VARCHAR(100) NOT NULL,
                         feed_url VARCHAR(255) NOT NULL
);

-- Create detections table
CREATE TABLE detections (
                            id SERIAL PRIMARY KEY,
                            camera_id INTEGER REFERENCES cameras(id),
                            detection_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            type VARCHAR(50) NOT NULL,
                            details TEXT
);

-- Insert initial data
INSERT INTO cameras (name, location, feed_url) VALUES
                                                   ('Camera 1', 'North Gate', 'http://localhost:8000/images/camera1.jpg'),
                                                   ('Camera 2', 'Riverbank', 'http://localhost:8000/images/camera2.jpg'),
                                                   ('Camera 3', 'Restricted Area', 'http://localhost:8000/images/camera3.jpg'),
                                                   ('Camera 4', 'South Wall', 'http://localhost:8000/images/camera4.jpg'),
                                                   ('Camera 5', 'East Gate', 'http://localhost:8000/images/camera5.jpg');

CREATE TABLE users (
                       id SERIAL PRIMARY KEY,
                       name VARCHAR(100) NOT NULL,
                       email VARCHAR(255) UNIQUE NOT NULL,
                       hashed_password TEXT NOT NULL
);