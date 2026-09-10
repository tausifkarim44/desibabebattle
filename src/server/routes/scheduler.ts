import { Hono } from 'hono';
import {
  redis,
  reddit,
  type TaskRequest,
  type TaskResponse,
} from '@devvit/web/server';
import { calculateEloRatings } from '../core/battle';
import { celebrities } from '../core/celebrities';

export const scheduler = new Hono();

scheduler.post('/end-battle', async (c) => {
  const { data } = await c.req.json<TaskRequest<{ postId: string }>>();

  const postId = data?.postId;

  if (!postId) {
    console.error('End battle error: postId missing');
    return c.json<TaskResponse>({ status: 'error' }, 400);
  }

  try {
    const post = await reddit.getPostById(postId as `t3_${string}`);
    const postData = await post.getPostData();
    if (postData?.status === 'ended') {
  console.log('Battle already ended:', postId);
  return c.json<TaskResponse>({ status: 'ok' });
}
    const liveCommentId = postData?.liveCommentId;
   
    if (liveCommentId) {
  const liveComment = await reddit.getCommentById(
    liveCommentId as `t1_${string}`
  );

  await liveComment.undistinguish();
}

const contestants: string[] = Array.isArray(postData?.contestants)
  ? postData.contestants.filter(
      (contestant): contestant is string =>
        typeof contestant === 'string'
    )
  : [];
  const originalPostId =
  typeof postData?.originalPostId === 'string'
    ? postData.originalPostId
    : null;


    if (contestants.length < 2) {
      console.error('End battle error: contestants missing');
      return c.json<TaskResponse>({ status: 'error' }, 400);
    }
const ratings: number[] = [];

for (const contestant of contestants) {
  const celebrity = celebrities.find(
    (c) =>
      c.name.toLowerCase() === contestant.toLowerCase() ||
      c.aliases.some(
        (alias) => alias.toLowerCase() === contestant.toLowerCase()
      )
  );

  const ratingKey = `elo:${celebrity?.name ?? contestant}`;
const storedRating = await redis.get(ratingKey);

const currentRating = storedRating
  ? parseInt(storedRating, 10)
  : celebrity?.rating ?? 1500;

if (!storedRating) {
  await redis.set(ratingKey, currentRating.toString());
}

ratings.push(currentRating);
}
    const votes: number[] = [];

    for (let i = 0; i < contestants.length; i++) {
      const count = await redis.get(`votes:${postId}:${i}`);
      votes.push(count ? parseInt(count, 10) : 0);
    }

    const highestVotes = Math.max(...votes);
    const winnerIndices = votes
      .map((count, index) => (count === highestVotes ? index : -1))
      .filter((index) => index !== -1);
      const totalVotes = votes.reduce((sum, count) => sum + count, 0);
const eloEligible = totalVotes >= 20;

    const isTie = winnerIndices.length > 1;

const winner = isTie
  ? null
  : contestants[winnerIndices[0] ?? 0] ?? null;
let newRatings = ratings;

if (eloEligible && !isTie) {
  newRatings = calculateEloRatings(ratings, votes);
}
    await post.setPostData({
      ...postData,
      status: 'ended',
      votes,
      winner,
      winnerIndices,
        ratings: newRatings,
      endedAt: Date.now(),
    });
    if (originalPostId) {
  let resultComment = `🏆 **Battle Results**\n\n`;

  if (isTie) {
    resultComment += `🤝 **It's a draw!**\n\n`;
  } else {
    resultComment += `🏆 **${winner} won!**\n\n`;
  }

  resultComment += `🗳️ **Final votes:**\n`;

  contestants.forEach((contestant, index) => {
    resultComment += `- ${contestant} — ${votes[index] ?? 0} ${
      (votes[index] ?? 0) === 1 ? 'vote' : 'votes'
    }\n`;
  });

  resultComment += `\n`;

  if (!eloEligible) {
    resultComment +=
      `⚠️ **No rating changes.** This battle needed at least 20 total votes.\n`;
  } else if (isTie) {
    resultComment +=
      `🤝 **No rating changes.** Tied battles do not affect ratings.\n`;
  } else {
    resultComment += `⭐ **Rating changes:**\n`;

    contestants.forEach((contestant, index) => {
      const oldRating = ratings[index] ?? 1500;
      const newRating = newRatings[index] ?? oldRating;
      const change = newRating - oldRating;

      resultComment += `- ${contestant}: **${oldRating} → ${newRating}** (${
        change >= 0 ? '+' : ''
      }${change})\n`;
    });
  }
if (liveCommentId) {
  const liveComment = await reddit.getCommentById(
    liveCommentId as `t1_${string}`
  );

  await liveComment.distinguish(false);
}
const resultCommentPost = await reddit.submitComment({
  id: originalPostId as `t3_${string}`,
  text: resultComment,
  runAs: 'APP',
});

await resultCommentPost.distinguish(true);
const updatedPostData = await post.getPostData();

await post.setPostData({
  ...updatedPostData,
  resultCommentId: resultCommentPost.id,
});

console.log('Result comment posted and stickied on original:', originalPostId);
}
for (let i = 0; i < contestants.length; i++) {
  const celebrity = celebrities.find(
    (c) =>
      c.name.toLowerCase() === contestants[i]?.toLowerCase() ||
      c.aliases.some(
        (alias) => alias.toLowerCase() === contestants[i]?.toLowerCase()
      )
  );

  const ratingKey = `elo:${celebrity?.name ?? contestants[i]}`;

  await redis.set(
    ratingKey,
    (newRatings[i] ?? ratings[i] ?? 1500).toString()
  );
  await redis.hSet(`rating-history:${celebrity?.name ?? contestants[i]}`, {
  [Date.now().toString()]: JSON.stringify({
    battleId: postId,
    opponent: contestants.filter((_, index) => index !== i),
oldRating: ratings[i] ?? 1500,
newRating: newRatings[i] ?? ratings[i] ?? 1500,
votes: votes[i] ?? 0,
result:
  isTie
    ? 'D'
    : winnerIndices.includes(i)
      ? 'W'
      : 'L',
  }),
});

}
// H2H history
for (let i = 0; i < contestants.length; i++) {
  for (let j = i + 1; j < contestants.length; j++) {
    const nameA = contestants[i] ?? '';
    const nameB = contestants[j] ?? '';

    const names = [nameA, nameB].sort((a, b) =>
      a.localeCompare(b)
    );

    const h2hKey = `h2h:${names[0]}:${names[1]}`;

    let resultA: 'W' | 'L' | 'D';
    let resultB: 'W' | 'L' | 'D';

    if ((votes[i] ?? 0) > (votes[j] ?? 0)) {
      resultA = 'W';
      resultB = 'L';
    } else if ((votes[i] ?? 0) < (votes[j] ?? 0)) {
      resultA = 'L';
      resultB = 'W';
    } else {
      resultA = 'D';
      resultB = 'D';
    }

    await redis.hSet(h2hKey, {
      [Date.now().toString()]: JSON.stringify({
        battleId: postId,
        contestants: [nameA, nameB],
        votes: [votes[i] ?? 0, votes[j] ?? 0],
        result: {
          [nameA]: resultA,
          [nameB]: resultB,
        },
      }),
    });
  }
}
for (let i = 0; i < contestants.length; i++) {
  const celebrity = celebrities.find(
    (c) =>
      c.name.toLowerCase() === contestants[i]?.toLowerCase() ||
      c.aliases.some(
        (alias) => alias.toLowerCase() === contestants[i]?.toLowerCase()
      )
  );

  const celebrityName = celebrity?.name ?? contestants[i];

  let result: 'W' | 'L' | 'D';

  if (isTie) {
    result = 'D';
  } else if (winner === contestants[i]) {
    result = 'W';
  } else {
    result = 'L';
  }

  const formKey = `form:${celebrityName}`;
  const storedForm = await redis.get(formKey);

  let form: string[] = [];

  if (storedForm) {
    try {
      const parsed = JSON.parse(storedForm);
      if (Array.isArray(parsed)) {
        form = parsed.filter(
          (item): item is string =>
            item === 'W' || item === 'L' || item === 'D'
        );
      }
    } catch {
      form = [];
    }
  }

  form.unshift(result);
  form = form.slice(0, 5);

  await redis.set(formKey, JSON.stringify(form));
}
for (let i = 0; i < contestants.length; i++) {
  for (let j = i + 1; j < contestants.length; j++) {
const pairNames = [
  contestants[i] ?? '',
  contestants[j] ?? '',
].sort();

    const h2hKey = `h2h:${pairNames[0]}:${pairNames[1]}`;

    await redis.hSet(h2hKey, {
      [Date.now().toString()]: JSON.stringify({
        battleId: postId,
        contestants: [contestants[i], contestants[j]],
        votes: [votes[i] ?? 0, votes[j] ?? 0],
        winner:
          (votes[i] ?? 0) > (votes[j] ?? 0)
            ? contestants[i]
            : (votes[j] ?? 0) > (votes[i] ?? 0)
              ? contestants[j]
              : null,
        ratings: [newRatings[i] ?? ratings[i] ?? 1500, newRatings[j] ?? ratings[j] ?? 1500],
      }),
    });
  }
}
    console.log('Battle ended:', postId);
    console.log('Votes:', votes);
    console.log('Winner:', winner ?? 'DRAW');

    return c.json<TaskResponse>({ status: 'ok' });
  } catch (error) {
    console.error('End battle error:', error);

    return c.json<TaskResponse>(
      {
        status: 'error',
      },
      500
    );
  }
});