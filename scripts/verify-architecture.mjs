import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function walkFiles(directory) {
  const entries = readdirSync(path.join(root, directory));
  return entries.flatMap((entry) => {
    const relativePath = path.join(directory, entry);
    const absolutePath = path.join(root, relativePath);
    const stats = statSync(absolutePath);
    return stats.isDirectory() ? walkFiles(relativePath) : [relativePath];
  });
}

const checks = [
  {
    name: 'Base layout does not hydrate the whole header as a React island',
    pass: () => !read('src/layouts/BaseLayout.astro').includes('Header client:only="react"'),
  },
  {
    name: 'No component uses client:only as a default rendering path',
    pass: () => {
      const sourceFiles = walkFiles('src').filter((file) => /\.(astro|mdx)$/.test(file));
      return sourceFiles.every((file) => !read(file).includes('client:only='));
    },
  },
  {
    name: 'Base layout has no global pointermove tracking',
    pass: () => !read('src/layouts/BaseLayout.astro').includes("document.addEventListener('pointermove'"),
  },
  {
    name: 'Production CSS avoids default backdrop/blur glass effects',
    pass: () => {
      const css = read('src/styles/global.css');
      return !/backdrop-filter\s*:|filter\s*:\s*blur\(/.test(css);
    },
  },
  {
    name: 'Refractive runtime is not a production dependency',
    pass: () => !read('package.json').includes('@hashintel/refractive'),
  },
  {
    name: 'Refractive wrappers expose an opt-in flag for future runtime use',
    pass: () => /enableRefractive\??: boolean/.test(read('src/components/Refractive.tsx')),
  },
  {
    name: 'No source imports the old React Header component',
    pass: () => {
      const sourceFiles = walkFiles('src').filter((file) => /\.(astro|tsx|ts|mdx)$/.test(file));
      return sourceFiles.every((file) => !/from ['"].*components\/Header['"]/.test(read(file)));
    },
  },
];

const failures = checks.filter((check) => !check.pass());

if (failures.length > 0) {
  console.error('Architecture verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure.name}`);
  }
  process.exit(1);
}

console.log(`Architecture verification passed (${checks.length} checks).`);
