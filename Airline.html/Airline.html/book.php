<?php
require_once 'config.php';

$flightId = filter_input(INPUT_GET, 'flight_id', FILTER_VALIDATE_INT);
$passengers = filter_input(INPUT_GET, 'passengers', FILTER_VALIDATE_INT);
$passengers = ($passengers && $passengers > 0 && $passengers <= 9) ? $passengers : 1;

$stmt = $pdo->prepare("SELECT * FROM flights WHERE id = ? AND departure_time > NOW()");
$stmt->execute([$flightId ?: 0]);
$flight = $stmt->fetch();

if (!$flight) {
    http_response_code(404);
    exit('Flight not found. <a href="index.php">Search again</a>.');
}
if ((int)$flight['seats_available'] < $passengers) {
    exit('Not enough seats available. <a href="index.php">Search again</a>.');
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['full_name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $count = filter_input(INPUT_POST, 'passengers', FILTER_VALIDATE_INT);
    $count = ($count && $count > 0 && $count <= 9) ? $count : 0;

    if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $phone === '' || !$count) {
        $error = 'Enter a valid name, email, phone number and passenger count.';
    } else {
        try {
            $pdo->beginTransaction();

            // Lock the flight row to prevent two simultaneous bookings taking the same seats.
            $lock = $pdo->prepare("SELECT price, seats_available FROM flights WHERE id = ? FOR UPDATE");
            $lock->execute([$flightId]);
            $lockedFlight = $lock->fetch();

            if (!$lockedFlight || (int)$lockedFlight['seats_available'] < $count) {
                throw new RuntimeException('Sorry, not enough seats are available now.');
            }

            $userStmt = $pdo->prepare(
                "INSERT INTO users (full_name, email, phone) VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone)"
            );
            $userStmt->execute([$name, $email, $phone]);

            $findUser = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $findUser->execute([$email]);
            $userId = (int)$findUser->fetchColumn();

            $total = (float)$lockedFlight['price'] * $count;
            $reference = 'SF' . strtoupper(bin2hex(random_bytes(4)));

            $bookingStmt = $pdo->prepare(
                "INSERT INTO bookings (booking_reference, user_id, flight_id, passengers, total_amount)
                 VALUES (?, ?, ?, ?, ?)"
            );
            $bookingStmt->execute([$reference, $userId, $flightId, $count, $total]);

            $updateSeats = $pdo->prepare("UPDATE flights SET seats_available = seats_available - ? WHERE id = ?");
            $updateSeats->execute([$count, $flightId]);

            $pdo->commit();
            header('Location: confirmation.php?ref=' . urlencode($reference));
            exit;
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            $error = $e instanceof RuntimeException ? $e->getMessage() : 'Booking could not be completed. Please try again.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Passenger Details | SkyFly</title><link rel="stylesheet" href="style.css"></head>
<body>
<header class="site-header"><a class="brand" href="index.php">✈ SkyFly Airlines</a><nav><a href="index.php">Home</a></nav></header>
<main class="content-section narrow">
  <a href="index.php" class="back">← Back to flights</a>
  <h1>Passenger details</h1>
  <div class="summary">
    <strong><?= htmlspecialchars($flight['flight_number']) ?> · <?= htmlspecialchars($flight['airline']) ?></strong>
    <p><?= htmlspecialchars($flight['origin']) ?> → <?= htmlspecialchars($flight['destination']) ?></p>
    <p><?= date('d M Y, h:i A', strtotime($flight['departure_time'])) ?></p>
    <p>Fare per passenger: ₹<?= number_format((float)$flight['price'], 2) ?></p>
  </div>
  <?php if ($error): ?><p class="notice"><?= htmlspecialchars($error) ?></p><?php endif; ?>
  <form method="post" class="form-card">
    <label>Full name<input name="full_name" maxlength="100" required></label>
    <label>Email address<input type="email" name="email" maxlength="150" required></label>
    <label>Phone number<input name="phone" type="tel" maxlength="20" required></label>
    <label>Number of passengers
      <select name="passengers">
        <?php for ($i=1; $i<=min(9,(int)$flight['seats_available']); $i++): ?>
          <option value="<?= $i ?>" <?= $i===$passengers?'selected':'' ?>><?= $i ?></option>
        <?php endfor; ?>
      </select>
    </label>
    <button class="btn" type="submit">Confirm booking</button>
  </form>
</main>
<footer>© <?= date('Y') ?> SkyFly Airlines. Student project demo.</footer>
</body>
</html>
