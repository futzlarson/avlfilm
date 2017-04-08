<?php

require_once "/var/www/html/vendor/autoload.php";
date_default_timezone_set('America/New_York');

if (! $_POST)
    die();

// Remove empty fields.
foreach ($_POST as $key => $value) {
    if (! $value)
        unset($_POST[$key]);
}

// Handle headshot and resume uploads.
$_POST['headshot'] = move('headshot_file');
$_POST['resume'] = move('resume_file');

// If not uploade, try link.
if (! $_POST['headshot'])
    $_POST['headshot'] = $_POST['headshot_link'];
if (! $_POST['resume'])
    $_POST['resume'] = $_POST['resume_link'];

// Remove fields we don't want in the document.
unset($_POST['headshot_file'], $_POST['headshot_link'], $_POST['resume_file'], $_POST['resume_link']);

// Add to database.
add();

// Email.
$to = 'futzlarson@gmail.com';
$message = print_r($_POST, TRUE);
$subject = "[avlfilm.com] New actor!";
mail($to, $subject, $message);

// Redirect to homepage.
header("Location: /?thanks=1");

function add() {
    $actors = (new MongoDB\Client)->avlfilm->actors;

    // Insert.
    $_POST['approved'] = false;
    $r = $actors->insertOne($_POST);

    // Get insert info.
    $count = $r->getInsertedCount();
    $_POST['count'] = $count;
}
function move($which) {
    $file = $_FILES[$which];
    $info = pathinfo($file['name']);
    $ext = $info['extension'];
    $tmp = $file['tmp_name'];

    // File not uploaded.
    if (! file_exists($tmp) || ! is_uploaded_file($tmp))
        return;

    $newname = $which . '_' . date('Ymd_His') . ".$ext";
    $target = $_SERVER['DOCUMENT_ROOT'] . '/uploads/' . $newname;
    move_uploaded_file($tmp, $target);

    return $newname;
}

?>
