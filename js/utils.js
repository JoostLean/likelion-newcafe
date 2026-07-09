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
