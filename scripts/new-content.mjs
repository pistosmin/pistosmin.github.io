import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const type = process.argv[2];
const title = process.argv.slice(3).join(' ').trim();

const targets = {
  post: 'src/content/posts',
  note: 'src/content/notes',
  project: 'src/content/projects',
};

if (!targets[type] || !title) {
  console.error('Usage: npm run new:post -- "글 제목"');
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const asciiSlug = title
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[^a-z0-9\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-');
const slug = asciiSlug || `${type}-${today.replaceAll('-', '')}`;
const directory = targets[type];
const filename = path.join(directory, `${today}-${slug}.mdx`);

if (existsSync(filename)) {
  console.error(`Already exists: ${filename}`);
  process.exit(1);
}

const templates = {
  post: `---\ntitle: "${title}"\ndescription: "한 문장 요약을 적는다."\npublished: ${today}\ncategory: "thought"\ntags: []\ndraft: true\n---\n\n본문을 쓴다.\n`,
  note: `---\ntitle: "${title}"\ndescription: "짧은 설명을 적는다."\npublished: ${today}\ntags: []\ndraft: true\n---\n\n메모를 쓴다.\n`,
  project: `---\ntitle: "${title}"\ndescription: "프로젝트를 한 문장으로 설명한다."\npublished: ${today}\nstatus: "in-progress"\nstack: []\ntags: []\ndraft: true\nlinks: {}\n---\n\n프로젝트의 문제, 접근, 배운 점을 쓴다.\n`,
};

await mkdir(directory, { recursive: true });
await writeFile(filename, templates[type], 'utf8');

console.log(`Created ${filename}`);
