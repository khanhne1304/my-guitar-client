/** Bắt buộc onboarding khi chưa có guitarOnboardingCompleted === true (tài khoản mới hoặc dữ liệu cũ). */
export function needsGuitarOnboarding(user) {
  if (!user || user.role === 'admin') return false;
  return user.guitarOnboardingCompleted !== true;
}

export const GOAL_OPTIONS = [
  { id: 'strumming', label: 'Đệm hát (strumming)' },
  { id: 'solo', label: 'Solo / lead' },
  { id: 'fingerstyle', label: 'Fingerstyle' },
];

export const LEVEL_LABELS = {
  none: 'Chưa biết / Mới bắt đầu',
  basic: 'Cơ bản',
  advanced: 'Nâng cao',
};
