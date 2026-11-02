# WEAVEX 官網｜交付包

純靜態網站，不需要建置流程（no build step）。整個資料夾直接放到任何靜態主機即可上線，例如 Nginx、Apache、S3 + CloudFront、Netlify、Vercel 或 Azure Static Web Apps。

---

## 1. 本機預覽

不能直接雙擊打開 `index.html`。瀏覽器用 `file://` 開啟時會擋掉影片與 3D 模型的載入，必須起一個本機伺服器：

```bash
cd weavex-site
python3 -m http.server 8080
# 或 npx serve .
```

起好後開 http://localhost:8080 。

---

## 2. 檔案結構

```
weavex-site/
├── index.html                 頁面結構（全部區塊）
├── css/main.css               全站樣式
├── js/
│   ├── main.js                捲動動畫、區塊切換、整合流程、表單、Quest 3 模型載入
│   ├── showcase.js            六種服務的互動元件（CardSwap / MagicBento / 3D 手機 / AI 輪播 / GridScan / 3D 列印）
│   └── ribbons.js             首頁與聯絡區的 WebGL 線條背景
├── vendor/                    第三方函式庫（已放本地，不依賴 CDN）
│   ├── gsap/                  GSAP 3.12.5 + ScrollTrigger
│   └── three/                 three.js r147 + GLTFLoader + RoomEnvironment
└── assets/
    ├── img/web/               網頁開發作品截圖（5 張）
    ├── img/print/             3D 列印成品圖（目前三種風格各一）
    │   └── alt-q/             備選：Q 版風格
    ├── img/consult/           AI 顧問照片（目前為示意圖）
    ├── img/favicon.svg
    ├── video/                 App 操作影片與載入畫面（mp4 + 同名 jpg 封面）
    └── model/
        ├── quest3-data.js     Meta Quest 3 模型（GLB 轉 base64，目前頁面使用這個）
        └── quest3.glb         原始模型檔（備用，見 §5）
```

---

## 3. 上線前必須替換的內容（TODO）

| 位置 | 目前內容 | 要換成 |
|---|---|---|
| `index.html` 導覽列、頁尾、`<title>` | WEAVEX／織訊科技（虛構名稱） | 正式公司名稱、Logo |
| `index.html` 頁尾 | 「虛構公司名稱，示意用」 | 正式版權文字 |
| `index.html` 聯絡區 | hello@weavex.example、02-0000-0000、台北市（示意地址） | 正式聯絡資訊 |
| `js/main.js` 表單送出 | 只做前端驗證，顯示「已收到（示意表單）」 | 串接後端 API 或表單服務，已標 `TODO(後端)` |
| `js/showcase.js` → `AI_ITEMS` 第一筆「AI 顧問」 | 示意照片與「合作學校 A／B／C（示意）」 | 真實活動照片放進 `assets/img/consult/`，並填入學校名稱 |
| `js/showcase.js` → `MOCKS` 的「台灣燈塔」 | CSS 示意畫面（沒有截圖） | 補一張網站截圖，比照其他五筆用 `<img class="mk-shot">` |
| `index.html` 整合流程區 | 「小森食堂」虛構餐廳情境 | 可保留當示範；若要換成真實案例，替換文字與 mockup |
| `<head>` | 未設定 `og:url`、`og:image` | 上線網址與 1200×630 分享圖 |

---

## 4. 頁面區塊與對應程式

| 區塊 | HTML id | 主要邏輯 |
|---|---|---|
| 首頁主視覺（釘選＋標題拆分） | `#top` | `main.js` 的 hero timeline、`ribbons.js` |
| 軟體 × AI × 線下互動（三張卡片洗牌） | `#layers` | `main.js` 的 layers timeline |
| 六種服務（捲動切換） | `#services` | `main.js` 的 `SVC` 陣列；各服務 demo 在 `showcase.js` 的 `WeavexDemos.*` |
| 整合流程（5 步驟＋分岔） | `#flow` | `main.js` 的 `flowAt()`／`flowStep()` |
| 四個階段（橫向捲動） | `#process` | `main.js` 的 process horizontal |
| 聯絡表單 | `#contact` | `main.js` 的表單 submit |

常改的資料都集中在 `showcase.js` 開頭的陣列：`MOCKS`（網頁作品）、`APPS`（App 影片與章節）、`AI_ITEMS`（AI 應用卡片）、`MODELS`（3D 列印模型）。

---

## 5. 技術備註

- **Quest 3 模型**：在原型環境裡受 CSP 限制，模型是以 base64 字串（`quest3-data.js`）在記憶體中解析，並暫時停用 `createImageBitmap`。正式主機沒有這個限制，可以改成直接載入 `quest3.glb`，檔案小約 25%，見 `main.js` 的「Meta Quest 3 model」段落：
  ```js
  new THREE.GLTFLoader().load('assets/model/quest3.glb', function (g) { /* 同原本 parse 的 callback */ });
  ```
  改完後即可移除 `quest3-data.js` 與 `createImageBitmap` 的處理。模型只在捲到「虛擬實境」時才載入（lazy load）。
- **字型**：目前使用 Google Fonts（Bricolage Grotesque、Noto Sans TC、JetBrains Mono）。如需完全自架，可改用 self-hosted woff2。
- **瀏覽器需求**：Chrome、Edge、Safari、Firefox 近兩年的版本。虛擬實境的 GridScan 需要 WebGL2。
- **無障礙**：支援 `prefers-reduced-motion`，系統開啟「減少動態效果」時動畫會關閉。
- **行動版**：900px 以下會解除部分釘選捲動，改為一般直向排版。
- **快取建議**：`assets/`、`vendor/` 可設長快取，例如 `Cache-Control: max-age=31536000`；`index.html`、`css/`、`js/` 建議短快取或檔名加版本號。影片的 Range Request 一般靜態主機都預設支援。
- **授權**：GSAP 免費授權，商用網站也可使用（條款見 gsap.com/licensing）；three.js 採 MIT 授權，授權檔在 `vendor/three/LICENSE`。
- `showcase.js` 裡的 `CONSULT`／`WeavexDemos.consult` 是舊版獨立 AI 顧問輪播，目前沒有使用，可刪除。
