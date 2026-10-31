/* Data + renderers for projects, skills and certificates.
   Everything here works without GSAP: animations.js enhances the rendered DOM. */
(() => {
  'use strict';
  const DS = (window.DS = window.DS || {});
  const $ = (s, r = document) => r.querySelector(s);
  const pad = (n) => String(n).padStart(2, '0');

  DS.projects = [
    { id: 'agripredict', cat: 'analytics', wide: true, title: 'AgriPredict', type: 'Agriculture · decision support',
      desc: 'Weather-aware market trend analysis that connects crop-price patterns and seasonal signals to practical agricultural decisions.',
      tags: ['Python', 'Machine Learning', 'Streamlit'], img: 'assets/projects/agri-predict.svg',
      live: 'https://weatheragripredict.streamlit.app/', repo: 'https://github.com/dhanush0823-git/Weather-Aware-Market-Trend-Analysis-for-Crops',
      points: ['Links crop-price trends with weather and seasonal signals', 'Published as a live Streamlit application', 'Built with Python and machine-learning workflows'] },
    { id: 'health-chatbot', cat: 'genai', wide: true, title: 'AI Health Chatbot', type: 'Public health · conversational AI',
      desc: 'A conversational public-health awareness tool designed to answer common symptom, vaccination and outbreak questions with retrieval-backed context.',
      tags: ['Python', 'NLP', 'RAG', 'FAISS', 'Streamlit'], img: 'assets/projects/ai-health-chatbot.svg',
      live: 'https://disawachatbot.streamlit.app/', repo: 'https://github.com/dhanush0823-git/ai-public-health-chatbot',
      points: ['Answers symptom, vaccination and outbreak questions', 'Retrieval-backed context via vector search', 'Published as a live Streamlit application'] },
    { id: 'rbi-gatekeeper', cat: 'genai', title: 'RBI LLM–RAG Gatekeeper', type: 'Financial regulation · RAG',
      desc: 'A retrieval-augmented workflow for validating financial queries against regulatory information with a vector-index approach.',
      tags: ['Python', 'LLM', 'RAG', 'Vector search'], img: 'assets/projects/rbi-rag-gatekeeper.svg',
      repo: 'https://github.com/dhanush0823-git/rbi-llm-rag-gatekeeper',
      points: ['Checks queries against regulatory source text', 'Uses a vector index for retrieval', 'LLM answers are grounded in retrieved context'] },
    { id: 'resume-match', cat: 'ml', title: 'Resume–Job Matching', type: 'NLP · embeddings',
      desc: 'Semantic matching concept that compares resume content with job descriptions to surface relevant skills and potential gaps beyond exact keywords.',
      tags: ['NLP', 'Embeddings', 'FAISS'], img: 'assets/projects/resume-job-matching.svg',
      points: ['Compares meaning, not only keywords', 'Surfaces matching skills and potential gaps', 'Embedding-based similarity search'] },
    { id: 'sentiment', cat: 'ml', title: 'NLP Sentiment Analysis', type: 'Text AI · classification',
      desc: 'A text-processing pipeline for cleaning language, extracting features and classifying opinions into sentiment categories using standard metrics.',
      tags: ['Python', 'Scikit-learn', 'Text processing'], img: 'assets/projects/nlp-sentiment-analysis.svg',
      points: ['Text cleaning and feature extraction', 'Positive, neutral and negative classes', 'Evaluated with standard classification metrics'] },
    { id: 'ml-lab', cat: 'ml', title: 'ML Algorithms Lab', type: 'Supervised learning',
      desc: 'Hands-on experiments with tree-based models, including Decision Tree and XGBoost, from training through evaluation.',
      tags: ['Python', 'XGBoost', 'Decision Tree', 'Jupyter'], img: 'assets/projects/ml-algorithms-lab.svg',
      repo: 'https://github.com/dhanush0823-git/ML_Algorithms',
      points: ['Decision Tree and XGBoost experiments', 'Train, test and evaluate workflow', 'Documented in Jupyter notebooks'] },
    { id: 'ecommerce', cat: 'analytics', title: 'E-Commerce Sales Analytics', type: 'Business intelligence',
      desc: 'Explored 50,000+ sales transactions to identify buying patterns, revenue trends and performance signals, then surfaced them in Power BI dashboards.',
      tags: ['SQL', 'Python', 'Power BI'], img: 'assets/projects/ecommerce-sales-analytics.svg',
      points: ['50,000+ transactions processed with SQL and Python', 'KPI tracking, customer segmentation and regional analysis', 'Reporting time reduced by 30% (per résumé)'] },
    { id: 'scraping', cat: 'automation', title: 'Web Scraping with Selenium', type: 'Browser automation · ETL',
      desc: 'Automates browser interactions and transforms collected web content into structured datasets for downstream analysis.',
      tags: ['Python', 'Selenium', 'Pandas'], img: 'assets/projects/web-scraping-selenium.svg',
      repo: 'https://github.com/dhanush0823-git/Web-Scraping-Python-Selenium',
      points: ['Automates browser interactions', 'Extracts fields from page elements', 'Outputs structured datasets with Pandas'] }
  ];

  DS.filters = [['all', 'All work'], ['genai', 'GenAI'], ['ml', 'ML & NLP'], ['analytics', 'Analytics'], ['automation', 'Automation']];

  DS.skillCats = [['all', 'All'], ['prog', 'Programming'], ['analytics', 'Data analytics'], ['ml', 'Machine learning'], ['genai', 'Generative AI'], ['web', 'Web'], ['tools', 'Tools']];
  DS.skills = [
    ['prog', 'Python', 'Analysis, automation and model workflows', 'Py'], ['prog', 'SQL & MySQL', 'Querying, joins and data preparation', 'SQL'],
    ['prog', 'R', 'Statistical computing', 'R'], ['prog', 'Pandas & NumPy', 'Cleaning, transformation and EDA', 'Pd'],
    ['analytics', 'Power BI', 'Interactive dashboards and reporting', 'BI'], ['analytics', 'DAX & Power Query', 'Measures, shaping and KPI logic', 'DAX'],
    ['analytics', 'Tableau', 'Visual analytics', 'Tb'], ['analytics', 'Excel', 'Pivot tables and advanced formulas', 'Xl'],
    ['ml', 'Scikit-learn', 'Classification, regression and evaluation', 'ML'], ['ml', 'Decision Trees', 'Tree-based models and XGBoost', 'DT'],
    ['ml', 'Regression', 'Predictive modelling', 'Rg'], ['ml', 'Deep learning', 'TensorFlow and PyTorch foundations', 'DL', true],
    ['genai', 'LLMs', 'Prompting and model-backed workflows', 'LLM'], ['genai', 'RAG', 'Retrieval-backed response design', 'RAG'],
    ['genai', 'FAISS & Embeddings', 'Vector search and semantic similarity', 'Fa'], ['genai', 'NLP & Transformers', 'Text processing and semantic features', 'NLP'],
    ['genai', 'Hugging Face', 'Models, pipelines and ecosystem', 'HF', true],
    ['web', 'HTML', 'Semantic page structure', 'H'], ['web', 'CSS', 'Responsive layout and styling', 'C'],
    ['web', 'JavaScript', 'Interactive front ends', 'JS'], ['web', 'Streamlit', 'Deploying interactive data apps', 'St'],
    ['tools', 'Git & GitHub', 'Version control and sharing', 'Git'], ['tools', 'VS Code', 'Daily development environment', 'VS'],
    ['tools', 'Jupyter', 'Experiments and notebooks', 'Jp'], ['tools', 'Selenium', 'Browser automation and scraping', 'Se'],
    ['tools', 'PySpark & Hadoop', 'Big-data fundamentals', 'PyS']
  ].map(([cat, name, desc, icon, exploring]) => ({ cat, name, desc, icon, exploring: !!exploring }));

  DS.certs = [
    { id: 'be10x', title: 'AI Tools & ChatGPT Workshop', issuer: 'be10x', date: 'Feb 2, 2025', kind: 'image', note: 'Certificate of completion',
      src: 'assets/certificates/be10x-ai-tools.jpg', thumb: 'assets/certificates/thumbs/be10x-ai-tools.jpg' },
    { id: 'cit', title: 'Data Analytics using Orange', issuer: 'Coimbatore Institute of Technology', date: 'Mar 9, 2024', kind: 'image', note: 'ASTRANOVA 2K24 workshop participation',
      src: 'assets/certificates/cit-orange-data-analytics.jpg', thumb: 'assets/certificates/thumbs/cit-orange-data-analytics.jpg' },
    { id: 'gateway', title: 'Full Stack Web Development Internship', issuer: 'Gateway Software Solutions', date: 'Jul 25, 2024', kind: 'image', note: 'Internship completion letter',
      src: 'assets/certificates/gateway-internship.jpg', thumb: 'assets/certificates/thumbs/gateway-internship.jpg' },
    { id: 'ibm', title: 'Artificial Intelligence Fundamentals', issuer: 'IBM SkillsBuild', date: 'Oct 10, 2025', kind: 'image', note: 'Verified digital credential',
      src: 'assets/certificates/ibm-ai-fundamentals.jpg', thumb: 'assets/certificates/thumbs/ibm-ai-fundamentals.jpg',
      verify: 'https://www.credly.com/badges/4b7e79a2-8a6a-4743-ada4-74183f38e58a' },
    { id: 'infosys', title: 'Data Science with Python', issuer: 'Infosys Springboard', date: 'Completed Sep 21, 2025', kind: 'image', note: 'Course completion · issued Jan 12, 2026',
      src: 'assets/certificates/infosys-data-science-python.jpg', thumb: 'assets/certificates/thumbs/infosys-data-science-python.jpg', verify: 'https://verify.onwingspan.com' },
    { id: 'vcodez', title: 'Data Science Internship Experience Letter', issuer: 'VCodez', date: 'Oct 23, 2025', kind: 'pdf', note: 'Internship July – October 2025 · PDF',
      src: 'assets/certificates/vcodez-data-science-internship.pdf', preview: 'assets/certificates/vcodez-preview.jpg', thumb: 'assets/certificates/thumbs/vcodez-data-science-internship.jpg' }
  ];

  /* ---------- Projects: stacked deck ---------- */
  DS.catColor = { all: '#c8ff3d', prog: '#c8ff3d', analytics: '#38bdf8', ml: '#9d6bff', genai: '#5eead4', web: '#ffb454', tools: '#cbd5e1',
    automation: '#ffb454' };
  const projColor = { genai: '#5eead4', ml: '#9d6bff', analytics: '#38bdf8', automation: '#ffb454' };
  const grid = $('#projectGrid'), filters = $('#filters'), countEl = $('#projectCount');
  if (grid && filters) {
    filters.innerHTML = DS.filters.map(([k, l], i) => {
      const n = k === 'all' ? DS.projects.length : DS.projects.filter((p) => p.cat === k).length;
      return `<button type="button" class="filter${i ? '' : ' active'}" data-filter="${k}" aria-pressed="${i === 0}">${l}<sup>${pad(n)}</sup></button>`;
    }).join('');
    const host = (u) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');
    grid.innerHTML = DS.projects.map((p, i) => `
      <article class="deck-card" data-cat="${p.cat}" data-id="${p.id}" style="--i:${i};--c:${projColor[p.cat] || '#c8ff3d'}">
        <span class="dk-ghost" aria-hidden="true">${pad(i + 1)}</span>
        <div class="dk-info">
          <div class="dk-top"><span class="dk-no">${pad(i + 1)} / ${pad(DS.projects.length)}</span><span class="dk-type">${p.type}</span>${p.live ? '<span class="dk-live"><i></i>Live</span>' : ''}</div>
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
          <ul class="dk-points">${p.points.map((x) => `<li>${x}</li>`).join('')}</ul>
          <div class="tags">${p.tags.map((t) => `<span>${t}</span>`).join('')}</div>
          <div class="plinks">
            ${p.live ? `<a class="btn btn-solid btn-sm" href="${p.live}" target="_blank" rel="noopener">Live demo ↗</a>` : ''}
            ${p.repo ? `<a class="btn btn-ghost btn-sm" href="${p.repo}" target="_blank" rel="noopener">GitHub ↗</a>` : ''}
            <button type="button" class="link-btn plain" data-open="project" data-id="${p.id}">Details</button>
          </div>
        </div>
        <button class="dk-media" type="button" data-tilt data-open="project" data-id="${p.id}" aria-label="Open details for ${p.title}">
          <span class="dk-bar"><i></i><i></i><i></i><em>${p.live ? host(p.live) : 'project preview'}</em></span>
          <span class="dk-shot"><span class="dk-par"><img src="${p.img}" alt="${p.title} project preview graphic" width="1200" height="750" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async"></span></span>
          <span class="dk-view">View details</span>
        </button>
      </article>`).join('');
    const cards = [...grid.children];
    const setCount = (n) => { if (countEl) countEl.textContent = `Showing ${pad(n)} project${n === 1 ? '' : 's'}`; };
    setCount(cards.length);
    filters.addEventListener('click', (e) => {
      const b = e.target.closest('.filter'); if (!b || b.classList.contains('active')) return;
      filters.querySelectorAll('.filter').forEach((x) => { const on = x === b; x.classList.toggle('active', on); x.setAttribute('aria-pressed', on); });
      const cat = b.dataset.filter, show = (c) => cat === 'all' || c.dataset.cat === cat;
      let k = 0; cards.forEach((c) => { if (show(c)) c.style.setProperty('--i', k++); }); // stacking order of the visible cards
      setCount(k);
      if (DS.fx && DS.fx.filter) DS.fx.filter(cards, show);
      else cards.forEach((c) => { c.hidden = !show(c); });
    });
  }

  /* ---------- Skills: orbit lab ---------- */
  const KEYS = { 'Python': ['python'], 'SQL & MySQL': ['sql'], 'Pandas & NumPy': ['pandas'], 'Power BI': ['power bi'], 'Scikit-learn': ['scikit-learn'],
    'Decision Trees': ['decision tree', 'xgboost'], 'LLMs': ['llm'], 'RAG': ['rag'], 'FAISS & Embeddings': ['faiss', 'embeddings'], 'NLP & Transformers': ['nlp', 'text processing'],
    'Streamlit': ['streamlit'], 'Jupyter': ['jupyter'], 'Selenium': ['selenium'] };
  DS.skills.forEach((s) => { s.keys = KEYS[s.name] || []; });
  const tabs = $('#skillTabs'), orbit = $('#orbitMap'), lanes = $('#skillLanes');
  if (tabs && orbit) {
    const catLabel = (k) => (DS.skillCats.find((c) => c[0] === k) || [])[1] || '';
    tabs.innerHTML = DS.skillCats.map(([k, l], i) => {
      const n = k === 'all' ? DS.skills.length : DS.skills.filter((s) => s.cat === k).length;
      return `<button type="button" role="tab" class="tab${i ? '' : ' active'}" data-cat="${k}" aria-selected="${i === 0}" style="--c:${DS.catColor[k]}"><span class="tab-no">${pad(i)}</span><span class="tab-l">${l}</span><sup>${pad(n)}</sup></button>`;
    }).join('');
    const $n = (id) => document.getElementById(id);
    const select = (idx) => {
      const s = DS.skills[idx]; if (!s) return;
      orbit.style.setProperty('--c', DS.catColor[s.cat]);
      orbit.querySelectorAll('.om-node').forEach((n) => n.classList.toggle('sel', +n.dataset.idx === idx));
      $n('omName').textContent = s.icon; $n('omCount').textContent = catLabel(s.cat);
      $n('srCat').textContent = catLabel(s.cat); $n('srName').textContent = s.name + (s.exploring ? ' · learning' : '');
      $n('srDesc').textContent = s.desc;
      $n('srCat').style.color = DS.catColor[s.cat];
      const used = DS.projects.filter((p) => s.keys.some((k) => p.tags.some((t) => t.toLowerCase().includes(k))));
      $n('srUsed').innerHTML = used.length ? used.map((p) => `<button type="button" class="used-chip" data-open="project" data-id="${p.id}">${p.title}</button>`).join('') : '<em>Not tied to a showcased project yet</em>';
    };
    let curCat = 'all';
    const buildOrbit = (cat) => {
      curCat = cat;
      orbit.querySelectorAll('.om-ring').forEach((r) => r.remove());
      const list = DS.skills.map((s, i) => ({ s, i })).filter((x) => cat === 'all' || x.s.cat === cat);
      const two = list.length > 8, half = Math.ceil(list.length / 2);
      orbit.classList.toggle('one', !two);
      (two ? [list.slice(0, half), list.slice(half)] : [list]).forEach((group, ri) => {
        const ring = document.createElement('div'); ring.className = 'om-ring r' + ri;
        const R = two ? (ri ? 44 : 30) : 38;
        group.forEach(({ s, i }, k) => {
          const a = (k / group.length) * Math.PI * 2 - Math.PI / 2 + (ri ? 0.3 : 0);
          const n = document.createElement('button'); n.type = 'button'; n.className = 'om-node'; n.dataset.idx = i;
          n.style.cssText = `left:${50 + Math.cos(a) * R}%;top:${50 + Math.sin(a) * R}%;--c:${DS.catColor[s.cat]};--n:${k + ri * 6}`;
          n.setAttribute('aria-label', s.name);
          n.innerHTML = `<b>${s.icon}<em>${s.name}</em></b>`; ring.appendChild(n);
        });
        orbit.appendChild(ring);
      });
      select(list[0].i);
    };
    tabs.addEventListener('click', (e) => {
      const b = e.target.closest('.tab'); if (!b || b.classList.contains('active')) return;
      tabs.querySelectorAll('.tab').forEach((x) => { const on = x === b; x.classList.toggle('active', on); x.setAttribute('aria-selected', on); });
      buildOrbit(b.dataset.cat);
    });
    orbit.addEventListener('click', (e) => { const n = e.target.closest('.om-node'); if (n) select(+n.dataset.idx); });
    orbit.addEventListener('focusin', (e) => { const n = e.target.closest('.om-node'); if (n) select(+n.dataset.idx); });
    orbit.addEventListener('mouseover', (e) => { const n = e.target.closest('.om-node'); if (n) select(+n.dataset.idx); });
    buildOrbit('all');

    if (lanes) {
      const item = (s, i, hidden) => `<button type="button" class="lane-item" style="--c:${DS.catColor[s.cat]}" data-idx="${i}"${hidden ? ' tabindex="-1" aria-hidden="true"' : ''}><b>${s.icon}</b>${s.name}</button>`;
      const groups = [0, 1, 2].map((g) => DS.skills.map((s, i) => ({ s, i })).filter((x, k) => k % 3 === g));
      lanes.innerHTML = groups.map((g, gi) => `<div class="lane" style="--d:${[46, 58, 52][gi]}s"><div class="lane-track">${g.map((x) => item(x.s, x.i)).join('')}${g.map((x) => item(x.s, x.i, true)).join('')}</div></div>`).join('');
      lanes.addEventListener('click', (e) => {
        const b = e.target.closest('.lane-item'); if (!b) return;
        const s = DS.skills[+b.dataset.idx];
        const t = tabs.querySelector(`.tab[data-cat="${s.cat}"]`); t && t.click();
        select(+b.dataset.idx);
        orbit.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
      });
    }
  }

  /* ---------- Certificates ---------- */
  const track = $('#certTrack');
  if (track) {
    track.innerHTML = DS.certs.map((c, i) => `
      <article class="cert" data-id="${c.id}" data-tilt>
        <button class="cert-media" type="button" data-open="cert" data-id="${c.id}" aria-label="Preview ${c.title}">
          <img src="${c.thumb}" alt="${c.title} — ${c.issuer}" width="900" height="${c.id === 'gateway' || c.id === 'vcodez' ? 1165 : 640}" loading="lazy" decoding="async">
          <span class="cert-badge">${c.kind === 'pdf' ? 'PDF' : 'Image'}</span><span class="cert-view">Preview</span>
        </button>
        <div class="cert-body"><span class="cert-no">${pad(i + 1)}</span><div><h3>${c.title}</h3><p>${c.issuer}</p><small>${c.date}</small></div></div>
        ${c.verify ? `<a class="cert-verify" href="${c.verify}" target="_blank" rel="noopener">Verify credential ↗</a>` : `<span class="cert-verify muted">${c.note}</span>`}
      </article>`).join('');
  }
})();
