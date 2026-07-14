/* ============================================
   주문 상세 페이지 로직
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  Cart.subscribe(updateCartBadge);
  renderDetail();
});

function updateCartBadge(count) {
  const badge = $("#cart-count");
  if (badge) badge.textContent = count;
}

function renderDetail() {
  const order = OrderStore.getById(getQueryParam("id"));
  const container = $("#order-detail");

  if (!order) {
    container.innerHTML = `
      <div class="not-found">
        <p>주문을 찾을 수 없습니다.</p>
        <a href="list" class="btn btn-outline">주문 내역으로</a>
      </div>`;
    return;
  }

  const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending;

  container.innerHTML = `
    <a href="list" class="back-link">← 주문 내역</a>

    <div class="order-detail-card card">
      <div class="order-detail-head">
        <div>
          <h1 class="order-detail-id">주문번호 ${order.id}</h1>
          <p class="order-detail-date text-muted">${formatDate(order.createdAt)}</p>
        </div>
        <span class="order-status-badge" style="background:${status.color}">${status.label}</span>
      </div>

      ${renderStatusTimeline(order.status)}

      <ul class="order-item-list">
        ${order.items
          .map(
            (item) => `
          <li class="order-item-row">
            <span class="order-item-name">${escapeHtml(item.name)}</span>
            <span class="order-item-qty">${item.qty}개</span>
            <span class="order-item-price">${formatPrice(item.price * item.qty)}</span>
          </li>`
          )
          .join("")}
      </ul>

      <div class="order-detail-total">
        <span>총 결제금액</span>
        <span class="order-total-price">${formatPrice(order.total)}</span>
      </div>
    </div>
  `;
}
