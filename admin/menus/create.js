/* ============================================
   관리자 · 메뉴 추가 로직
   ============================================ */

const PLACEHOLDER_IMG = "https://placehold.co/400x300?text=No+Image";

/** 카테고리 셀렉트 옵션 채우기 */
function renderCategoryOptions(selectedId) {
  const select = $("#category");
  select.innerHTML = CATEGORIES.map(
    (c) =>
      `<option value="${c.id}" ${c.id === selectedId ? "selected" : ""}>${c.emoji} ${escapeHtml(c.name)}</option>`
  ).join("");
}

/** 폼 입력값으로 미리보기 갱신 */
function updatePreview() {
  const name = $("#name").value.trim();
  const price = Number($("#price").value) || 0;
  const image = $("#image").value.trim();
  const category = getCategory($("#category").value);

  $("#preview-name").textContent = name || "메뉴 이름";
  $("#preview-price").textContent = formatPrice(price);
  $("#preview-category").textContent = category
    ? `${category.emoji} ${category.name}`
    : "카테고리";
  $("#preview-img").src = image || PLACEHOLDER_IMG;
}

/** 폼 유효성 검사 → 유효하면 값 객체, 아니면 null */
function validateForm() {
  const name = $("#name");
  const price = $("#price");
  let valid = true;

  [name, price].forEach((el) => el.classList.remove("is-invalid"));

  if (!name.value.trim()) {
    name.classList.add("is-invalid");
    valid = false;
  }
  if (price.value === "" || Number(price.value) < 0) {
    price.classList.add("is-invalid");
    valid = false;
  }

  if (!valid) {
    showToast("필수 항목을 확인해주세요.");
    return null;
  }

  return {
    name: name.value.trim(),
    category: $("#category").value,
    price: Number(price.value),
    image: $("#image").value.trim() || PLACEHOLDER_IMG,
    description: $("#description").value.trim(),
    popular: $("#popular").checked,
    soldOut: $("#soldOut").checked,
  };
}

document.addEventListener("DOMContentLoaded", () => {
  MenuStore.init();
  renderCategoryOptions();
  updatePreview();

  // 실시간 미리보기
  ["name", "price", "image", "category"].forEach((id) => {
    $(`#${id}`).addEventListener("input", updatePreview);
    $(`#${id}`).addEventListener("change", updatePreview);
  });

  $("#preview-img").addEventListener("error", function () {
    this.src = PLACEHOLDER_IMG;
  });

  // 제출
  $("#menu-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = validateForm();
    if (!data) return;

    const created = MenuStore.add(data);
    showToast("새 메뉴를 등록했습니다.");
    setTimeout(() => (location.href = `detail.html?id=${created.id}`), 600);
  });
});
