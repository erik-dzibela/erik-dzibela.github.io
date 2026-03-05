# erik-dzibela.github.io

Personal cybersecurity site — writeups, tools, blog.

Built with [Jekyll](https://jekyllrb.com/) · Hosted on [GitHub Pages](https://pages.github.com/)

---

## Quick Start

### Prerequisites
- Ruby 3.1+
- Bundler (`gem install bundler`)

### Local Development

```bash
git clone https://github.com/erik-dzibela/erik-dzibela.github.io
cd erik-dzibela.github.io
bundle install
bundle exec jekyll serve --livereload
# → http://localhost:4000
```

---

## Adding Content

### New CTF Writeup

Create `_writeups/YYYY-MM-DD-challenge-name.md`:

```yaml
---
title: "Challenge Name"
date: 2024-03-15
event: "CTF Name 2024"
category: "web"          # web | pwn | rev | crypto | osint | misc
difficulty: "Medium"     # Easy | Medium | Hard | Insane
points: 350
solves: 142
flag: "ctf{flag_here}"
description: "One-line description for card previews."
tags: [web, sqli]
---

Your writeup content here in Markdown...
```

### New Blog Post

Create `_posts/YYYY-MM-DD-post-title.md`:

```yaml
---
layout: post
title: "Post Title"
date: 2024-01-20
tags: [web, research]
description: "Short description."
---

Content here...
```

### New Tool

Create `_tools/tool-name.md`:

```yaml
---
title: "toolname"
date: 2024-02-10
language: "Python"
description: "What it does."
github: "https://github.com/you/tool"
tags: [recon, networking]
---

Tool documentation here...
```

---

## Deployment

Push to `main` — GitHub Actions builds and deploys automatically.

Go to: **Settings → Pages → Source: GitHub Actions**

---

## Customisation

- **`_config.yml`** — site title, handle, social links
- **`assets/css/main.css`** — all styles via CSS variables at the top
- **`_includes/navbar.html`** — navigation links
- **`_includes/footer.html`** — footer content

To change the colour accent, edit `--cyan` in `main.css`:

```css
--cyan: #00d4ff;  /* change this */
```
