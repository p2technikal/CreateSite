const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const localTime = document.querySelector("#local-time");
const currentYear = document.querySelector("#current-year");
const blogCarousel = document.querySelector("#blog-carousel");
const blogViewport = document.querySelector("#blog-viewport");
const blogTrack = document.querySelector("#blog-track");
const blogStatus = document.querySelector("#blog-status");
const blogPagination = document.querySelector("#blog-pagination");
const blogPrevious = document.querySelector("#blog-previous");
const blogNext = document.querySelector("#blog-next");
const savedTheme = window.localStorage.getItem("theme");
const blogDateFormatter = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Melbourne",
  day: "numeric",
  month: "short",
  year: "numeric",
});

let blogPosts = [];
let activeBlogIndex = 0;
let paginationMaxIndex = -1;
let blogResizeFrame = 0;
let blogLayoutVisibleSlides = 0;

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

function visibleBlogSlides() {
  if (window.matchMedia("(max-width: 560px)").matches) {
    return 1;
  }

  if (window.matchMedia("(max-width: 760px)").matches) {
    return 2;
  }

  return 3;
}

function maximumBlogIndex() {
  return Math.max(0, blogPosts.length - visibleBlogSlides());
}

function updateBlogSlideLayout() {
  const visibleSlides = visibleBlogSlides();
  if (visibleSlides === blogLayoutVisibleSlides) {
    return;
  }

  blogLayoutVisibleSlides = visibleSlides;
  const basis =
    visibleSlides === 1
      ? "100%"
      : visibleSlides === 2
        ? "calc((100% - 16px) / 2)"
        : "calc((100% - 32px) / 3)";

  for (const slide of blogTrack.children) {
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

function makeBlogCard(post, index) {
  const item = document.createElement("li");
  item.className = "blog-slide";
  item.setAttribute("aria-roledescription", "slide");
  item.setAttribute("aria-label", `${index + 1} of ${blogPosts.length}`);

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

  const date = document.createElement("time");
  date.className = "blog-card-date";
  date.dateTime = post.publishedAt;
  date.textContent = blogDateFormatter.format(new Date(post.publishedAt));

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

function goToBlogPost(index) {
  const maximum = maximumBlogIndex();
  if (maximum === 0) {
    return;
  }

  const target = (index + maximum + 1) % (maximum + 1);
  const firstSlide = blogTrack.querySelector(".blog-slide");
  const slideGap = Number.parseFloat(window.getComputedStyle(blogTrack).columnGap) || 0;
  const stride = firstSlide.getBoundingClientRect().width + slideGap;
  if (!Number.isFinite(stride) || stride <= 0) {
    return;
  }
  const targetScrollLeft = target * stride;

  if (Math.abs(blogViewport.scrollLeft - targetScrollLeft) < 2) {
    updateBlogCarousel(target);
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  blogViewport.scrollTo({
    left: targetScrollLeft,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
  updateBlogCarousel(target);
}

function updateBlogCarousel(requestedIndex) {
  if (blogPosts.length === 0) {
    return;
  }

  updateBlogSlideLayout();
  const maximum = maximumBlogIndex();
  const firstSlide = blogTrack.querySelector(".blog-slide");
  const slideGap = Number.parseFloat(window.getComputedStyle(blogTrack).columnGap) || 0;
  const stride = firstSlide.getBoundingClientRect().width + slideGap;
  if (!Number.isFinite(stride) || stride <= 0) {
    return;
  }

  activeBlogIndex =
    requestedIndex === undefined
      ? Math.min(maximum, Math.max(0, Math.round(blogViewport.scrollLeft / stride)))
      : Math.min(maximum, Math.max(0, requestedIndex));
  blogPrevious.disabled = maximum === 0;
  blogNext.disabled = maximum === 0;

  if (paginationMaxIndex !== maximum) {
    paginationMaxIndex = maximum;
    blogPagination.replaceChildren();

    for (let index = 0; index <= maximum; index += 1) {
      const dot = document.createElement("button");
      dot.className = "blog-page-dot";
      dot.type = "button";
      dot.addEventListener("click", () => goToBlogPost(index));
      blogPagination.append(dot);
    }
  }

  for (const [index, dot] of Array.from(blogPagination.children).entries()) {
    dot.hidden = Math.abs(index - activeBlogIndex) > 2;
    dot.setAttribute("aria-label", `Show blog post ${index + 1}`);
    dot.setAttribute("aria-current", String(index === activeBlogIndex));
  }
}

function showBlogError(message) {
  blogStatus.hidden = false;
  blogStatus.dataset.state = "error";
  blogStatus.textContent = message;
  blogPrevious.disabled = true;
  blogNext.disabled = true;
  blogCarousel.setAttribute("aria-busy", "false");
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
      showBlogError("The blog feed returned an unexpected response. Visit the blog directly.");
      return;
    }

    blogPosts = normalizeBlogPosts(entries);
    if (blogPosts.length === 0) {
      finishRequest();
      showBlogError("No blog posts could be displayed. Visit the blog directly.");
      return;
    }

    blogTrack.replaceChildren(...blogPosts.map(makeBlogCard));
    blogCarousel.setAttribute("aria-busy", "false");
    blogStatus.textContent = "";
    blogStatus.hidden = true;
    updateBlogCarousel();
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
    showBlogError("The blog feed could not be loaded. Visit the blog directly.");
  };
  request.src = feedUrl.href;

  const timeout = window.setTimeout(() => {
    finishRequest();
    showBlogError("The blog feed took too long to respond. Visit the blog directly.");
  }, 15000);

  document.head.append(request);
}

themeToggle.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = nextTheme;
  window.localStorage.setItem("theme", nextTheme);
  updateThemeLabel();
});

blogPrevious.addEventListener("click", () => goToBlogPost(activeBlogIndex - 1));
blogNext.addEventListener("click", () => goToBlogPost(activeBlogIndex + 1));
blogViewport.addEventListener("scroll", () => updateBlogCarousel(), { passive: true });
window.addEventListener("resize", () => {
  window.cancelAnimationFrame(blogResizeFrame);
  blogResizeFrame = window.requestAnimationFrame(() => {
    blogResizeFrame = window.requestAnimationFrame(() => updateBlogCarousel());
  });
});

currentYear.textContent = new Date().getFullYear();
updateThemeLabel();
updateLocalTime();
window.setInterval(updateLocalTime, 60_000);
loadBlogPosts();
