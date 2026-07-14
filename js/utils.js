/* ============================================
   공통 유틸리티
   - 포맷 헬퍼
   - 장바구니(Cart) 관리
   - 주문(Order) 관리
   - DOM/쿼리 헬퍼
   ============================================ */

/* ---------- 포맷 ---------- */

/** 숫자를 "4,000원" 형태로 포맷 */
function formatPrice(value) {
  return `${Number(value).toLocaleString("ko-KR")}원`;
}

/** Date/타임스탬프를 "2026.07.06 14:30" 형태로 포맷 */
function formatDate(value) {
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

/* ---------- DOM 헬퍼 ---------- */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/** HTML 특수문자 이스케이프 (XSS 방지) */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** URL 쿼리스트링 파라미터 조회 */
function getQueryParam(key) {
  return new URLSearchParams(location.search).get(key);
}

/* ---------- 다크 모드(Theme) ---------- */

const THEME_STORAGE_KEY = "cafe.theme";

const ThemeStore = {
  get() {
    return localStorage.getItem(THEME_STORAGE_KEY) || "light";
  },

  set(theme) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
  },

  toggle() {
    this.set(this.get() === "dark" ? "light" : "dark");
  },
};

/** 페이지 내 모든 .theme-toggle 버튼을 현재 테마에 맞게 초기화하고 클릭 바인딩 */
function initThemeToggle() {
  document.documentElement.setAttribute("data-theme", ThemeStore.get());

  const updateIcon = (btn, theme) => {
    btn.textContent = theme === "dark" ? "☀️" : "🌙";
    btn.setAttribute(
      "aria-label",
      theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"
    );
  };

  $$(".theme-toggle").forEach((btn) => {
    updateIcon(btn, ThemeStore.get());
    btn.addEventListener("click", () => {
      ThemeStore.toggle();
      $$(".theme-toggle").forEach((b) => updateIcon(b, ThemeStore.get()));
    });
  });
}

document.addEventListener("DOMContentLoaded", initThemeToggle);

/* ---------- 최근 본 메뉴(Recent) ---------- */

const RECENT_STORAGE_KEY = "cafe.recent";
const RECENT_MAX = 8;

const RecentStore = {
  /** 최근 본 메뉴 id 배열 (최신순) */
  getIds() {
    try {
      return JSON.parse(localStorage.getItem(RECENT_STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  },

  /** 메뉴를 "최근 본" 맨 앞에 기록 (중복 제거, 최대 RECENT_MAX개 유지) */
  add(menuId) {
    menuId = Number(menuId);
    let ids = this.getIds().filter((id) => id !== menuId);
    ids.unshift(menuId);
    localStorage.setItem(
      RECENT_STORAGE_KEY,
      JSON.stringify(ids.slice(0, RECENT_MAX))
    );
  },

  /** 최근 본 메뉴 객체 배열 (삭제된 메뉴는 자동 제외, excludeId는 목록에서 제외) */
  getMenus(excludeId) {
    return this.getIds()
      .filter((id) => id !== Number(excludeId))
      .map((id) => MenuStore.getById(id))
      .filter(Boolean);
  },
};

/**
 * "최근 본 메뉴" 가로 스크롤 위젯 렌더링
 * sectionEl: 위젯 전체를 감싸는 요소 (메뉴가 없으면 hidden 처리)
 * scrollEl: 카드가 채워질 스크롤 컨테이너
 * options.hrefPrefix: 상세 페이지 링크 접두사 (menus/ 폴더 기준 상대경로)
 * options.excludeId: 목록에서 제외할 메뉴 id (상세 페이지 자기 자신)
 */
function renderRecentWidget(sectionEl, scrollEl, options = {}) {
  if (!sectionEl || !scrollEl) return;
  const { hrefPrefix = "", excludeId } = options;
  const menus = RecentStore.getMenus(excludeId);

  if (menus.length === 0) {
    sectionEl.hidden = true;
    return;
  }

  sectionEl.hidden = false;
  scrollEl.innerHTML = menus
    .map(
      (menu) => `
      <a href="${hrefPrefix}detail?id=${menu.id}" class="recent-card">
        <div class="recent-card-image" style="background-image:url('${menu.image}')"></div>
        <p class="recent-card-name">${escapeHtml(menu.name)}</p>
        <p class="recent-card-price">${formatPrice(menu.price)}</p>
      </a>`
    )
    .join("");
}

/* ---------- 장바구니 담기 애니메이션 ---------- */

/** 담기 버튼에서 헤더 장바구니 아이콘으로 아이콘이 날아가는 연출 */
function flyToCart(originEl) {
  const target = $(".cart-link");
  if (!originEl || !target) return;

  const from = originEl.getBoundingClientRect();
  const to = target.getBoundingClientRect();

  const flyer = document.createElement("div");
  flyer.textContent = "☕";
  flyer.style.cssText = [
    "position:fixed",
    `left:${from.left + from.width / 2 - 12}px`,
    `top:${from.top + from.height / 2 - 12}px`,
    "width:24px",
    "height:24px",
    "font-size:20px",
    "line-height:24px",
    "text-align:center",
    "z-index:9999",
    "pointer-events:none",
    "transition:transform .55s cubic-bezier(.3,-0.4,.7,1.4), opacity .55s ease .15s",
    "will-change:transform,opacity",
  ].join(";");
  document.body.appendChild(flyer);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);

  requestAnimationFrame(() => {
    flyer.style.transform = `translate(${dx}px, ${dy}px) scale(0.3)`;
    flyer.style.opacity = "0.2";
  });

  setTimeout(() => {
    flyer.remove();
    target.classList.add("cart-pop");
    setTimeout(() => target.classList.remove("cart-pop"), 350);
  }, 550);
}

/** 담기 버튼 클릭 시 바운스 + 장바구니로 날아가는 연출을 함께 재생 */
function celebrateAddToCart(btn) {
  if (!btn) return;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  btn.classList.add("btn-bounce");
  setTimeout(() => btn.classList.remove("btn-bounce"), 350);

  if (!reduceMotion) flyToCart(btn);
}

/* ---------- 장바구니(Cart) ---------- */

const CART_STORAGE_KEY = "cafe.cart";

const Cart = {
  /** 장바구니 항목 배열 반환: [{ menuId, qty }] */
  getItems() {
    try {
      return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  },

  _save(items) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    this._notify();
  },

  /** 장바구니에 추가 (이미 있으면 수량 증가) */
  add(menuId, qty = 1) {
    const items = this.getItems();
    const existing = items.find((i) => i.menuId === Number(menuId));
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ menuId: Number(menuId), qty });
    }
    this._save(items);
  },

  /** 특정 메뉴 수량 설정 (0 이하이면 제거) */
  setQty(menuId, qty) {
    let items = this.getItems();
    if (qty <= 0) {
      items = items.filter((i) => i.menuId !== Number(menuId));
    } else {
      const item = items.find((i) => i.menuId === Number(menuId));
      if (item) item.qty = qty;
    }
    this._save(items);
  },

  /** 특정 메뉴 제거 */
  remove(menuId) {
    this._save(this.getItems().filter((i) => i.menuId !== Number(menuId)));
  },

  /** 장바구니 비우기 */
  clear() {
    this._save([]);
  },

  /** 담긴 총 수량 */
  getCount() {
    return this.getItems().reduce((sum, i) => sum + i.qty, 0);
  },

  /**
   * 메뉴 정보와 결합한 상세 목록 반환:
   * [{ menuId, qty, menu, subtotal }]
   */
  getDetailedItems() {
    return this.getItems()
      .map((i) => {
        const menu = MenuStore.getById(i.menuId);
        if (!menu) return null;
        return { ...i, menu, subtotal: menu.price * i.qty };
      })
      .filter(Boolean);
  },

  /** 총 금액 */
  getTotal() {
    return this.getDetailedItems().reduce((sum, i) => sum + i.subtotal, 0);
  },

  /** 장바구니 변경 구독 (콜백은 count를 인자로 받음) */
  subscribe(callback) {
    this._listeners = this._listeners || [];
    this._listeners.push(callback);
    callback(this.getCount());
  },

  _notify() {
    (this._listeners || []).forEach((cb) => cb(this.getCount()));
  },
};

/* ---------- 주문(Order) ---------- */

const ORDER_STORAGE_KEY = "cafe.orders";

/** 주문 상태 정의 */
const ORDER_STATUS = {
  pending: { label: "접수 대기", color: "var(--color-warning)" },
  making: { label: "제조 중", color: "var(--color-accent)" },
  done: { label: "완료", color: "var(--color-success)" },
  canceled: { label: "취소됨", color: "var(--color-danger)" },
};

const OrderStore = {
  getAll() {
    try {
      return JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  },

  getById(id) {
    return this.getAll().find((o) => o.id === Number(id)) || null;
  },

  _save(orders) {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
  },

  /**
   * 장바구니 상세 항목으로 주문 생성 → 생성된 주문 반환
   * items: Cart.getDetailedItems() 결과
   */
  create(items, extra = {}) {
    const orders = this.getAll();
    const nextId = orders.reduce((max, o) => Math.max(max, o.id), 0) + 1;
    const order = {
      id: nextId,
      createdAt: Date.now(),
      status: "pending",
      items: items.map((i) => ({
        menuId: i.menuId,
        name: i.menu.name,
        price: i.menu.price,
        qty: i.qty,
      })),
      total: items.reduce((sum, i) => sum + i.subtotal, 0),
      ...extra,
    };
    orders.unshift(order);
    this._save(orders);
    return order;
  },

  /** 주문 상태 변경 */
  updateStatus(id, status) {
    const orders = this.getAll();
    const order = orders.find((o) => o.id === Number(id));
    if (!order) return null;
    order.status = status;
    this._save(orders);
    return order;
  },
};

/** 진행 순서가 있는 주문 상태 (취소됨은 별도 처리) */
const ORDER_TIMELINE_STEPS = ["pending", "making", "done"];

/** 주문 상태 진행 타임라인 HTML 생성 (부드럽게 채워지는 진행바 + 단계 표시) */
function renderStatusTimeline(status) {
  if (status === "canceled") {
    return `
      <div class="status-timeline status-timeline--canceled">
        <span class="status-timeline-canceled-dot"></span>
        <span>이 주문은 취소되었습니다.</span>
      </div>`;
  }

  const stepIndex = Math.max(ORDER_TIMELINE_STEPS.indexOf(status), 0);
  const fillPercent = (stepIndex / (ORDER_TIMELINE_STEPS.length - 1)) * 100;

  const steps = ORDER_TIMELINE_STEPS.map((key, i) => {
    const info = ORDER_STATUS[key];
    const state = i < stepIndex ? "is-done" : i === stepIndex ? "is-active" : "";
    return `
      <div class="status-timeline-step ${state}">
        <span class="status-timeline-dot"></span>
        <span class="status-timeline-label">${info.label}</span>
      </div>`;
  }).join("");

  return `
    <div class="status-timeline">
      <div class="status-timeline-track">
        <div class="status-timeline-fill" style="width:${fillPercent}%"></div>
      </div>
      <div class="status-timeline-steps">${steps}</div>
    </div>`;
}

/* ---------- 결제 수단(Payment) ---------- */

/**
 * 결제 수단 정의
 * ⚠️ 실제 PG(결제대행사) 연동이 아닌 UI/UX 시뮬레이션용 mock 데이터입니다.
 *    카드 입력폼 검증, 토스페이/카카오페이 결제 처리 모두 실제 외부 연동 없이
 *    화면 전환/로딩 연출만으로 결제 흐름을 흉내냅니다.
 */
const PAYMENT_METHODS = {
  card: { label: "신용카드", icon: "💳" },
  tosspay: { label: "토스페이", icon: "🔷" },
  kakaopay: { label: "카카오페이", icon: "💛" },
};

/** 주문의 결제 수단 정보 반환 (결제 수단 필드가 없는 이전 주문은 기본값 처리) */
function getPaymentMethodInfo(order) {
  return PAYMENT_METHODS[order.paymentMethod] || { label: "정보 없음", icon: "❔" };
}

/* ---------- 토스트 알림 ---------- */

/** 화면 하단에 잠깐 뜨는 토스트 메시지 */
function showToast(message, duration = 2000) {
  let container = $("#toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.cssText =
      "position:fixed;left:50%;bottom:32px;transform:translateX(-50%);" +
      "z-index:9999;display:flex;flex-direction:column;gap:8px;align-items:center;";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText =
    "background:var(--color-text);color:var(--color-text-inverse);padding:12px 20px;" +
    "border-radius:var(--radius-full);font-size:0.9rem;font-weight:600;" +
    "box-shadow:var(--shadow-lg);opacity:0;transform:translateY(8px);" +
    "transition:opacity .25s ease,transform .25s ease;";
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
    setTimeout(() => toast.remove(), 250);
  }, duration);
}
