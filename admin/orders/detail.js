/* ============================================
   관리자 · 주문 상세 로직
   ============================================ */

function renderDetail() {
  const root = $("#detail-root");
  const order = OrderStore.getById(getQueryParam("id"));

  if (!order) {
    root.innerHTML = `
      <div class="detail-missing card">
        <p>존재하지 않는 주문입니다.</p>
        <a href="list" class="btn btn-primary" style="margin-top:16px">목록으로</a>
      </div>`;
    return;
  }

  const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending;

  root.innerHTML = `
    <div class="order-detail card">
      <div class="order-detail__head">
        <div>
          <h1 class="order-detail__id">주문 #${order.id}</h1>
          <p class="order-detail__date text-muted">${formatDate(order.createdAt)}</p>
        </div>
        <span class="order-status" style="background:${status.color}">${status.label}</span>
      </div>

      ${renderStatusTimeline(order.status)}

      <ul class="order-detail__items">
        ${order.items
          .map(
            (item) => `
          <li class="order-detail__item-row">
            <span>${escapeHtml(item.name)}</span>
            <span class="text-muted">${item.qty}개</span>
            <span class="order-detail__item-price">${formatPrice(item.price * item.qty)}</span>
          </li>`
          )
          .join("")}
      </ul>

      <div class="order-detail__total">
        <span>총 결제금액</span>
        <span class="order-detail__total-price">${formatPrice(order.total)}</span>
      </div>

      <div class="order-detail__status-actions">
        <span class="order-detail__status-label">상태 변경</span>
        <div class="order-detail__status-buttons">
          ${Object.entries(ORDER_STATUS)
            .map(
              ([key, info]) => `
            <button class="btn ${key === order.status ? "btn-primary" : "btn-outline"}"
                    data-status="${key}" ${key === order.status ? "disabled" : ""}>
              ${info.label}
            </button>`
            )
            .join("")}
        </div>
      </div>
    </div>`;

  $$("[data-status]", root).forEach((btn) => {
    btn.addEventListener("click", () => {
      OrderStore.updateStatus(order.id, btn.dataset.status);
      showToast(`주문 상태를 "${ORDER_STATUS[btn.dataset.status].label}"(으)로 변경했습니다.`);
      renderDetail();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderDetail();
});
