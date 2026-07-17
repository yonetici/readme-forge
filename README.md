# README Forge 🔨

**Build a GitHub profile README that doesn't rot.**

Most profile READMEs slowly fall apart: stats cards hit shared rate limits (HTTP 503), icons hotlinked
from moving repos start 404ing, and Heroku-hosted badge services died back in 2022. README Forge
generates profiles that stay healthy — and diagnoses existing ones that already broke.

## Why another generator?

| | Typical generators | README Forge |
|---|---|---|
| Skill icons | Hotlinked from `master` branches | Version-pinned via jsDelivr — can't 404 |
| GitHub stats | Shared Vercel instance (chronically rate-limited) | Rendered *inside your repo* by GitHub Actions |
| Existing broken profiles | Not their problem | 🩺 Link Doctor finds, explains, and fixes them |
| When a service dies | Your profile shows broken images | Your profile doesn't notice |

## Features

- **🛠️ Builder** — form-based editor with live GitHub-style preview: basics, categorized skills,
  social badges, and stats add-ons. Copy or download the result.
- **📊 Durable stats** — instead of hotlinking `github-readme-stats.vercel.app`, the download includes
  a `update-stats.yml` workflow that renders your stats to a committed SVG on a daily schedule using
  your own repo's `GITHUB_TOKEN`. No shared instance, no rate limits, no dead services.
- **🩺 Link Doctor** — point it at any GitHub username. It fetches the profile README, checks every
  link and image (including soft-404s: URLs that return HTTP 200 but serve HTML where an image
  should be), explains *why* each dead link died, and suggests working replacements.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Using the durable stats workflow

1. Download your README from the Builder — you get `README.md` + `update-stats.yml`.
2. In your profile repo (`<username>/<username>`), place the workflow at
   `.github/workflows/update-stats.yml`.
3. Run it once from the **Actions** tab (it also runs daily at 03:00 UTC).
4. `github-metrics.svg` is committed to your repo and referenced by the README — from that point on,
   your stats render even if every third-party stats service on the internet disappears.

## Roadmap

- [ ] One-click "fix my README" — Link Doctor outputs a fully repaired README, not just suggestions
- [ ] Icon vendoring — commit selected SVGs to an `assets/` folder for zero external requests
- [ ] Theme gallery and more layout templates
- [ ] Self-hosted SVG stat cards (serverless) as an alternative to the Actions workflow
- [ ] Deploy to GitHub Pages / Vercel

## Tech stack

Next.js 16 · TypeScript · Tailwind CSS 4 · react-markdown

## Acknowledgements

Inspired by [rahuldkjain/github-profile-readme-generator](https://github.com/rahuldkjain/github-profile-readme-generator)
(Apache-2.0) — the tool that popularized profile READMEs. README Forge focuses on the durability
problems that emerged in the years since: dead Herokus, rate-limited shared instances, and moved icons.

## License

MIT
