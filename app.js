const seedRecords = [
  {
    id: "seoul-bookshop",
    title: "골목 끝, 오래된 책방의 불빛",
    location: "서울 종로구",
    country: "대한민국",
    date: "2026.11.14",
    author: "동네기록자",
    category: "locality",
    summary: "삼십 년째 같은 자리를 지키는 작은 책방. 주인에게 책을 추천받고 골목 소식을 나누던 시간이 이 동네의 풍경이 되었습니다.",
    story: "퇴근길이면 자연스레 발걸음이 향하던 곳입니다. 새 책이 들어온 날에는 주인아저씨가 먼저 안부를 물었고, 책을 고르다 보면 어느새 동네의 소식도 함께 들었습니다. 간판은 조금 바랬지만 창문 너머 불빛은 오늘도 따뜻합니다.",
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=85",
    coords: [37.5729, 126.9794],
    likes: 24
  },
  {
    id: "busan-stairs",
    title: "바다를 향해 이어지는 계단",
    location: "부산 영도구",
    country: "대한민국",
    date: "2026.11.09",
    author: "파도소리",
    category: "community",
    summary: "언덕 위 이웃들이 매일 오르내리는 계단. 잠깐 쉬어 가는 의자와 서로 건네는 인사가 이 길을 특별하게 만듭니다.",
    story: "계단 중간에 놓인 작은 의자는 누가 처음 가져다 놓았는지 아무도 모릅니다. 무거운 장바구니를 든 이웃은 그곳에서 숨을 고르고, 지나가던 사람은 자연스럽게 안부를 묻습니다. 바다가 보이는 이 길에는 오래된 인사말이 쌓여 있습니다.",
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=85",
    coords: [35.0912, 129.0678],
    likes: 18
  },
  {
    id: "seoul-repair",
    title: "고장 난 물건을 고쳐주는 손",
    location: "서울 성북구",
    country: "대한민국",
    date: "2026.11.02",
    author: "수선하는마음",
    category: "everyday",
    summary: "동네에서 오래 운영된 수선집. 버려질 뻔한 의자와 우산, 오래 입은 옷에 새 시간을 건네는 곳입니다.",
    story: "망가진 물건을 들고 가면 사장님은 어디가 불편한지부터 천천히 물어봅니다. 새것을 사는 일보다 고쳐 쓰는 일이 더 자연스러웠던 시절의 감각을, 이 작은 가게가 지금까지 이어주고 있습니다.",
    image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=85",
    coords: [37.5894, 127.0167],
    likes: 12
  },
  {
    id: "busan-market",
    title: "시장 골목에 남은 아침 인사",
    location: "부산 중구",
    country: "대한민국",
    date: "2026.10.28",
    author: "아침산책",
    category: "community",
    summary: "문을 여는 가게마다 서로의 안부를 묻는 시장 골목. 물건을 사고파는 일 너머에 이웃의 하루가 이어집니다.",
    story: "아침 일찍 시장을 지나면 가게마다 문을 여는 소리가 들립니다. 단골에게는 늘 같은 자리를 남겨 두고, 서로의 가족 소식을 기억해 줍니다. 이 골목은 물건뿐 아니라 마음도 주고받는 곳입니다.",
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=85",
    coords: [35.1051, 129.0276],
    likes: 9
  }
];

const storageKeys = {
  records: "mumyeong-records-v1",
  likes: "mumyeong-likes-v1"
};
const categoryNames = {
  locality: "동네의 결",
  community: "함께의 흔적",
  everyday: "일상의 풍경"
};
const categoryDescriptions = {
  locality: "장소와 지역의 이야기",
  community: "사람과 공동체의 기억",
  everyday: "생활 속 사물과 습관"
};
const imageFallback = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=85";
let userRecords = loadStoredRecords();
let likedRecords = loadLikedRecords();
let noticeTimer;
let mapInstance;
let mapMarkers = [];
let currentMapFilter = "all";

function readStorage(key, fallback, validator) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const value = JSON.parse(raw);
    return validator(value) ? value : fallback;
  } catch (error) {
    console.error(`저장된 데이터(${key})를 읽지 못했습니다.`, error);
    return fallback;
  }
}

function loadStoredRecords() {
  return readStorage(storageKeys.records, [], value => Array.isArray(value));
}

function loadLikedRecords() {
  return readStorage(storageKeys.likes, [], value => Array.isArray(value) && value.every(id => typeof id === "string"));
}

function getRecords() {
  return [...userRecords, ...seedRecords];
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function formatLocation(record) {
  return `${record.location} · ${record.country || "대한민국"}`;
}

function safeImageUrl(value) {
  try {
    const url = new URL(value, window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : imageFallback;
  } catch {
    return imageFallback;
  }
}

function makeCard(record, featured = false) {
  const article = element("article", featured ? "feature-card" : "archive-card");
  const openButton = element("button", "card-open");
  openButton.type = "button";
  openButton.setAttribute("aria-label", `${record.title} 기록 자세히 보기`);
  openButton.addEventListener("click", () => openDetail(record.id));

  const imageWrap = element("div", "card-image");
  const image = document.createElement("img");
  image.src = safeImageUrl(record.image);
  image.alt = `${record.location} 풍경`;
  image.loading = "lazy";
  image.addEventListener("error", () => { image.src = imageFallback; }, { once: true });
  imageWrap.append(image, element("span", "country-chip", record.country || "대한민국"));

  const body = element("div", "card-body");
  const meta = element("div", "meta-row");
  meta.append(element("span", "location", `⌖ ${record.location}`), element("time", "", record.date));
  const title = element("h3", "card-title", record.title);
  const summary = element("p", "card-summary", record.summary);
  const byline = element("div", "byline", `✳ ${record.author || "익명"} · ${categoryNames[record.category] || "기록"}`);
  body.append(meta, title, summary, byline);
  openButton.append(imageWrap, body);

  const actions = element("div", "card-actions");
  const likes = element("span", "action-btn");
  likes.append(element("span", "icon", "♡"), document.createTextNode(` ${record.likes || 0}`));
  const saveButton = element("button", "save-btn", likedRecords.includes(record.id) ? "저장됨 ✓" : "기억하기 ♡");
  saveButton.type = "button";
  saveButton.setAttribute("aria-pressed", String(likedRecords.includes(record.id)));
  saveButton.addEventListener("click", () => toggleLike(record.id));
  actions.append(likes, saveButton);

  article.append(openButton, actions);
  return article;
}

function renderHome() {
  const featuredGrid = document.querySelector("#featuredGrid");
  featuredGrid.replaceChildren(...getRecords().slice(0, 2).map(record => makeCard(record, true)));
}

function renderArchive() {
  const search = document.querySelector("#searchInput").value.trim().toLocaleLowerCase("ko");
  const category = document.querySelector("#categoryFilter").value;
  const sort = document.querySelector("#sortFilter").value;
  let records = getRecords().filter(record => {
    const searchable = `${record.title} ${record.location} ${record.summary} ${record.story}`.toLocaleLowerCase("ko");
    return (!search || searchable.includes(search)) && (!category || record.category === category);
  });
  if (sort === "popular") records = records.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  else records = records.sort((a, b) => b.date.localeCompare(a.date));

  document.querySelector("#recordCount").textContent = String(records.length);
  const grid = document.querySelector("#archiveGrid");
  if (!records.length) {
    const empty = element("div", "future-empty");
    empty.append(element("span", "", "⌕"), element("h3", "", "검색 결과가 없습니다"), element("p", "", "다른 검색어나 주제로 다시 찾아보세요."));
    grid.replaceChildren(empty);
    return;
  }
  grid.replaceChildren(...records.map(record => makeCard(record)));
}

function renderMapEntries() {
  const records = getRecords().filter(record => currentMapFilter === "all" || record.location.includes(currentMapFilter));
  const entries = document.querySelector("#mapEntries");
  entries.replaceChildren();
  records.forEach(record => {
    const entry = element("article", "map-entry");
    const title = element("h4", "", record.title);
    const location = element("p", "", formatLocation(record));
    const open = element("button", "map-popup-open", "이야기 보기");
    open.type = "button";
    open.addEventListener("click", () => openDetail(record.id));
    entry.append(title, location, open);
    entries.append(entry);
  });
  updateMapMarkers(records);
}

function showNotice(message, state = "success") {
  const notice = document.querySelector("#appNotice");
  notice.textContent = message;
  notice.dataset.state = state;
  notice.classList.add("visible");
  window.clearTimeout(noticeTimer);
  noticeTimer = window.setTimeout(() => notice.classList.remove("visible"), 3600);
}

function saveLikes() {
  try {
    localStorage.setItem(storageKeys.likes, JSON.stringify(likedRecords));
    return true;
  } catch (error) {
    console.error("기억한 기록을 저장하지 못했습니다.", error);
    showNotice("브라우저에 기록을 저장하지 못했어요. 저장 공간을 확인해 주세요.", "error");
    return false;
  }
}

function toggleLike(id) {
  const previous = likedRecords;
  likedRecords = likedRecords.includes(id)
    ? likedRecords.filter(recordId => recordId !== id)
    : [...likedRecords, id];
  if (!saveLikes()) {
    likedRecords = previous;
    return;
  }
  renderHome();
  renderArchive();
  showNotice(likedRecords.includes(id) ? "이 기록을 기억 목록에 담았어요." : "기억 목록에서 기록을 뺐어요.");
}

function openModal(modal) {
  modal.classList.add("visible");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  const focusable = modal.querySelector("input, textarea, select, button");
  if (focusable) focusable.focus();
}

function closeModals() {
  document.querySelectorAll(".modal.visible").forEach(modal => {
    modal.classList.remove("visible");
    modal.setAttribute("aria-hidden", "true");
  });
  document.body.style.overflow = "";
}

function appendDetailSection(container, heading, content) {
  const section = element("section", "detail-section");
  section.append(element("h4", "", heading), element("p", "detail-body", content));
  container.append(section);
}

function openDetail(id) {
  const record = getRecords().find(item => item.id === id);
  if (!record) {
    showNotice("기록을 찾을 수 없습니다.", "error");
    return;
  }
  const content = document.querySelector("#detailContent");
  content.replaceChildren();
  const header = element("div", "detail-header");
  const image = document.createElement("img");
  image.className = "detail-image";
  image.src = safeImageUrl(record.image);
  image.alt = `${record.location} 풍경`;
  image.addEventListener("error", () => { image.src = imageFallback; }, { once: true });
  const heading = element("h2", "detail-title", record.title);
  heading.id = "detailTitle";
  const meta = element("div", "detail-meta", `${formatLocation(record)} · ${record.date} · ${record.author || "익명"}`);
  header.append(image, heading, meta);
  content.append(header);
  appendDetailSection(content, "기록 이야기", record.story || record.summary);
  const meaning = element("section", "detail-section");
  meaning.append(element("h4", "", "이 기억의 의미"));
  const tags = element("div", "detail-criteria");
  tags.append(element("span", `criterion-tag ${record.category}`, categoryNames[record.category] || "기록"));
  meaning.append(tags, element("p", `detail-reason ${record.category}`, categoryDescriptions[record.category] || "우리의 일상에 남은 기억입니다."));
  content.append(meaning);
  const actions = element("div", "detail-actions");
  const save = element("button", "save-btn", likedRecords.includes(id) ? "저장됨 ✓" : "기억하기 ♡");
  save.type = "button";
  save.addEventListener("click", () => {
    toggleLike(id);
    save.textContent = likedRecords.includes(id) ? "저장됨 ✓" : "기억하기 ♡";
  });
  actions.append(save);
  content.append(actions);
  openModal(document.querySelector("#detailModal"));
}

function switchPage(name) {
  const pages = {
    home: document.querySelector("#homePage"),
    archive: document.querySelector("#archivePage"),
    map: document.querySelector("#mapPage")
  };
  if (!pages[name]) return;
  Object.entries(pages).forEach(([key, page]) => page.classList.toggle("active", key === name));
  document.querySelectorAll("[data-page-link]").forEach(button => {
    const active = button.dataset.pageLink === name;
    if (button.classList.contains("nav-btn")) {
      button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    }
  });
  if (name === "archive") renderArchive();
  if (name === "map") {
    initializeMap();
    renderMapEntries();
    if (mapInstance) window.setTimeout(() => mapInstance.invalidateSize(), 100);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function initializeMap() {
  if (mapInstance || !window.L) return;
  const mapElement = document.querySelector("#map");
  try {
    mapInstance = window.L.map(mapElement, { scrollWheelZoom: false }).setView([36.4, 127.8], 7);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(mapInstance);
    mapElement.querySelector(".map-fallback")?.remove();
  } catch (error) {
    console.error("지도를 불러오지 못했습니다.", error);
    mapInstance = null;
    showNotice("지도를 불러오지 못했어요. 오른쪽 목록에서 기록을 살펴볼 수 있습니다.", "local");
  }
}

function updateMapMarkers(records) {
  if (!mapInstance || !window.L) return;
  mapMarkers.forEach(marker => marker.remove());
  mapMarkers = records.filter(record => Array.isArray(record.coords)).map(record => {
    const marker = window.L.marker(record.coords).addTo(mapInstance);
    marker.bindPopup(`<strong>${escapeHtml(record.title)}</strong><br>${escapeHtml(record.location)}<br><button class="map-popup-open" type="button" data-record-id="${escapeHtml(record.id)}">기록 보기</button>`);
    marker.on("popupopen", event => {
      const button = event.popup.getElement().querySelector("[data-record-id]");
      button?.addEventListener("click", () => openDetail(record.id));
    });
    return marker;
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function saveRecord(record) {
  const nextRecords = [record, ...userRecords];
  try {
    localStorage.setItem(storageKeys.records, JSON.stringify(nextRecords));
    userRecords = nextRecords;
    return true;
  } catch (error) {
    console.error("기록을 저장하지 못했습니다.", error);
    showNotice("기록을 저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.", "error");
    return false;
  }
}

document.querySelectorAll("[data-page-link]").forEach(button => {
  button.addEventListener("click", event => {
    event.preventDefault();
    switchPage(button.dataset.pageLink);
  });
});

document.querySelectorAll("[data-open-write]").forEach(button => {
  button.addEventListener("click", () => openModal(document.querySelector("#writeModal")));
});

document.querySelectorAll("[data-close-modal]").forEach(button => {
  button.addEventListener("click", closeModals);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModals();
});

document.querySelector("#searchInput").addEventListener("input", renderArchive);
document.querySelector("#categoryFilter").addEventListener("change", renderArchive);
document.querySelector("#sortFilter").addEventListener("change", renderArchive);

document.querySelector("#mapFilters").addEventListener("click", event => {
  const button = event.target.closest("[data-map-filter]");
  if (!button) return;
  currentMapFilter = button.dataset.mapFilter;
  document.querySelectorAll("[data-map-filter]").forEach(filter => filter.classList.toggle("active", filter === button));
  renderMapEntries();
});

document.querySelector("#recordForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const values = new FormData(form);
  const imageValue = String(values.get("image") || "").trim();
  const record = {
    id: `record-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: String(values.get("title")).trim(),
    location: String(values.get("location")).trim(),
    country: "대한민국",
    date: new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()).replaceAll(" ", "").replaceAll(". ", ".").replace(/\.$/, ""),
    author: String(values.get("author")).trim() || "익명",
    category: String(values.get("category")),
    summary: String(values.get("story")).trim(),
    story: String(values.get("story")).trim(),
    image: imageValue ? safeImageUrl(imageValue) : imageFallback,
    coords: null,
    likes: 0
  };
  if (!saveRecord(record)) return;
  form.reset();
  form.elements.author.value = "익명";
  closeModals();
  renderHome();
  renderArchive();
  renderMapEntries();
  showNotice("소중한 기록을 아카이브에 남겼어요.");
  switchPage("archive");
});

renderHome();
renderArchive();
