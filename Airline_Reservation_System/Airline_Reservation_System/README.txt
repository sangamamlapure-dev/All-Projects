SKYFLY AIRLINE RESERVATION SYSTEM - SETUP

Requirements:
- XAMPP (Apache + MySQL)
- VS Code (optional editor)
- A modern browser

1. Copy the Airline_Reservation_System folder into:
   C:\xampp\htdocs\

2. Open XAMPP Control Panel and start Apache and MySQL.

3. Open phpMyAdmin:
   http://localhost/phpmyadmin

4. Click Import, choose database.sql from this project, then click Import/Go.
   This creates the airline_reservation database and sample flights.

5. Check config.php. XAMPP commonly uses:
   host = localhost
   username = root
   password = (blank)
   If your MySQL password is different, update it there.

6. Open the website:
   http://localhost/Airline_Reservation_System/

7. Search using sample routes such as Mumbai -> Delhi.
   The sample flights are scheduled relative to the time you import database.sql.

PROJECT FILES
- index.php         Home page and flight search
- book.php          Passenger form and booking processing
- confirmation.php  Booking confirmation / ticket details
- config.php        PDO database connection
- database.sql      Database and sample flight data
- style.css         Responsive website styling

IMPORTANT
- This is an educational/demo project, not a production airline booking platform.
- It does not process real payments, issue airline tickets, send emails, or verify passenger identity.
- Before real deployment, add authentication, CSRF protection, payment gateway integration,
  stronger validation, audit logging, privacy/security review and proper cancellation/refund workflows.
