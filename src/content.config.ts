import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const categorySchema = z.enum(['life', 'thought', 'tech', 'work']);

const postLikeSchema = {
  title: z.string(),
  description: z.string(),
  published: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
  cover: z.string().optional(),
};

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}', retainBody: true }),
  schema: z.object({
    ...postLikeSchema,
    category: categorySchema,
    series: z
      .object({
        id: z.string().min(1),
        title: z.string().min(1),
        order: z.number().int(),
      })
      .optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}', retainBody: true }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    status: z.enum(['in-progress', 'shipped', 'archived']).default('in-progress'),
    stack: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    links: z
      .object({
        demo: z.url().optional(),
        repo: z.url().optional(),
        caseStudy: z.url().optional(),
      })
      .default({}),
  }),
});

export const collections = { posts, projects };
