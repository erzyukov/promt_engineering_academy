export interface OrderStep {
  id: string;
  text: string;
}

export interface OrderStepsData {
  /** Шаги в перемешанном виде (как показываются пользователю). */
  steps: OrderStep[];
  /** Правильный порядок — массив id шагов. */
  correctOrder: string[];
  explanation?: string;
}
