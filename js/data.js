/* ============================================
   메뉴 / 카테고리 데이터
   - 관리자가 메뉴를 CRUD 하면 localStorage에 반영된다.
   - 최초 실행 시 아래 SEED 데이터로 초기화된다.
   ============================================ */

const CATEGORIES = [
  { id: "coffee", name: "커피", emoji: "☕" },
  { id: "latte", name: "라떼", emoji: "🥛" },
  { id: "tea", name: "티/에이드", emoji: "🍵" },
  { id: "dessert", name: "디저트", emoji: "🍰" },
];

const MENU_SEED = [
  {
    id: 1,
    name: "아메리카노",
    category: "coffee",
    price: 4000,
    description: "깊고 진한 에스프레소에 물을 더한 클래식 아메리카노.",
    image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600&q=80",
    soldOut: false,
    popular: true,
  },
  {
    id: 2,
    name: "에스프레소",
    category: "coffee",
    price: 3500,
    description: "원두 본연의 풍미를 진하게 담아낸 한 잔.",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80",
    soldOut: false,
    popular: false,
  },
  {
    id: 3,
    name: "카페라떼",
    category: "latte",
    price: 4800,
    description: "부드러운 스팀 우유와 에스프레소의 조화.",
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&q=80",
    soldOut: false,
    popular: true,
  },
  {
    id: 4,
    name: "바닐라라떼",
    category: "latte",
    price: 5300,
    description: "달콤한 바닐라 향이 은은하게 퍼지는 라떼.",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80",
    soldOut: false,
    popular: false,
  },
  {
    id: 5,
    name: "녹차라떼",
    category: "latte",
    price: 5300,
    description: "고소한 우유와 진한 국내산 녹차의 만남.",
    image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600&q=80",
    soldOut: false,
    popular: false,
  },
  {
    id: 6,
    name: "자몽에이드",
    category: "tea",
    price: 5800,
    description: "상큼한 자몽 과육이 가득한 시원한 에이드.",
    image: "https://images.unsplash.com/photo-1497534446932-c925b458314a?w=600&q=80",
    soldOut: false,
    popular: true,
  },
  {
    id: 7,
    name: "캐모마일 티",
    category: "tea",
    price: 4500,
    description: "은은한 향으로 하루를 편안하게 마무리하는 허브티.",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&q=80",
    soldOut: true,
    popular: false,
  },
  {
    id: 8,
    name: "티라미수",
    category: "dessert",
    price: 6500,
    description: "부드러운 마스카포네 크림과 진한 커피의 디저트.",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80",
    soldOut: false,
    popular: true,
  },
  {
    id: 9,
    name: "치즈케이크",
    category: "dessert",
    price: 6000,
    description: "꾸덕한 뉴욕 스타일 치즈케이크.",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80",
    soldOut: false,
    popular: false,
  },
  {
    id: 10,
    name: "크루아상",
    category: "dessert",
    price: 3800,
    description: "겹겹이 살아있는 버터 향 가득한 크루아상.",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80",
    soldOut: false,
    popular: false,
  },
];

/* ============================================
   메뉴 저장소 (localStorage 기반)
   ============================================ */

const MENU_STORAGE_KEY = "cafe.menus";

const MenuStore = {
  /** 저장소를 SEED 데이터로 초기화 (없을 때만) */
  init() {
    if (!localStorage.getItem(MENU_STORAGE_KEY)) {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(MENU_SEED));
    }
  },

  /** 전체 메뉴 반환 */
  getAll() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(MENU_STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  },

  /** id로 단일 메뉴 반환 */
  getById(id) {
    return this.getAll().find((m) => m.id === Number(id)) || null;
  },

  /** 카테고리로 필터링 (categoryId 생략 시 전체) */
  getByCategory(categoryId) {
    const all = this.getAll();
    if (!categoryId || categoryId === "all") return all;
    return all.filter((m) => m.category === categoryId);
  },

  /** 전체 메뉴 배열 저장 */
  saveAll(menus) {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menus));
  },

  /** 새 메뉴 추가 → 생성된 메뉴 반환 */
  add(menu) {
    const menus = this.getAll();
    const nextId = menus.reduce((max, m) => Math.max(max, m.id), 0) + 1;
    const created = {
      id: nextId,
      soldOut: false,
      popular: false,
      ...menu,
    };
    menus.push(created);
    this.saveAll(menus);
    return created;
  },

  /** 기존 메뉴 수정 → 수정된 메뉴 반환(없으면 null) */
  update(id, patch) {
    const menus = this.getAll();
    const idx = menus.findIndex((m) => m.id === Number(id));
    if (idx === -1) return null;
    menus[idx] = { ...menus[idx], ...patch, id: menus[idx].id };
    this.saveAll(menus);
    return menus[idx];
  },

  /** 메뉴 삭제 → 성공 여부 반환 */
  remove(id) {
    const menus = this.getAll();
    const next = menus.filter((m) => m.id !== Number(id));
    if (next.length === menus.length) return false;
    this.saveAll(next);
    return true;
  },

  /** 저장소를 SEED로 리셋 */
  reset() {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(MENU_SEED));
  },
};

// 카테고리 조회 헬퍼
function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || null;
}
