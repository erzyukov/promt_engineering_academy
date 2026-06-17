import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { articles } from '../content/registry';
import { useProgress } from '../hooks/useLocalProgress';

export function Home() {
  const sorted = [...articles].sort((a, b) => a.order - b.order);
  const progress = useProgress();

  return (
    <div className="container">
      <section className="hero">
        <h1 className="hero__title">Учись писать промпты на практике</h1>
        <p className="hero__subtitle">
          Не сухая теория и не списки «100 лучших промптов». Читаешь абзац — тут же
          проверяешь понимание интерактивным упражнением, идёшь дальше.
        </p>
      </section>

      <section className="articles">
        <h2 className="section-title">Статьи</h2>
        <div className="article-grid">
          {sorted.map((a) => {
            const done = progress[a.quizId];
            return (
              <Link key={a.slug} to={`/article/${a.slug}`} className="article-card">
                <div className="article-card__top">
                  <span className="article-card__order">{a.order}</span>
                  {done && (
                    <span className="article-card__done" title="Тест пройден">
                      <CheckCircle2 size={15} />
                      {done.pct}%
                    </span>
                  )}
                </div>
                <h3 className="article-card__title">{a.title}</h3>
                <p className="article-card__summary">{a.summary}</p>
                <span className="article-card__meta">{a.readingTime} мин чтения</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
