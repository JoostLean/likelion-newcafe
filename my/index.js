/* ============================================
   마이페이지 로직
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  MenuStore.init();
  Cart.subscribe(updateCartBadge);
  renderSummary();
  renderRecentOrders();
});

function updateCartBadge(count) {
  const badge = $("#cart-count");
  if (badge) badge.textContent = count;
}

function renderSummary() {
  const orders = OrderStore.getAll();
  const totalSpent = orders
    .filter((o) => o.status !== "canceled")
    .reduce((sum, o) => sum + o.total, 0);

  $("#my-order-count").textContent = `${orders.length}건`;
  $("#my-total-spent").textContent = formatPrice(totalSpent);
}

function renderRecentOrders() {
  const container = $("#my-recent-orders");
  const orders = OrderStore.getAll().slice(0, 3);

  if (orders.length === 0) {
    container.innerHTML = `<p class="empty-state text-muted">아직 주문 내역이 없습니다.</p>`;
    return;
  }

  container.innerHTML = orders
    .map((order) => {
      const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
      const [firstItem, ...rest] = order.items;
      const summary =
        rest.length > 0
          ? `${escapeHtml(firstItem.name)} 외 ${rest.length}건`
          : escapeHtml(firstItem.name);

      return `
      <a href="../orders/detail?id=${order.id}" class="my-order-row">
        <div class="my-order-row-main">
          <span class="my-order-row-id">주문번호 ${order.id}</span>
          <span class="my-order-row-summary text-muted">${summary}</span>
        </div>
        <span class="order-status" style="background:${status.color}">${status.label}</span>
        <span class="my-order-row-total">${formatPrice(order.total)}</span>
      </a>`;
    })
    .join("");
}
