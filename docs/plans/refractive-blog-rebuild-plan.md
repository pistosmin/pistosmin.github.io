---
title: Refractive Blog Rebuild Plan
created: 2026-05-05
status: active
depth: deep
origin: user request plus prior session crash experiments
---

# Refractive Blog Rebuild Plan

## 0. 전제 재정정

이 계획은 처음 작성한 초안과 전제가 다르다. 현재 `src/components/Refractive.tsx`가 실제 refractive runtime을 쓰지 않는 것은 설계가 비어 있어서가 아니라, 이전 실험에서 크래시를 피하려고 의도적으로 만든 안전 shim이다.

더 중요한 정정은 이것이다. **문제의 1순위는 Refractive 자체라고 단정할 수 없다.** 공식 문서 기준으로 다시 보면 Astro, GitHub Pages, Pagefind라는 선택 자체는 블로그에 맞다. 문제는 내가 처음 제공한 구현이 Astro의 핵심 장점인 "정적 HTML 중심 + 필요한 곳만 작은 island"와 반대로 갔다는 데 있다.

초기 구현의 구조적 문제:

- `src/layouts/BaseLayout.astro`에서 Header 전체를 `<Header client:only="react">`로 렌더링했다.
- Astro 공식 문서에서 `client:only`는 서버 HTML 렌더링을 건너뛰고 페이지 로드 즉시 클라이언트에서 렌더링/하이드레이션하는 방식이다. 블로그의 전역 Header에 쓰기에는 과했다.
- Header 내부에 SearchDialog, ThemeToggle, Refractive 버튼들이 모두 묶였다. 그래서 모든 페이지가 처음부터 React runtime, 검색 UI 상태, 테마 상태, effect 컴포넌트 경계를 함께 떠안았다.
- BaseLayout에는 전역 `pointermove` 핸들러가 있었고, 이 핸들러가 `.liquid-control, .refractive-control`을 찾아 매 이동마다 `getBoundingClientRect()`와 CSS 변수 갱신을 수행했다.
- `src/styles/global.css`에는 전역 fixed background, 여러 `backdrop-filter`, 큰 `filter: blur`, glass 컨트롤 broad selector가 동시에 있었다.

따라서 이번 재빌드는 "Refractive를 어떻게 다시 넣을까"가 아니라, **블로그 shell을 완전히 정적이고 얇게 다시 세운 뒤, Search/Pagefind/Theme/Refractive를 독립적인 opt-in island로 분해하는 작업**이다.

이전 대화와 git 이력을 보면 흐름은 이렇다.

- `ea984da Replace site with Astro blog`: Astro 블로그와 `@hashintel/refractive`, CSS glass/backdrop/blur가 함께 들어간 초기 버전.
- 사용자가 GitHub Pages 배포본에서도 자원 사용량과 크래시를 보고함.
- `0aa319f Disable refractive runtime`: `@hashintel/refractive`만 제거하고 CSS glass는 유지한 실험. 그래도 크래시가 의심됨.
- `c746acc Restore refractive without CSS blur`: 반대로 refractive는 켜고 CSS `backdrop-filter`, 큰 `filter: blur`, 전역 pointer tracking을 끈 실험. 그래도 크래시 발생.
- `b913452 Disable refractive runtime again`: refractive runtime과 CSS blur/backdrop 후보를 모두 제거한 안전 배포. 이 시점부터 다음 의심 축은 블로그 페이지 아키텍처, React hydration, Search/Pagefind, 고정 배경/전역 CSS 구조로 좁혀졌다.

따라서 이번 재빌드의 핵심은 "Refractive API를 다시 살리자"가 아니다. 핵심은 **잘못 설계된 클라이언트 shell을 제거하고, 크래시를 만들 수 있는 효과 계층을 기본 아키텍처에서 격리한 뒤, 블로그의 읽기 경험을 먼저 안정화하는 것**이다. Refractive는 그 다음에 별도 실험실과 kill switch를 통해 다시 판단한다.

## 1. 문제 정의

pistoslog는 Astro, React, MDX, Pagefind 기반의 정적 GitHub Pages 블로그다. 빌드 파이프라인은 현재 `npm run check`, `npm run build` 기준으로 통과한다. 하지만 실제 브라우저 경험에서는 다음 문제가 있었다.

- 내부 브라우저/로컬 테스트 중 스크린샷 캡처 단계에서 크래시가 발생했다.
- GitHub Pages 배포본에서도 heavy visual effect 조합이 크래시를 유발하는 것으로 보였다.
- Refractive runtime만 끄거나 CSS blur/backdrop만 끄는 단일 실험으로는 충분히 안정화되지 않았다.
- 결국 현재 코드는 여러 effect를 제거한 안전 상태이며, 이 상태만 보고 "API가 비어 있다"고 판단하면 이전 실험의 의미를 놓친다.

새 목표는 다음이다.

1. 블로그 shell을 Astro 정적 HTML 중심으로 재구성한다.
2. 전역 Header를 React island에서 제거한다.
3. Search, Theme, ReadingProgress 같은 기능만 작고 독립적인 island로 둔다.
4. Pagefind는 정적 검색 라이브러리로 유지하되, 검색 dialog가 열리고 query가 충분할 때만 로드한다.
5. glassmorphism은 CSS-only, low-cost surface system으로 다시 만든다.
6. Refractive는 기본 UI가 아니라 격리된 experimental adapter로 둔다.
7. 효과를 켜고 끄는 진단 플래그를 넣어, 다시 크래시가 나도 원인을 분리할 수 있게 한다.

## 2. 실패 분석

### 2.1 블로그 shell이 Astro island 원칙을 어겼다

Astro 공식 문서는 Astro 컴포넌트가 기본적으로 정적 HTML/CSS로 렌더링되고, 클라이언트 JavaScript는 `client:*`로 명시한 컴포넌트에만 로드되는 것이 성능상의 핵심이라고 설명한다. 그런데 초기 구현은 모든 페이지의 Header를 `client:only="react"`로 만들었다.

이건 블로그에 맞지 않는다. Header의 링크, brand, footer, 글 카드, 본문은 모두 정적 HTML이면 충분하다. 실제 상호작용은 검색 열기, 검색 실행, 테마 전환 정도다. 따라서 Header 전체를 React로 올린 것은 과한 client shell이고, GitHub Pages에 올렸을 때 브라우저가 처음부터 처리해야 할 작업을 불필요하게 늘렸다.

교훈:

- Header, footer, nav, card, article frame은 Astro 컴포넌트여야 한다.
- React는 SearchDialog, ThemeToggle, ReadingProgress처럼 상태가 필요한 작은 컴포넌트에만 쓴다.
- `client:only`는 browser API 때문에 SSR이 불가능한 작은 컴포넌트에만 쓴다. 전역 레이아웃 shell에 쓰지 않는다.

### 2.2 Refractive는 "나쁜 코드"가 아니라 "위험한 기본값"이었다

`@hashintel/refractive`를 사용한 이전 구현은 `refractive.div`, `refractive.a`, `refractive.button`을 통해 SVG displacement, canvas/ImageData, ResizeObserver, `backdropFilter: url(#...)` 계열의 런타임을 끌어왔다. 번들 크기 자체는 치명적이지 않았지만, 렌더링 파이프라인에서는 훨씬 비싼 조합이었다.

하지만 더 중요한 문제는 Refractive를 사용했다는 사실 자체보다, 그것이 이미 잘못된 client shell 안에 들어갔다는 점이다. Header 전체가 즉시 클라이언트 렌더링되는 구조였기 때문에 Refractive가 실제 범인인지, React shell/전역 pointer/CSS blur와 결합해 터진 것인지 분리하기 어려워졌다.

교훈:

- Refractive는 default renderer가 아니라 optional renderer여야 한다.
- 기본 UI는 plain HTML/CSS로 완성되어야 한다.
- Refractive는 한정된 demo/lab route에서만 먼저 검증한다.

### 2.3 CSS glass도 단독으로 안전하다고 볼 수 없었다

이전 실험에서 Refractive만 끈 상태에서도 크래시가 계속 의심됐다. 당시 CSS에는 여러 `backdrop-filter`, 큰 `filter: blur`, fixed background layer, pointer-driven glow가 함께 있었다.

교훈:

- CSS-only glass도 "가벼운 장식"이라고 단정하면 안 된다.
- 넓은 면적의 blur, fixed layer blur, 여러 겹의 backdrop-filter는 기본 UI에서 제외한다.
- glass 표현은 blur가 아니라 색, 투명도, stroke, inset highlight, shadow, texture로 만든다.

### 2.4 Pagefind 선택은 맞지만 연결 위치가 틀렸다

Pagefind 공식 문서는 Pagefind가 정적 HTML을 색인하고, 빌드 결과에 정적 검색 번들과 인덱스를 추가하는 방식이라고 설명한다. GitHub Pages 같은 정적 호스팅과 잘 맞는다. 따라서 Pagefind 자체를 뺄 이유는 없다.

문제는 SearchDialog가 Header React island 안에 있고, Header가 모든 페이지에서 즉시 클라이언트 렌더링된다는 점이다. 검색은 사용자가 열기 전까지 필요 없다.

교훈:

- Pagefind는 유지한다.
- 검색 버튼은 Astro 정적 HTML 또는 아주 작은 island로 둔다.
- Pagefind JS는 dialog open + query 조건 이후에만 dynamic import한다.

### 2.5 페이지 아키텍처가 너무 빨리 React island에 기대었다

현재 `BaseLayout.astro`는 `Header client:only="react"`를 사용한다. 그 안에 Header, SearchDialog, ThemeToggle이 함께 들어가고, SearchDialog는 Pagefind를 동적으로 import한다.

이 구조가 직접 크래시 원인이라고 확정할 수는 없다. 하지만 이전 실험에서 Refractive와 blur/backdrop을 제거한 뒤에도 문제가 남는다면 다음 후보는 이쪽이다.

교훈:

- 내비게이션은 Astro 정적 HTML이어야 한다.
- Search와 Theme만 작은 island로 분리한다.
- Pagefind import는 검색 dialog가 열리고 query가 충분할 때만 실행한다.
- hydration 전 fallback과 hydration 후 UI가 크게 달라지지 않게 한다.

### 2.6 "디자인 실험"과 "블로그 제품"이 섞였다

초기 화면은 분위기가 있었지만, 안정적인 읽기 제품으로서의 구조가 먼저 서지 않았다. 글 목록, 글 상세, 현재 위치, 검색 접근성, 뒤로가기, 읽은 글 표시, 댓글/광고 순서 같은 UX 기본기가 effect보다 뒤에 있었다.

교훈:

- 먼저 읽기 경험을 완성하고, 효과는 그 위에 얹는다.
- 본문과 긴 설명은 glass 뒤에 두지 않는다.
- 효과가 꺼진 상태가 최종 제품으로도 부끄럽지 않아야 한다.

## 3. 재빌드 원칙

1. 기본값은 `static-first`다. 전역 shell은 Astro HTML이다.
2. 기본값은 `fx=stable`이다. Refractive와 backdrop blur는 기본값이 아니다.
3. 사이트는 JavaScript 없이도 읽기, 이동, RSS, 상세 페이지 접근이 가능해야 한다.
4. React island는 검색, 테마, 읽기 진행률처럼 필요한 곳에만 둔다.
5. `client:only`는 전역 레이아웃에 쓰지 않는다.
6. glassmorphism은 CSS-only surface token으로 구현한다.
7. Refractive는 `fx=experimental-refractive` 또는 별도 lab page에서만 켠다.
8. 크래시 가능성이 있는 효과는 URL flag나 env flag로 즉시 끌 수 있어야 한다.
9. 새 시각 효과를 추가할 때마다 "렌더링 비용 예산"을 적는다.
10. 로컬 내부 브라우저가 불안정하므로, 시각 검증은 GitHub Pages 배포본, curl asset inspection, 사용자가 여는 실제 브라우저, 필요 시 Playwright CLI smoke 순서로 한다.

## 4. 핵심 컬러와 시각 방향

방향은 "진짜 유리 시뮬레이션"이 아니라 "편집형 고급 표면"이다. 따뜻한 종이, 선명한 먹색, 세이지, 슬레이트 블루, 코럴을 유지하되 blur 의존도를 낮춘다.

### Light theme

- `ink`: `#181713` - 제목과 본문.
- `paper`: `#F5EFE4` - 전체 배경.
- `paper-raised`: `#FFF9EE` - 본문, 글 카드, 검색 결과.
- `sage`: `#5F7368` - primary accent, active nav, CTA.
- `slate-blue`: `#526E93` - 보조 링크, glass tint.
- `coral`: `#C37767` - 제한적 강조.
- `amber`: `#D2A64E` - 진행률, 짧은 highlight.

### Dark theme

- `night`: `#070A12` - 전체 배경.
- `night-raised`: `#111827` - 읽기 표면.
- `moon`: `#F2E9D9` - 주요 텍스트.
- `mist`: `#B9C3D3` - 보조 텍스트.
- `glass-blue`: `#8FB0F4` - 어두운 모드의 차가운 tint.
- `warm-glass`: `#E8DCCA` - 얇은 border/specular.
- `coral-dark`: `#EBA291` - 제한적 강조.

### Glass 표현 방식

기본 glass는 다음으로 만든다.

- 반투명 background color.
- 1px light/dark mixed border.
- inset top highlight.
- 낮은 shadow.
- 아주 약한 static grain 또는 gradient.

기본 glass에서 금지한다.

- `backdrop-filter`를 넓은 면적에 적용.
- fixed full-screen blur.
- SVG displacement.
- pointermove마다 `getBoundingClientRect()` 호출.
- text 뒤의 움직이는 광택.

## 5. 새 아키텍처

### 5.1 계층

```text
content collections
  -> content helpers
  -> static layout shell
  -> design tokens
  -> stable surface system
  -> small interactive islands
  -> experimental effect lab
```

중요한 변화는 React/effect layer가 본 페이지 shell 밖으로 밀려난다는 점이다. Astro shell이 먼저고, island는 나중이다.

### 5.2 제안 파일 구조

```text
src/
  components/
    layout/
      SiteHeader.astro
      SiteFooter.astro
    search/
      SearchDialog.tsx
    theme/
      ThemeToggle.tsx
    reading/
      ArticleFrame.astro
      ReadingProgress.tsx
      ReadingRail.tsx
    cards/
      PostCard.astro
      ProjectCard.astro
    effects/
      EffectMode.ts
      StableGlass.astro
      RefractiveShim.tsx
      ExperimentalRefractive.tsx
      LiquidGlassLab.tsx
  styles/
    global.css
    tokens.css
    base.css
    layout.css
    surfaces.css
    content.css
    components.css
```

이동은 점진적으로 한다. 먼저 effect 경계를 만들고, 그 다음 Header와 Search를 분리한다.

### 5.3 Effect mode

지원 모드는 다음처럼 둔다.

```text
stable
  production default
  CSS-only, no backdrop-filter, no refractive runtime

css-glass
  limited enhancement
  small-area blur may be allowed only after test

experimental-refractive
  lab/demo only
  imports @hashintel/refractive dynamically

flat
  emergency kill switch
  readable surfaces only
```

URL flag 후보:

```text
?fx=stable
?fx=css-glass
?fx=refractive-lab
?fx=flat
```

운영 기본값은 항상 `stable` 또는 `flat`으로 즉시 되돌릴 수 있어야 한다.

## 6. Refractive 재도입 전략

### 6.1 지금 하지 않을 것

- `@hashintel/refractive`를 다시 기본 의존성으로 넣지 않는다.
- Header, CTA, 카테고리 칩, 검색 버튼에 Refractive를 바로 적용하지 않는다.
- "이번에는 조금 낮은 값이면 괜찮겠지" 식으로 production에 넣지 않는다.

### 6.2 먼저 만들 것

- `RefractiveShim`: 현재처럼 기존 호출부 API를 보존하되 stable mode에서는 plain `a/button/div`만 렌더링한다.
- `ExperimentalRefractive`: dynamic import로 `@hashintel/refractive`를 lab에서만 불러온다.
- `LiquidGlassLab`: 하나의 route 또는 글 내부 demo에서만 Refractive를 켜고, 표면 개수와 크기를 제한한다.
- `EffectMode`: URL flag, localStorage, env flag를 읽어 mode를 결정한다.

### 6.3 Refractive를 다시 통과시키려면 필요한 조건

- lab route에서 Refractive surface 1개, 3개, 6개 단계별 테스트.
- 모바일 실제 브라우저에서 60초 이상 스크롤/탭/테마 전환 안정성 확인.
- CSS blur/backdrop이 꺼진 상태와 켜진 상태를 분리해 확인.
- 라이브 asset에 `feDisplacementMap`, `ResizeObserver`, `ImageData`, `backdropFilter`가 어디에 포함되는지 기록.
- stable mode로 돌아가는 kill switch 검증.

이 조건을 만족하기 전까지 Refractive는 블로그 UI 재료가 아니다.

## 7. 페이지별 UX 계획

### 7.1 Home

목표는 "읽을 글이 있는 개인 출판 공간"이 첫 화면에서 보이는 것이다.

- H1은 3줄 내외로 유지한다.
- 설명문은 짧고 선명하게 둔다.
- `글 읽기` CTA를 primary로 둔다.
- 프로필과 카테고리 인덱스는 stable glass surface로 낮춘다.
- 0개 카테고리는 링크로 노출하지 않거나 disabled 상태로 둔다.
- 최근 글 시작부가 첫 viewport 아래쪽에 보여야 한다.

### 7.2 Writing list

- 카테고리는 anchor 이동 또는 실제 필터 중 하나로 명확히 정한다.
- 빈 anchor로 이동하지 않게 한다.
- 글 카드는 readable surface를 기본으로 둔다.
- 방문한 글 표시 또는 읽은 글 표시를 제공한다.
- 긴 제목과 긴 태그가 모바일에서 넘치지 않게 한다.

### 7.3 Article detail

- 본문 폭은 680-720px.
- 본문 뒤에는 glass/refraction을 깔지 않는다.
- 목차는 desktop rail, mobile 접힘 패널로 둔다.
- Reading progress는 얇고 정적인 UI로 시작한다.
- 댓글은 본문 바로 아래, 광고는 그 뒤로 둔다.
- `updated`가 있으면 메타에 표시한다.

### 7.4 Header

- Header는 Astro 정적 컴포넌트로 바꾼다.
- 현재 페이지에 `aria-current="page"`를 붙인다.
- Search와 Theme만 개별 island로 둔다.
- 모바일 메뉴는 가로 스크롤이면 fade 단서를 주거나 2줄 래핑으로 바꾼다.

### 7.5 Search

- dialog를 열기 전에는 Pagefind를 import하지 않는다.
- query가 2글자 이상일 때만 검색한다.
- focus trap, Escape close, focus restore를 구현한다.
- 결과는 readable surface에 둔다.
- 검색 버튼과 input은 명시적 `aria-label`을 가진다.

## 8. 구현 단위와 테스트

### Unit A: Effect safety baseline

대상 파일:

- `src/components/Refractive.tsx`
- `src/components/effects/EffectMode.ts`
- `src/components/effects/RefractiveShim.tsx`
- `src/styles/surfaces.css`
- `src/layouts/BaseLayout.astro`

결정:

- 현재 Refractive shim은 실패의 흔적이므로 유지한다.
- 이름은 유지하되 문서와 주석으로 "production-safe shim"임을 명확히 한다.
- 신규 effect는 `effects/` 아래로만 들어간다.

테스트:

- `npm run check`
- `npm run build`
- `rg -n "@hashintel/refractive|feDisplacementMap|backdropFilter|ImageData|ResizeObserver" dist` 결과가 stable build에서는 비어 있어야 한다.

### Unit B: CSS surface reset

대상 파일:

- `src/styles/global.css`
- `src/styles/tokens.css`
- `src/styles/base.css`
- `src/styles/surfaces.css`
- `src/styles/layout.css`

결정:

- `.liquid-control` broad selector를 새 코드에서 금지한다.
- readable, stable glass, action chrome을 분리한다.
- `backdrop-filter`는 기본 surface에서 쓰지 않는다.

테스트:

- `npm run check`
- `npm run build`
- `rg -n "backdrop-filter|filter: blur" dist/_astro`로 production CSS 확인.
- 360px, 390px, 430px, 768px, 1440px에서 수평 오버플로우 확인.

### Unit C: Static header and small islands

대상 파일:

- `src/components/Header.tsx`
- `src/components/layout/SiteHeader.astro`
- `src/components/SearchDialog.tsx`
- `src/components/ThemeToggle.tsx`
- `src/layouts/BaseLayout.astro`

결정:

- Header 전체 `client:only="react"`를 제거한다.
- Search와 Theme만 필요하면 hydrate한다.
- fallback markup과 hydrated markup의 접근성 이름을 맞춘다.

테스트:

- `npm run check`
- `npm run build`
- 빌드 asset에서 Header용 React entry가 사라졌는지 확인.
- nav active state와 search button aria label 확인.

### Unit D: Home rebuild

대상 파일:

- `src/pages/index.astro`
- `src/components/RefractiveHomeActions.tsx`
- `src/components/cards/PostCard.astro`
- `src/components/cards/ProjectCard.astro`
- `src/styles/layout.css`
- `src/styles/components.css`

테스트:

- 첫 viewport에서 H1, 설명, `글 읽기`가 보인다.
- 빈 카테고리가 링크로 이동하지 않는다.
- 모바일 hero와 profile card가 폭을 넘지 않는다.
- `npm run check`
- `npm run build`

### Unit E: Article reading architecture

대상 파일:

- `src/pages/posts/[...slug].astro`
- `src/pages/notes/[...slug].astro`
- `src/pages/projects/[...slug].astro`
- `src/components/reading/ArticleFrame.astro`
- `src/components/reading/ReadingProgress.tsx`
- `src/components/reading/ReadingRail.tsx`
- `src/components/Giscus.astro`
- `src/components/AdSlot.astro`
- `src/styles/content.css`

테스트:

- 본문 폭과 행간이 안정적이다.
- 목차가 mobile에서 overflow를 만들지 않는다.
- 댓글이 광고보다 먼저 나온다.
- `updated` 메타가 표시된다.
- `npm run check`
- `npm run build`

### Unit F: Search and Pagefind isolation

대상 파일:

- `src/components/search/SearchDialog.tsx`
- `src/components/SearchDialog.tsx`
- `src/styles/components.css`

테스트:

- dialog open 전 Pagefind JS를 import하지 않는다.
- Escape close, focus restore, Tab trap이 동작한다.
- 결과 개수 메시지는 `aria-live="polite"`다.
- `npm run check`
- `npm run build`

### Unit G: Refractive lab, optional

대상 파일:

- `src/components/effects/ExperimentalRefractive.tsx`
- `src/components/effects/LiquidGlassLab.tsx`
- `src/pages/lab/liquid-glass.astro` 또는 `src/content/posts/liquid-glass-blog-ui.mdx`

조건:

- stable rebuild가 완료된 뒤에만 시작한다.
- production route에 자동 노출하지 않는다.
- `@hashintel/refractive`는 dynamic import 또는 별도 chunk로 격리한다.

테스트:

- stable build에서는 heavy runtime 문자열이 없다.
- lab route에서만 Refractive chunk가 로드된다.
- `?fx=flat`에서 lab 효과가 꺼진다.

## 9. 실행 순서

### Phase 0: 이전 실험 정리

- `ea984da`, `0aa319f`, `c746acc`, `b913452`의 목적을 문서에 남긴다.
- 현재 `Refractive.tsx`가 shim인 이유를 코드 주석 또는 docs에 남긴다.
- 이전 문서 `docs/liquid-glass-ui-plan.md` 상단에 이번 계획으로 superseded 되었음을 표시한다.

완료 기준:

- 새 작업자가 현재 코드만 보고 Refractive가 "실수로 빈 것"이라고 오해하지 않는다.

### Phase 1: Stable baseline architecture

- Header를 Astro 정적으로 바꾼다.
- Search/Theme island를 분리한다.
- Pagefind import를 lazy하게 만든다.
- CSS surface를 stable mode 기준으로 정리한다.

완료 기준:

- stable build에 `@hashintel/refractive`, `feDisplacementMap`, `backdrop-filter`, 큰 `filter: blur`가 없다.
- 기본 사이트가 고급스럽지만 가볍게 보인다.

### Phase 2: Read-first UI rebuild

- Home, Writing, Article detail의 정보 구조를 다시 잡는다.
- 글 목록과 본문은 readable surface로 정리한다.
- current nav, visited/read state, updated meta, back behavior를 넣는다.

완료 기준:

- effect가 없어도 블로그 제품으로 성립한다.
- 모바일에서 수평 스크롤이 없다.

### Phase 3: UX interaction hardening

- Search dialog 접근성을 완성한다.
- Reading progress와 ReadingRail을 작게 추가한다.
- giscus theme sync와 댓글/광고 순서를 정리한다.

완료 기준:

- keyboard-only로 주요 흐름이 가능하다.
- 댓글 흐름이 읽기 흐름을 방해하지 않는다.

### Phase 4: Remote verification loop

- 로컬 내부 브라우저 대신 GitHub Pages 배포본 기준으로 확인한다.
- `curl`로 HTML/CSS/JS asset 문자열을 확인한다.
- 필요하면 사용자가 실제 브라우저에서 `?fx=flat`, `?fx=stable`을 비교한다.

완료 기준:

- 배포본 asset이 의도한 effect mode와 일치한다.
- 크래시가 발생하면 어떤 mode에서 발생했는지 기록할 수 있다.

### Phase 5: Refractive lab only

- stable UI와 별도로 lab route에서 Refractive를 실험한다.
- surface 개수와 크기를 제한한다.
- mobile 실제 브라우저 안정성 확인 전까지 본 UI에는 넣지 않는다.

완료 기준:

- Refractive가 production shell과 분리되어 있다.
- 언제든 `flat`으로 되돌릴 수 있다.

## 10. 반복 방지 체크리스트

- 현재 코드를 보기 전에 이전 실험 커밋과 세션 결론을 확인했는가?
- 제거된 효과가 "실수"인지 "크래시 회피"인지 구분했는가?
- 새 effect가 stable 기본값에 들어가 있지 않은가?
- `@hashintel/refractive`가 production initial route에 포함되지 않는가?
- `backdrop-filter`나 큰 `filter: blur`가 넓은 면적에 적용되지 않는가?
- Header 전체를 React island로 만들지 않았는가?
- Pagefind가 검색 전부터 import되지 않는가?
- hover 정보가 focus에서도 보이는가?
- 모바일 360px에서 넘치는 텍스트나 카드가 없는가?
- `npm run check`, `npm run build`, asset 문자열 검사를 했는가?

## 11. 최종 완료 기준

- `npm run check` 통과.
- `npm run build` 통과.
- stable build asset에 `@hashintel/refractive`, `feDisplacementMap`, `ImageData`, `ResizeObserver`, `backdropFilter`, `backdrop-filter`, 큰 `filter: blur`가 없다.
- Header는 정적 Astro shell이며 Search/Theme만 작은 island다.
- Home, Writing, Article detail이 effect 없이도 충분히 고급스럽다.
- 본문에는 glass/refraction이 깔리지 않는다.
- 검색 dialog는 keyboard-only로 사용할 수 있다.
- 360px, 390px, 430px, 768px, 1440px에서 수평 스크롤이 없다.
- Refractive는 lab 또는 opt-in mode에만 존재한다.
- 이전 크래시 실험의 교훈이 README 또는 docs에 남아 있다.

## 11.1 2026-05-05 implementation checkpoint

이번 배포에서 완료한 범위:

- Header 전체 `client:only="react"` 제거.
- `src/components/SiteHeader.astro`로 정적 Header shell 구성.
- SearchDialog와 ThemeToggle만 `client:idle` island로 유지.
- `src/components/Header.tsx` 제거.
- Refractive wrapper에 `enableRefractive` opt-in prop 추가.
- production dependency에 `@hashintel/refractive` 미포함 유지.
- 기본 CSS에서 `backdrop-filter`, 큰 `filter: blur`, 전역 pointermove 추적 미사용 유지.
- 홈의 0개 카테고리를 disabled surface로 처리.
- 글목록의 빈 카테고리 anchor 제거.
- `scripts/verify-architecture.mjs`로 위 회귀를 자동 검사.

아직 production에 넣지 않은 범위:

- Refractive runtime 재도입.
- experimental lab route.
- URL 기반 `fx` mode/killswitch.
- Reading progress/rail.
- 로컬 브라우저 기반 시각 회귀 테스트.

## 12. 참고 근거

- 이전 UX 점검: `docs/ux-audit-2026-05-05.md`
- 이전 부분 계획: `docs/liquid-glass-ui-plan.md`
- 현재 안전 shim: `src/components/Refractive.tsx`
- 현재 전역 CSS: `src/styles/global.css`
- 초기 Refractive 도입 커밋: `ea984da Replace site with Astro blog`
- Refractive 제거 실험: `0aa319f Disable refractive runtime`
- Refractive ON, CSS blur OFF 실험: `c746acc Restore refractive without CSS blur`
- Refractive 재제거 안전 배포: `b913452 Disable refractive runtime again`
- CSS `backdrop-filter`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter
- Filter Effects Level 2 backdrop-filter draft: https://drafts.csswg.org/filter-effects-2/
- SVG `feDisplacementMap`: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap
