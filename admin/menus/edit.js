/* ============================================
   관리자 · 메뉴 수정 로직
   ============================================ */

const PLACEHOLDER_IMG = "https://placehold.co/400x300?text=No+Image";

let editingId = null;

/** 카테고리 셀렉트 옵션 채우기 */
function renderCategoryOptions(selectedId) {
  const select = $("#category");
  select.innerHTML = CATEGORIES.map(
    (c) =>
      `<option value="${c.id}" ${c.id === selectedId ? "selected" : ""}>${c.emoji} ${escapeHtml(c.name)}</option>`
  ).join("");
}

/** 기존 메뉴 값으로 폼 채우기 */
function fillForm(menu) {
  $("#name").value = menu.name;
  $("#price").value = menu.price;
  $("#image").value =
    menu.image && menu.image !== PLACEHOLDER_IMG ? menu.image : "";
  $("#description").value = menu.description || "";
  $("#popular").checked = !!menu.popular;
  $("#soldOut").checked = !!menu.soldOut;
  renderCategoryOptions(menu.category);
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

  const menu = MenuStore.getById(getQueryParam("id"));
  if (!menu) {
    $("#form-layout").hidden = true;
    $("#missing").hidden = false;
    return;
  }

  editingId = menu.id;
  fillForm(menu);
  updatePreview();

  // 실시간 미리보기
  ["name", "price", "image", "category"].forEach((id) => {
    $(`#${id}`).addEventListener("input", updatePreview);
    $(`#${id}`).addEventListener("change", updatePreview);
  });

  $("#preview-img").addEventListener("error", function () {
    this.src = PLACEHOLDER_IMG;
  });

  // 삭제
  $("#delete-btn").addEventListener("click", () => {
    if (!confirm(`"${menu.name}" 메뉴를 삭제할까요?`)) return;
    MenuStore.remove(editingId);
    showToast("메뉴를 삭제했습니다.");
    setTimeout(() => (location.href = "list"), 600);
  });

  // 저장
  $("#menu-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = validateForm();
    if (!data) return;

    MenuStore.update(editingId, data);
    showToast("변경 사항을 저장했습니다.");
    setTimeout(() => (location.href = `detail?id=${editingId}`), 600);
  });
});
