/* ============================================
   메뉴 목록 페이지 로직
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  MenuStore.init();
  renderCategoryTabs();
  renderMenus(getQueryParam("category") || "all");
  Cart.subscribe(updateCartBadge);
});

window.addEventListener("popstate", () => {
  const current = getQueryParam("category") || "all";
  setActiveTab(current);
  renderMenus(current);
});

function updateCartBadge(count) {
  const badge = $("#cart-count");
  if (badge) badge.textContent = count;
}

function setActiveTab(categoryId) {
  $$(".category-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.category === categoryId);
  });
}

function renderCategoryTabs() {
  const container = $("#category-tabs");
  const current = getQueryParam("category") || "all";
  const tabs = [{ id: "all", name: "전체", emoji: "🍽️" }, ...CATEGORIES];

  container.innerHTML = tabs
    .map(
      (c) => `
      <button class="category-tab ${c.id === current ? "active" : ""}" data-category="${c.id}">
        <span>${c.emoji}</span> ${escapeHtml(c.name)}
      </button>`
    )
    .join("");

  $$(".category-tab", container).forEach((btn) => {
    btn.addEventListener("click", () => {
      const categoryId = btn.dataset.category;
      const url = new URL(location.href);
      if (categoryId === "all") {
        url.searchParams.delete("category");
      } else {
        url.searchParams.set("category", categoryId);
      }
      history.pushState({}, "", url);
      setActiveTab(categoryId);
      renderMenus(categoryId);
    });
  });
}

function renderMenus(categoryId) {
  const grid = $("#menu-grid");
  const menus = MenuStore.getByCategory(categoryId);

  if (menus.length === 0) {
    grid.innerHTML = `<p class="empty-state text-muted">등록된 메뉴가 없습니다.</p>`;
    return;
  }

  grid.innerHTML = menus
    .map(
      (menu) => `
      <article class="menu-card card ${menu.soldOut ? "is-sold-out" : ""}" data-id="${menu.id}">
        <a href="detail.html?id=${menu.id}" class="menu-card-link">
          <div class="menu-card-image" style="background-image:url('${menu.image}')">
            ${menu.popular ? `<span class="badge badge-popular">인기</span>` : ""}
            ${menu.soldOut ? `<span class="badge badge-soldout">품절</span>` : ""}
          </div>
          <div class="menu-card-body">
            <h3 class="menu-card-name">${escapeHtml(menu.name)}</h3>
            <p class="menu-card-desc text-muted">${escapeHtml(menu.description)}</p>
            <p class="menu-card-price">${formatPrice(menu.price)}</p>
          </div>
        </a>
        <button class="btn btn-primary menu-card-add" data-add="${menu.id}" ${menu.soldOut ? "disabled" : ""}>
          담기
        </button>
      </article>`
    )
    .join("");

  $$("[data-add]", grid).forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      Cart.add(btn.dataset.add);
      showToast("장바구니에 담았습니다.");
    });
  });
}
