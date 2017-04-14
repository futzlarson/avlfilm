<?php

require_once "/var/www/html/vendor/autoload.php";
error_reporting(error_reporting() & ~E_NOTICE);

$collection = (new MongoDB\Client)->avlfilm->actors;
$cursor = $collection->find(
    [ 'approved' => true ],
    [
        'sort' => [ 'name' => 1 ]
    ]
);

$row = 0;

include '_header.php';

?>

<style>
    fieldset {
        background-color: rgba(255, 255, 255, 0.8);
        border-radius: 5px;
        font-family: Arial;
        font-size: 10pt;
        padding: 15px;
    }
    img {
        height: 33%;
    }
    label { display: inline }
    h2 {
        font-family: Arial;
        font-weight: normal;
    }

    .pad { margin-right: 25px }

    #size {
        margin-left: 50px;
    }

    /* Responsive */
    @media (max-width: 500px) {
        th,td { font-size: 9pt }

        #mobile { display: block }
        #size {
            margin-left: 0;
            margin-top: 15px;
        }
    }
</style>

<div class="content">
    <h1>Actors</h1>

    <div id="notice">
        Before reaching out to any actors/agencies, be aware of the questions they will often have:

        <ul>
            <li>What is the project? Film? TV? Short film? Commercial?</li>
            <li>How many days of filming for each role?</li>
            <li>What is the size of each role?</li>
            <li>Will they have to travel outside of Asheville for a callback or for filming?</li>
            <li>Will travel expenses be covered if traveling out of Asheville?</li>
            <li>Will food be provided during filming or receive per diem for food each day?</li>
            <li>Is there compensation?</li>
            <li>If so, what? And can it be mailed within 10 days of the actor's last shooting date?</li>
            <li>Is the production covered by insurance in the case of accidental injury?</li>
        </ul>

        <a href="/assets/ActorAgreement.pdf">Here</a> is a typical agreement that you would receive from an agency. Also realize that standard non-union agency fee is 20% in addition to the actor's daily rate.
    </div>

    <fieldset style="display: inline-block">
        <legend><strong>Options</strong></legend>

        <div class="left hide">
            <em>Hair color</em>
            <div class="options">
                <?php foreach($options['hair_color'] as $f) { ?>
                    <input disabled checked="checked" id="hair_<?= $f ?>" type="checkbox" />
                    <label for="hair_<?= $f ?>"><?= $f ?></label>
                    <br />
                <?php } ?>
            </div>
        </div>

        <div class="left hide" style="margin-left: 50px">
            <em>Hair length</em>
            <div class="options">
                <?php foreach($options['hair_length'] as $f) { ?>
                    <input disabled checked="checked" id="hair_<?= $f ?>" type="checkbox" />
                    <label for="hair_<?= $f ?>"><?= $f ?></label>
                    <br />
                <?php } ?>
            </div>
        </div>

        <div class="left hide" style="margin-left: 50px">
            <em>Eyes</em>
            <div class="options">
            </div>
        </div>

        <div class="left">
                <u>Height</u><br />
                <input class="height" id="chk_taller" type="checkbox" />
                <label for="chk_taller">At least:</label>
                <select name="taller">
                    <?php foreach (range($options['height_upper'], $options['height_lower']) as $i) { ?>
                        <option value="<?= $i ?>"><?= to_height($i) ?></option>
                    <?php } ?>
                </select>

    <!--
                <div style="height: 20px"></div>

                <input class="height" id="chk_shorter" type="checkbox" />
                <label for="chk_shorter">At most:</label>
                <select name="shorter">
                    <?php foreach (range($options['height_lower'], $options['height_upper']) as $i) { ?>
                        <option value="<?= $i ?>"><?= to_height($i) ?></option>
                    <?php } ?>
                </select>
    -->

        </div>
        <div class="left" id="size">
            <u>Thumbnail size</u><br />
            <input checked="checked" id="33" name="thumb" type="radio" />
            <label class="pad" for="33">Small</label>

            <input id="66" name="thumb" type="radio" />
            <label class="pad" for="66">Medium</label>

            <input id="100" name="thumb" type="radio" />
            <label for="100">Large</label>
        </div>

        <div class="clear"></div>

        <p style="margin: 20px 0 0 0; font-size: 9pt">
            Would other options (hair color, hair length, weight or eye color) be helpful? <a class="contact" href="#">Tell us!</a>
        </p>
        <p style="font-size: 9pt; margin-bottom: 0">
            Currently populated by actors from: <a href="http://screenartiststalent.com">Screen Artists Talent</a>, <a href="https://www.gagetalent.com">Gage Models and Talent Agency</a>. <a href="add.php">Want to be added?</a>
        </p>
    </fieldset>

    <h2 style="margin: 30px 0">
        Actors: <strong id="count"></strong>
        &nbsp;
        <a href="add.php" title="Want to be added?"><i class="fa fa-plus-square"></i></a>
    </h2>

    <p class="hide blurb important" id="mobile">This page is best viewed on a desktop.</p>

    <table border="1">
        <tr>
            <th>Photo</th>
            <th>Name</th>
            <th>Gender</th>
            <th>Age group</th>
            <th>Height</th>
            <th>Hair&nbsp;color</th>
            <th>Hair&nbsp;length</th>
            <th>Eyes</th>
            <!--<th>Phone</th>-->
            <!--<th>Email</th>
            <th>Website</th>
            <th>Reel</th>-->
            <th>Resume</th>
            <!--<th>IMDB link</th>-->
            <th>Contact</th>
        </tr>
        <?php foreach($cursor as $actor) { ?>
            <tr <?= ++$row % 2 == 0 ? '' : ' class="alt"' ?>>
                <td>
                    <a href="<?= $actor->resume ?>" target="_blank"><img class="headshot" src="<?= $actor->headshot ?>" /></a>
                </td>
                <td><?= $actor->name ?></td>
                <td><?= isset($actor->gender) ? ucfirst($actor->gender) : '' ?></td>
                <td><?= $actor->age_group ?></td>
                <td name="height" inches="<?= to_inches($actor->height) ?>"><?= $actor->height ?></td>
                <td><?= $actor->hair_color ?></td>
                <td><?= $actor->hair_length ?></td>
                <td><?= $actor->eyes ?></td>
                <!--<td>phone</td>-->
                <!--<td>email</td>
                <td>website</td>
                <td>reel</td>-->
                <td>
                    <a href="<?= $actor->resume ?>" target="_blank">Resume</a>
                </td>
                <!--<td>imdb</td>-->
                <td>
                    <?php if ($actor->rep == 'sat') { ?>
                        <a href="mailto:jessy@screenartiststalent.com?subject=[avlfilm.com] <?= $actor->name ?>">SAT</a>
                    <?php } else if ($actor->rep == 'gage') { ?>
                        <a href="https://www.gagetalent.com/book-talent.php?id=<?= $actor->gage_id ?>">Gage</a>
                    <?php } else if ($actor->contact) { ?>
                        <a href="mailto:<?= $actor->contact ?>?subject=[avlfilm.com] <?= $actor->name ?>">Email</a>
                    <?php } ?>
                </td>
            </tr>
        <?php } ?>
    </table>
</div>

<?php include '_footer.php' ?>

<?php include '_fa.php' ?>
<script>
    $(function() {

        // Pre-select 6'0" because it's what all women want.
        $('[name=taller]').val('72');

        // Height filter.
        $('.height').change(filterHeight);

        // Enable checkbox on selection.
        $('[name=taller]').change(function() {
            $('[id=chk_taller').prop('checked', true);
            $('[id=chk_taller').trigger('change');
        });

        // Thumbnail size.
        $('[name=thumb]').change(function() {
            var percent = $(this).attr('id');
            $('img.headshot').css('height', percent + '%');
        });

        updateCount();
    });

    function filterHeight() {

        // Taller.
        if ($('[id=chk_taller]').is(':checked')) {
            var taller = $('[name=taller]').val();
            console.log('taller than: ' + taller);

            $('tr').each(function() {
                var height = $(this).find('[name=height]');

                if (height.length) {
                    var inches = height.attr('inches');
                    if (inches >= taller)
                        $(this).show();
                    else
                        $(this).hide();
                }
            });
        } else {
            $('tr').each(function() {
                $(this).show();
            });
        }

        updateCount();
    }
    function updateCount() {
        var count = 0;

        $('tr').each(function() {
            if ($(this).find('[name=height]').length && $(this).is(':visible'))
                count++;
        });

        $('#count').html(count);
    }
</script>

</body>
</html>
