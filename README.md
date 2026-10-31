# Dhanush S — Premium Animated Portfolio

Data Science · Machine Learning · Generative AI. A static site (HTML, CSS, vanilla JS) with GSAP, ScrollTrigger and Lenis loaded from CDNs. No build step and no backend.

## Run locally
Open `index.html`, or serve the folder: `python3 -m http.server 8000` then visit http://localhost:8000
(An internet connection is needed for the GSAP/Lenis CDNs and Google Fonts. Without them the site still works as a fully visible static page.)

## Deploy to Vercel
Import the folder as a static project (Framework: *Other*, no build command, output directory = root). `vercel.json` adds caching and security headers.

## Structure
```
index.html
css/  style.css (design system, components) · animations.css (keyframes, intro loader, reduced motion) · responsive.css
js/   projects.js (data + renderers: projects, skills, certificates)
      interactions.js (tilt, magnetic buttons, cursor, hero particles; no GSAP needed)
      animations.js (GSAP/ScrollTrigger/Lenis: intro, split text, scroll reveals, pinned RAG story, horizontal certificates)
      main.js (boot, nav, viewers, modals, loader)
assets/ images/ · certificates/ (+thumbs, VCodez PDF) · projects/ (custom SVG previews) · icons/ · resume.pdf
```

## Features
- Intro loader (DS monogram, percentage, skip button; shorter on repeat visits)
- Hero: word-by-word masked reveal, animated gradient text, 3D tilt portrait, orbit rings, floating Python/SQL/AI/RAG chips, particle field, mouse spotlight
- Scroll-scrubbed statement, counters (only real résumé values), animated timeline, pinned RAG pipeline story, pinned horizontal certificate gallery
- Projects as a scroll-stacking deck: each card slides over the last (which scales and dims), browser-frame previews with parallax and 3D tilt, category filters, detail modal, custom SVG previews
- Skills as an interactive orbit lab: pick a discipline, hover/click orbiting tools, see which projects use each one; plus three counter-scrolling tool lanes (no fake percentages)
- Full-screen certificate viewer: zoom, prev/next, keyboard (←, →, Esc), PDF viewer for the VCodez letter
- Respects `prefers-reduced-motion`; mouse effects disabled on touch devices; keyboard focus trap in dialogs

## Content to verify before publishing
- Experience lists a single Gateway Software Solutions entry, the 8–25 July 2024 Full Stack Web Development internship, exactly as the completion letter states.
- VCodez dates follow the letter (Jul–Oct 2025); the résumé says Nov 2025.
- Skills "R" and "Tableau" come from the original brief; they are not on the résumé. "Deep learning" and "Hugging Face" are marked *learning*.
- Project GitHub links for AgriPredict, Health Chatbot, RBI Gatekeeper, ML Algorithms and Web Scraping were carried over from the original portfolio.
