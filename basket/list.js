/* ============================================
   장바구니 페이지 로직
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
          <p class="basket-item-price text-muted">${formatPrice(i.menu.price)}</p>
          <div class="basket-item-qty">
            <button class="qty-btn" data-decrease="${i.menuId}" aria-label="수량 감소">−</button>
            <span class="qty-value">${i.qty}</span>
            <button class="qty-btn" data-increase="${i.menuId}" aria-label="수량 증가">+</button>
          </div>
        </div>
        <p class="basket-item-subtotal">${formatPrice(i.subtotal)}</p>
        <button class="basket-item-remove" data-remove="${i.menuId}" aria-label="삭제">✕</button>
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

  $$("[data-increase]", list).forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = items.find((i) => i.menuId === Number(btn.dataset.increase));
      Cart.setQty(btn.dataset.increase, item.qty + 1);
      renderBasket();
    });
  });

  $$("[data-decrease]", list).forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = items.find((i) => i.menuId === Number(btn.dataset.decrease));
      Cart.setQty(btn.dataset.decrease, item.qty - 1);
      renderBasket();
    });
  });

  $$("[data-remove]", list).forEach((btn) => {
    btn.addEventListener("click", () => {
      Cart.remove(btn.dataset.remove);
      renderBasket();
      showToast("장바구니에서 제거했습니다.");
    });
  });
}
