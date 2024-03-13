<?php
// Database connection details
$servername = "localhost:3306";
$username = "root";
$password = "Mani@100699";
$dbname = "form_data";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve form data
    $name = $_POST["name"];
    $email = $_POST["email"];
    $phno = $_POST["phno"];
    $password = $_POST["password"];
    $dob = $_POST["dob"];
    $skills = $_POST["skills"];
    $gender = $_POST["gender"];
    $courses = implode(", ", $_POST["course"]);

    // Store file name
    $resume_filename = $_FILES["Resume"]["name"];

    // Prepare and bind SQL statement
    $stmt = $conn->prepare("INSERT INTO applications (name, email, phno, password, dob, skills, gender, courses, resume_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssisss", $name, $email, $phno, $password, $dob, $skills, $gender, $courses, $resume_path);

    // Execute SQL statement
    if ($stmt->execute() === TRUE) {
        echo "Application submitted successfully!";
    } else {
        echo "Error: " . $stmt->error;
    }

    // Close statement and connection
    $stmt->close();
    $conn->close();
} else {
    // If form is not submitted, redirect user to the form page
    header("Location: form.html");
    exit;
}
?>
