/* ============================================
   관리자 · 메뉴 상세 로직
   ============================================ */

function renderDetail() {
  const root = $("#detail-root");
  const id = getQueryParam("id");
  const menu = MenuStore.getById(id);

  if (!menu) {
    root.innerHTML = `
      <div class="detail-missing card">
        <p>존재하지 않는 메뉴입니다.</p>
        <a href="list.html" class="btn btn-primary" style="margin-top:16px">목록으로</a>
      </div>`;
    return;
  }

  const category = getCategory(menu.category);
  const badges = [];
  if (category)
    badges.push(
      `<span class="badge badge--category">${category.emoji} ${escapeHtml(category.name)}</span>`
    );
  if (menu.popular)
    badges.push('<span class="badge badge--popular">인기</span>');
  if (menu.soldOut)
    badges.push('<span class="badge badge--soldout">품절</span>');

  root.innerHTML = `
    <div class="detail">
      <div class="detail__media">
        <img src="${escapeHtml(menu.image)}" alt="${escapeHtml(menu.name)}"
             onerror="this.src='https://placehold.co/600x450?text=No+Image'" />
      </div>
      <div class="detail__info">
        <div class="detail__badges">${badges.join("")}</div>
        <h1 class="detail__name">${escapeHtml(menu.name)}</h1>
        <p class="detail__price">${formatPrice(menu.price)}</p>
        <p class="detail__desc">${escapeHtml(menu.description || "설명이 없습니다.")}</p>

        <div class="detail__meta">
          <div class="detail__meta-row">
            <span>메뉴 ID</span><span>#${menu.id}</span>
          </div>
          <div class="detail__meta-row">
            <span>카테고리</span><span>${category ? escapeHtml(category.name) : "-"}</span>
          </div>
          <div class="detail__meta-row">
            <span>판매 상태</span>
            <span>${menu.soldOut ? "🔴 품절" : "🟢 판매 중"}</span>
          </div>
          <div class="detail__meta-row">
            <span>인기 메뉴</span><span>${menu.popular ? "⭐ 지정" : "미지정"}</span>
          </div>
        </div>

        <div class="detail__actions">
          <a class="btn btn-primary" href="edit.html?id=${menu.id}">수정하기</a>
          <button class="btn btn-danger" id="delete-btn">삭제하기</button>
        </div>
      </div>
    </div>`;

  $("#delete-btn").addEventListener("click", () => {
    if (!confirm(`"${menu.name}" 메뉴를 삭제할까요?`)) return;
    MenuStore.remove(menu.id);
    showToast("메뉴를 삭제했습니다.");
    setTimeout(() => (location.href = "list.html"), 600);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  MenuStore.init();
  renderDetail();
});
