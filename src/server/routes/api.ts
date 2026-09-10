import { Hono } from 'hono';
import { context, redis, reddit } from '@devvit/web/server';
import { celebrities } from '../core/celebrities';
import type {
  DecrementResponse,
  IncrementResponse,
  InitResponse,
} from '../../shared/api';

type ErrorResponse = {
  status: 'error';
  message: string;
};

export const api = new Hono();

api.get('/init', async (c) => {
  const { postId } = context;

  if (!postId) {
    console.error('API Init Error: postId not found in devvit context');
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required but missing from context',
      },
      400
    );
  }

  try {
    const [count, username] = await Promise.all([
      redis.get('count'),
      reddit.getCurrentUsername(),
    ]);

    return c.json<InitResponse>({
      type: 'init',
      postId: postId,
      count: count ? parseInt(count) : 0,
      username: username ?? 'anonymous',
    });
  } catch (error) {
    console.error(`API Init Error for post ${postId}:`, error);
    let errorMessage = 'Unknown error during initialization';
    if (error instanceof Error) {
      errorMessage = `Initialization failed: ${error.message}`;
    }
    return c.json<ErrorResponse>(
      { status: 'error', message: errorMessage },
      400
    );
  }
});

api.post('/increment', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required',
      },
      400
    );
  }

  const count = await redis.incrBy('count', 1);
  return c.json<IncrementResponse>({
    count,
    postId,
    type: 'increment',
  });
});
api.post('/vote', async (c) => {
  const { postId } = context;

  if (!postId) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required',
      },
      400
    );
  }

  const post = await reddit.getPostById(postId as `t3_${string}`);
  const postData = await post.getPostData();
  const contestants = Array.isArray(postData?.contestants)
  ? postData.contestants
  : [];

  if (
    postData?.status === 'ended' ||
    (typeof postData?.endTime === 'number' &&
      postData.endTime <= Date.now())
  ) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'Voting is closed for this battle',
      },
      409
    );
  }

  const username = await reddit.getCurrentUsername();

  if (!username) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'You must be logged in to vote',
      },
      401
    );
  }

  const body = await c.req.json<{ contestantIndex?: number }>();
  const contestantIndex = body.contestantIndex;

if (
  contestantIndex === undefined ||
  !Number.isInteger(contestantIndex) ||
  contestantIndex < 0 ||
  contestantIndex >= contestants.length
) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'Invalid contestant',
      },
      400
    );
  }

  const voteKey = `vote:${postId}:${username}`;

  const existingVote = await redis.get(voteKey);

  if (existingVote != null) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'You have already voted in this battle',
      },
      409
    );
  }

  await redis.set(voteKey, contestantIndex.toString());

  const count = await redis.incrBy(
    `votes:${postId}:${contestantIndex}`,
    1
  );

  return c.json({
    type: 'vote',
    postId,
    contestantIndex,
    count,
  });
});
api.get('/my-vote', async (c) => {
  const { postId } = context;

  if (!postId) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required',
      },
      400
    );
  }

  const username = await reddit.getCurrentUsername();

  if (!username) {
    return c.json({
      voted: false,
      contestantIndex: null,
    });
  }

  const voteKey = `vote:${postId}:${username}`;
  const existingVote = await redis.get(voteKey);

  if (existingVote == null) {
    return c.json({
      voted: false,
      contestantIndex: null,
    });
  }

  return c.json({
    voted: true,
    contestantIndex: parseInt(existingVote, 10),
  });
});
api.get('/results', async (c) => {
  const { postId } = context;

  if (!postId) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required',
      },
      400
    );
  }

  const votes = [];

  for (let i = 0; i < 6; i++) {
    const count = await redis.get(`votes:${postId}:${i}`);
    votes.push(count ? parseInt(count) : 0);
  }

  return c.json({
    type: 'results',
    postId,
    votes,
  });
});
api.post('/decrement', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required',
      },
      400
    );
  }

  const count = await redis.incrBy('count', -1);
  return c.json<DecrementResponse>({
    count,
    postId,
    type: 'decrement',
  });
});
api.get('/status', async (c) => {
  const { postId } = context;

  if (!postId) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required',
      },
      400
    );
  }

  try {
    const post = await reddit.getPostById(postId as `t3_${string}`);
    const postData = await post.getPostData();

    return c.json({
      type: 'status',
      status: postData?.status ?? 'active',
      winner: postData?.winner ?? null,
      votes: postData?.votes ?? [],
    });
  } catch (error) {
    console.error('Battle status error:', error);

    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'Could not get battle status',
      },
      500
    );
  }
});
api.get('/my-vote', async (c) => {
  const { postId } = context;

  if (!postId) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required',
      },
      400
    );
  }

  const username = await reddit.getCurrentUsername();

  if (!username) {
    return c.json({
      voted: false,
      contestantIndex: null,
    });
  }

  const voteKey = `vote:${postId}:${username}`;
  const existingVote = await redis.get(voteKey);

  return c.json({
    voted: existingVote != null,
    contestantIndex:
      existingVote != null ? parseInt(existingVote, 10) : null,
  });
});

api.get('/leaderboard', async (c) => {
  const rankings = [];

  for (const celebrity of celebrities) {
    const ratingKey = `elo:${celebrity.name}`;
    const storedRating = await redis.get(ratingKey);
    const historyKey = `rating-history:${celebrity.name}`;
const history = await redis.hGetAll(historyKey);
const recentForm = Object.entries(history)
  .sort(([a], [b]) => Number(b) - Number(a))
  .slice(0, 5)
  .map(([, value]) => {
    try {
      const entry = JSON.parse(value);
      return entry.result;
    } catch {
      return null;
    }
  })
  .filter(
    (result): result is 'W' | 'L' | 'D' =>
      result === 'W' || result === 'L' || result === 'D'
  )
  .join('');

rankings.push({
  name: celebrity.name,
  rating: storedRating
    ? parseInt(storedRating, 10)
    : celebrity.rating ?? 1500,
  avatar: celebrity.avatar,
  form: recentForm,
});
  }

  rankings.sort((a, b) => b.rating - a.rating);

  return c.json({
    rankings,
  });
});
api.get('/rating-history/:name', async (c) => {
  const name = c.req.param('name');

  const history = await redis.hGetAll(`rating-history:${name}`);

  const entries = Object.entries(history ?? {}).map(
    ([timestamp, value]) => ({
      timestamp: Number(timestamp),
      ...JSON.parse(value),
    })
  );

  entries.sort((a, b) => a.timestamp - b.timestamp);

  return c.json({
    name,
    history: entries,
  });
});
api.get('/h2h/:nameA/:nameB', async (c) => {
  const nameA = c.req.param('nameA');
  const nameB = c.req.param('nameB');

  const names = [nameA, nameB].sort((a, b) =>
    a.localeCompare(b)
  );

  const h2hKey = `h2h:${names[0]}:${names[1]}`;

  const history = await redis.hGetAll(h2hKey);

  const battles = Object.entries(history ?? {})
    .map(([timestamp, value]) => ({
      timestamp: Number(timestamp),
      ...JSON.parse(value),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  return c.json({
    nameA,
    nameB,
    battles,
  });
});
api.get('/profile/:name', async (c) => {
  const name = c.req.param('name');

  const celebrity = celebrities.find(
    (celebrity) =>
      celebrity.name.toLowerCase() === name.toLowerCase() ||
      celebrity.aliases.some(
        (alias) => alias.toLowerCase() === name.toLowerCase()
      )
  );

  if (!celebrity) {
    return c.json(
      {
        error: 'Celebrity not found',
      },
      404
    );
  }

const ratingKey = `elo:${celebrity.name}`;
const storedRating = await redis.get(ratingKey);

const currentRating = storedRating
  ? parseInt(storedRating, 10)
  : celebrity.rating ?? 1500;

const rankings = [];

for (const celeb of celebrities) {
  const rating = await redis.get(`elo:${celeb.name}`);

  rankings.push(
    rating
      ? parseInt(rating, 10)
      : celeb.rating ?? 1500
  );
}

rankings.sort((a, b) => b - a);

const rank = rankings.indexOf(currentRating) + 1;
const history = await redis.hGetAll(
  `rating-history:${celebrity.name}`
);

const battles = Object.keys(history).length;
let wins = 0;
let losses = 0;
let draws = 0;

for (const value of Object.values(history)) {
  try {
    const entry = JSON.parse(value);

    if (entry.result === 'W') wins++;
    if (entry.result === 'L') losses++;
    if (entry.result === 'D') draws++;
  } catch {
    // Ignore invalid history entries
  }
}
const recentForm = Object.entries(history)
  .sort(([a], [b]) => Number(b) - Number(a))
  .slice(0, 5)
  .map(([, value]) => {
    try {
      const entry = JSON.parse(value);
      return entry.result;
    } catch {
      return null;
    }
  })
  .filter(
    (result): result is 'W' | 'L' | 'D' =>
      result === 'W' || result === 'L' || result === 'D'
  )
  .join('');
  const ratingValues = Object.values(history).flatMap((value) => {
  try {
    const entry = JSON.parse(value);
    return [entry.oldRating, entry.newRating].filter(
      (rating) => typeof rating === 'number'
    );
  } catch {
    return [];
  }
});

const peakElo = Math.max(currentRating, ...ratingValues);
const lowestElo = Math.min(currentRating, ...ratingValues);
return c.json({
  name: celebrity.name,
  avatar: celebrity.avatar,
  rating: currentRating,
  rank,
  battles,
  wins,
  losses,
  draws,
  form: recentForm,
  peakElo,
lowestElo,
});
});