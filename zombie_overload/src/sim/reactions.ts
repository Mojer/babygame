import { EV_BURST, EV_PLAGUE } from './chain';
import { CORE, FROZEN, T_BEAM, T_EXPLOSION, T_SHARD, T_SHOCK, VOLATILE } from './content';

/**
 * 狀態 × 觸發 → 反應。技能只負責「附加狀態」或「造成觸發」，組合自然湧現。
 * 反應會消耗狀態 → 同一隻殭屍不會被同一個狀態重複引爆，不會無限循環。
 * 新增技能 = 在表上加一列。
 */
export interface StatusReaction {
  id: 'shatter' | 'detonate';
  label: string;
  status: number;
  triggers: number;
}

export const STATUS_REACTIONS: StatusReaction[] = [
  // 凍結的殭屍被爆炸／光束／冰片／衝擊波打到 → 碎裂（即死，噴出冰片打周圍，冰片可再碎裂其他凍結者）
  { id: 'shatter', label: '碎裂', status: FROZEN, triggers: T_EXPLOSION | T_BEAM | T_SHARD | T_SHOCK },
  // 不穩定（被毒爆波及）的殭屍被光束或衝擊波掃到 → 直接引爆
  { id: 'detonate', label: '引爆', status: VOLATILE, triggers: T_BEAM | T_SHOCK },
];

export const REACTIVE_STATUS = STATUS_REACTIONS.reduce((m, r) => m | r.status, 0);

/** 死亡時的反應，第一個符合的生效 */
export interface DeathReaction {
  id: 'plague' | 'burst';
  label: string;
  /** -1 = 不限種類 */
  kind: number;
  status: number;
  event: number;
}

export const DEATH_REACTIONS: DeathReaction[] = [
  // 感染核心死亡 → 毒爆：範圍傷害，並讓周圍殭屍「不穩定」
  { id: 'plague', label: '毒爆', kind: CORE, status: 0, event: EV_PLAGUE },
  // 不穩定的殭屍死亡 → 殉爆
  { id: 'burst', label: '殉爆', kind: -1, status: VOLATILE, event: EV_BURST },
];
