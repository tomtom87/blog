type Post = {
  id: string;
  data: { title: string; description: string; date: Date };
};

// Takes already-published posts (see getPublishedPosts); does not filter drafts.
export function rssItems(posts: Post[]) {
  return posts.map((p) => ({
    title: p.data.title,
    description: p.data.description,
    pubDate: p.data.date,
    link: `/blog/${p.id}/`,
  }));
}
