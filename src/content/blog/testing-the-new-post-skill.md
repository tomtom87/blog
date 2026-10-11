---
title: "Testing the new-post skill"
description: "A quick post created with one slash command, to show how adding posts works on this site."
date: 2026-10-11
tags: [meta, astro]
draft: false
---

This post exists to test a workflow. I typed `/new-post`, answered two questions, and Claude wrote this file.

![A crowd of cartoon Tux penguins, one waving a GNU/Linux flag](../../assets/blog/testing-the-new-post-skill/test-image.jpg)

## How it works

Posts are Markdown files in `src/content/blog/`. The skill picks a slug from the title, fills in the front matter, reuses my existing tags, and runs the build to check everything matches the schema.

## Why bother

Less friction means more writing. If adding a post takes ten seconds, I'm far more likely to publish the small things I learn along the way.
