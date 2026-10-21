// The fields we use from GitHub's "list releases" API response.
type ApiRelease = {
  tag_name: string;
  name: string | null;
  published_at: string | null;
  html_url: string;
  body: string | null;
  draft: boolean;
};

// Drops drafts (and unpublished ones) and maps to collection entries.
export function toReleases(api: ApiRelease[]) {
  return api
    .filter((r) => !r.draft && r.published_at)
    .map((r) => ({
      id: r.tag_name,
      title: r.name || r.tag_name,
      date: new Date(r.published_at!),
      url: r.html_url,
      body: r.body ?? "",
    }));
}

export function byNewest<T extends { data: { date: Date } }>(releases: T[]) {
  return [...releases].sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}
