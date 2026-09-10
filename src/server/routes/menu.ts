import { Hono } from 'hono';
import type { UiResponse } from '@devvit/web/shared';
import { context, reddit } from '@devvit/web/server';
import { createLeaderboardPost } from '../core/post';

export const menu = new Hono();


menu.post('/leaderboard', async (c) => {
  try {
    const post = await createLeaderboardPost();

    return c.json<UiResponse>(
      {
        navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
      },
      200
    );
  } catch (error) {
    console.error(`Error creating leaderboard: ${error}`);

    return c.json<UiResponse>(
      {
        showToast: 'Failed to create leaderboard',
      },
      400
    );
  }
});menu.post('/profile-test', async (c) => {
  try {
    const post = await reddit.submitCustomPost({
      subredditName: context.subredditName,
      title: 'Alia Bhatt — Profile',
      entry: 'profile',
      postData: {
        name: 'Alia Bhatt',
      },
    });

    return c.json<UiResponse>(
      {
        navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
      },
      200
    );
  } catch (error) {
    console.error(`Error creating profile: ${error}`);

    return c.json<UiResponse>(
      {
        showToast: 'Failed to create profile',
      },
      400
    );
  }
});