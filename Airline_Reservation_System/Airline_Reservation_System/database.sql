CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flights (
  id INT AUTO_INCREMENT PRIMARY KEY,
  flight_number VARCHAR(20) NOT NULL UNIQUE,
  airline VARCHAR(100) NOT NULL,
  origin VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  departure_time DATETIME NOT NULL,
  arrival_time DATETIME NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  seats_available INT NOT NULL DEFAULT 0,
  INDEX route_date_idx (origin, destination, departure_time)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_reference VARCHAR(20) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  flight_id INT NOT NULL,
  passengers INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('CONFIRMED','CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
  booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_booking_flight FOREIGN KEY (flight_id) REFERENCES flights(id)
);

INSERT IGNORE INTO flights
(flight_number, airline, origin, destination, departure_time, arrival_time, price, seats_available)
VALUES
('SF101','SkyFly Airlines','Mumbai','Delhi', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 2 HOUR 10 MINUTE, 5200.00, 45),
('SF205','SkyFly Airlines','Mumbai','Bengaluru', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY) + INTERVAL 1 HOUR 45 MINUTE, 4100.00, 38),
('SF310','SkyFly Airlines','Delhi','Mumbai', DATE_ADD(NOW(), INTERVAL 4 DAY), DATE_ADD(NOW(), INTERVAL 4 DAY) + INTERVAL 2 HOUR 15 MINUTE, 5500.00, 50),
('SF422','SkyFly Airlines','Pune','Delhi', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY) + INTERVAL 2 HOUR 5 MINUTE, 4800.00, 30),
('SF530','SkyFly Airlines','Mumbai','Goa', DATE_ADD(NOW(), INTERVAL 6 DAY), DATE_ADD(NOW(), INTERVAL 6 DAY) + INTERVAL 1 HOUR 20 MINUTE, 2900.00, 25);