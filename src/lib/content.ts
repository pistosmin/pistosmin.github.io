import { getCollection } from 'astro:content';

export async function getPosts() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());
}

export async function getProjects() {
  const projects = await getCollection('projects', ({ data }) => !data.draft);
  return projects.sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());
}
