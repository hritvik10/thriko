/**
 * Copy for the legal pages (currently the Privacy Policy).
 *
 * The policy describes exactly what the site does today: the enquiry form in
 * `features/enquiry/`, the spreadsheet columns in `backend/app/services/excel_store.py`
 * and the in-memory rate limiter. If any of those change, update the matching
 * section here, because a privacy notice that does not match the code is worse
 * than none at all.
 *
 * `{contactEmail}` in any text is replaced with a mailto link at render time.
 */

export type LegalBlock =
  | { type: 'text'; text: string }
  | { type: 'list'; items: string[] }
  /** Term + explanation pairs, for "what we collect" style breakdowns. */
  | { type: 'defs'; items: { term: string; detail: string }[] };

export interface LegalSection {
  /** Anchor id, also used by the table of contents. */
  id: string;
  heading: string;
  blocks: LegalBlock[];
}

/**
 * Who the policy is written on behalf of.
 *
 * TODO before launch: a privacy notice must name the legal entity that decides
 * how the data is used and give a real postal address. Replace every value below
 * with the registered details once the company is incorporated.
 */
export const legalEntity = {
  /** TODO: registered company name, e.g. "Thriko Technologies Private Limited". */
  name: 'Thriko',
  /** TODO: registered postal address, including city, state and postcode. */
  address: 'Registered address to be confirmed',
  /** TODO: the country the company is registered in. */
  country: 'India',
} as const;

export const privacyPolicy = {
  kicker: 'Legal',
  title: 'Privacy Policy',
  effectiveDate: '31 October 2026',
  lastUpdated: '31 October 2026',
  lead: `This policy explains what personal information ${legalEntity.name} collects through thriko.com, why we collect it, how long we keep it and what you can ask us to do with it.`,
  summary: [
    'The only personal information we ask for is what you type into the quote form.',
    'We use it to reply to your enquiry and prepare a proposal, nothing else.',
    'We set no cookies and run no analytics or advertising trackers.',
    'We never sell, rent or share your details for marketing.',
    'You can ask us to send you a copy of your data, or delete it, at any time.',
  ],
  tocTitle: 'On this page',
  sections: [
    {
      id: 'who-we-are',
      heading: '1. Who we are',
      blocks: [
        {
          type: 'text',
          text: `${legalEntity.name} ("Thriko", "we", "us") builds websites, mobile apps and AI software. We are responsible for the personal information collected through this website, which makes us the data controller for it.`,
        },
        {
          type: 'defs',
          items: [
            { term: 'Company', detail: legalEntity.name },
            { term: 'Registered address', detail: legalEntity.address },
            { term: 'Privacy contact', detail: '{contactEmail}' },
          ],
        },
        {
          type: 'text',
          text: 'This policy covers thriko.com only. When we build or maintain software for a client, we handle data inside that product on the client’s instructions under a separate agreement. Section 12 explains the difference.',
        },
      ],
    },
    {
      id: 'what-we-collect',
      heading: '2. Information we collect',
      blocks: [
        {
          type: 'text',
          text: 'You can read every page of this site without giving us any personal information. We collect information in three situations.',
        },
        {
          type: 'defs',
          items: [
            {
              term: 'When you submit the quote form',
              detail:
                'Your name, email address, the country you are in, the type of project you need, your approximate budget and its currency (or a note that you are not sure yet), your timeline, anything you write in the message box, and whether you ticked interest in the pilot partner programme. We add a submission date, a reference such as TH-4F9A2C and a status so we can track our reply.',
            },
            {
              term: 'When your browser requests a page',
              detail:
                'Our server briefly holds your IP address in memory to count form submissions and block spam (a few submissions per minute). It is discarded within about a minute and is never written to our enquiry records. Our server logs record the reference and project type of a submission, never your name, email address or message.',
            },
            {
              term: 'When you contact us directly',
              detail:
                'If you email us or join a call, we keep that correspondence and any notes we make about your project so that we can advise you properly.',
            },
          ],
        },
        {
          type: 'text',
          text: 'The form also contains a hidden field that real visitors never see. Only automated bots fill it in, and those submissions are discarded rather than stored.',
        },
        {
          type: 'text',
          text: 'We do not ask for sensitive information, such as health, biometric, racial, religious, political or financial account details, and we do not need it to quote for a project. Please do not include that kind of information, or anyone else’s confidential information, in the message box. If you need to share something confidential before we talk, ask us for a mutual non-disclosure agreement first and we will sign one.',
        },
      ],
    },
    {
      id: 'why-we-use-it',
      heading: '3. Why we use your information, and our legal basis',
      blocks: [
        {
          type: 'defs',
          items: [
            {
              term: 'To reply to your enquiry and prepare a proposal',
              detail:
                'Based on the consent you give with the tick box on the form, and on taking steps at your request before entering a contract.',
            },
            {
              term: 'To keep a record of enquiries, proposals and projects',
              detail:
                'Based on our legitimate interest in running the business, knowing what we quoted and to whom, and being able to answer questions about it later.',
            },
            {
              term: 'To keep the form free of spam and abuse',
              detail:
                'Based on our legitimate interest in keeping the website working and our records usable.',
            },
            {
              term: 'To meet accounting, tax and other legal obligations',
              detail: 'Where the law requires us to keep records, we keep them for as long as it requires.',
            },
          ],
        },
        {
          type: 'text',
          text: 'We do not use your details for newsletters or marketing campaigns, we do not build profiles about you, and we make no decisions about you by purely automated means. We do not sell or rent personal information to anyone, and we do not share it for anyone else’s marketing.',
        },
      ],
    },
    {
      id: 'cookies',
      heading: '4. Cookies, analytics and tracking',
      blocks: [
        {
          type: 'text',
          text: 'This website sets no cookies. We run no analytics, advertising, tracking pixels, session recording or social media trackers, which is why you see no cookie banner.',
        },
        {
          type: 'text',
          text: 'One third party is involved in displaying the site: our typefaces are served by Google Fonts, so your browser requests those font files from Google’s servers and Google receives your IP address and browser details as part of that request. No cookie is set and no information about you is sent to us through it.',
        },
        {
          type: 'text',
          text: 'Your browser may store small amounts of information on your own device to remember what you have typed into the form. That stays on your device and is never sent to us unless you submit the form.',
        },
      ],
    },
    {
      id: 'who-can-see-it',
      heading: '5. Where your information is stored and who can see it',
      blocks: [
        {
          type: 'text',
          text: 'Enquiries are saved to an access-controlled file on our own server, backed up regularly. Inside Thriko, only the people who need it to reply to you and scope your project can open it, and everyone with access is bound by confidentiality obligations.',
        },
        {
          type: 'text',
          text: 'We use a small number of service providers to run the site and our business. They process information only on our instructions and under contracts that require them to keep it confidential and secure.',
        },
        {
          type: 'list',
          items: [
            'Website hosting and content delivery (Cloudflare)',
            'Hosting for the server that receives form submissions',
            'Our business email provider, which carries our correspondence with you',
            'Google Fonts, as described in section 4',
            'Our accountants and, if we ever need advice on a dispute, our lawyers',
          ],
        },
        {
          type: 'text',
          text: 'We may also disclose information where the law requires it, or where we need to establish or defend legal claims. If our business is ever reorganised or acquired, your information may transfer to the new owner, who would remain bound by this policy.',
        },
        {
          type: 'text',
          text: 'Our website and enquiry form do not send your details to any AI model provider. We do not put your name, email address or message into AI tools in order to answer your enquiry.',
        },
      ],
    },
    {
      id: 'international',
      heading: '6. International transfers',
      blocks: [
        {
          type: 'text',
          text: `We work with clients across the world, and our team and servers are based in ${legalEntity.country}. If you are in the United Kingdom, the European Economic Area or another region with data transfer rules, your information will be transferred outside that region when you contact us.`,
        },
        {
          type: 'text',
          text: 'Where that transfer needs a safeguard, we rely on the standard contractual clauses approved for the purpose, or on your explicit consent given when you submit the form. You can ask us for details of the safeguard that applies to you.',
        },
      ],
    },
    {
      id: 'how-long',
      heading: '7. How long we keep it',
      blocks: [
        {
          type: 'defs',
          items: [
            {
              term: 'Enquiries that do not become projects',
              detail:
                'Up to 24 months after our last contact with you, so that we can pick the conversation up again if you come back to us. After that we delete the record.',
            },
            {
              term: 'Clients',
              detail:
                'For as long as we work together, and then for as long as tax and company law requires us to keep the contract and accounting records, which is typically up to seven years.',
            },
            {
              term: 'Spam submissions',
              detail: 'Discarded immediately and never stored.',
            },
            {
              term: 'Technical data used for rate limiting',
              detail: 'Held in memory for about a minute and then discarded.',
            },
          ],
        },
        {
          type: 'text',
          text: 'If you ask us to delete your information sooner, we will, unless we are required to keep a specific record by law.',
        },
      ],
    },
    {
      id: 'your-rights',
      heading: '8. Your rights',
      blocks: [
        {
          type: 'text',
          text: 'Depending on where you live, you have some or all of the following rights over the information we hold about you. We honour these requests for everyone who contacts us, wherever you are.',
        },
        {
          type: 'list',
          items: [
            'Ask for a copy of the information we hold about you',
            'Ask us to correct anything inaccurate or incomplete',
            'Ask us to delete it',
            'Ask us to stop or limit how we use it',
            'Object to us using it on the basis of our legitimate interests',
            'Ask for it in a portable, machine-readable format',
            'Withdraw the consent you gave on the form, at any time, without affecting anything we did before you withdrew it',
          ],
        },
        {
          type: 'text',
          text: 'Email {contactEmail} with your request and the reference from your enquiry, if you have it. We will reply within 30 days. We may ask a question or two to confirm that the request really comes from you, and we will not charge you or treat you differently for asking.',
        },
        {
          type: 'text',
          text: 'If you are not happy with how we have handled your information, please tell us first and we will try to put it right. You can also complain to your data protection regulator: in the United Kingdom that is the Information Commissioner’s Office, and in the European Economic Area it is the supervisory authority for the country you live in.',
        },
      ],
    },
    {
      id: 'security',
      heading: '9. How we protect your information',
      blocks: [
        {
          type: 'list',
          items: [
            'The whole site and the form are served over an encrypted HTTPS connection',
            'Every field is checked against a strict list of allowed values and lengths before it is stored',
            'Submissions are rate limited per IP address to block automated abuse',
            'Form input is stored as plain text, so nothing typed into it can run as a formula or a command',
            'Our server logs deliberately exclude names, email addresses and messages',
            'Access to enquiry records is limited to the people who need it, over authenticated accounts',
          ],
        },
        {
          type: 'text',
          text: 'No system is perfectly secure. If a breach ever affects your information, we will tell you and the relevant regulator where the law requires it, and explain what happened and what we are doing about it.',
        },
      ],
    },
    {
      id: 'children',
      heading: '10. Children',
      blocks: [
        {
          type: 'text',
          text: 'This site sells professional services to businesses and is not directed at children. We do not knowingly collect information from anyone under 16. If you believe a child has sent us their details, email {contactEmail} and we will delete them.',
        },
      ],
    },
    {
      id: 'other-sites',
      heading: '11. Links to other sites',
      blocks: [
        {
          type: 'text',
          text: 'Our site links to a small number of other places, such as our social media profiles. Those sites have their own privacy policies and we are not responsible for how they handle your information.',
        },
      ],
    },
    {
      id: 'client-projects',
      heading: '12. Information inside our clients’ products',
      blocks: [
        {
          type: 'text',
          text: 'When we design, build or maintain software for a client, we sometimes handle personal information belonging to that client’s own users. In that situation the client decides how the information is used and we act only on their written instructions, as their processor.',
        },
        {
          type: 'text',
          text: 'That work is governed by the agreement and data processing terms we sign with each client, which set out the security measures, the approved sub-processors, how long we keep anything and what happens at the end of the project. This policy does not cover it. If you are a user of a product we built and have a question about your data, please contact the company that operates the product.',
        },
      ],
    },
    {
      id: 'changes',
      heading: '13. Changes to this policy',
      blocks: [
        {
          type: 'text',
          text: 'We will update this page when what we do with personal information changes. The date at the top always shows the current version. If a change materially affects how we use information you have already given us, we will contact you about it rather than relying on you noticing the update.',
        },
      ],
    },
    {
      id: 'contact',
      heading: '14. How to contact us',
      blocks: [
        {
          type: 'text',
          text: 'For anything in this policy, including requests about your own information, email {contactEmail} and we will reply within one business day.',
        },
        {
          type: 'defs',
          items: [
            { term: 'Email', detail: '{contactEmail}' },
            { term: 'Post', detail: `${legalEntity.name}, ${legalEntity.address}` },
          ],
        },
      ],
    },
  ] satisfies LegalSection[],
};
