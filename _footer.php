<footer>
    This site is for informational purposes only. None of the businesses have been vetted so take the information at face value and use your judgment.
</footer>

<div id="contact">
    <p>The lifeblood of this site is feedback, so thank you!</p>

    <form action="/scripts/send.php" method="post">
        <input name="action" type="hidden" value="update" />
        <input name="question" type="hidden" />

        <label>Your email (optional, but helpful if we need to follow up with you)</label>
        <input name="from" style="width: 100%" type="text" />

        <br /><br />

        <label>Your message</label>
        <textarea rows="5" name="message" style="width: 100%"></textarea>
    </form>
</div>

<script>
    $(function() {

        // Contact button.
        $('.contact').click(function() {
            contact();

            return false;
        });

        // Thanks message.
        if (getParam('thanks') == true)
            thanks();

        // Fancy tooltips.
        $(document).tooltip();
    });

    function contact(question) {
        var label = question ? 'Update' : 'Send';
        var btns = {};
        btns[label] = send;
        btns['Cancel'] = function() {
            $('#contact').dialog('close');
        };

        // Set action.
        $('[name=action]').val(question ? 'update' : '');

        $('#contact').dialog({

            // Clear out message on close.
            close: function() {
                $('[name=message]').val('');
            },

            // Set title on open.
            open: function() {
                //$('#contact').dialog('option', 'position', 'center');

                if (question)
                    $('#contact').dialog('option', 'title', question);
                else
                    $('#contact').dialog('option', 'title', 'Contact Us');
            },

            buttons: btns,
            modal: true,
            position: { my: "center", at: "center", of: window },
            width: 500
        });
    }
    function getParam(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
    }
    function send() {
        $.post('/scripts/send.php', {
            action: $('[name=action]').val(),
            question: $('[name=question]').val(),
            from: $('[name=from]').val(),
            message: $('[name=message]').val()
        }, function() {
            $('#contact').dialog('close');
            thanks();
        });
    }
    function thanks() {

        // FIXME: Reveal/highlight for a few sec.
        $('#alert').slideDown();
    }
</script>
