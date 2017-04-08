<?php

if (! $_POST)
    die();

$question = $_REQUEST['question'];
$action = $_REQUEST['action'];
$from = $_REQUEST['from'];
$message = "From: $from\n\n" . $_REQUEST['message'];
$to = 'futzlarson@gmail.com';
$subject = "[avlfilm.com] ";

if ($action == 'update')
    $subject .= "Update to: $question";
else
    $subject .= "Suggestion";

mail($to, $subject, $message);

?>
