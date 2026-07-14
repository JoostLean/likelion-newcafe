/* ============================================
   메인 페이지 로직
   ============================================ */

const ADMIN_PASSWORD = "0000";

document.addEventListener("DOMContentLoaded", () => {
  MenuStore.init();
  Cart.subscribe(updateCartBadge);
  renderCategories();
  renderPopularMenus();
  setupAdminAuth();
  renderRecentWidget($("#recent-section"), $("#recent-scroll"), {
    hrefPrefix: "menus/",
  });
});

function updateCartBadge(count) {
  const badge = $("#cart-count");
  if (badge) badge.textContent = count;
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

function renderPopularMenus() {
  const grid = $("#popular-grid");
  const popular = MenuStore.getAll()
    .filter((m) => m.popular && !m.soldOut)
    .slice(0, 4);

  if (popular.length === 0) {
    grid.innerHTML = `<p class="empty-state text-muted">등록된 인기 메뉴가 없습니다.</p>`;
    return;
  }

  grid.innerHTML = popular
    .map(
      (menu) => `
      <article class="popular-card card">
        <a href="menus/detail.html?id=${menu.id}" class="popular-card-link">
          <div class="popular-card-image" style="background-image:url('${menu.image}')">
            <span class="badge badge-popular">인기</span>
          </div>
          <div class="popular-card-body">
            <h3 class="popular-card-name">${escapeHtml(menu.name)}</h3>
            <p class="popular-card-price">${formatPrice(menu.price)}</p>
          </div>
        </a>
        <button class="btn btn-primary popular-card-add" data-add="${menu.id}">담기</button>
      </article>`
    )
    .join("");

  $$("[data-add]", grid).forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      Cart.add(btn.dataset.add);
      showToast("장바구니에 담았습니다.");
      celebrateAddToCart(btn);
    });
  });
}

/** 관리자 진입 버튼 → 비밀번호 확인 모달 */
function setupAdminAuth() {
  const trigger = $("#admin-link");
  const modal = $("#admin-auth-modal");
  const form = $("#admin-auth-form");
  const input = $("#admin-password");
  const cancelBtn = $("#admin-auth-cancel");

  if (!trigger || !modal) return;

  const openModal = () => {
    modal.hidden = false;
    input.value = "";
    input.classList.remove("is-invalid");
    input.focus();
  };

  const closeModal = () => {
    modal.hidden = true;
  };

  trigger.addEventListener("click", openModal);
  cancelBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (input.value === ADMIN_PASSWORD) {
      location.href = "admin/index.html";
      return;
    }

    input.classList.remove("is-invalid");
    void input.offsetWidth;
    input.classList.add("is-invalid");
    input.value = "";
    input.focus();
    showToast("비밀번호가 올바르지 않습니다.");
  });
}
