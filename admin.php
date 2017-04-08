<?php

require_once "/var/www/html/vendor/autoload.php";

$collection = (new MongoDB\Client)->avlfilm->actors;
$pending = $collection->find(
    [ 'approved' => false ],
    [
        'sort' => [ 'name' => 1 ]
    ]
);

include '_header.php';

?>

<style>
    h2 {
        margin-bottom: 5px;
    }

    footer {
        bottom: 0;
        left: 0;
        position: absolute;
        right: 0;
    }
</style>

<div class="content">
    <h1>Pending Actors: <?= count($pending) ?></h1>

    <table border="1">
        <tr>
            <th>Name</th>
            <th>Height</th>
            <th>Hair color</th>
            <th>Hair length</th>
            <th>Eyes</th>
            <th>Headshot</th>
            <th>Resume</th>
            <th>Contact</th>
            <th>Comments</th>
            <th>Actions</th>
        </tr>
        <?php foreach ($pending as $p) { ?>
            <tr>
                <?php foreach (array('name', 'height', 'hair_color', 'hair_length', 'eyes', 'headshot', 'resume', 'contact', 'comments') as $f) { ?>
                    <td>
                    <?php if ($f == 'headshot' || $f == 'resume') { ?>
                        <a href="/uploads/<?= $p->$f ?>"><?= $p->$f ?></a>
                    <?php } else { ?>
                        <?= $p->$f ?>
                    <?php } ?>
                    </td>
                <?php } ?>
                <td>
                    <button>Approve</button>
                    <button>Delete</button>
                </td>
            </tr>
        <?php } ?>
    </table>
</div>

<?php include '_footer.php' ?>

</body>
</html>
