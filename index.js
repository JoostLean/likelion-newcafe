/* ============================================
   메인 페이지 로직
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  MenuStore.init();
  renderPopularMenus();
  renderCategories();
  Cart.subscribe(updateCartBadge);
});

function updateCartBadge(count) {
  const badge = $("#cart-count");
  if (badge) badge.textContent = count;
}

function renderPopularMenus() {
  const grid = $("#popular-grid");
  const popular = MenuStore.getAll().filter((m) => m.popular);

  if (popular.length === 0) {
    grid.innerHTML = `<p class="empty-state text-muted">인기 메뉴가 없습니다.</p>`;
    return;
  }

  grid.innerHTML = popular
    .map(
      (menu) => `
      <article class="menu-card card">
        <a href="menus/detail.html?id=${menu.id}" class="menu-card-link">
          <div class="menu-card-image" style="background-image:url('${menu.image}')">
            <span class="badge badge-popular">인기</span>
          </div>
          <div class="menu-card-body">
            <h3 class="menu-card-name">${escapeHtml(menu.name)}</h3>
            <p class="menu-card-desc text-muted">${escapeHtml(menu.description)}</p>
            <p class="menu-card-price">${formatPrice(menu.price)}</p>
          </div>
        </a>
      </article>`
    )
    .join("");
}

function renderCategories() {
  const grid = $("#category-grid");

  grid.innerHTML = CATEGORIES.map(
    (c) => `
      <a href="menus/list.html?category=${c.id}" class="category-card card">
        <span class="category-card-emoji">${c.emoji}</span>
        <span class="category-card-name">${escapeHtml(c.name)}</span>
      </a>`
  ).join("");
}
