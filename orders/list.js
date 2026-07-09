/* ============================================
   주문 내역 목록 페이지 로직
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  Cart.subscribe(updateCartBadge);
  renderOrders();
});

function updateCartBadge(count) {
  const badge = $("#cart-count");
  if (badge) badge.textContent = count;
}

function renderOrders() {
  const container = $("#order-list");
  const orders = OrderStore.getAll();

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="text-muted">아직 주문 내역이 없습니다.</p>
        <a href="../menus/list" class="btn btn-primary">메뉴 보러가기</a>
      </div>`;
    return;
  }

  container.innerHTML = orders
    .map((order) => {
      const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
      const [firstItem, ...rest] = order.items;
      const summary = rest.length > 0
        ? `${escapeHtml(firstItem.name)} 외 ${rest.length}건`
        : escapeHtml(firstItem.name);

      return `
      <a href="detail?id=${order.id}" class="order-card card">
        <div class="order-card-header">
          <span class="order-id">주문번호 ${order.id}</span>
          <span class="order-status-badge" style="background:${status.color}">${status.label}</span>
        </div>
        <p class="order-date text-muted">${formatDate(order.createdAt)}</p>
        <p class="order-summary">${summary}</p>
        <p class="order-total">${formatPrice(order.total)}</p>
      </a>`;
    })
    .join("");
}
