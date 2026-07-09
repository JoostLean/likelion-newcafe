/* ============================================
   관리자 · 주문 목록 로직
   ============================================ */

let currentStatus = "all";

const STATUS_FILTERS = [
  { id: "all", label: "전체" },
  { id: "pending", label: ORDER_STATUS.pending.label },
  { id: "making", label: ORDER_STATUS.making.label },
  { id: "done", label: ORDER_STATUS.done.label },
  { id: "canceled", label: ORDER_STATUS.canceled.label },
];

/** 다음 단계로 진행할 상태 (더 진행할 단계가 없으면 없음) */
const NEXT_STATUS = { pending: "making", making: "done" };

/** 상태 필터 탭 렌더링 */
function renderFilter() {
  const filter = $("#status-filter");

  filter.innerHTML = STATUS_FILTERS.map(
    (s) => `
      <button class="filter-tab ${s.id === currentStatus ? "is-active" : ""}" data-status="${s.id}">
        ${escapeHtml(s.label)}
      </button>`
  ).join("");

  $$(".filter-tab", filter).forEach((tab) => {
    tab.addEventListener("click", () => {
      currentStatus = tab.dataset.status;
      renderFilter();
      renderOrders();
    });
  });
}

/** 주문 목록 렌더링 */
function renderOrders() {
  const list = $("#orders-list");
  const empty = $("#orders-empty");
  const all = OrderStore.getAll();
  const orders =
    currentStatus === "all" ? all : all.filter((o) => o.status === currentStatus);

  $("#order-count").textContent = orders.length;

  if (orders.length === 0) {
    list.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  list.innerHTML = orders
    .map((order) => {
      const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
      const [firstItem, ...rest] = order.items;
      const summary =
        rest.length > 0
          ? `${escapeHtml(firstItem.name)} 외 ${rest.length}건`
          : escapeHtml(firstItem.name);
      const next = NEXT_STATUS[order.status];
      const cancelable = order.status !== "canceled" && order.status !== "done";

      return `
      <article class="order-row card">
        <a href="detail?id=${order.id}" class="order-row__main">
          <span class="order-row__id">#${order.id}</span>
          <span class="order-row__date text-muted">${formatDate(order.createdAt)}</span>
          <span class="order-row__summary">${summary}</span>
          <span class="order-row__total">${formatPrice(order.total)}</span>
        </a>
        <div class="order-row__side">
          <span class="order-status" style="background:${status.color}">${status.label}</span>
          <div class="order-row__actions">
            ${next ? `<button class="btn btn-outline" data-advance="${order.id}">${ORDER_STATUS[next].label}로 변경</button>` : ""}
            ${cancelable ? `<button class="btn btn-danger" data-cancel="${order.id}">취소</button>` : ""}
          </div>
        </div>
      </article>`;
    })
    .join("");

  $$("[data-advance]", list).forEach((btn) => {
    btn.addEventListener("click", () => {
      const order = OrderStore.getById(btn.dataset.advance);
      const next = order && NEXT_STATUS[order.status];
      if (!next) return;
      OrderStore.updateStatus(order.id, next);
      showToast(`주문 #${order.id} 상태를 "${ORDER_STATUS[next].label}"(으)로 변경했습니다.`);
      renderOrders();
    });
  });

  $$("[data-cancel]", list).forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!confirm(`주문 #${btn.dataset.cancel}을 취소할까요?`)) return;
      OrderStore.updateStatus(btn.dataset.cancel, "canceled");
      showToast("주문을 취소했습니다.");
      renderOrders();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderFilter();
  renderOrders();
});
