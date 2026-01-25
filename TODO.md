## Now
- Admin mobile experience
- Claude skills (vs tasks?)
- Analytics: exclude me?
- Buttons: Directory vs Calendar. Also the <p> beneath
- Better directory structure?
- Timezones of things and best practice

## Later
- Incorrect time? https://calendar.google.com/calendar/u/1/r/eventedit?text=WNC+FIlmmaker+Kick+Off&dates=20260201T140000Z/20260201T153000Z&details=We'll+be+having+our+first+in-person+meeting+at+Frog+Level+Brewery.+If+anyone+has+a+movie+idea+or+script,+bring+it+on.+Frog+Level+has+food+and+drink+available.+All+ages+are+invited.%0ANo+cost.+We+will+just+get+together+and+talk+about+making+some+movies+in+WNC.+&location=Frog+Level+Brewing
- Admin:
  - Events ignore: FREE Kids Movie! [17069740] | Casual chat + coffee or more, Sunday mornings 10-noon [312846915]
- og:image

## Proxies
- Analytics?
- Rollbar

## Accounts
- Figure out how claiming should work
          {user ? (
            <li class="auth-link"><a href="/account/profile">Profile</a></li>
          ) : (
            <li class="auth-link"><a href="/account/login">Login</a></li>
          )}

## Events
- vistor_id changing?
- Package to generate info display/graphs for site_settings.database_backups, events. or, just feed it into a site that can generate analyses?

## Checks
- npx astro check
- npx tsc --noEmit (rn by astro check)
- npm run lint
- npm run lint:fix (to fix certain things)
- npx prettier --check

## Submission system
- Mimic google forms intake, button on page (new one for Spotlight?)
- Filter by Spotlight event (add/modify): Theme, Date
- Pending, Selected, Rejected with a note and name
- Number of films and runtime

## Later

- Directory: Ability to add photo
- scan pages for accuracy periodically and email report: festivals, resources
- use festival page to periodically update gcal

=====

## Done

- SEO re-eval
- Roll FAQ up
- Production: Contact button popup form w/ fields
- Roll production up
- Roll festival up
- Tracking clicks for ROI on membership: activity log?
- Make Resources page (fix links first)
- Homepage: Mission statement (generate?)
- Vercel: EO env var
- Test email sub: better alert
- Resources Update: Other resources, Online
- EO alerts for new signups? Webhooks?
- Address loading issue (screenshot)
- Tracking updates
  - Track filmmaker submission
  - Switch to a location API where Vercel won't hit limits
  - Document tracking codes
- Approve: Auto-email
- Review plan. Button to add events rather than auto?
- See what Gemini thinks
- Manual add form goes directly to calendar. Same format as avlgo
- Some sort of anti-span on newsletter signup
- Generate a sitemap that auto-updates
- Approve: disable button. Also add bio field. show bio and notes in admin/directory
- Calendar: Submit event with all the fields: title, desc, location, start time, end time, link for more info
- Directory: Tooltip on gear
- Social media: Youtube, IG, FB
- Social:
  - Handle multiple ig w/ spaces
  - Display as clickable (directory, create/edit, admin)
- Admin: Preview emails in browser, get rid of test-approval-email

### Calendar Events

- On Sunday, call up an admin page that calls the api and gets all film,movie events over the next week
- Display the events with whatever info is available, similar to avl go, with <Add>
- Manually review and click button to add
- Button uses Calendar API to add to avlfilm calendar in particular format
