<?php
require_once 'config.php';
$ref = trim($_GET['ref'] ?? '');
$stmt = $pdo->prepare(
    "SELECT b.booking_reference, b.passengers, b.total_amount, b.status, b.booked_at,
            u.full_name, u.email, f.flight_number, f.airline, f.origin, f.destination,
            f.departure_time, f.arrival_time
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     JOIN flights f ON f.id = b.flight_id
     WHERE b.booking_reference = ?"
);
$stmt->execute([$ref]);
$booking = $stmt->fetch();
if (!$booking) {
    http_response_code(404);
    exit('Booking not found. <a href="index.php">Go home</a>.');
}
?>
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Booking confirmed | SkyFly</title><link rel="stylesheet" href="style.css"></head>
<body>
<header class="site-header"><a class="brand" href="index.php">✈ SkyFly Airlines</a><nav><a href="index.php">Home</a></nav></header>
<main class="content-section narrow">
  <div class="success-mark">✓</div>
  <h1>Booking confirmed!</h1>
  <p class="muted">Your demo booking has been saved successfully.</p>
  <section class="ticket">
    <p class="eyebrow">BOOKING REFERENCE</p>
    <h2><?= htmlspecialchars($booking['booking_reference']) ?></h2>
    <hr>
    <h3><?= htmlspecialchars($booking['airline']) ?> · <?= htmlspecialchars($booking['flight_number']) ?></h3>
    <p class="route"><?= htmlspecialchars($booking['origin']) ?> → <?= htmlspecialchars($booking['destination']) ?></p>
    <p>Departure: <?= date('d M Y, h:i A', strtotime($booking['departure_time'])) ?></p>
    <p>Passenger: <?= htmlspecialchars($booking['full_name']) ?></p>
    <p>Email: <?= htmlspecialchars($booking['email']) ?></p>
    <p>Passengers: <?= (int)$booking['passengers'] ?></p>
    <p>Total: <strong>₹<?= number_format((float)$booking['total_amount'], 2) ?></strong></p>
    <p>Status: <strong><?= htmlspecialchars($booking['status']) ?></strong></p>
  </section>
  <a class="btn link-btn" href="index.php">Book another flight</a>
</main>
<footer>© <?= date('Y') ?> SkyFly Airlines. Student project demo.</footer>
</body>
</html>
