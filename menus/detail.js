/* ============================================
   메뉴 상세 페이지 로직
   ============================================ */

let currentQty = 1;

document.addEventListener("DOMContentLoaded", () => {
  MenuStore.init();
  Cart.subscribe(updateCartBadge);
  renderDetail();
});

function updateCartBadge(count) {
  const badge = $("#cart-count");
  if (badge) badge.textContent = count;
}

function renderDetail() {
  const menu = MenuStore.getById(getQueryParam("id"));
  const container = $("#menu-detail");

  if (!menu) {
    container.innerHTML = `
      <div class="not-found">
        <p>메뉴를 찾을 수 없습니다.</p>
        <a href="list.html" class="btn btn-outline">메뉴 목록으로</a>
      </div>`;
    return;
  }

  const category = getCategory(menu.category);

  container.innerHTML = `
    <a href="list.html" class="back-link">← 메뉴 목록</a>

    <div class="menu-detail-layout">
      <div class="menu-detail-image" style="background-image:url('${menu.image}')">
        ${menu.popular ? `<span class="badge badge-popular">인기</span>` : ""}
        ${menu.soldOut ? `<span class="badge badge-soldout">품절</span>` : ""}
      </div>

      <div class="menu-detail-info card">
        <p class="menu-detail-category text-muted">
          ${category ? `${category.emoji} ${escapeHtml(category.name)}` : ""}
        </p>
        <h1 class="menu-detail-name">${escapeHtml(menu.name)}</h1>
        <p class="menu-detail-desc text-muted">${escapeHtml(menu.description)}</p>
        <p class="menu-detail-price">${formatPrice(menu.price)}</p>

        ${
          menu.soldOut
            ? `<p class="sold-out-notice">현재 품절된 메뉴입니다.</p>`
            : `
        <div class="qty-control">
          <button type="button" id="qty-minus" class="qty-btn" aria-label="수량 감소">−</button>
          <span id="qty-value" class="qty-value">1</span>
          <button type="button" id="qty-plus" class="qty-btn" aria-label="수량 증가">+</button>
        </div>

        <div class="menu-detail-actions">
          <button type="button" id="add-to-cart" class="btn btn-primary btn-add-cart">
            <span id="total-price">${formatPrice(menu.price)}</span> 담기
          </button>
        </div>`
        }
      </div>
    </div>
  `;

  if (!menu.soldOut) {
    currentQty = 1;
    bindQtyControls(menu);
  }
}

function bindQtyControls(menu) {
  const qtyValue = $("#qty-value");
  const totalPrice = $("#total-price");

  const updateTotal = () => {
    qtyValue.textContent = currentQty;
    totalPrice.textContent = formatPrice(menu.price * currentQty);
  };

  $("#qty-minus").addEventListener("click", () => {
    if (currentQty > 1) {
      currentQty -= 1;
      updateTotal();
    }
  });

  $("#qty-plus").addEventListener("click", () => {
    currentQty += 1;
    updateTotal();
  });

  $("#add-to-cart").addEventListener("click", () => {
    Cart.add(menu.id, currentQty);
    showToast(`${menu.name} ${currentQty}개를 담았습니다.`);
    currentQty = 1;
    updateTotal();
  });
}
