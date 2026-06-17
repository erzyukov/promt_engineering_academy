export interface HSpan {
  id: string;
  text: string;
}

export interface SpotTheHallucinationData {
  /** Вводная реплика — что это за «ответ AI». */
  intro?: string;
  /** Текст, заранее разбитый на кликабельные фрагменты. */
  spans: HSpan[];
  /** id фрагментов, содержащих галлюцинацию. */
  hallucinationIds: string[];
  explanation: string;
}
