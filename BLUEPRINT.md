# ☕ 카페 앱 - 프로젝트 청사진

## 📁 폴더 구조 (완전 코로케이션)

```
cafe-app/
│
├── index.html                        # 메인 (고객)
├── index.css                         # 메인 페이지 스타일
└── index.js                          # 메인 페이지 로직
│
├── 👤 고객 - 메뉴
│   └── menus/
│       ├── list.html                 # 메뉴 목록
│       ├── list.css
│       ├── list.js
│       ├── detail.html               # 메뉴 상세
│       ├── detail.css
│       └── detail.js
│
├── 👤 고객 - 마이페이지
│   └── my/
│       ├── index.html                # 마이페이지 메인
│       ├── index.css
│       └── index.js
│
├── 👤 고객 - 장바구니
│   └── basket/
│       ├── list.html                 # 장바구니
│       ├── list.css
│       └── list.js
│
├── 👤 고객 - 주문 내역
│   └── orders/
│       ├── list.html                 # 주문 내역 목록
│       ├── list.css
│       ├── list.js
│       ├── detail.html               # 주문 상세
│       ├── detail.css
│       └── detail.js                   
│
├── 🔴 관리자/사장
│   └── admin/
│       ├── index.html                # 대시보드
│       ├── index.css
│       ├── index.js
│       │
│       ├── menus/
│       │   ├── list.html             # 메뉴 목록
│       │   ├── list.css
│       │   ├── list.js
│       │   ├── detail.html           # 메뉴 상세
│       │   ├── detail.css
│       │   ├── detail.js
│       │   ├── create.html           # 메뉴 추가
│       │   ├── create.css
│       │   ├── create.js
│       │   ├── edit.html             # 메뉴 수정
│       │   ├── edit.css
│       │   └── edit.js
│       │
│       └── orders/
│           ├── list.html             # 주문 목록
│           ├── list.css
│           ├── list.js
│           ├── detail.html           # 주문 상세
│           ├── detail.css
│           └── detail.js
│
├── 📦 공유 자원
│   ├── css/
│   │   └── variables.css             # CSS 변수 (전역)
│   └── js/
│       ├── data.js                   # 메뉴/카테고리 데이터
│       └── utils.js                  # 공통 유틸리티
```

## 👥 역할별 기능

| 역할 | 경로 | 주요 기능 |
|------|------|-----------|
| **고객** | `/`, `/menus/`, `/my/`, `/basket/`, `/orders/` | 메인, 메뉴 조회, 마이페이지, 장바구니, 주문 내역 |
| **관리자/사장** | `/admin/`, `/admin/menus/`, `/admin/orders/` | 대시보드, 메뉴 CRUD, 주문 관리 |

## 🎨 디자인

- **테마**: 라이트/다크 모드 지원 + 따뜻한 브라운/크림 톤
- **분위기**: 미니멀 + 모던
- **카드 스타일**: Glass morphism
- **레이아웃**: 반응형 (모바일/데스크톱)

## 📐 코로케이션 원칙

- **HTML과 동일한 디렉토리에 css, js 파일을 평탄하게 배치** (별도 하위 폴더 없음)
- **파일명은 HTML 파일명과 동일하게 매칭** (`index.html` → `index.css`, `index.js`)
- 전역 공통 자원만 `/css/`, `/js/` 폴더에 분리
- 역할별 독립 폴더로 관심사를 분리

---

## ✅ 구현 TODO

### 1단계: 공유 자원

- [x] `css/variables.css` — 전역 CSS 변수, 리셋
- [x] `js/data.js` — 메뉴/카테고리 데이터
- [x] `js/utils.js` — 공통 유틸리티 (카트, 포맷 등)

### 2단계: 관리자 - 메뉴 관리 시스템

- [x] `admin/menus/list.html` — 메뉴 목록
- [x] `admin/menus/list.css`
- [x] `admin/menus/list.js`
- [x] `admin/menus/detail.html` — 메뉴 상세
- [x] `admin/menus/detail.css`
- [x] `admin/menus/detail.js`
- [x] `admin/menus/create.html` — 메뉴 추가
- [x] `admin/menus/create.css`
- [x] `admin/menus/create.js`
- [x] `admin/menus/edit.html` — 메뉴 수정
- [x] `admin/menus/edit.css`
- [x] `admin/menus/edit.js`

### 3단계: 고객 - 메뉴 조회 시스템

- [x] `menus/list.html` — 메뉴 목록
- [x] `menus/list.css`
- [x] `menus/list.js`
- [x] `menus/detail.html` — 메뉴 상세
- [x] `menus/detail.css`
- [x] `menus/detail.js`

### 4단계: 고객 - 장바구니 관리 시스템

- [x] `basket/list.html` — 장바구니
- [x] `basket/list.css`
- [x] `basket/list.js`

### 5단계: 고객 - 주문 관리 시스템

- [x] `orders/list.html` — 주문 내역 목록
- [x] `orders/list.css`
- [x] `orders/list.js`
- [x] `orders/detail.html` — 주문 상세
- [x] `orders/detail.css`
- [x] `orders/detail.js`

### 6단계: 고객 - 메인 페이지

- [x] `index.html`
- [x] `index.css`
- [x] `index.js`

### 7단계: 고객 - 마이페이지

- [x] `my/index.html`
- [x] `my/index.css`
- [x] `my/index.js`

### 8단계: 관리자 - 대시보드 & 주문 관리

- [x] `admin/index.html` — 대시보드
- [x] `admin/index.css`
- [x] `admin/index.js`
- [x] `admin/orders/list.html` — 주문 목록
- [x] `admin/orders/list.css`
- [x] `admin/orders/list.js`
- [x] `admin/orders/detail.html` — 주문 상세
- [x] `admin/orders/detail.css`
- [x] `admin/orders/detail.js`

### 9단계: UX 고도화 기능 (전 페이지 공통)

- [x] **다크모드 토글** — 모든 페이지 헤더에 🌙/☀️ 버튼, `localStorage("cafe.theme")`로 유지, `css/variables.css`의 `:root[data-theme="dark"]`에 다크 색상 토큰 정의 (`js/utils.js`의 `ThemeStore`)
- [x] **메뉴 검색 자동완성** — `menus/list.html` 검색창에 입력 시 이름/카테고리 매칭 드롭다운 표시, 클릭 시 메뉴 상세로 이동
- [x] **최근 본 메뉴 위젯** — 메뉴 상세 조회 시 `localStorage("cafe.recent")`에 최대 8개 기록 (`js/utils.js`의 `RecentStore`), 홈 화면과 메뉴 목록 페이지에 가로 스크롤 위젯으로 표시
- [x] **장바구니 담기 애니메이션** — "담기" 버튼 클릭 시 버튼 바운스 + 아이콘이 헤더 장바구니로 날아가는 연출 (`js/utils.js`의 `flyToCart`/`celebrateAddToCart`), `prefers-reduced-motion` 대응
- [x] **주문 상태 타임라인** — 주문 상세(고객/관리자 공통)에서 접수 대기 → 제조 중 → 완료 진행 상태를 부드럽게 채워지는 진행바로 시각화 (`js/utils.js`의 `renderStatusTimeline`), 취소된 주문은 별도 안내 배너로 표시
  - ⚠️ 원래 요청은 "접수→준비중→배송중→완료"였으나, 이 앱은 포장/픽업 카페 주문 모델이라 배송(배송중) 단계가 없어 기존 3단계 주문 상태(`pending`/`making`/`done`, `ORDER_STATUS`)를 그대로 사용해 타임라인을 구성함
- [x] **결제 수단 선택** — 장바구니 "주문하기" 클릭 시 바로 주문을 생성하지 않고 결제 수단 선택 모달(`basket/list.html`의 `#payment-modal`, `basket/list.js`)을 먼저 표시. 신용카드/토스페이/카카오페이 3종 (`js/utils.js`의 `PAYMENT_METHODS`), 신용카드는 카드번호/유효기간/CVC 입력폼으로 전환, 토스페이·카카오페이는 1.5초 로딩 연출 후 결제 완료 처리. 완료된 주문은 `paymentMethod` 필드를 저장하고(`OrderStore.create`) 고객 주문 상세("OO(으)로 결제 완료" 문구, `orders/detail.js`)와 관리자 주문 목록/상세(`admin/orders/list.js`, `admin/orders/detail.js`)에도 결제 수단을 표시
  - ⚠️ 실제 PG(결제대행사) 연동이 아닌 UI/UX 시뮬레이션(mock)으로, 카드 입력값 검증과 토스페이/카카오페이 결제 처리 모두 외부 통신 없이 화면 전환/로딩 연출만으로 구현됨 (관련 코드에 주석으로 명시)
