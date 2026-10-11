import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";
import { getPublishedPosts } from "../lib/posts";
import { rssItems } from "../lib/rss";

export async function GET(context: APIContext) {
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site!,
    items: rssItems(await getPublishedPosts()),
  });
}
