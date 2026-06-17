import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

type ArticleComponent = LazyExoticComponent<ComponentType>;

/** Сопоставление slug → ленивый MDX-компонент статьи. */
export const articleComponents: Record<string, ArticleComponent> = {
  'how-llms-work': lazy(() => import('./articles/how-llms-work.mdx')),
  'prompt-structure': lazy(() => import('./articles/prompt-structure.mdx')),
  'hallucinations': lazy(() => import('./articles/hallucinations.mdx')),
};
