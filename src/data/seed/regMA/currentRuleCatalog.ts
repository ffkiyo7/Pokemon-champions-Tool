export const currentRuleSelectableItemIds = [
  'sitrus-berry',
  'venusaurite',
  'charizardite-x',
  'charizardite-y',
  'garchompite',
] as const;

export const currentRuleNatureOptions = [
  { id: '爽朗', up: ['速度'], down: ['特攻'] },
  { id: '胆小', up: ['速度'], down: ['攻击'] },
  { id: '固执', up: ['攻击'], down: ['特攻'] },
  { id: '慎重', up: ['特防'], down: ['特攻'] },
  { id: '冷静', up: ['特攻'], down: ['速度'] },
  { id: '怕慢(+速)', up: ['速度'], down: [] },
] as const;

export const currentRuleCatalogNotes = {
  items: 'Selectable item pool is intentionally smaller than seed data until the Reg M-A item catalog is fully joined and reviewed.',
  moves: 'Move choices still use local seed learnsets and remain review-grade, not a complete Reg M-A learnset.',
  natures: 'Nature choices are the current UI subset and must be expanded after the full Champions nature catalog is confirmed.',
} as const;
