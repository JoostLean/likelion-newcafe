/* ============================================
   장바구니 페이지 로직
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  MenuStore.init();
  renderBasket();
  Cart.subscribe(updateCartBadge);
  initCardForm();
  setupPaymentModalDismiss();
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
    </div>
    <button id="checkout-btn" class="btn btn-primary checkout-btn">주문하기</button>`;

  $("#checkout-btn").addEventListener("click", handleCheckout);

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

/** 주문하기 처리: 주문 생성 대신 결제 수단 선택 모달을 먼저 연다 */
function handleCheckout() {
  const items = Cart.getDetailedItems();
  if (items.length === 0) return;

  openPaymentModal(items);
}

/* ============================================
   결제 수단 선택 모달
   ⚠️ 실제 PG(결제대행사) 연동이 아닌 UI/UX 시뮬레이션(mock)입니다.
   ============================================ */

/** 모달이 열려 있는 동안 결제 대상이 되는 장바구니 상세 항목 */
let pendingCheckoutItems = null;

function openPaymentModal(items) {
  pendingCheckoutItems = items;
  const total = items.reduce((sum, i) => sum + i.subtotal, 0);
  $("#payment-total").textContent = formatPrice(total);

  renderPaymentMethodOptions();
  showPaymentStep("select");
  $("#payment-card-form").reset();
  $("#payment-modal").hidden = false;
}

function closePaymentModal() {
  $("#payment-modal").hidden = true;
  pendingCheckoutItems = null;
}

/** 결제 처리 중(로딩 연출)에는 닫기를 막아 실제 결제 흐름처럼 동작 */
function canDismissPaymentModal() {
  return $('[data-step="processing"]').hidden;
}

function showPaymentStep(step) {
  $$(".payment-step").forEach((el) => {
    el.hidden = el.dataset.step !== step;
  });
}

function renderPaymentMethodOptions() {
  const grid = $("#payment-method-grid");
  grid.innerHTML = Object.entries(PAYMENT_METHODS)
    .map(
      ([key, info]) => `
      <button type="button" class="payment-method-option" data-method="${key}">
        <span class="payment-method-icon">${info.icon}</span>
        <span class="payment-method-label">${escapeHtml(info.label)}</span>
      </button>`
    )
    .join("");

  $$("[data-method]", grid).forEach((btn) => {
    btn.addEventListener("click", () => selectPaymentMethod(btn.dataset.method));
  });
}

function selectPaymentMethod(method) {
  if (method === "card") {
    showPaymentStep("card");
    return;
  }
  // 토스페이/카카오페이: 실제 외부 연동 없이 로딩 연출 후 결제 완료 처리
  runMockPayment(method);
}

function runMockPayment(method) {
  const info = PAYMENT_METHODS[method];
  $("#payment-processing-text").textContent = `${info.label}로 결제 중...`;
  showPaymentStep("processing");

  setTimeout(() => finishCheckout(method), 1500);
}

/** 카드번호/유효기간/CVC 입력폼: 형식만 갖춘 데모용 자동 포맷팅 (실제 검증 없음) */
function initCardForm() {
  const numberInput = $("#card-number");
  const expiryInput = $("#card-expiry");
  const cvcInput = $("#card-cvc");
  if (!numberInput) return;

  numberInput.addEventListener("input", () => {
    numberInput.value = numberInput.value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  });

  expiryInput.addEventListener("input", () => {
    const digits = expiryInput.value.replace(/\D/g, "").slice(0, 4);
    expiryInput.value =
      digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  });

  cvcInput.addEventListener("input", () => {
    cvcInput.value = cvcInput.value.replace(/\D/g, "").slice(0, 3);
  });

  $("#payment-card-back").addEventListener("click", () => showPaymentStep("select"));

  $("#payment-card-form").addEventListener("submit", (e) => {
    e.preventDefault();
    // 실제 카드 유효성 검증(Luhn 등)은 하지 않는 UI 시뮬레이션
    $("#payment-processing-text").textContent = "신용카드로 결제 중...";
    showPaymentStep("processing");
    setTimeout(() => finishCheckout("card"), 1500);
  });
}

function setupPaymentModalDismiss() {
  const modal = $("#payment-modal");
  if (!modal) return;

  const tryClose = () => {
    if (canDismissPaymentModal()) closePaymentModal();
  };

  $("#payment-modal-close").addEventListener("click", tryClose);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) tryClose();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) tryClose();
  });
}

/** 결제 완료 처리: 주문 생성(결제 수단 포함) → 장바구니 비우기 → 주문 상세로 이동 */
function finishCheckout(method) {
  const items = pendingCheckoutItems;
  if (!items) return;

  const order = OrderStore.create(items, { paymentMethod: method });
  Cart.clear();
  closePaymentModal();

  const info = PAYMENT_METHODS[method];
  showToast(`${info.label}(으)로 결제 완료되었습니다.`);

  setTimeout(() => {
    location.href = `../orders/detail?id=${order.id}`;
  }, 600);
}
