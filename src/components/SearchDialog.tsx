import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { RefractiveButton } from './Refractive';

type SearchResult = {
  url: string;
  title: string;
  excerpt: string;
};

type PagefindResult = {
  data: () => Promise<{
    url: string;
    excerpt: string;
    meta: {
      title?: string;
      description?: string;
    };
  }>;
};

export default function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [message, setMessage] = useState('검색어를 입력해 주세요.');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }

      if (event.key === 'Escape') setOpen(false);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    window.setTimeout(() => inputRef.current?.focus(), 40);
  }, [open]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setMessage('두 글자 이상 입력하면 글과 프로젝트를 찾습니다.');
      return;
    }

    let cancelled = false;

    async function runSearch() {
      try {
        const pagefindPath = '/pagefind/pagefind.js';
        const pagefind = await import(/* @vite-ignore */ pagefindPath);
        const search = await pagefind.search(trimmed);
        const loaded = await Promise.all(
          search.results.slice(0, 8).map(async (result: PagefindResult) => {
            const data = await result.data();
            return {
              url: data.url,
              title: data.meta.title ?? 'Untitled',
              excerpt: data.excerpt,
            };
          }),
        );

        if (!cancelled) {
          setResults(loaded);
          setMessage(loaded.length > 0 ? `${loaded.length}개의 결과` : '검색 결과가 없습니다.');
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setMessage('검색 인덱스는 프로덕션 빌드 후 활성화됩니다.');
        }
      }
    }

    runSearch();

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <>
      <RefractiveButton className="search-trigger" type="button" onClick={() => setOpen(true)} preset="pill">
        <Search aria-hidden="true" size={16} />
        <span>Search</span>
        <kbd>⌘K</kbd>
      </RefractiveButton>

      {open && (
        <div className="search-layer" role="presentation">
          <button className="search-backdrop" type="button" aria-label="검색 닫기" onClick={() => setOpen(false)} />
          <section className="search-dialog" role="dialog" aria-modal="true" aria-label="사이트 검색">
            <div className="search-field">
              <Search aria-hidden="true" size={18} />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="글, 태그, 프로젝트 검색"
              />
              <RefractiveButton
                className="icon-button"
                type="button"
                aria-label="검색 닫기"
                onClick={() => setOpen(false)}
                preset="icon"
              >
                <X aria-hidden="true" size={18} />
              </RefractiveButton>
            </div>

            <p className="search-message">{message}</p>

            {results.length > 0 && (
              <div className="search-results">
                {results.map((result) => (
                  <a className="search-result" href={result.url} key={result.url} onClick={() => setOpen(false)}>
                    <strong>{result.title}</strong>
                    <span dangerouslySetInnerHTML={{ __html: result.excerpt }} />
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
