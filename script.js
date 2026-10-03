const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const localTime = document.querySelector("#local-time");
const currentYear = document.querySelector("#current-year");
const savedTheme = window.localStorage.getItem("theme");
const blogDateFormatter = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Melbourne",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const blogCarousel = createCarousel("blog", "blog post");
const techieCarousel = createCarousel("techie", "technical article");
let blogResizeFrame = 0;
const techiePosts = [
  {
    title: "Growing concern of Shoplifting in retail industry",
    url: "https://www.linkedin.com/pulse/growing-concern-shoplifting-retail-industry-pranit-prakash/",
    excerpt:
      "An exploration of rising retail theft, its impact on Australian retailers, and the role of technology and security.",
    category: "Retail technology",
    source: "LinkedIn Pulse",
  },
  {
    title: "SaaS Is Changing the Realm of Architecture",
    url: "https://www.linkedin.com/pulse/saas-changing-realm-architecture-pranit-prakash/",
    excerpt:
      "How the shift to SaaS and best-of-breed products is changing the role of enterprise architecture.",
    category: "Architecture",
    source: "LinkedIn Pulse",
  },
  {
    title: "Derivation of Integration",
    url: "https://www.linkedin.com/pulse/derivation-integration-pranit-prakash/",
    excerpt:
      "Key questions and considerations for deriving integration requirements across enterprise systems.",
    category: "Integration",
    source: "LinkedIn Pulse",
  },
  {
    title: "Integrating End-points with Agent-based Deployment",
    url: "https://www.linkedin.com/pulse/integrating-end-points-agent-based-deployment-pranit-prakash/",
    excerpt:
      "Thoughts on endpoint integration and agent-based deployment approaches.",
    category: "Deployment",
    source: "LinkedIn Pulse",
  },
  {
    title: "Aiming for DevOps in ServiceNow",
    url: "https://www.linkedin.com/pulse/aiming-devops-servicenow-pranit-prakash/",
    excerpt:
      "A practical look at the tools, integrations, and automation that support DevOps for ServiceNow.",
    category: "DevOps",
    source: "LinkedIn Pulse",
  },
  {
    title: "Towards Enterprise Service Management",
    url: "https://www.linkedin.com/pulse/towards-enterprise-service-management-pranit-prakash/",
    excerpt:
      "Applying service-management practices across business functions with shared services and processes.",
    category: "Service management",
    source: "LinkedIn Pulse",
  },
  {
    title: "Oops! Can We Limit SLAs to Mere Metrics?",
    url: "https://www.linkedin.com/pulse/oops-can-limit-slas-mere-metrics-pranit-prakash/",
    excerpt:
      "Why effective SLAs need governance, ownership, and meaningful outcomes—not just targets and measurements.",
    category: "Service management",
    source: "LinkedIn Pulse",
  },
  {
    title: "Importance of a Single Source of Truth",
    url: "https://www.linkedin.com/pulse/importance-single-source-truth-pranit-prakash/",
    excerpt:
      "Why consistent, reconciled information across connected systems matters to sound IT architecture.",
    category: "Architecture",
    source: "LinkedIn Pulse",
  },
];

if (savedTheme === "light" || savedTheme === "dark") {
  root.dataset.theme = savedTheme;
}

function updateThemeLabel() {
  const isLight = root.dataset.theme === "light";
  themeToggle.setAttribute(
    "aria-label",
    isLight ? "Switch to dark theme" : "Switch to light theme",
  );
}

function updateLocalTime() {
  const now = new Date();
  const time = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Melbourne",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(now);

  localTime.dateTime = now.toISOString();
  localTime.textContent = time + " in Melbourne";
}

function createCarousel(id, itemLabel) {
  return {
    itemLabel,
    container: document.querySelector(`#${id}-carousel`),
    viewport: document.querySelector(`#${id}-viewport`),
    track: document.querySelector(`#${id}-track`),
    status: document.querySelector(`#${id}-status`),
    pagination: document.querySelector(`#${id}-pagination`),
    previous: document.querySelector(`#${id}-previous`),
    next: document.querySelector(`#${id}-next`),
    posts: [],
    activeIndex: 0,
    paginationMaxIndex: -1,
    layoutVisibleSlides: 0,
  };
}

function visibleCarouselSlides() {
  if (window.matchMedia("(max-width: 560px)").matches) {
    return 1;
  }

  if (window.matchMedia("(max-width: 760px)").matches) {
    return 2;
  }

  return 3;
}

function maximumCarouselIndex(carousel) {
  return Math.max(0, carousel.posts.length - visibleCarouselSlides());
}

function updateCarouselSlideLayout(carousel) {
  const visibleSlides = visibleCarouselSlides();
  if (visibleSlides === carousel.layoutVisibleSlides) {
    return;
  }

  carousel.layoutVisibleSlides = visibleSlides;
  const basis =
    visibleSlides === 1
      ? "100%"
      : visibleSlides === 2
        ? "calc((100% - 16px) / 2)"
        : "calc((100% - 32px) / 3)";

  for (const slide of carousel.track.children) {
    slide.style.flexBasis = basis;
  }
}

function plainText(html) {
  const withoutMarkup = html
    .replace(/<(script|style|noscript|template)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*>/g, " ");
  const decoder = document.createElement("textarea");
  decoder.innerHTML = withoutMarkup;
  return decoder.value.replace(/\s+/g, " ").trim();
}

function makeBlogCard(post, index, totalPosts) {
  const item = document.createElement("li");
  item.className = "blog-slide";
  item.setAttribute("aria-roledescription", "slide");
  item.setAttribute("aria-label", `${index + 1} of ${totalPosts}`);

  const link = document.createElement("a");
  link.className = "blog-card";
  link.href = post.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", `${post.title} (opens in a new tab)`);

  const art = document.createElement("div");
  art.className = "blog-card-art";
  art.setAttribute("aria-hidden", "true");

  const category = document.createElement("span");
  category.className = "blog-card-category";
  category.textContent = post.category;

  const number = document.createElement("span");
  number.className = "blog-card-number";
  number.textContent = String(index + 1).padStart(2, "0");
  art.append(category, number);

  const body = document.createElement("div");
  body.className = "blog-card-body";

  const date = post.publishedAt ? document.createElement("time") : document.createElement("span");
  date.className = "blog-card-date";
  if (post.publishedAt) {
    date.dateTime = post.publishedAt;
    date.textContent = blogDateFormatter.format(new Date(post.publishedAt));
  } else {
    date.textContent = post.source;
  }

  const title = document.createElement("h3");
  title.className = "blog-card-title";
  title.textContent = post.title;

  const excerpt = document.createElement("p");
  excerpt.className = "blog-card-excerpt";
  excerpt.textContent = post.excerpt || "Open this post on Blogger to read the full article.";

  const readMore = document.createElement("span");
  readMore.className = "blog-card-read-more";
  readMore.textContent = "Read story";

  body.append(date, title, excerpt, readMore);
  link.append(art, body);
  item.append(link);
  return item;
}

function goToCarouselPost(carousel, index) {
  const maximum = maximumCarouselIndex(carousel);
  if (maximum === 0) {
    return;
  }

  const target = (index + maximum + 1) % (maximum + 1);
  const firstSlide = carousel.track.querySelector(".blog-slide");
  const slideGap = Number.parseFloat(window.getComputedStyle(carousel.track).columnGap) || 0;
  const stride = firstSlide.getBoundingClientRect().width + slideGap;
  if (!Number.isFinite(stride) || stride <= 0) {
    return;
  }
  const targetScrollLeft = target * stride;

  if (Math.abs(carousel.viewport.scrollLeft - targetScrollLeft) < 2) {
    updateCarousel(carousel, target);
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  carousel.viewport.scrollTo({
    left: targetScrollLeft,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
  updateCarousel(carousel, target);
}

function updateCarousel(carousel, requestedIndex) {
  if (carousel.posts.length === 0) {
    return;
  }

  updateCarouselSlideLayout(carousel);
  const maximum = maximumCarouselIndex(carousel);
  const firstSlide = carousel.track.querySelector(".blog-slide");
  const slideGap = Number.parseFloat(window.getComputedStyle(carousel.track).columnGap) || 0;
  const stride = firstSlide.getBoundingClientRect().width + slideGap;
  if (!Number.isFinite(stride) || stride <= 0) {
    return;
  }

  carousel.activeIndex =
    requestedIndex === undefined
      ? Math.min(maximum, Math.max(0, Math.round(carousel.viewport.scrollLeft / stride)))
      : Math.min(maximum, Math.max(0, requestedIndex));
  carousel.previous.disabled = maximum === 0;
  carousel.next.disabled = maximum === 0;

  if (carousel.paginationMaxIndex !== maximum) {
    carousel.paginationMaxIndex = maximum;
    carousel.pagination.replaceChildren();

    for (let index = 0; index <= maximum; index += 1) {
      const dot = document.createElement("button");
      dot.className = "blog-page-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Show ${carousel.itemLabel} ${index + 1}`);
      dot.addEventListener("click", () => goToCarouselPost(carousel, index));
      carousel.pagination.append(dot);
    }
  }

  for (const [index, dot] of Array.from(carousel.pagination.children).entries()) {
    dot.hidden = Math.abs(index - carousel.activeIndex) > 2;
    dot.setAttribute("aria-current", String(index === carousel.activeIndex));
  }
}

function renderCarousel(carousel, posts) {
  carousel.posts = posts;
  carousel.track.replaceChildren(...posts.map((post, index) => makeBlogCard(post, index, posts.length)));
  carousel.container.setAttribute("aria-busy", "false");
  carousel.status.hidden = true;
  updateCarousel(carousel);
}

function showCarouselError(carousel, message) {
  carousel.status.hidden = false;
  carousel.status.dataset.state = "error";
  carousel.status.textContent = message;
  carousel.previous.disabled = true;
  carousel.next.disabled = true;
  carousel.container.setAttribute("aria-busy", "false");
}

function normalizeBlogPosts(entries) {
  const posts = [];

  for (const entry of entries) {
    const title = entry.title?.$t?.trim();
    const alternateLink = entry.link?.find((link) => link.rel === "alternate")?.href;

    if (!title || !alternateLink) {
      continue;
    }

    const url = new URL(alternateLink);
    if (url.protocol !== "https:" || url.hostname !== "p2here.blogspot.com") {
      continue;
    }

    const publishedAt = entry.published?.$t;
    if (!publishedAt || Number.isNaN(new Date(publishedAt).getTime())) {
      continue;
    }

    const content = entry.content?.$t || entry.summary?.$t || "";
    const excerpt = plainText(content).slice(0, 180);
    const category = entry.category?.find((item) => item.term?.trim())?.term.trim() || "Writing";

    posts.push({ title, url: url.href, publishedAt, excerpt, category });
  }

  return posts;
}

function loadBlogPosts() {
  const callbackName =
    `__bloggerFeed_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const request = document.createElement("script");
  const feedUrl = new URL("https://p2here.blogspot.com/feeds/posts/default");
  let settled = false;

  function finishRequest() {
    if (settled) {
      return;
    }

    settled = true;
    window.clearTimeout(timeout);
    request.remove();
    delete globalThis[callbackName];
  }

  globalThis[callbackName] = (payload) => {
    const entries = payload?.feed?.entry;
    if (!Array.isArray(entries)) {
      finishRequest();
      showCarouselError(
        blogCarousel,
        "The blog feed returned an unexpected response. Visit the blog directly.",
      );
      return;
    }

    const posts = normalizeBlogPosts(entries);
    if (posts.length === 0) {
      finishRequest();
      showCarouselError(blogCarousel, "No blog posts could be displayed. Visit the blog directly.");
      return;
    }

    renderCarousel(blogCarousel, posts);
    finishRequest();
  };

  feedUrl.search = new URLSearchParams({
    alt: "json-in-script",
    callback: callbackName,
    "max-results": "100",
    fields: "feed(entry(title,link,published,content,category))",
  });
  request.async = true;
  request.onerror = () => {
    finishRequest();
    showCarouselError(blogCarousel, "The blog feed could not be loaded. Visit the blog directly.");
  };
  request.src = feedUrl.href;

  const timeout = window.setTimeout(() => {
    finishRequest();
    showCarouselError(blogCarousel, "The blog feed took too long to respond. Visit the blog directly.");
  }, 15000);

  document.head.append(request);
}

themeToggle.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = nextTheme;
  window.localStorage.setItem("theme", nextTheme);
  updateThemeLabel();
});

for (const carousel of [blogCarousel, techieCarousel]) {
  carousel.previous.addEventListener("click", () =>
    goToCarouselPost(carousel, carousel.activeIndex - 1),
  );
  carousel.next.addEventListener("click", () =>
    goToCarouselPost(carousel, carousel.activeIndex + 1),
  );
  carousel.viewport.addEventListener("scroll", () => updateCarousel(carousel), { passive: true });
}

window.addEventListener("resize", () => {
  window.cancelAnimationFrame(blogResizeFrame);
  blogResizeFrame = window.requestAnimationFrame(() => {
    blogResizeFrame = window.requestAnimationFrame(() => {
      updateCarousel(blogCarousel);
      updateCarousel(techieCarousel);
    });
  });
});

currentYear.textContent = new Date().getFullYear();
updateThemeLabel();
updateLocalTime();
window.setInterval(updateLocalTime, 60_000);
renderCarousel(techieCarousel, techiePosts);
loadBlogPosts();
