<?php
require_once 'config.php';

$origin = trim($_GET['origin'] ?? '');
$destination = trim($_GET['destination'] ?? '');
$date = trim($_GET['date'] ?? '');
$passengers = filter_input(INPUT_GET, 'passengers', FILTER_VALIDATE_INT);
$passengers = ($passengers && $passengers > 0 && $passengers <= 9) ? $passengers : 1;

$flights = [];
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['search'])) {
    if ($origin === '' || $destination === '' || $date === '') {
        $error = 'Please enter origin, destination and travel date.';
    } elseif (strcasecmp($origin, $destination) === 0) {
        $error = 'Origin and destination must be different.';
    } else {
        $stmt = $pdo->prepare(
            "SELECT * FROM flights
             WHERE LOWER(origin) = LOWER(?)
               AND LOWER(destination) = LOWER(?)
               AND DATE(departure_time) = ?
               AND seats_available >= ?
               AND departure_time > NOW()
             ORDER BY departure_time"
        );
        $stmt->execute([$origin, $destination, $date, $passengers]);
        $flights = $stmt->fetchAll();
        if (!$flights) $error = 'No matching flights found. Try another route or date.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SkyFly Airlines | Book Flights</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
<header class="site-header">
  <a class="brand" href="index.php">✈ SkyFly Airlines</a>
  <nav><a href="index.php">Home</a><a href="#booking">Book Flight</a><a href="#results">Flights</a></nav>
</header>

<main>
  <section class="hero">
    <div class="hero-copy">
      <p class="eyebrow">FLY BETTER. GO FURTHER.</p>
      <h1>Your journey<br>starts here.</h1>
      <p>Search flights, compare fares and book your next trip with ease.</p>
    </div>
    <section class="search-card" id="booking">
      <h2>Find your flight</h2>
      <form method="get" action="index.php" class="search-form">
        <input type="hidden" name="search" value="1">
        <label>From
          <input name="origin" list="cities" placeholder="e.g. Mumbai" value="<?= htmlspecialchars($origin) ?>" required>
        </label>
        <label>To
          <input name="destination" list="cities" placeholder="e.g. Delhi" value="<?= htmlspecialchars($destination) ?>" required>
        </label>
        <datalist id="cities">
          <option value="Mumbai"><option value="Delhi"><option value="Pune">
          <option value="Bengaluru"><option value="Goa">
        </datalist>
        <label>Departure date
          <input type="date" name="date" min="<?= date('Y-m-d') ?>" value="<?= htmlspecialchars($date) ?>" required>
        </label>
        <label>Passengers
          <select name="passengers">
            <?php for ($i=1; $i<=9; $i++): ?>
              <option value="<?= $i ?>" <?= $passengers === $i ? 'selected' : '' ?>><?= $i ?> <?= $i===1?'Adult':'Adults' ?></option>
            <?php endfor; ?>
          </select>
        </label>
        <button class="btn" type="submit">Search Flights</button>
      </form>
    </section>
  </section>

  <section class="content-section" id="results">
    <?php if ($error): ?><p class="notice"><?= htmlspecialchars($error) ?></p><?php endif; ?>
    <?php if ($flights): ?>
      <h2>Available flights</h2>
      <p class="muted"><?= count($flights) ?> flight(s) found for <?= htmlspecialchars($origin) ?> → <?= htmlspecialchars($destination) ?></p>
      <div class="flight-list">
        <?php foreach ($flights as $flight): ?>
          <article class="flight-card">
            <div><strong><?= htmlspecialchars($flight['airline']) ?></strong><p class="muted"><?= htmlspecialchars($flight['flight_number']) ?></p></div>
            <div><strong><?= date('h:i A', strtotime($flight['departure_time'])) ?></strong><p><?= htmlspecialchars($flight['origin']) ?></p></div>
            <div class="muted">→</div>
            <div><strong><?= date('h:i A', strtotime($flight['arrival_time'])) ?></strong><p><?= htmlspecialchars($flight['destination']) ?></p></div>
            <div><strong>₹<?= number_format((float)$flight['price'], 2) ?></strong><p class="muted"><?= (int)$flight['seats_available'] ?> seats left</p></div>
            <form action="book.php" method="get">
              <input type="hidden" name="flight_id" value="<?= (int)$flight['id'] ?>">
              <input type="hidden" name="passengers" value="<?= $passengers ?>">
              <button class="btn" type="submit">Book now</button>
            </form>
          </article>
        <?php endforeach; ?>
      </div>
    <?php else: ?>
      <div class="features">
        <article><span>✈</span><h3>Great destinations</h3><p>Explore routes across India.</p></article>
        <article><span>🔒</span><h3>Secure booking</h3><p>Your booking details are handled safely.</p></article>
        <article><span>☎</span><h3>Travel support</h3><p>Help when you need it.</p></article>
      </div>
    <?php endif; ?>
  </section>
</main>
<footer>© <?= date('Y') ?> SkyFly Airlines. Student project demo.</footer>
</body>
</html>
