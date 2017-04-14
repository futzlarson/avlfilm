<?php

require_once "/var/www/html/vendor/autoload.php";

$collection = (new MongoDB\Client)->avlfilm->actors;
$filter = [ 'approved' => false ];
$pending = $collection->find(
    $filter,
    [
        'sort' => [ 'name' => 1 ]
    ]
);
$results = $collection->count($filter);

include '_header.php';

?>

<style>
    h2 {
        margin-bottom: 5px;
    }

/*
    footer {
        bottom: 0;
        left: 0;
        position: absolute;
        right: 0;
    }
*/
</style>

<div class="content">
    <h1>Pending Actors: <?= $results ?></h1>

    <?php if ($results) { ?>
        <table border="1">
            <tr>
                <th>Name</th>
                <th>Height</th>
                <th>Hair&nbsp;color</th>
                <th>Hair&nbsp;length</th>
                <th>Eyes</th>
                <th>Headshot</th>
                <th>Resume</th>
                <!--<th>Contact</th>-->
                <th>Comments</th>
                <th>Actions</th>
            </tr>
            <?php foreach ($pending as $p) { ?>
                <tr>
                    <?php foreach (array('name', 'height', 'hair_color', 'hair_length', 'eyes', 'headshot', 'resume', 'comments') as $f) { ?>
                        <td>
                        <?php if ($f == 'headshot') { ?>
                            <a href="<?= $p->$f ?>"><?= $p->$f ?></a>
                        <?php } else if ($f == 'resume') { ?>
                            <a href="<?= $p->$f ?>">resume</a>
                        <?php } else if (isset($p->$f)) { ?>
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
    <?php } else { ?>
        <p>Aww.</p>
    <?php } ?>
</div>

<?php include '_footer.php' ?>

</body>
</html>
