export interface ArticleMeta {
  slug: string;
  title: string;
  summary: string;
  order: number;
  /** Ориентировочное время чтения, минуты */
  readingTime: number;
}

export const articles: ArticleMeta[] = [
  {
    slug: 'how-llms-work',
    title: 'Как работают LLM (на пальцах)',
    summary:
      'Токены, предсказание следующего слова и контекст — интуиция без математики.',
    order: 1,
    readingTime: 8,
  },
  {
    slug: 'prompt-structure',
    title: 'Структура эффективного промпта',
    summary:
      'Роль, контекст, задача, формат и ограничения — из чего собран хороший промпт.',
    order: 2,
    readingTime: 9,
  },
  {
    slug: 'hallucinations',
    title: 'Галлюцинации: почему AI уверенно врёт',
    summary: 'Откуда берутся выдумки, как их распознавать и проверять факты.',
    order: 3,
    readingTime: 7,
  },
];

export function getArticle(slug: string): ArticleMeta | undefined {
  return articles.find((a) => a.slug === slug);
}
