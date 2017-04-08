<?php

$server = $_SERVER['SERVER_NAME'];
$local = $server == 'localhost';
$self = $_SERVER['PHP_SELF'];

$options = array(
    'hair_color' => array('-', 'Auburn', 'Bald', 'Black', 'Blonde', 'Brown', 'Gray', 'Honey Brown', 'Multi-color', 'Red', 'Salt and Pepper', 'Strawberry Blonde', 'White'),
    'hair_length' => array('-', 'Bald (total)', 'Bald (on top)', 'Buzzcut', 'Chin length', 'Long', 'Receding', 'Shaved', 'Short', 'Shoulder length'),
    'height_lower' => 43,
    'height_upper' => 77
);

// Set title and description.
if (strpos($self, 'actors.php') !== false) {
    $title = "Actors in Asheville, NC";
    $desc = "Find Actors in Asheville, North Carolina.";
} else if (strpos($self, 'about.php') !== false) {
    $title = "About avlfilm.com";
    $desc = "Why this site exists. In short, to help people create films in Asheville, North Carolina.";
} else if (strpos($self, 'add.php') !== false) {
    $title = "Add Actor";
    $desc = "Want to be added to our database of actors? This is where to do it!";
} else {
    $title = "Asheville Film";
    $desc = "Frequently asked questions for the independent filmmaking community in Asheville, North Carolina. Find film schools, film festivals, movie theaters, actors, crew, equipment various other resources.";
}

function to_height($i) {
    $feet = intval($i / 12);
    $inches = $i - ($feet * 12);

    if (strpos('.', $feet) !== false)
        $feet++;

    $height = "$feet'$inches\"";

    return $height;
}
function to_inches($height) {
    preg_match('/(\d*?)\'(\d*)/', $height, $match);
    $inches = $match[1] * 12 + $match[2];

    return $inches;
}

?>

<!DOCTYPE html>
<html>
<head>
    <title><?php echo $title; ?></title>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta charset="utf-8">
    <meta name="description" content="<?php echo $desc; ?>" />

    <!-- OpenGraph -->
    <meta property="og:title" content="<?php echo $title; ?>" />
    <meta property="og:description" content="<?php echo $desc; ?>" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="http://www.avlfilm.com<?php echo $self; ?>" />
    <meta property="og:image" content="http://<?php echo $_SERVER['HTTP_HOST']; ?>/assets/logo-black.png" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:height" content="200" />
    <meta property="og:image:width" content="950" />

        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>

        <link rel="stylesheet" href="http://code.jquery.com/ui/1.12.1/themes/pepper-grinder/jquery-ui.css">

    <link href="https://fonts.googleapis.com/css?family=Maven+Pro" rel="stylesheet">
    <link rel="stylesheet" href="/style.css">

    <?php include_once('_ga.php'); ?>
</head>

<body>

<div id="alert">Thank you, your message has been sent.</div>

<header>
    <div class="left">
        <a href="/"><img alt="Asheville Film" src="/assets/logo-white.png" /></a>
    </div>
    <div class="right">
        <a alt="About avlfilm.com" href="about.php" id="about">ABOUT</a>
        <a alt="Frequently Asked Questions" href="/">FAQ</a>
        <a alt="Actors in Asheville, NC" href="actors.php">ACTORS</a>
        <!--<a href="crew.php">CREW</a>-->
        <a alt="Contact us" class="contact" href="#">CONTACT</a>
    </div>
    <div class="clear"></div>
</header>

