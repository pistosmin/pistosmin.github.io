# pistoslog

Astro, React, TypeScript, MDX로 만든 개인 블로그 겸 작업물 아카이브입니다.

## 개발

```sh
npm install
npm run dev
```

로컬 서버는 기본적으로 `http://localhost:4321`에서 열립니다.

## 콘텐츠 작성

새 글:

```sh
npm run new:post -- "글 제목"
```

새 프로젝트:

```sh
npm run new:project -- "프로젝트 이름"
```

콘텐츠 위치는 다음과 같습니다.

- `src/content/posts`: 완성된 블로그 글
- `src/content/projects`: 개인 작업물

## 검증

```sh
npm run check
npm run build
```

`npm run build`는 Astro 타입 체크, 정적 빌드, Pagefind 검색 인덱스 생성을 함께 실행합니다.

## 댓글과 광고

`.env.example`을 참고해 giscus와 AdSense 공개 값을 설정합니다.

```sh
cp .env.example .env
```

giscus는 GitHub Discussions를 활성화한 뒤 발급되는 `repo id`, `category id`가 필요합니다.

## 배포

`.github/workflows/deploy.yml`은 `main` 브랜치 push 시 GitHub Pages로 `dist`를 배포합니다.
