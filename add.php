<?php include '_header.php' ?>

<style>
    button {
        font-size: 13pt;
        font-weight: bold;
        /*padding: 5px 10px;*/
    }
    form {
        background-color: #efefef;
        box-shadow: 0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19) !important;
        display: inline-block;
        padding: 25px;
    }

    input[type=file] {
        margin-bottom: 20px;
        width: 180px;
    }
    input[type=text],select {
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
        font-size: 14pt;
        margin-bottom: 20px;
        width: 200px;
    }
    textarea {
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
        width: 100%;
    }

    label {
        font-size: 12pt;
        margin-bottom: 2px;
    }

    #right {
        margin-left: 50px;
    }

    /* Responsive */
    @media (max-width: 570px) {
        form {
            display: block;
        }
        form .left {
            float: none;
        }
        input,select {
            width: 100% !important;
        }

        #right {
            margin-left: 0;
        }
    }
</style>

<div class="content">
    <h1>Add Actor</h1>

    <div id="notice">
        <?= $desc ?>
        <br /><br />
        If you have representation, we'd love for them to <a class="contact" href="#">contact us</a> so we can add their entire list! Fill out this form with as much info as you can.
    </div>

    <form action="/scripts/add_actor.php" method="post" enctype="multipart/form-data">
        <p class="red" style="margin-top: 0">Red fields are <u>not</u> required, but highly encouraged.</p>

        <div class="left">
            <label class="red">Name</label>
            <input name="name" tabindex="1" type="text" />

            <label>Hair Color</label>
            <select name="hair_color" tabindex="3">
                <?php foreach ($options['hair_color'] as $c) { ?>
                    <option><?= $c ?></option>
                <?php } ?>
            </select>

            <label class="red">Gender</label>
            <select name="gender">
                <?php foreach ($options['gender'] as $c) { ?>
                    <option><?= $c ?></option>
                <?php } ?>
            </select>

            <label class="red">
                Contact
                <i class="fa fa-question-circle-o" title="Your preferred way of being contacted. Phone number or email address."></i>
            </label>
            <input name="contact" tabindex="5" type="text" />

            <label>Website</label>
            <input name="website" tabindex="7" type="text" />

            <label>
                Representation
                <i class="fa fa-question-circle-o" title="The name of your agency, if you have one."></i>
            </label>
            <input name="rep" tabindex="9" type="text" />

            <label class="red">
                Headshot Upload
                <i class="fa fa-question-circle-o" title="Max size 10mb. Use this field or Headshot Link."></i>
            </label>
            <input name="headshot_file" tabindex="11" type="file" />

            <label class="red">Headshot Link</label>
            <input name="headshot_link" tabindex="13" type="text" />
        </div>
        <div class="left" id="right">
            <label class="red">Height</label>
            <select name="height" tabindex="2">
                <option>-</option>
                <?php foreach (range($options['height_upper'], $options['height_lower']) as $i) { ?>
                    <option><?= to_height($i) ?></option>
                <?php } ?>
            </select>

            <label>Hair Length</label>
            <select name="hair_length" tabindex="4">
                <?php foreach (array('-', 'Bald (total)', 'Bald (on top)', 'Buzzcut', 'Chin length', 'Long', 'Receding', 'Shaved', 'Short', 'Shoulder length') as $o) { ?>
                    <option><?= $o ?></option>
                <?php } ?>
            </select>

            <label class="red">Age Group</label>
            <select name="gender">
                <?php foreach ($options['age_group'] as $c) { ?>
                    <option><?= $c ?></option>
                <?php } ?>
            </select>

            <label>Eye Color</label>
            <!--<input name="eyes" tabindex="6" type="text" />-->
            <select name="eyes" tabindex="6">
                <?php foreach ($options['eyes'] as $c) { ?>
                    <option><?= $c ?></option>
                <?php } ?>
            </select>

            <label>Reel</label>
            <input name="reel" tabindex="8" type="text" />

            <label>IMDB Link</label>
            <input name="imdb" tabindex="10" type="text" />

            <label class="red">
                Resume Upload
                <i class="fa fa-question-circle-o" title="Max size 10mb. Use this field or Resume Link."></i>
            </label>
            <input name="resume_file" tabindex="12" type="file" />

            <label class="red">Resume Link</label>
            <input name="resume_link" tabindex="14" type="text" />
        </div>

        <div class="clear"></div>

        <label>
            Comments
            <i class="fa fa-question-circle-o" title="Anything else we should know? Does this form need correcting? Tell us!"></i>
        </label>
        <textarea name="comments" rows="3"></textarea>

        <div class="spacer" style="height: 30px"></div>

        <button tabindex="15"><i class="fa fa-plus"></i>&nbsp;&nbsp;Add me</button>
    </form>
</div>

<?php include '_footer.php' ?>

<?php include '_fa.php' ?>

</body>
</html>
