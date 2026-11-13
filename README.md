# Drop Zone Travels — website

Static HTML/CSS/JS site for Drop Zone Travels, Sangam Vihar, New Delhi.

This folder is **generated**. Do not hand-edit it — changes are overwritten on
the next publish. The source project lives one directory up.

- Hosts: GitHub Pages or Vercel (static, no runtime or build step).
- Entry point: `index.html`, served at `/`.
- Sitemap: `/sitemap.xml` → three child sitemaps in `/sitemaps/`.
- 404: `404.html`, picked up automatically by both hosts.

GitHub Pages: publish this folder's contents at the root of the selected
branch. In Settings → Pages, choose **Deploy from a branch** and the branch's
root folder. The `.nojekyll` marker disables Jekyll processing.

Vercel: framework preset **Other**, build command **empty**, output directory
**.**. `vercel.json` applies only to Vercel.
