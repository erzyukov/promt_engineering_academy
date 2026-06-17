import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

type ArticleComponent = LazyExoticComponent<ComponentType>;

/**
 * Сопоставление slug → ленивый MDX-компонент статьи.
 * Статьи №2 и №3 добавятся сюда по мере написания (Фаза 4).
 */
export const articleComponents: Record<string, ArticleComponent> = {
  'how-llms-work': lazy(() => import('./articles/how-llms-work.mdx')),
};
