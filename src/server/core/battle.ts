export const parseContestants = (title: string): string[] => {
  const parts = title.split(/\s+vs\s+/i);

  if (
    parts.some(
      (part) => /^vs\b/i.test(part.trim()) || /\bvs$/i.test(part.trim())
    )
  ) {
    return [];
  }

  return parts.map((name) => name.trim());
};

export const isValidContestantCount = (contestants: string[]): boolean => {
  return contestants.length >= 2 && contestants.length <= 6;
};
export type BattleDecision = 'VALID BATTLE' | 'REVIEW' | 'INVALID BATTLE';
export const getBattleDecision = (
  validCount: boolean,
  approvedContestants: boolean,
  hasMedia: boolean
): BattleDecision => {
  if (!validCount || !hasMedia) {
    return 'INVALID BATTLE';
  }

  if (!approvedContestants) {
    return 'REVIEW';
  }

  return 'VALID BATTLE';
};
export const calculateEloRatings = (
  ratings: number[],
  votes: number[],
  kFactor = 32
): number[] => {
  const newRatings = [...ratings];
  const contestantCount = ratings.length;

  if (contestantCount < 2 || votes.length !== contestantCount) {
    return newRatings;
  }

  for (let i = 0; i < contestantCount; i++) {
    for (let j = i + 1; j < contestantCount; j++) {
      const ratingI = ratings[i] ?? 1500;
      const ratingJ = ratings[j] ?? 1500;

      const expectedI =
        1 / (1 + Math.pow(10, (ratingJ - ratingI) / 400));

      const expectedJ = 1 - expectedI;

      let scoreI: number;
      let scoreJ: number;

      if ((votes[i] ?? 0) > (votes[j] ?? 0)) {
        scoreI = 1;
        scoreJ = 0;
      } else if ((votes[i] ?? 0) < (votes[j] ?? 0)) {
        scoreI = 0;
        scoreJ = 1;
      } else {
        scoreI = 0.5;
        scoreJ = 0.5;
      }

      const pairScale = 1 / (contestantCount - 1);

      newRatings[i] =
        (newRatings[i] ?? ratingI) +
        kFactor * pairScale * (scoreI - expectedI);

      newRatings[j] =
        (newRatings[j] ?? ratingJ) +
        kFactor * pairScale * (scoreJ - expectedJ);
    }
  }

  return newRatings.map((rating) => Math.round(rating));
};