/* ============================================
   관리자 · 대시보드 로직
   ============================================ */

function isToday(timestamp) {
  const d = new Date(timestamp);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/** 통계 카드 렌더링 */
function renderStats() {
  const orders = OrderStore.getAll();
  const menus = MenuStore.getAll();

  const todayOrders = orders.filter((o) => isToday(o.createdAt));
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const totalSales = orders
    .filter((o) => o.status !== "canceled")
    .reduce((sum, o) => sum + o.total, 0);

  $("#stat-today-orders").textContent = todayOrders.length;
  $("#stat-pending-orders").textContent = pendingOrders.length;
  $("#stat-total-sales").textContent = formatPrice(totalSales);
  $("#stat-menu-count").textContent = menus.length;
}

/** 최근 주문 목록 렌더링 (최신 5건) */
function renderRecentOrders() {
  const container = $("#recent-orders");
  const orders = OrderStore.getAll().slice(0, 5);

  if (orders.length === 0) {
    container.innerHTML = `<p class="dashboard-empty text-muted">아직 주문이 없습니다.</p>`;
    return;
  }

  container.innerHTML = orders
    .map((order) => {
      const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
      return `
      <a href="orders/detail?id=${order.id}" class="recent-order-row">
        <span class="recent-order-id">#${order.id}</span>
        <span class="recent-order-date text-muted">${formatDate(order.createdAt)}</span>
        <span class="order-status" style="background:${status.color}">${status.label}</span>
        <span class="recent-order-total">${formatPrice(order.total)}</span>
      </a>`;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  MenuStore.init();
  renderStats();
  renderRecentOrders();
});
