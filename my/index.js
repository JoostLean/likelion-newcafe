/* ============================================
   마이페이지 로직
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  MenuStore.init();
  renderTabs();
  setActiveTab(getQueryParam("tab") || "profile");
  renderStats();
  renderRecentOrders();
  renderBasketSummary();
  Cart.subscribe(updateCartBadge);
});

window.addEventListener("popstate", () => {
  setActiveTab(getQueryParam("tab") || "profile");
});

function updateCartBadge(count) {
  const badge = $("#cart-count");
  if (badge) badge.textContent = count;

  const statCartCount = $("#stat-cart-count");
  if (statCartCount) statCartCount.textContent = count;
}

function renderTabs() {
  $$(".mypage-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      const url = new URL(location.href);
      if (tab === "profile") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", tab);
      }
      history.pushState({}, "", url);
      setActiveTab(tab);
    });
  });
}

function setActiveTab(tab) {
  $$(".mypage-tab").forEach((btn) => {
    const isActive = btn.dataset.tab === tab;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", String(isActive));
  });

  $$(".tab-panel").forEach((panel) => {
    panel.hidden = panel.id !== `tab-${tab}`;
  });
}

function renderStats() {
  const orders = OrderStore.getAll();
  const totalSpent = orders
    .filter((o) => o.status !== "canceled")
    .reduce((sum, o) => sum + o.total, 0);

  $("#stat-order-count").textContent = orders.length;
  $("#stat-total-spent").textContent = formatPrice(totalSpent);
}

function renderRecentOrders() {
  const container = $("#recent-order-list");
  const orders = OrderStore.getAll().slice(0, 3);

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="text-muted">아직 주문 내역이 없습니다.</p>
        <a href="../menus/list.html" class="btn btn-primary">메뉴 보러가기</a>
      </div>`;
    return;
  }

  container.innerHTML = orders
    .map((order) => {
      const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
      const [firstItem, ...rest] = order.items;
      const summary = rest.length > 0
        ? `${escapeHtml(firstItem.name)} 외 ${rest.length}건`
        : escapeHtml(firstItem.name);

      return `
      <a href="../orders/detail.html?id=${order.id}" class="recent-order-row card">
        <span class="recent-order-id">#${order.id}</span>
        <span class="recent-order-summary">${summary}</span>
        <span class="recent-order-status" style="background:${status.color}">${status.label}</span>
        <span class="recent-order-total">${formatPrice(order.total)}</span>
      </a>`;
    })
    .join("");
}

function renderBasketSummary() {
  const container = $("#basket-summary-list");
  const items = Cart.getDetailedItems();

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="text-muted">장바구니가 비어 있습니다.</p>
        <a href="../menus/list.html" class="btn btn-primary">메뉴 보러가기</a>
      </div>`;
    return;
  }

  const rows = items
    .map(
      (i) => `
      <div class="recent-order-row card">
        <span class="recent-order-summary">${escapeHtml(i.menu.name)} × ${i.qty}</span>
        <span class="recent-order-total">${formatPrice(i.subtotal)}</span>
      </div>`
    )
    .join("");

  container.innerHTML = `
    ${rows}
    <div class="recent-order-row card basket-summary-total-row">
      <span>총 금액</span>
      <span class="recent-order-total">${formatPrice(Cart.getTotal())}</span>
    </div>`;
}
