import { useState } from 'react';
import type { TechPage } from '../lib/route';
import { GITHUB, LINKEDIN, ViewLink, type Go } from './bits';
import { education, languages, skills, volunteering, work, type Entry } from '../data/career';

interface Props {
  /** null while the tech side is not open: shows the start screen. */
  page: TechPage | null;
  /** The content hides while the photo side is leaned; the menu only dims. */
  leanedAway: boolean;
  /** Out of reach for keyboard and screen readers: the side is collapsed, or a dialog is open. */
  inert: boolean;
  go: Go;
}

// bottom-up listing: the first entry sits right under `ls`
const listing: TechPage[] = ['contact', 'what-i-use', 'hobbies', 'career', 'introduction', 'start'];

export default function TechSide({ page, leanedAway, inert, go }: Props) {
  const [hovered, setHovered] = useState<TechPage | null>(null);
  const active = page ?? 'start';
  const off = () => setHovered(null);

  return (
    <section className="tech" aria-label="Tech" inert={inert}>
      <div className={`tech-content slide ${page ? 'is-open' : ''}`} style={{ opacity: leanedAway ? 0 : 1 }}>
        {(page === null || page === 'start') && <Home />}
        {page === 'introduction' && <Introduction />}
        {page === 'what-i-use' && <Uses />}
        {page === 'contact' && <Contact />}
        {page === 'career' && <Career />}
        {page === 'hobbies' && <NotWritten page={page} />}
      </div>

      <nav className="tech-nav slide" aria-label="Tech" style={{ opacity: leanedAway ? 0.8 : 1 }}>
        <span className="dim">~ $ ls</span>
        {listing.map((p) => (
          <ViewLink
            key={p}
            to={{ side: 'tech', page: p }}
            go={go}
            className={`te-h ${active === p ? 'is-current' : ''}`}
            onMouseEnter={() => setHovered(p)}
            onFocus={() => setHovered(p)}
            onMouseLeave={off}
            onBlur={off}
          >
            {p}/
          </ViewLink>
        ))}
        <span aria-hidden="true">
          <span className="dim">~ $</span> cd {hovered ?? active}
          <span className="cursor" />
        </span>
      </nav>
    </section>
  );
}

const Prompt = ({ children }: { children: string }) => (
  <div>
    <span className="dim">~ $</span> {children}
  </div>
);

function Home() {
  return (
    <div className="tech-page tech-home">
      <div>
        <Prompt>whoami</Prompt>
        <div>konrad — software developer</div>
      </div>
      <div>
        <Prompt>cat background.txt</Prompt>
        <div>computer science @ TUM, applied subject: medicine</div>
        <div>llm pipeline for kidney nutrition data · poster award</div>
      </div>
      <div>
        <Prompt>cat status.txt</Prompt>
        <div>looking for a developer role, ideally in digital health</div>
      </div>
    </div>
  );
}

function Introduction() {
  return (
    <article className="tech-page is-long">
      <div className="dim">~ $ cat introduction.md</div>
      <h1># introduction</h1>
      <p>Hi, I'm Konrad.</p>
      <p>
        I feel at home where computer science meets medicine. I studied Computer Science at TUM with medicine as my application subject, and now I
        want to build software that makes a real difference.
      </p>
      <p>
        As a working student at Carealytix, I learned how to build software that reaches real patients quickly without cutting corners on quality,
        accessibility or regulatory compliance (ISO 13485 / ISO 27001). At the same time, I worked as a research assistant with nephrologists and
        nutrition specialists at TUM. I designed, built and validated an LLM-based pipeline that expands a nutritional database for patients with
        chronic kidney disease. I presented the results at the XXI International Congress on Renal Nutrition and Metabolism, where I won a poster
        award, and I'm first author of the paper, which is currently under review.
      </p>
      <p>
        What matters to me is software that's good for the planet, for people and for society. Sometimes that means medicine. I started as a school
        first-aider and kept going through my studies and at Carealytix. Sometimes it means passing on knowledge: first teaching beginner swimming
        courses with the DLRG, later teaching IT and maths at a secondary school. It could just as well mean reducing inequality or pushing the
        energy transition forward. As long as my work makes the world a little better, step by step, I'm motivated.
      </p>
      <p>I'm looking for a position as a software developer, ideally in digital health.</p>
      <p className="dim">When I'm not writing code, I'm probably behind a camera. That's the other half of this site.</p>
    </article>
  );
}

function Uses() {
  return (
    <article className="tech-page tech-uses is-long">
      <div className="dim">~ $ cat what-i-use.md</div>
      <h1># what i use</h1>
      <section>
        <h2>## desk</h2>
        <dl className="kv">
          <dt>editor</dt>
          <dd>Zed / VS Code</dd>
          <dt>agents</dt>
          <dd>Claude Code / Codex</dd>
          <dt>daily</dt>
          <dd>React, Python, Marimo notebooks, Java, LaTeX</dd>
          <dt>this site</dt>
          <dd>Astro</dd>
          <dt>os</dt>
          <dd>
            Fedora with GNOME <span className="dim"># probably changed by the time you read this</span>
          </dd>
          <dt>cad</dt>
          <dd>Onshape</dd>
          <dt>printer</dt>
          <dd>Anycubic Kobra S1</dd>
        </dl>
        <div className="printer">
          <Prompt>kobra status</Prompt>
          <div className="dim">printing: something I don't need</div>
          <div>
            [<span className="printer__done">###########</span>
            <span className="printer__todo">...................</span>] 37%
          </div>
        </div>
      </section>
    </article>
  );
}

const Entries = ({ entries }: { entries: Entry[] }) => (
  <ul className="entries">
    {entries.map((e) => (
      <li key={e.title}>
        <div>{e.title}</div>
        <div className="dim">{[e.where, e.when].filter(Boolean).join(' · ')}</div>
        {e.points && (
          <ul className="points">
            {e.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}
      </li>
    ))}
  </ul>
);

const Pairs = ({ pairs }: { pairs: [string, string][] }) => (
  <dl className="kv">
    {pairs.map(([k, v]) => [<dt key={`${k}-k`}>{k}</dt>, <dd key={`${k}-v`}>{v}</dd>])}
  </dl>
);

function Career() {
  return (
    <article className="tech-page tech-uses is-long">
      <div className="dim">~ $ cat career.md</div>
      <h1># career</h1>
      <section>
        <h2>## work</h2>
        <Entries entries={work} />
      </section>
      <section>
        <h2>## education</h2>
        <Entries entries={education} />
      </section>
      <section>
        <h2>## skills</h2>
        <Pairs pairs={skills} />
      </section>
      <section>
        <h2>## languages</h2>
        <Pairs pairs={languages} />
      </section>
      <section>
        <h2>## volunteering</h2>
        <Entries entries={volunteering} />
      </section>
      <section>
        <h2>## elsewhere</h2>
        <dl className="kv">
          <dt>github</dt>
          <dd>
            <a href="https://github.com/dextrodus" className="tech-link te-h">
              dextrodus
            </a>
          </dd>
          <dt>linkedin</dt>
          <dd>
            <a href="https://www.linkedin.com/in/schltr/" className="tech-link te-h">
              schltr
            </a>
          </dd>
          <dt>mail</dt>
          <dd>
            <a href="mailto:k@schltr.com" className="tech-link te-h">
              k@schltr.com
            </a>
          </dd>
        </dl>
      </section>
    </article>
  );
}

function Contact() {
  return (
    <article className="tech-page">
      <div className="dim">~ $ cat contact.md</div>
      <h1># contact</h1>
      <dl className="kv">
        <dt>name</dt>
        <dd>Konrad Schlüter</dd>
        <dt>mail</dt>
        <dd>
          <a href="mailto:k@schltr.com" className="tech-link te-h">
            k@schltr.com
          </a>
        </dd>
        <dt>complaints</dt>
        <dd>
          <a href="mailto:spam@schltr.com" className="tech-link te-h">
            spam@schltr.com
          </a>{' '}
          <span className="dim"># for appropriate disposal</span>
        </dd>
        <dt>github</dt>
        <dd>
          <a href={GITHUB} className="tech-link te-h" rel="me">
            github.com/dextrodus
          </a>{' '}
          <span className="dim"># Copilot hurt itself in its confusion!</span>
        </dd>
        <dt>linkedin</dt>
        <dd>
          <a href={LINKEDIN} className="tech-link te-h" rel="me">
            linkedin.com/in/schltr
          </a>{' '}
          <span className="dim"># Loading Buzzwords...</span>
        </dd>
      </dl>
      <p className="dim">Your message will be read by a human. Eventually.</p>
    </article>
  );
}

function NotWritten({ page }: { page: TechPage }) {
  return (
    <article className="tech-page">
      <div className="dim">~ $ cat {page}.md</div>
      <h1># {page}</h1>
      <p className="dim">cat: {page}.md: not written yet. It works on my machine.</p>
    </article>
  );
}
