<?php include '_header.php' ?>

<style>
    button {
        border: none;
        border-radius: 7px;
        color: #444;
        cursor: pointer;
        /*display: none;*/
        font-size: 9pt;
        padding: 3px 10px;
    }
    button:hover { color: #000 }

    .questions li {
        margin-bottom: 15px;
    }
    .questions li:last-child,.questions p:last-child { margin-bottom: 0 }
    .questions > li {
        /*background-color: #fff;*/
        background-color: #f3f3f5;
        border: 1px solid #bbb;
        border-radius: 5px;
        /*box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);*/
        box-shadow: 0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19) !important;
        font-size: 1.5em;
        list-style-type: none;
        opacity: 0.8;
        padding: 30px 20px;
    }
    .questions .question + li + a {
        display: block;
    }
    .questions li div.answer {
        /*display: none;*/
        font-size: 12pt;
        margin: 1.5em 0 0 0;
        padding-right: 100px;
    }
    .questions { padding: 0 }

    @media (max-width: 500px) {
        button.right {
            background-color: #c0c0c0;
            margin-top: 10px;
        }

        .questions li div.answer {
            padding-right: 0;
        }
    }
</style>

<div class="content">
    <div id="notice">Welcome to <strong>avlfilm.com</strong>, a new continually-updated resource for the filmmaking community of Asheville, North Carolina! For our mission, see our <a href="about.php">about page</a>. If you have anything you think should be added, please <a class="contact" href="#">contact us</a>. If you want to update an existing question, hover over it and click the Update button.</div>

    <h1>The Local Community</h1>
    <ul class="questions">
        <li>
            <h2 class="left">What film schools are in North Carolina?</h2>
            <button class="right">Update</button>
            <div class="spacer"></div>

            <div class="answer">
                <ul>
                    <li>
                        <a href="http://www.ashevilleschooloffilm.com">Asheville School of Film</a><br />
                        A non-degree film school offering a variety of hands-on 8 week and 4 week courses, as well as weekend seminars and workshops.
                    </li>
                    <li>
                        <a href="https://www.uncsa.edu/filmmaking/index.aspx">University of North Carolina School of the Arts, School of Filmmaking</a><br />
                        Ranked among the best film schools in the country, the filmmaking school at UNCSA knows that you won't become a filmmaker by sitting in a classroom.
                    </li>
                    <li>
                        <a href="https://www.wcu.edu/learn/departments-schools-colleges/fpa/stagescreen/programs/film-television.aspx">Western Carolina University Film and Television Production Program</a><br />
                        All Film and Television Production program (FTP) faculty have worked extensively in the film and television industries. They teach not only the art and technique of filmmaking but the real world skills and attitudes necessary to succeed as well.
                    </li>
                </ul>
            </div>
        </li>
        <li>
            <h2 class="left">What film festivals are in town?</h2>
            <button class="right">Update</button>
            <div class="spacer"></div>

            <div class="answer">
                <ul>
                    <li>
                        <a href="http://catflyfilmfest.com">Cat Fly Indie Film Festival</a><br />
                        March 31 - April 2, 2017.
                    </li>
                    <li>
                        <a href="http://ajff.fineartstheatre.com">Asheville Jewish Film Festival</a><br />
                        April 6, 13, 20 &amp; 27, 2017.
                    </li>
                    <li>
                        <a href="http://www.musicvideoavl.com/">Music Video AVL</a><br />
                        April 19, 2017.
                    </li>
                    <li>
                        <a href="http://90secondnewbery.com">90-Second Newberry Film Festival</a><br />
                        April 22, 2017.
                    </li>
                    <li>
                        <a href="http://www.48hourfilm.com/asheville-nc">48-hour Film Project</a><br />
                        June 17 - 18, 2017.
                    </li>
                    <li>
                        <a href="http://www.ashevillencfilmfestival.com">Asheville Film Festival</a><br />
                        September 16, 2017.
                    </li>
                    <li>
                        <a href="http://5pointfilm.org/asheville">5Point Adventure Film Festival</a><br />
                        2017 dates TBD.
                    </li>
                    <li>
                        <a href="http://www.twinriversmediafestival.com">Twin Rivers Multimedia</a><br />
                        Already over for 2017.
                    </li>
                    <li>
                        <a href="http://www.blackmountaincollege.org/film-festival-frame-form-screen-dance-festival/">Frame + Form | Screen Dance Festival</a><br />
                        Already over for 2017.
                    </li>
                </ul>
            </div>
        </li>
        <li>
            <h2 class="left">What movie theaters are in town?</h2>
            <button class="right">Update</button>
            <div class="spacer"></div>

            <div class="answer">
                <ul>
                    <li>
                        <a href="https://www.ashevillebrewing.com/movies/">Asheville Brewing Company</a><br />
                        All tickets are just <span class="green">$3</span> for all shows.<br />
                        <a href="https://www.google.com/maps/place/Asheville+Pizza+%26+Brewing+Co/@35.6221378,-82.5558037,17z/data=!3m1!4b1!4m5!3m4!1s0x8859f4c8537e7fa9:0x23d7cd5244e031f7!8m2!3d35.6221378!4d-82.553615">675 Merrimon Avenue</a>
                    </li>
                    <li>
                        <a href="https://www.carmike.com/nc/carmike-10-asheville-nc">AMC Classic River Hills 10 AKA Carmike Cinema 10</a><br />
                        Cineplex with 3D &amp; jumbo digital screens showing first-run films, opera productions &amp; sports events. <span class="green">$5 Tuesdays</span>: You do have to be a rewards card member, which is free, and you have to buy tickets at the box office.<br />
                        <a href="https://www.google.com/maps/place/Carmike+10/@35.570739,-82.5228177,17z/data=!3m1!4b1!4m5!3m4!1s0x8859f30a4ff417e3:0x26ec6bdbaae3ee60!8m2!3d35.570739!4d-82.520629">121 River Hills Rd</a>
                    </li>
                    <li>
                        <a href="https://www.cinemark.com/north-carolina/the-carolina-cinemark-asheville">Carolina Cinemas</a><br />
                        Cinema showing first-run and indie films plus football, with a full bar and lounge. <span class="green">$5 2D Tuesdays</span>. Pro tip: buy yourself an e-gift card and you can avoid the fees.<br />
                        <a href="https://www.google.com/maps/place/The+Carolina+Cinemark+Asheville/@35.5115907,-82.5270439,17z/data=!3m1!4b1!4m5!3m4!1s0x8859f2825c655b81:0xd970a7a899cfc6b3!8m2!3d35.5115907!4d-82.5248552">1640 Hendersonville Rd, Asheville, NC 28803</a>
                    </li>
                    <li>
                        <a href="http://www.fineartstheatre.com">Fine Arts Theatre</a><br />
                        Easygoing cinema showing 1st-run, art &amp; independent films in an art deco/modern setting. <span class="green">$6 Tuesdays</span>.<br />
                        <a href="https://www.google.com/maps/place/Fine+Arts+Theatre/@35.593571,-82.5533137,17z/data=!3m1!4b1!4m5!3m4!1s0x8859f359e223c221:0x70a200d72c8d1b05!8m2!3d35.593571!4d-82.551125">36 Biltmore Ave</a>
                    </li>
                    <li>
                        <a href="http://www.grailmoviehouse.com">Grail Moviehouse</a><br />
                        The Grail is a locally owned and operated three-screen cinema downtown, screening first run, independent, classic and local films in a comfortable setting. Concessions feature delicious local snacks and drinks. Asheville Film Society Screenings every Tuesday and Thursday.<br />
                        <a href="https://www.google.com/maps/place/Grail+Moviehouse/@35.593571,-82.5533137,17z/data=!4m5!3m4!1s0x8859f3539cdca9b7:0xfd8d51ccadb81c6b!8m2!3d35.5921563!4d-82.5589508">45 South French Broad Avenue, Suite 130</a>
                    </li>
                    <li>
                        <a href="http://www.regmovies.com/theatres/theatre-folder/regal-biltmore-grande-stadium-15-rpx-8597">Regal Biltmore Grande Stadium 15</a><br />
                        <a href="https://www.google.com/maps/place/Regal+Cinemas+Biltmore+Grande+15+%26+RPX/@35.4849027,-82.5603011,17z/data=!3m1!4b1!4m5!3m4!1s0x8859ed340665c81f:0xcf38507f4f87fe35!8m2!3d35.4849027!4d-82.5581124">I-26 &amp; Long Shoals Rd</a>
                    </li>
                </ul>
            </div>
        </li>
        <li>
            <h2 class="left">What production companies are in town?</h2>
            <button class="right">Update</button>
            <div class="spacer"></div>

            <div class="answer">
                <ul>
                    <li>
                        <a href="https://www.facebook.com/allaroundartsy/">All Around Artsy Productions</a><br />
                        Narrative film and music video production company specializing in capturing the magic and whimsy of brands and artists. Striving to provoke and instill wonder one video project at a time.
                    </li>
                    <li>
                        <a href="http://amplified-media.com">Amplified Media</a><br />
                        Amplified Media is a professional Video and Photography firm located in beautiful Asheville NC. We specialize in creative visual storytelling with an authentic and genuine approach.
                    </li>
                    <li>
                        <a href="http://www.bonesteelfilms.com">Bonesteel Films</a><br />
                        Bonesteel Films is a team of video craftspeople.  Their boutique specializes in authentic branded content with a focus on real stories and real people.
                    </li>
                    <li>
                        <a href="https://www.fiascopictures.com">Fiasco Pictures</a><br />
                    </li>
                </ul>
            </div>
        </li>
        <li>
            <h2 class="left">What other resources are in town?</h2>
            <button class="right">Update</button>
            <div class="spacer"></div>

            <div class="answer">
                <ul>
                    <li>
                        <a href="https://theactorscenterasheville.com">The Actor's Center of Asheville</a><br />
                        Dedicated to helping students better understand the craft of acting on a professional level. Students explore their potential through scene study, improvisation, character development and much more. The Actor's Center of Asheville offers Acting classes, Audition shooting &amp; coaching, workshops, and One on One Private Coaching for film, television, commercials, industrials, in addition to the stage. The Actor's Center Of Asheville is lead by Instructor and professional working actor, Kevin Patrick Murphy.<br />
                        <a href="https://www.google.com/maps/place/The+Actor's+Center+Of+Asheville/@35.6078709,-82.3613101">104 Eastside Drive, Black Mountain</a>
                    </li>
                    <li>
                        <a href="http://www.ashevilleschooloffilm.com">Asheville School of Film</a><br />
                        Focused on providing affordable, short term classes in various filmmaking subjects. Our goal is to provide quality, concise information and experience for those with a general interest in filmmaking and for all skill levels.<br />
                        <a href="https://www.google.com/maps/place/Asheville+School+of+Film/@35.592117,-82.5614137">45 South French Broad Ave, Suite 120</a>
                    </li>
                    <li>
                        <a href="http://www.ballphotosupply.com">Ball Photo Supply Camera Center</a><br />
                        A camera store serving WNC for over 50 years.<br />
                        <a href="https://www.google.com/maps/place/Ball+Photo+Supply+Camera+Center/@35.5940157,-82.5365173,17z/data=!3m1!4b1!4m5!3m4!1s0x8859f36158a19761:0x5c524c50ad32f9a5!8m2!3d35.5940157!4d-82.5343286">Innsbruck Mall, 85 Tunnel Rd</a>
                    </li>
                    <li>
                        <a href="https://mechanicaleyecinema.org">Mechanical Eye Microcinema</a><br />
                        Mechanical Eye Microcinema is a non-profit organization dedicated to facilitating an inclusive community of empowered voices by providing equitable access to moving image screenings, education, and resources.<br />
                        <a href="https://www.google.com/maps/place/The+Refinery+Creator+Space/@35.587139,-82.5569937,17z/data=!3m1!4b1!4m5!3m4!1s0x8859f34e20b74e3f:0xaf09fce4a0397b8d!8m2!3d35.587139!4d-82.554805">The Refinery, Suite 22</a>
                    </li>
                    <li class="gray">
                        NYS3: The Meisner Conservatory for the Southeast<br />
                        This shut down in late 2016.
                    </li>
                    <li>
                        <a href="http://ashevillearts.com/refinery/">Refinery Creator Space</a><br />
                        AKA The Refinery. A space for artists to work, collaborate, and grow their creative businesses.<br />
                        <a href="https://www.google.com/maps/place/The+Refinery+Creator+Space/@35.587139,-82.5569937,17z/data=!3m1!4b1!4m5!3m4!1s0x8859f34e20b74e3f:0xaf09fce4a0397b8d!8m2!3d35.587139!4d-82.554805"></a>
                    </li>
                    <li>
                        <a href="http://screenartistsco-op.com">Screen Artists Co-op</a><br />
                        Screen Artists Co-op is a collective of professional actors working together to achieve success in screen acting. The Co-op is a service provider for audition taping, headshots and a series of acting courses designed by founder and mentor Jon Menick, an actor in the LA and NYC markets for 35+ years. Courses such as Blocks and Fears, Persona, Dialects, Character and Script Analysis, to name a few, as well as practicums in Auditioning Technique, break down and rebuild the skill set of the actor to attain the goal of working in the Southeast Region and beyond. Professional Actress Jennifer Gatti, who most recently held a recurring role in the HBO series Vice Principals, and has dozens of screen credits throughout her years as an actor, is the Co-op's Scene Study instructor. Classes are held in three blocks each year (excluding the summer) for 8-10 weeks per session.<br />
                        <a href="https://www.google.com/maps/place/Screen+Artists+Talent/@35.638402,-82.5994857,17z/data=!3m1!4b1!4m5!3m4!1s0x88598b047c1b0c31:0x63bc61219231e4d!8m2!3d35.638402!4d-82.597297">2002 Riverside Drive, Suite 42P</a>
                    </li>
                    <li>
                        <a href="http://screenartiststalent.com">Screen Artists Talent</a><br />
                        Screen Artists Talent believes strongly in the process of branding and marketing the personal essence of the actors we represent. As your agent, we will take the time to get to know not only your skills, talents and personality as an actor, as well as the real person behind it all. We will utilize everything we discover about who you are to ensure that you are thoroughly and realistically represented in the world of professional screen acting. Screen Artists Talent is a boutique agency in the beautiful mountains of Western North Carolina.<br />
                        <a href="https://www.google.com/maps/place/Screen+Artists+Talent/@35.638402,-82.5994857,17z/data=!3m1!4b1!4m5!3m4!1s0x88598b047c1b0c31:0x63bc61219231e4d!8m2!3d35.638402!4d-82.597297">2002 Riverside Drive, Suite 42P</a>
                    </li>
                </ul>
            </div>
        </li>
        <li id="online">
            <h2 class="left">What resources are there online?</h2>
            <button class="right">Update</button>
            <div class="spacer"></div>

            <div class="answer">
                <p>
                    <a href="http://www.ashevillemovie.com">Asheville Video Alliance</a><br />
                    A North Carolina non-profit corporation comprised of local filmmakers, editors, actors, and others focused on making a difference within the community.
                </p>

                <p><u>Meetup.com</u></p>

                <ul>
                    <li>
                        <a href="https://www.meetup.com/Asheville-Video-Alliance/">Asheville Video Alliance</a>
                    </li>
                    <li>
                        <a href="https://www.meetup.com/Asheville-20s-and-30s-Movie-Geek-Social-Meetup/">Asheville 20s and 30s Movie Geek Social Meetup</a>
                    </li>
                </ul>

                <p><u>Facebook groups</u></p>

                <ul>
                    <li>
                        <a href="https://www.facebook.com/groups/123105947855710/">Asheville Actors</a><br />
                        A place to post audition and performance reminders.
                    </li>
                    <li>
                        <a href="https://www.facebook.com/groups/ashevilleartscene/">Asheville Artists' Network</a><br />
                        This is a group for Asheville artists, arts-world professionals, and enthusiasts. It's a place for us all to keep in touch with what's happening in the arts world, to ask questions, and to support each other.
                    </li>
                    <li>
                        <a href="https://www.facebook.com/groups/ashevilleauditions/">Asheville Audition &amp; Casting Notices</a><br />
                        A central place for casting and audition notices in and around Western North Carolina.
                    </li>
                    <li>
                        <a href="https://www.facebook.com/groups/avlfg/">Asheville Filmmakers Group</a><br />
                        This group is for anyone interested in the production of movies and videos in the Asheville, NC area.
                    </li>
                    <li>
                        <a href="https://www.facebook.com/ashevilleschooloffilm/">Asheville School of Film</a><br />
                        Business page that post various film related events and articles.
                    </li>
                    <li>
                        <a href="https://www.facebook.com/groups/245020652269214/">WAX - West Asheville Exchange</a><br />
                        This is a place for community discussion, things for sale, and discussion on Asheville topics. Could be a good resource for finding extras.
                    </li>
                    <li>
                        <a href="https://www.facebook.com/groups/wncfc/">Western North Carolina Film &amp; Theatre Community</a><br />
                        Mission is to show both the major/indie film industry that Western NC has talent in actors and production crew.
                    </li>
                    <li>
                        <a href="https://www.facebook.com/groups/AFC.Asheville/">Western North Carolina Filmmakers Co-op</a><br />
                        To unite and encourage independent filmmakers and increase the quantity and quality of productions from Western North Carolina.
                    </li>
                </ul>
            </div>
        </li>
    </ul>

    <h1>Actors &amp; Crew</h1>
    <ul class="questions">
        <li>
            <h2 class="left">Where can I find actors and crew?</h2>
            <button class="right">Update</button>
            <div class="spacer"></div>

            <div class="answer">
                <p>Our <a href="actors.php">Actors page</a>! The very next thing for this site will be to build a similar database for crew.</p>

                <p>
                    Acting agencies in the area:
                    <ul>
                        <li>Asheville: <a href="https://theactorscenterasheville.com">The Actor's Center of Asheville</a> and <a href="http://screenartiststalent.com">Screen Artists Talent</a></li>
                        <li>Charlotte/Raleigh: <a href="http://www.boldtalentagency.com/contact-us/">Bold Talent</a></li>
                        <li>Greenville: <a href="https://www.abovethelinetalent.com">Above the Line Talent</a> and <a href="http://millielewisgreenville.com">Millie Lewis</a></li>
                        <li>Hickory: <a href="http://www.thebrockagency.com/home.asp">Brock Agency</a></li>
                    </ul>
                </p>

                <p>
                    As for sites, these are some I know of, though I can't speak to their efficacy:
                    <ul>
                        <li><a href="http://800casting.com">800casting.com</a></li>
                        <li><a href="http://actorsaccess.com">actorsaccess.com</a></li>
                        <li><a href="http://breakdownexpress.com">breakdownexpress.com</a></li>
                        <li><a href="https://indiefilmcasting.com">indiefilmcasting.com</a></li>
                        <li><a href="https://www.productionhub.com">productionhub.com</a></li>
                        <li><a href="http://www.thesoutherncastingcall.com/category/casting-calls/north-carolina/">thesoutherncastingcall.com</a></li>
                    </ul>
                </p>

                <p>The <a href="http://mountainx.com">Mountain Xpress</a> also has an Auditions section of their Community Calendar that you could try.</p>

                <p>And finally, you can always try sticking flyers around town, but this is the least effective method.</p>
            </div>
        </li>
    </ul>

    <h1>Rentals</h1>
    <ul class="questions">
        <li>
            <h2 class="left">Who offers rentals in town?</h2>
            <button class="right">Update</button>
            <div class="spacer"></div>

            <div class="answer">
                <p>For equipment, <a href="http://ashevillecameragriplightingrental.com">AVL Camera Grip &amp; Lighting Rental</a> and <a href="http://www.ballphotosupply.com">Ball Photo</a>.</p>
                <p>For studios and/or green screens, <a href="http://www.ashevilleschooloffilm.com">Asheville School of Film</a> and <a href="http://theashevillestudio.com">The Asheville Studio</a>.</p>
            </div>
        </li>
    </ul>
</div>

<?php include '_footer.php' ?>

<script>
    $(function() {

        /* Reveal answer.
        $('li a.left').click(function() {
            $(this).parent().find('.answer').slideToggle();

            return false;
        });

        // Reveal update button on hover.
        $('.questions > li').hover(function() {
            $(this).find('button').show();
        }, function() {
            $(this).find('button').hide();
        });*/

        // Update.
        $('button').click(function() {
            var question = $(this).parent().find('h2').first().text();
            $('[name=question]').val(question);

            contact(question);
        });
    });
</script>

</body>
</html>
