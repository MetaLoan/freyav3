/**
 * 塔罗牌数据库 - 78 张完整塔罗牌
 * 
 * 22 张大阿卡纳 (Major Arcana) + 56 张小阿卡纳 (Minor Arcana)
 * 小阿卡纳分 4 组：Wands(权杖) / Cups(圣杯) / Swords(宝剑) / Pentacles(星币)
 */

export type TarotSuit = 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';

export interface TarotCardData {
  id: string;
  name: string;
  suit: TarotSuit;
  keywords: string[];
  description: string;
  /** 正位含义 */
  uprightMeaning: string;
  /** 逆位含义 */
  reversedMeaning: string;
}

export const MAJOR_ARCANA: TarotCardData[] = [
  { id: '0', name: 'The Fool', suit: 'major', keywords: ['Beginnings', 'Innocence', 'Spontaneity'], description: 'A reminder of new beginnings and having faith in the future.', uprightMeaning: 'New beginnings, free spirit, innocence, spontaneity', reversedMeaning: 'Recklessness, risk-taking, holding back' },
  { id: '1', name: 'The Magician', suit: 'major', keywords: ['Manifestation', 'Resourcefulness', 'Power'], description: 'You have all the tools you need to succeed.', uprightMeaning: 'Willpower, desire, creation, manifestation', reversedMeaning: 'Trickery, illusions, manipulation' },
  { id: '2', name: 'The High Priestess', suit: 'major', keywords: ['Intuition', 'Sacred Knowledge', 'Divine Feminine'], description: 'Listen to your inner voice and trust your instincts.', uprightMeaning: 'Intuition, higher powers, mystery, subconscious mind', reversedMeaning: 'Hidden agendas, need to listen to inner voice' },
  { id: '3', name: 'The Empress', suit: 'major', keywords: ['Femininity', 'Beauty', 'Abundance'], description: 'Growth, abundance, and the nurturing power of nature.', uprightMeaning: 'Fertility, femininity, beauty, nature, abundance', reversedMeaning: 'Creative block, dependence on others' },
  { id: '4', name: 'The Emperor', suit: 'major', keywords: ['Authority', 'Structure', 'Control'], description: 'Structure, authority, and establishing solid foundations.', uprightMeaning: 'Authority, establishment, structure, a father figure', reversedMeaning: 'Domination, excessive control, lack of discipline' },
  { id: '5', name: 'The Hierophant', suit: 'major', keywords: ['Wisdom', 'Tradition', 'Conformity'], description: 'Spiritual wisdom, tradition, and conventional values.', uprightMeaning: 'Spiritual wisdom, religious beliefs, conformity, tradition', reversedMeaning: 'Personal beliefs, freedom, challenging the status quo' },
  { id: '6', name: 'The Lovers', suit: 'major', keywords: ['Love', 'Harmony', 'Choices'], description: 'Love, harmony, and significant choices in relationships.', uprightMeaning: 'Love, harmony, relationships, values alignment, choices', reversedMeaning: 'Self-love, disharmony, imbalance, misalignment' },
  { id: '7', name: 'The Chariot', suit: 'major', keywords: ['Willpower', 'Success', 'Determination'], description: 'Determination, willpower, and moving forward with purpose.', uprightMeaning: 'Control, willpower, success, action, determination', reversedMeaning: 'Self-discipline, opposition, lack of direction' },
  { id: '8', name: 'Strength', suit: 'major', keywords: ['Courage', 'Persuasion', 'Compassion'], description: 'Your inner strength, courage, and resilience.', uprightMeaning: 'Strength, courage, persuasion, influence, compassion', reversedMeaning: 'Inner strength, self-doubt, raw emotion' },
  { id: '9', name: 'The Hermit', suit: 'major', keywords: ['Soul-searching', 'Introspection', 'Inner Guidance'], description: 'A time for introspection and inner guidance.', uprightMeaning: 'Soul-searching, introspection, being alone, inner guidance', reversedMeaning: 'Isolation, loneliness, withdrawal' },
  { id: '10', name: 'Wheel of Fortune', suit: 'major', keywords: ['Luck', 'Karma', 'Destiny'], description: 'Life is full of cycles and constant change.', uprightMeaning: 'Good luck, karma, life cycles, destiny, a turning point', reversedMeaning: 'Bad luck, resistance to change, breaking cycles' },
  { id: '11', name: 'Justice', suit: 'major', keywords: ['Fairness', 'Truth', 'Law'], description: 'Fairness, truth, and the law of cause and effect.', uprightMeaning: 'Justice, fairness, truth, cause and effect, law', reversedMeaning: 'Unfairness, lack of accountability, dishonesty' },
  { id: '12', name: 'The Hanged Man', suit: 'major', keywords: ['Pause', 'Surrender', 'New Perspectives'], description: 'Pause, reflect, and see things from a new perspective.', uprightMeaning: 'Pause, surrender, letting go, new perspectives', reversedMeaning: 'Delays, resistance, stalling, indecision' },
  { id: '13', name: 'Death', suit: 'major', keywords: ['Endings', 'Transformation', 'Transition'], description: 'Transformation, endings, and new beginnings.', uprightMeaning: 'Endings, change, transformation, transition', reversedMeaning: 'Resistance to change, personal transformation, inner purging' },
  { id: '14', name: 'Temperance', suit: 'major', keywords: ['Balance', 'Moderation', 'Patience'], description: 'Balance, patience, and finding the middle path.', uprightMeaning: 'Balance, moderation, patience, purpose', reversedMeaning: 'Imbalance, excess, self-healing, re-alignment' },
  { id: '15', name: 'The Devil', suit: 'major', keywords: ['Shadow Self', 'Attachment', 'Addiction'], description: 'Bondage, materialism, and unhealthy attachments.', uprightMeaning: 'Shadow self, attachment, addiction, restriction, sexuality', reversedMeaning: 'Releasing limiting beliefs, exploring dark thoughts, detachment' },
  { id: '16', name: 'The Tower', suit: 'major', keywords: ['Sudden Change', 'Upheaval', 'Awakening'], description: 'Sudden upheaval, revelation, and necessary destruction.', uprightMeaning: 'Sudden change, upheaval, chaos, revelation, awakening', reversedMeaning: 'Personal transformation, fear of change, averting disaster' },
  { id: '17', name: 'The Star', suit: 'major', keywords: ['Hope', 'Faith', 'Renewal'], description: 'A beacon of hope, inspiration, and renewed faith.', uprightMeaning: 'Hope, faith, purpose, renewal, spirituality', reversedMeaning: 'Lack of faith, despair, self-trust, disconnection' },
  { id: '18', name: 'The Moon', suit: 'major', keywords: ['Illusion', 'Fear', 'Intuition'], description: 'Intuition, dreams, and the subconscious mind.', uprightMeaning: 'Illusion, fear, anxiety, subconscious, intuition', reversedMeaning: 'Release of fear, repressed emotion, inner confusion' },
  { id: '19', name: 'The Sun', suit: 'major', keywords: ['Positivity', 'Success', 'Vitality'], description: 'Radiates joy, success, and positive energy.', uprightMeaning: 'Positivity, fun, warmth, success, vitality', reversedMeaning: 'Inner child, feeling down, overly optimistic' },
  { id: '20', name: 'Judgement', suit: 'major', keywords: ['Rebirth', 'Inner Calling', 'Absolution'], description: 'Self-reflection, evaluation, and spiritual awakening.', uprightMeaning: 'Judgement, rebirth, inner calling, absolution', reversedMeaning: 'Self-doubt, inner critic, ignoring the call' },
  { id: '21', name: 'The World', suit: 'major', keywords: ['Completion', 'Accomplishment', 'Travel'], description: 'Completion, fulfillment, and achieving your goals.', uprightMeaning: 'Completion, integration, accomplishment, travel', reversedMeaning: 'Seeking personal closure, short-cuts, delays' },
];

const createMinorArcana = (suit: TarotSuit, suitName: string, startId: number): TarotCardData[] => {
  const cards: { name: string; keywords: string[]; description: string; upright: string; reversed: string }[] = [
    { name: `Ace of ${suitName}`, keywords: ['New Opportunity', 'Potential', 'Beginning'], description: `A spark of new ${suitName.toLowerCase()} energy.`, upright: 'New beginnings, inspiration, potential', reversed: 'Delays, missed opportunity, lack of direction' },
    { name: `Two of ${suitName}`, keywords: ['Balance', 'Partnership', 'Decisions'], description: `Weighing options in the realm of ${suitName.toLowerCase()}.`, upright: 'Planning, making decisions, partnerships', reversed: 'Indecision, lack of planning, imbalance' },
    { name: `Three of ${suitName}`, keywords: ['Growth', 'Expansion', 'Creativity'], description: `Growth and expansion of ${suitName.toLowerCase()} energy.`, upright: 'Growth, creativity, collaboration', reversed: 'Lack of growth, delays, overextension' },
    { name: `Four of ${suitName}`, keywords: ['Stability', 'Foundation', 'Security'], description: `A stable foundation in ${suitName.toLowerCase()}.`, upright: 'Stability, security, celebration', reversed: 'Instability, lack of foundation, stagnation' },
    { name: `Five of ${suitName}`, keywords: ['Conflict', 'Challenge', 'Change'], description: `Challenges in the realm of ${suitName.toLowerCase()}.`, upright: 'Conflict, competition, challenges', reversed: 'Resolution, compromise, harmony' },
    { name: `Six of ${suitName}`, keywords: ['Harmony', 'Progress', 'Sharing'], description: `Progress and sharing of ${suitName.toLowerCase()}.`, upright: 'Harmony, success, generosity', reversed: 'Imbalance, selfishness, lack of progress' },
    { name: `Seven of ${suitName}`, keywords: ['Assessment', 'Patience', 'Strategy'], description: `Assessing progress in ${suitName.toLowerCase()}.`, upright: 'Assessment, patience, perseverance', reversed: 'Impatience, lack of reward, shortcuts' },
    { name: `Eight of ${suitName}`, keywords: ['Movement', 'Action', 'Speed'], description: `Swift movement in ${suitName.toLowerCase()}.`, upright: 'Movement, action, rapid progress', reversed: 'Delays, stagnation, frustration' },
    { name: `Nine of ${suitName}`, keywords: ['Fulfillment', 'Attainment', 'Resilience'], description: `Near completion in ${suitName.toLowerCase()}.`, upright: 'Fulfillment, attainment, satisfaction', reversed: 'Setbacks, inner strength needed, near miss' },
    { name: `Ten of ${suitName}`, keywords: ['Completion', 'Culmination', 'Legacy'], description: `The culmination of ${suitName.toLowerCase()} energy.`, upright: 'Completion, legacy, culmination', reversed: 'Burden, resistance to completion, shortcuts' },
    { name: `Page of ${suitName}`, keywords: ['Curiosity', 'Potential', 'Learning'], description: `A youthful student of ${suitName.toLowerCase()}.`, upright: 'New ideas, curiosity, potential', reversed: 'Immaturity, lack of direction, procrastination' },
    { name: `Knight of ${suitName}`, keywords: ['Action', 'Adventure', 'Drive'], description: `The active pursuer of ${suitName.toLowerCase()}.`, upright: 'Action, adventure, drive, passion', reversed: 'Recklessness, restlessness, haste' },
    { name: `Queen of ${suitName}`, keywords: ['Nurturing', 'Mastery', 'Compassion'], description: `The nurturing master of ${suitName.toLowerCase()}.`, upright: 'Nurturing, compassion, mastery, calm', reversed: 'Insecurity, dependence, smothering' },
    { name: `King of ${suitName}`, keywords: ['Authority', 'Leadership', 'Mastery'], description: `The authoritative leader of ${suitName.toLowerCase()}.`, upright: 'Authority, leadership, mastery, control', reversed: 'Tyranny, rigidity, cold authority' },
  ];

  return cards.map((card, i) => ({
    id: (startId + i).toString(),
    name: card.name,
    suit,
    keywords: card.keywords,
    description: card.description,
    uprightMeaning: card.upright,
    reversedMeaning: card.reversed,
  }));
};

export const MINOR_ARCANA_WANDS = createMinorArcana('wands', 'Wands', 22);
export const MINOR_ARCANA_CUPS = createMinorArcana('cups', 'Cups', 36);
export const MINOR_ARCANA_SWORDS = createMinorArcana('swords', 'Swords', 50);
export const MINOR_ARCANA_PENTACLES = createMinorArcana('pentacles', 'Pentacles', 64);

/** 完整的 78 张塔罗牌 */
export const ALL_TAROT_CARDS: TarotCardData[] = [
  ...MAJOR_ARCANA,
  ...MINOR_ARCANA_WANDS,
  ...MINOR_ARCANA_CUPS,
  ...MINOR_ARCANA_SWORDS,
  ...MINOR_ARCANA_PENTACLES,
];

/** 随机抽取 N 张牌（不重复） */
export function drawCards(count: number = 3): { card: TarotCardData; isReversed: boolean }[] {
  const shuffled = [...ALL_TAROT_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(card => ({
    card,
    isReversed: Math.random() > 0.5,
  }));
}

/** 牌的位置标签（三牌阵） */
export const POSITION_LABELS = {
  past: 'The Past',
  present: 'The Present',
  future: 'The Future',
} as const;

export type TarotPosition = keyof typeof POSITION_LABELS;
