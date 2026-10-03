import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { profile } from "./src/data/profile.js";
import { site } from "./src/data/site.js";
import { socials } from "./src/data/socials.js";
import { reportPath, reports } from "./src/lib/routes.js";

// Collects every character used in src/ (plus all printable ASCII) and passes
// them to Google Fonts' `text=` parameter, so the browser downloads a tiny
// Noto Serif JP file instead of the full Japanese font.
// In dev, restart `npm run dev` after adding new Japanese characters.
function subsetTitleFont() {
  const collect = (dir, chars) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) collect(path, chars);
      else if (/\.(jsx?|css)$/.test(name)) for (const ch of readFileSync(path, "utf8")) chars.add(ch);
    }
  };

  return {
    name: "subset-title-font",
    transformIndexHtml(html) {
      const chars = new Set();
      for (let c = 0x20; c < 0x7f; c++) chars.add(String.fromCharCode(c));
      collect("src", chars);
      const text = [...chars]
        .filter((ch) => ch >= " ")
        .sort()
        .join("");
      return html.replace("text=%TITLE_FONT_TEXT%", `text=${encodeURIComponent(text)}`);
    },
  };
}

// Content-Security-Policy, added to production builds only (Vite's dev server
// needs inline scripts the policy would block). GitHub Pages can't send custom
// headers, so it's delivered as a <meta> tag. Every outside service the site
// talks to must be listed here, or the browser will block it.
function contentSecurityPolicy() {
  const goatcounter = site.goatcounter ? `https://${site.goatcounter}.goatcounter.com` : "";
  const policy = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    `img-src 'self' data: ${goatcounter}`,
    `connect-src 'self' https://api.github.com ${goatcounter}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "upgrade-insecure-requests",
  ]
    .map((d) => d.trim())
    .join("; ");

  return {
    name: "content-security-policy",
    apply: "build",
    transformIndexHtml(html) {
      return html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`,
      );
    },
  };
}

// schema.org Person data, built from src/data/ so it never drifts from the page.
// The sameAs links tell Google these profiles all belong to the same person.
// Check it with https://search.google.com/test/rich-results after deploying.
// (A JSON-LD block is data, not a script, so the CSP doesn't block it.)
function structuredData() {
  const title = (s) => s[0] + s.slice(1).toLowerCase();
  const name = `${title(profile.firstName)} ${title(profile.lastName)}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: site.url,
    dateModified: new Date().toISOString(),
    mainEntity: {
      "@type": "Person",
      name,
      url: site.url,
      description: profile.about,
      jobTitle: profile.jobTitle,
      affiliation: { "@type": "CollegeOrUniversity", name: profile.school.name, sameAs: profile.school.url },
      knowsAbout: ["Computer Engineering", ...profile.magi.melchior.lines],
      sameAs: socials.map((s) => s.url),
    },
  };
  // Escape "<" so nothing in the data can close the script tag early.
  const json = JSON.stringify(data, null, 2).replace(/</g, "\\u003c");

  return {
    name: "structured-data",
    transformIndexHtml(html) {
      return html.replace("</head>", `  <script type="application/ld+json">\n${json}\n    </script>\n  </head>`);
    },
  };
}

// sitemap.xml: the home page and every incident report (src/lib/routes.js),
// stamped with the build date (the site deploys on every push).
function sitemap() {
  return {
    name: "sitemap",
    apply: (_, { command, isSsrBuild }) => command === "build" && !isSsrBuild,
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10);
      const urls = [site.url, ...reports.map((p) => new URL(reportPath(p), site.url).href)];
      const entries = urls.map((url) => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`);
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`,
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), subsetTitleFont(), contentSecurityPolicy(), structuredData(), sitemap()],
});
