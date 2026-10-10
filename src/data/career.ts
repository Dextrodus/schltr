// Career page on the tech side, from Konrad's CV.
// Street address, phone number and date of birth stay out: this is a public page.

export interface Entry {
  title: string;
  where?: string;
  when: string;
  points?: string[];
}

export const work: Entry[] = [
  {
    title: 'Research, scientific analysis and paper',
    where: 'Department of Nephrology, TUM',
    when: 'Apr 2026 – Sep 2026',
    points: [
      'Analysed the results of using LLMs to expand a nutritional database for patients with chronic kidney disease.',
      'Wrote and submitted the paper as first author.',
      'Gave a talk and presented a poster at the XXI International Congress on Renal Nutrition and Metabolism in Berlin; the poster won an award.',
    ],
  },
  {
    title: 'Working student, software development',
    where: 'Carealytix Digital Health, Valley',
    when: 'Mar 2025 – Apr 2026',
    points: [
      'Built apps for dialysis patients and clinic staff across Germany in an agile team of six.',
      'React, React Native, TypeScript and NestJS under ISO 13485 and ISO 27001.',
      'Worked with medical, product and design teams on user needs and interfaces.',
      'CI/CD, code review, clean code, and agentic coding with Cursor and Claude Code.',
    ],
  },
  {
    title: 'Research assistant, AI and medical informatics',
    where: 'Carealytix Digital Health and TUM',
    when: 'Mar 2025 – Apr 2026',
    points: [
      'Used LLMs to expand a nutritional database for patients with chronic kidney disease, with nephrology and nutrition specialists at TUM.',
      'Did the requirements analysis, system design, implementation and statistical validation myself.',
      'Built an agentic Python pipeline with a tool-calling LLM and an MCP server, integrated into the production NestJS and React systems.',
    ],
  },
  {
    title: 'Maths teacher, catch-up courses',
    where: 'Walter-Klingenbeck-Realschule, Taufkirchen',
    when: 'Nov 2021 – Aug 2024',
    points: ['Taught post-pandemic catch-up maths to groups of about ten students across all grades.'],
  },
  {
    title: 'Ski instructor',
    where: 'Kinderskischule Held, Munich',
    when: 'Feb 2020 – Feb 2024',
    points: ['Taught children to ski. Level 1 ski instructor since 2021.'],
  },
  {
    title: 'IT teacher, substitute',
    where: 'Walter-Klingenbeck-Realschule, Taufkirchen',
    when: 'Oct 2023 – Dec 2023',
    points: ['Took over a ninth-grade IT class during sick leave and taught "Modelling and Coding of Algorithms", final exam included.'],
  },
  {
    title: 'IT security intern',
    where: 'Corporate Trust, Munich',
    when: 'Feb 2019',
    points: ['Set up two-factor authentication on a Raspberry Pi with FreeRADIUS and Google Authenticator.'],
  },
];

export const education: Entry[] = [
  {
    title: 'B.Sc. Computer Science',
    where: 'Technical University of Munich',
    when: 'Oct 2021 – Mar 2026',
    points: ['Application subject: medicine.', 'Thesis: data augmentation for brain–computer interfaces.'],
  },
  {
    title: 'Engineering Sciences',
    where: 'Technical University of Munich',
    when: 'Oct 2020 – Sep 2021',
    points: ['Switched to computer science.'],
  },
  {
    title: 'Abitur',
    where: 'Asam-Gymnasium München',
    when: '2012 – 2020',
  },
];

export const skills: [string, string][] = [
  ['proficient', 'Python, React, TypeScript, Java, VS Code, Git, agentic coding'],
  ['basic', 'Docker, SQL, NestJS, React Native, C, Rust, OCaml'],
];

export const languages: [string, string][] = [
  ['german', 'native'],
  ['english', 'C1'],
  ['french', 'B1'],
];

export const volunteering: Entry[] = [
  { title: 'School first-aid service', when: '2015 – 2020' },
  {
    title: 'Lifeguard and swimming instructor',
    where: 'German Life Saving Association (DLRG)',
    when: '2014 – 2019',
  },
];
