/* ============================================
   장바구니 페이지 로직 (조회 전용)
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  MenuStore.init();
  renderBasket();
  Cart.subscribe(updateCartBadge);
});

function updateCartBadge(count) {
  const badge = $("#cart-count");
  if (badge) badge.textContent = count;
}

function renderBasket() {
  const list = $("#basket-list");
  const summary = $("#basket-summary");
  const items = Cart.getDetailedItems();

  if (items.length === 0) {
    list.innerHTML = `<p class="empty-state text-muted">장바구니가 비어 있습니다.</p>`;
    summary.innerHTML = "";
    return;
  }

  list.innerHTML = items
    .map(
      (i) => `
      <article class="basket-item card" data-id="${i.menuId}">
        <div class="basket-item-image" style="background-image:url('${i.menu.image}')"></div>
        <div class="basket-item-body">
          <h3 class="basket-item-name">${escapeHtml(i.menu.name)}</h3>
          <p class="basket-item-price text-muted">${formatPrice(i.menu.price)} × ${i.qty}</p>
        </div>
        <p class="basket-item-subtotal">${formatPrice(i.subtotal)}</p>
      </article>`
    )
    .join("");

  summary.innerHTML = `
    <div class="basket-summary-row">
      <span>총 수량</span>
      <span>${Cart.getCount()}개</span>
    </div>
    <div class="basket-summary-row basket-summary-total">
      <span>총 금액</span>
      <span>${formatPrice(Cart.getTotal())}</span>
    </div>`;
}
