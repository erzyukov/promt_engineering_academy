export interface CaseCriterion {
  id: string;
  /** Что проверяем: «Задана роль», «Указан формат»... */
  label: string;
  /** Подстроки-маркеры (сравнение без регистра/ё). Критерий выполнен, если найдена любая. */
  anyOf?: string[];
  /** Доп. шаблон-регэксп (source, флаг i). */
  regex?: string;
}

export interface CaseStudyData {
  /** Что нужно получить от модели. */
  brief: string;
  /** Стартовый слабый промпт (в поле редактирования). */
  weakPrompt: string;
  /** Эвристические критерии «хорошего» промпта. */
  criteria: CaseCriterion[];
  /** Пример сильного промпта — показывается после проверки. */
  referenceGood: string;
  explanation: string;
}
