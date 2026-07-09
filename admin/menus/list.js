/* ============================================
   관리자 · 메뉴 목록 로직
   ============================================ */

let currentCategory = "all";

/** 카테고리 필터 탭 렌더링 */
function renderFilter() {
  const filter = $("#category-filter");
  const tabs = [{ id: "all", name: "전체", emoji: "📋" }, ...CATEGORIES];

  filter.innerHTML = tabs
    .map(
      (c) => `
      <button class="filter-tab ${c.id === currentCategory ? "is-active" : ""}"
              data-category="${c.id}">
        ${c.emoji} ${escapeHtml(c.name)}
      </button>`
    )
    .join("");

  $$(".filter-tab", filter).forEach((tab) => {
    tab.addEventListener("click", () => {
      currentCategory = tab.dataset.category;
      renderFilter();
      renderMenus();
    });
  });
}

/** 메뉴 카드 그리드 렌더링 */
function renderMenus() {
  const grid = $("#menus-grid");
  const empty = $("#menus-empty");
  const menus = MenuStore.getByCategory(currentCategory);

  $("#menu-count").textContent = menus.length;

  if (menus.length === 0) {
    grid.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  grid.innerHTML = menus
    .map((m) => {
      const category = getCategory(m.category);
      const badges = [];
      if (m.popular)
        badges.push('<span class="badge badge--popular">인기</span>');
      if (m.soldOut)
        badges.push('<span class="badge badge--soldout">품절</span>');

      return `
      <article class="menu-card card">
        <a class="menu-card__thumb" href="detail?id=${m.id}">
          <img src="${escapeHtml(m.image)}" alt="${escapeHtml(m.name)}"
               loading="lazy"
               onerror="this.src='https://placehold.co/400x300?text=No+Image'" />
          ${badges.length ? `<div class="menu-card__badges">${badges.join("")}</div>` : ""}
        </a>
        <div class="menu-card__body">
          <span class="menu-card__category">${category ? category.emoji + " " + escapeHtml(category.name) : ""}</span>
          <h2 class="menu-card__name">${escapeHtml(m.name)}</h2>
          <span class="menu-card__price">${formatPrice(m.price)}</span>
        </div>
        <div class="menu-card__actions">
          <a class="btn btn-outline" href="edit?id=${m.id}">수정</a>
          <button class="btn btn-danger" data-delete="${m.id}">삭제</button>
        </div>
      </article>`;
    })
    .join("");

  // 삭제 버튼 바인딩
  $$("[data-delete]", grid).forEach((btn) => {
    btn.addEventListener("click", () => handleDelete(Number(btn.dataset.delete)));
  });
}

/** 메뉴 삭제 처리 */
function handleDelete(id) {
  const menu = MenuStore.getById(id);
  if (!menu) return;
  if (!confirm(`"${menu.name}" 메뉴를 삭제할까요?`)) return;

  MenuStore.remove(id);
  showToast("메뉴를 삭제했습니다.");
  renderMenus();
}

/* ---- 초기화 ---- */
document.addEventListener("DOMContentLoaded", () => {
  MenuStore.init();
  renderFilter();
  renderMenus();
});
