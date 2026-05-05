import { RefractiveLink } from './Refractive';

export default function RefractiveHomeActions() {
  return (
    <>
      <RefractiveLink className="button button--primary" href="/writing/" preset="pill">
        글 읽기
      </RefractiveLink>
      <RefractiveLink className="button button--ghost" href="/projects/" preset="pill">
        작업물 보기
      </RefractiveLink>
    </>
  );
}
