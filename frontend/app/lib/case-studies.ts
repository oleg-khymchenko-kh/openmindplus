/**
 * Case studies, kept in code rather than the database: they are long-form,
 * reviewed text, and every change should go through a commit.
 *
 * The rules, taken from how the strongest agency and SaaS case studies are
 * built and from what has already gone wrong on argoaero:
 *
 * - The headline states what changed for the client, not what we built.
 * - Every figure in `stats` carries a `source`. A number nobody can trace is
 *   not published: a wrong figure gets quoted back by AI answers for months.
 * - Each figure needs a baseline or a unit the reader can judge it by.
 * - Where there is no honest metric, the story is a walkthrough of how the
 *   thing works — not an invented "40% faster".
 * - `story` is written for an owner of a business, in plain words. Anything
 *   only an engineer needs goes in `technical`.
 * - Every study is dated. Results go stale and a reader has to know when.
 * - Nothing that maps our infrastructure: no hosts, ports, paths, ids.
 */

export type Block =
  | string
  | { list: string[] }

export interface Stat {
  value: string
  label: string
  /** Where the number comes from, shown under the stat row. */
  source: string
}

export interface CaseStudy {
  slug: string
  /** Result-led headline. Under ~70 characters. */
  title: string
  /** Who it was for, as they may be named in public. */
  client: string
  industry: string
  location: string
  /** e.g. "Sep 2024 — ongoing" */
  period: string
  /** A study about work still under way says so up front. */
  status: 'live' | 'in-progress'
  /** ISO date this text was last checked against the code and the team. */
  checked: string
  /** One sentence under the headline. */
  lede: string
  summary: { challenge: string; solution: string; outcome: string }
  stats?: Stat[]
  story: { heading: string; body: Block[] }[]
  technical: { stack: string[]; notes: Block[] }
  /** Link to the project page on this site, if there is one. */
  projectSlug?: string
  /** The client's own site, if it may be linked. */
  url?: string
  /** Drafts are built but not listed, linked or indexed. */
  published: boolean
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'autoe-blog-invisible-to-google',
    // Sources: autoe repo, commit of 2026-08-23 ("Fix the whole blog and every
    // landing page rendering as a 404 to Googlebot..."); figures from the
    // Autoe session's build and network measurements and Search Console URL
    // Inspection, before and after. Checked 2026-11-04.
    title: '168 blog articles that opened fine for everyone except Google',
    client: 'AutoE',
    industry: 'EV charging',
    location: 'London, UK',
    period: 'August 2026',
    status: 'live',
    checked: '2026-11-04',
    lede:
      'Every article on the site opened perfectly in a browser. Google, looking at the same address, saw an error page — and refused to index it.',
    summary: {
      challenge:
        'A long-running site with 168 articles. Anyone who opened one saw it correctly, yet what Google saw at the same address was an error page it would not index.',
      solution:
        'We traced it to one oversized data request that Google gave up on before it finished, and changed the site so an article no longer depends on it.',
      outcome:
        'Google’s own inspection tool went from “page cannot be indexed” to “page can be indexed”, and a data request every page used to make now transfers a tenth of what it did.',
    },
    stats: [
      {
        value: '168',
        label: 'articles Google saw as an error page, now readable to it again',
        source: 'every article then on the blog, all served by the single code path that failed — count from the site’s own database, August 2026. The before-and-after live test in Google Search Console was run on sample article and landing-page addresses',
      },
      {
        value: '−90%',
        label: 'smaller: the data request every page of the site made — 272 KB down to 26 KB compressed',
        source: 'compressed transfer size of the request removed site-wide, measured before and after, August 2026',
      },
    ],
    story: [
      {
        heading: 'Everything looked fine',
        body: [
          'AutoE sells and installs electric-vehicle chargers in London, and its blog is a large part of how the site is found in search: articles on choosing a home charger, repairing one, or starting a charging business.',
          'Nothing was visibly wrong. Open any article and there it was — the right headline, the right text, the right images. Looking at the site the ordinary way told you nothing.',
          'What did show something was Google’s own report. It had started flagging the articles as “soft 404” — pages that answer as though they exist but look empty. That is what sent us to check the site through the crawler’s eyes rather than our own.',
        ],
      },
      {
        heading: 'What Google actually saw',
        body: [
          'Google, visiting exactly the same addresses, saw something else: a green “404 — page not found” screen. It reported them as missing and would not index them.',
          'It was not only new articles. It was all of them, including ones Google had already listed for years. Left alone, articles already in search were liable to drop out at the next crawl: a page that answers like this is how a site tells Google a page is no longer there. Nobody would have seen why.',
        ],
      },
      {
        heading: 'Why only Google',
        body: [
          'The cause was the order in which things happened. The page arrived correct. Then the site’s scripts started, and asked the server for the text of the article — in a single request that fetched all 168 articles at once.',
          'A browser on a decent connection waits for that. Google does not wait for ever: by the time the site’s main program had loaded, it had used up its time on the page. The request never finished, the site concluded the article did not exist, and it replaced the correct page with the error screen.',
          'So the fault only existed after the scripts ran, and only for a visitor that stops waiting early. A person checking the site would never see it.',
          'The flaw itself was old: the line that made “data has not arrived” and “this page does not exist” look identical to the site had been there since February 2023. How long Google had been affected cannot be known — the site’s Search Console history began five days before we found it. The failure also became likelier as the blog grew, because the request got heavier with every article published.',
        ],
      },
      {
        heading: 'Three changes',
        body: [
          {
            list: [
              'The article now arrives inside the page itself, so there is nothing left to fetch.',
              'If anything does still need fetching, the site asks for one article, not all of them.',
              'The “not found” screen now appears only when the server says plainly that an address does not exist — never just because data is late.',
            ],
          },
          'The third change is the one that matters most. Before, “no data yet” and “this page does not exist” looked the same to the site. Now they cannot be confused.',
        ],
      },
      {
        heading: 'How we know it worked',
        body: [
          'We used Google’s own inspection tool, which shows a page the way its crawler sees it. Before the fix it reported a “soft 404”: the page cannot be indexed. After, it reported that the page can be indexed.',
          'Removing that oversized request also helped every visitor, not only Google. It had been made on every page of the site, articles or not — and it now transfers about a tenth of what it did.',
        ],
      },
      {
        heading: 'What to take from it',
        body: [
          'An ordinary check saw a correct page, because by the usual measures it was one. The fault lived in what happened afterwards, and it could only be seen through the robot’s eyes.',
          'Most of the problems that cost a business its search traffic are like this. They are not visible from the office. You find them by looking at the site the way Google does — and by not accepting “it opens fine for me” as the end of the check.',
        ],
      },
    ],
    technical: {
      stack: ['Angular', 'Node.js', 'Koa', 'MySQL', 'Playwright', 'nginx', 'Cloudflare'],
      notes: [
        'An Angular single-page app with its own prerender: every route is captured to static HTML with title, meta, canonical and JSON-LD by a Playwright pass, and the server returns that HTML before the bundle loads. It is a custom build, not Angular Universal.',
        'The failure was in hydration. On boot the client fetched the full posts collection — 168 bodies, 809 KB — to resolve the current article. Googlebot’s render budget was most likely spent on the main bundle, the request did not resolve in time, and the article component treated absent data as not-found and routed to the 404 view. Google classified the result as a soft 404.',
        'Fix: the article payload is serialised into the prerendered HTML, so hydration needs no request; the fallback endpoint returns one post by slug; and the not-found route renders only on an explicit 404 from the API, never on missing or pending data. Verified with a URL Inspection live test.',
        'The same collection request ran on every route, so removing it cut that request from 809 KB to 119 KB, or 272 KB to 26 KB compressed.',
        'The server dependencies date from the project’s early years and were left as they were: the runtime moved to a current Node with no code changes, because the stack is plain JavaScript. A long-lived product is allowed to look like one.',
      ],
    },
    projectSlug: 'autoe',
    url: 'https://autoe.co.uk',
    published: true,
  },
  {
    slug: 'getosh-parking-fine-in-one-place',
    // Owner's instruction 2026-11-04: no figures. A walkthrough, built on the
    // positioning he insists on — the product is that nothing about a case
    // gets lost, not that it writes better letters. Engineering claims checked
    // against getosh-wise-worker main (run_id, per-task log archive and
    // replay) and getosh-backend (TE7/TE9 forms, WhatsApp and Telegram
    // intake). Council FOI statistics are not GetOSH results and are not
    // used. Models and prompts are not named.
    title: 'A parking-fine dispute kept in one place, from photo to appeal',
    client: 'GetOSH',
    industry: 'Consumer legal services',
    location: 'United Kingdom',
    period: '2020 — ongoing',
    status: 'live',
    checked: '2026-11-04',
    lede:
      'Challenging a parking fine is rarely hard because of the letter. It is hard because the papers end up in five places and a deadline passes while nobody is looking.',
    summary: {
      challenge:
        'UK drivers receive fines from councils, private car-park operators and debt collectors, each with its own rules and deadlines — and the paperwork scatters across a phone, a post box and an inbox.',
      solution:
        'A service where the driver sends a photo of the fine through WhatsApp, Telegram or the web, and everything about that case — the reading of it, the appeal, every reply — is kept together.',
      outcome:
        'One record per fine that does not lose a page or a date, with a draft appeal prepared for the driver to check and send.',
    },
    story: [
      {
        heading: 'Why a fine is harder to fight than it looks',
        body: [
          'A council penalty notice, a private parking “charge” and a debt collector’s letter can look much the same on paper. They are challenged in completely different ways, through different bodies, against different deadlines.',
          'Miss a deadline and the early-payment discount is gone, and the amount can grow. Later stages need formal paperwork and the right grounds, set out the right way. Most people meet this system once or twice in their lives and have never seen it before.',
          'And the papers do not stay together. The photo of the ticket is on a phone, the reminder went to an old address, the council’s reply arrived by email. By the time a case escalates, the person can no longer put the whole picture back together.',
        ],
      },
      {
        heading: 'What the driver does',
        body: [
          'They take a photo of the fine and send it — by WhatsApp, by Telegram, or through the website. Whatever they use, it goes into the same process. A blurred photo taken at an angle in a car park is the normal case, not the exception.',
        ],
      },
      {
        heading: 'What happens next',
        body: [
          {
            list: [
              'The document is read in two separate steps. First the details are taken out: the reference, the date, the amount, the vehicle, the address. Then, as its own question, the system works out who issued it — a council or a private operator — because that decides which rules apply.',
              'The case is worked through: what stage it is at, what grounds there are, what has to happen by when.',
              'A draft appeal is prepared, including the official forms where the process requires them, filled in.',
              'Every later letter, attachment and reply is added to the same case, so the full history is always in one place.',
            ],
          },
        ],
      },
      {
        heading: 'The point is that nothing gets lost',
        body: [
          'Plenty of websites explain how to appeal a fine. That is not what this is. The value is that a case is kept whole: every document, every date, every reply, in one record that does not depend on anyone’s memory or inbox.',
          'A dispute escalates when something slips — a letter not read, a deadline not noticed. Keeping the case in one place is what stops it slipping.',
        ],
      },
      {
        heading: 'What it deliberately does not do',
        body: [
          {
            list: [
              'It does not promise to win, and it does not advertise a success rate. Whether an appeal succeeds depends on the case.',
              'It does not send anything on its own. The system prepares the appeal; the driver reads it and decides.',
              'It explains the appeal process, but it does not give personal legal advice beyond that.',
            ],
          },
          'These limits are part of the product, not small print. A service that promises outcomes it cannot control is one people stop trusting quickly.',
        ],
      },
    ],
    technical: {
      stack: ['Node.js', 'Koa', 'MySQL', 'Sequelize', 'Large language models', 'pdf-lib', 'Gmail API', 'S3'],
      notes: [
        'Intake from three channels — WhatsApp, Telegram and the web app — feeds a single pipeline, so recognition and case logic exist once.',
        'Document understanding is split into two passes: field extraction, then issuer classification as a separate step. On noisy, real-world input — photos in a wide range of council and operator formats — separating the two improves accuracy over asking one model call to do both.',
        'The analysis runs in a separate background worker, not in the request the user is waiting on. Workers take tasks from a queue and each claim carries a run identifier, so the same task is never processed twice when more than one worker is running.',
        'For every task the worker archives the full run, including the requests to the model and its responses. Any unexpected result can be reopened and replayed later exactly as the system saw it — which is how you explain an AI decision after the fact rather than guessing at it.',
        'Statutory forms are generated as filled PDFs. Correspondence arriving by email is imported into the case it belongs to.',
      ],
    },
    projectSlug: 'getosh',
    url: 'https://getosh.today',
    published: true,
  },
  {
    slug: 'le-company-bitrix24-rebuilt-in-house',
    // Owner's decisions 2026-11-04: publish now, name the brand, present the
    // move as made. What is true and stated: the Bitrix24 functions the team
    // uses were rebuilt inside the company's own system and deployed with no
    // downtime. What the code contradicts and is NOT stated: that Bitrix24
    // is switched off, no longer paid for, or that the team works entirely
    // outside it — it is still the system of record, written to on every
    // change. The call-centre form is built but not yet in use, so it is not
    // described as having replaced anything. Parts-shop features are
    // described as built, not as trading results: it has taken no orders.
    // Company description from its own site, www.lecompany.co.uk (engineering
    // repair and installation, London; commercial kitchen and coffee
    // equipment). The platform itself handles coffee-machine rental, sales and
    // service. Sources: lecompany-app docs/bitrix-board.md, ffb-form.md,
    // visits-page.md and git log; lecompany-parts session notes.
    title: 'Le Company rebuilt its Bitrix24 workflows in-house',
    client: 'Le Company',
    industry: 'Commercial equipment repair',
    location: 'London, UK',
    period: 'September 2024 — ongoing',
    status: 'live',
    checked: '2026-11-04',
    lede:
      'A London engineering firm was running every job through two systems at once. We rebuilt the parts of Bitrix24 its team actually uses inside its own platform, while the business kept running.',
    summary: {
      challenge:
        'Orders and customer accounts lived in the company’s own platform, while the sales pipeline, engineer visits and invoices lived in Bitrix24. Two screens for the same work, held together by a sync.',
      solution:
        'The deal board, deal records, engineer visits and invoicing rebuilt inside the company’s own system, moved across with the two systems running side by side so nothing stopped.',
      outcome:
        'The team’s daily tools rebuilt around how it works, introduced while the business kept running — with Bitrix24 kept in sync behind them until it is retired.',
    },
    stats: [
      {
        value: '4,434',
        label: 'open deals in the coffee-machine pipeline, re-read from Bitrix24 in one full sync',
        source: 'engineering notes, test run on a development copy, October 2026',
      },
    ],
    story: [
      {
        heading: 'Two systems for the same job',
        body: [
          'Le Company is a London engineering firm that repairs and installs commercial kitchen equipment and coffee machines. Since 2024 its coffee-machine rental, sales and service work has run on its own platform: customer orders, customer accounts, card payments and email.',
          'Alongside it ran Bitrix24, a widely used off-the-shelf business system. That is where the sales pipeline lived, along with engineer visits, invoices, the comment history on every job and the web forms new enquiries came in through.',
          'The two were kept in step in both directions. In practice that meant the same information in two places, two screens to check, and a link between them that had to work around Bitrix24’s own limits — on how fast it can be asked for data, and in one case on an update that quietly removed files already attached to a job.',
        ],
      },
      {
        heading: 'What we rebuilt',
        body: [
          'Not all of Bitrix24 — only the parts the team actually uses, shaped around how they already worked:',
          {
            list: [
              'A board of jobs the team drags from stage to stage, with the same filters they were used to.',
              'The job record itself: the details, the booked engineer visit, comments, files and the full history.',
              'Invoices and estimates, produced as PDF documents.',
              'A page for engineers that works on a phone, where they finish a visit on site — built to replace a separate add-on the company had been using from Bitrix24’s marketplace.',
              'A form for the call centre to log new jobs, and a shared to-do list for the office.',
            ],
          },
        ],
      },
      {
        heading: 'Moving without stopping',
        body: [
          'What a business fears most about changing systems is the switch itself: the weekend when nothing works, the records that do not come across. We did not do it with a single switch.',
          'Bitrix24’s records are copied into the company’s own database. Each change made in the new system is written to Bitrix24 at the same moment, then read back to confirm it arrived. If Bitrix24 refuses it, the change is undone and the person sees exactly what went wrong — so a change made in the new system cannot be saved in one place and lost in the other.',
          'That is what lets the new screens be taken up one at a time while the business carries on. Nobody has to be moved or re-invited, because the user accounts were always the company’s own.',
          'Bitrix24 stays in the loop for now. Each new screen was built so that its Bitrix24 calls can be dropped later; switching Bitrix24 off will still mean replacing the automations that run inside it.',
        ],
      },
      {
        heading: 'The small things that decide whether a system gets used',
        body: [
          {
            list: [
              'Email with each customer is brought into one conversation on their record, instead of sitting in someone’s inbox.',
              'Inside each customer conversation, staff can ask an AI assistant to help draft the reply; nothing is sent to the customer without them.',
            ],
          },
        ],
      },
      {
        heading: 'The same care in the parts shop',
        body: [
          'The group’s new shop for electronic control boards and their repair, in six languages, is built with the same attention to the moment where a customer could get confused.',
          'Some boards are sold on condition that the old one comes back. The buyer pays a deposit on top of the price and gets it back when the old board arrives. The deposit is charged as its own line, so returning it is one action for one amount. And it is named with the word each market already uses for this kind of deposit: a German buyer reads “Pfand” and understands at once, where a literal “deposit” would read like a down payment.',
          'For repairs, the customer is given a reference before they post the board, to write on the box — a box of anonymous electronics can otherwise be matched to nobody. The reference leaves out characters a courier could misread when copying it by hand: no O and 0, no I and 1.',
        ],
      },
    ],
    technical: {
      stack: ['Angular', 'Node.js', 'Koa', 'MySQL', 'Sequelize', 'Bitrix24 REST', 'Stripe', 'Gmail API', 'OpenAI'],
      notes: [
        'Server on Koa with Sequelize over MySQL, client in Angular. Bitrix24 stages, deals, invoices, comments and files are mirrored into MySQL; a full re-import of the larger pipeline, about 4,400 open deals, took under two minutes in a test run.',
        'Writes go through to Bitrix24: the local change is sent over REST, the affected records are re-imported, and on any error the local row is restored and the error surfaced to the user. Bitrix24 stays the system of record during the transition, which is what makes the new screens safe to adopt piecemeal.',
        'Bitrix24’s REST API allows roughly two requests a second, so calls are queued with retry and back-off. One legacy deal-update method drops existing file attachments; updates use a path that preserves them.',
        'Releases swap the running version atomically and keep the previous one for rollback; the database is backed up nightly with rotation.',
        'The parts shop is a separate build: server-rendered Next.js for indexability across six languages, Fastify, Prisma over MySQL and Stripe Checkout. The core-exchange deposit is a distinct line item, so a refund is a single call.',
      ],
    },
    url: 'https://www.lecompany.co.uk',
    published: true,
  },
  {
    slug: 'argo-aero-measuring-the-funnel',
    // Owner said "decide yourself" between the measurement story and AI
    // visibility (2026-11-04); this one, because our own site is still behind
    // the same Cloudflare block the other story is about. Figures from the
    // argoaero session's queries of 2026-11-04: search_console_day and
    // search_console_row (13 Aug – 3 Nov 2026), site_event (funnel 26 Oct –
    // 4 Nov, the first day form_reached existed; one-page share 1 Oct – 4 Nov).
    // Percentages recomputed here from the absolute counts. The owner has NOT
    // decided to stop: the decision waits on a re-check set for 17 Nov 2026.
    // Update this study after that date.
    title: 'The page that took 46% of Argo Aero’s clicks, and no enquiries',
    client: 'Argo Aero',
    industry: 'Aviation — gyroplane and helicopter sales',
    location: 'London, UK',
    period: 'August — November 2026',
    status: 'in-progress',
    checked: '2026-11-04',
    lede:
      'One page started drawing almost half of all the clicks Google sent to the site. Counting what those visitors did next showed it had not brought a single enquiry — and why that mattered before spending more.',
    summary: {
      challenge:
        'A page written for a new language market became the most visited page on the site. It looked like the best result the site had ever had.',
      solution:
        'We measured every step between arriving and sending an enquiry, found that nobody on those pages ever touched the form, traced a likely cause and fixed it the same day.',
      outcome:
        'No money spent chasing traffic that was not converting, and a date set to test our own fix rather than trust it.',
    },
    stats: [
      {
        value: '46%',
        label: 'of the site’s search clicks went to one Romanian page — 907 of 1,958',
        source: 'Google Search Console, site totals and per-page rows, 13 August – 3 November 2026',
      },
      {
        value: '0 of 128',
        label: 'visitors who reached the enquiry form on the Romanian pages started filling it in',
        source: 'the site’s own event tracking, 26 October – 4 November 2026',
      },
      {
        value: '4 of 18',
        label: 'visits to the English contact page that ended in an enquiry, over the same days',
        source: 'the site’s own event tracking, 26 October – 4 November 2026',
      },
    ],
    story: [
      {
        heading: 'A win nobody planned for',
        body: [
          'Argo Aero sells two kinds of light aircraft from the UK: ARGON gyroplanes and ARGO helicopters. In mid-September we published nine pages in Georgian and Romanian, aimed at buyers in Georgia and Moldova. The readers turned out to be somewhere else: Romania.',
          'Within weeks one Romanian page was drawing almost half of all the clicks Google sent to the site: 907 out of the 1,958 clicks the site had between mid-August and early November — and the page had only existed since 15 September. The phrase bringing them was “elicopter de vanzare” — Romanian for “helicopter for sale” — where the page sat on average around third or fourth in the results. Over the same period three Romanian pages brought 914 clicks and the site’s ninety-five English pages brought 189.',
          'On a traffic report, that is the best thing that had happened to the site.',
        ],
      },
      {
        heading: 'Visitors are not enquiries',
        body: [
          'Before calling it a success, we looked at what those visitors actually did, one step at a time. Over ten days at the end of October:',
          {
            list: [
              '396 visits to the Romanian pages.',
              '128 of them scrolled far enough to see the enquiry form — one in three.',
              'None started filling it in. None sent it.',
            ],
          },
          'In the same ten days the English contact page had 18 visits, 17 reached the form, and 4 people sent an enquiry. Every enquiry form the site received from October to early November was sent from that one page.',
          'So the problem was not that people never got as far as the form. A third of them did. Nobody touched it. Of the 1,046 visitors who saw only Romanian pages, 97 in every 100 looked at one page and left — against 71 in 100 among the site’s other visitors. Of the 1,077 who landed on a Romanian page at all, 31 went on to the rest of the site.',
        ],
      },
      {
        heading: 'Checking that we measured what we thought',
        body: [
          'One thing had to be put right first, and it is ours. Until 26 October, the step our reports called “saw the form” was in fact recorded the moment the page loaded — whether or not the form ever came into view. For three weeks a number on the report meant something other than its label.',
          'We found it while looking for the step where Romanian visitors dropped away, and replaced it with one that only counts when the form actually appears on the screen. That is why the figures above start on 26 October: before that, there is nothing honest to compare.',
        ],
      },
      {
        heading: 'A likely reason, fixed the same day',
        body: [
          'On 3 November we found that the Romanian page was sitting inside the English site. The menu, the footer and the buttons on the first screen were all in English, and the page told search engines the business serves the United Kingdom. A Romanian reader arrived on a page that was mostly not talking to them.',
          'It was corrected the same day, across all four language sections of the site.',
          'A second cause may still be at work, and we have not identified one. That is the reason the check has a date on it rather than a conclusion.',
        ],
      },
      {
        heading: 'Not spending money on a guess',
        body: [
          'The owner asked what more work on Romanian search would bring. On the evidence, the honest answer was: more clicks, and so far no enquiries.',
          'So the decision on further spending waits until the fix can be measured. The check is set for 17 November 2026. If by then the share of Romanian visitors who read one page and leave has not moved, the money goes elsewhere.',
          'What that check will show is not known as this is written. This page will be updated with the answer.',
        ],
      },
      {
        heading: 'What to take from it',
        body: [
          'The headline number looked like the best result the site had ever had. Counting each step separately is what showed it was not — and it is what made it possible to set a date to test a fix, instead of believing in it.',
        ],
      },
    ],
    technical: {
      stack: ['Next.js', 'Node.js', 'PostgreSQL', 'Search Console API', 'IntersectionObserver'],
      notes: [
        'Search Console data is pulled into the site’s own database every day, as daily totals and per-page, per-query and per-country rows. Two traps worth knowing: Google suppresses low-volume rows, so per-country clicks sum to well under the site total (here 1,114 against 1,958) and any share must be taken against the daily totals; and average position must be weighted by impressions — a plain mean of daily rows put this query at 5.3 when it was 3.6.',
        {
          list: [
            'form_view — the form component mounted, which means only that the page loaded.',
            'form_reached — the form intersects the viewport (IntersectionObserver, threshold 0.01), recorded once per session, then the observer disconnects.',
            'form_start — the first input in any field, once.',
            'form_submit — the server confirmed it received the enquiry.',
          ],
        },
        'Event names live in one module shared by the page script, the endpoint that receives them and the CRM report that reads them, so a name cannot be spelled two ways and quietly split the data.',
        'The localisation fix covered the shared header, footer and first-screen calls to action in every language section, FAQ structured data, and the areaServed value in the Organization markup, which had said United Kingdom on every locale.',
      ],
    },
    projectSlug: 'argo-aero',
    url: 'https://argoaero.co.uk',
    published: false,
  },
]

export function publishedStudies(): CaseStudy[] {
  return caseStudies.filter(s => s.published)
}

export function findStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find(s => s.slug === slug)
}
