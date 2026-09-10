import { reddit, scheduler } from '@devvit/web/server';

export const createPost = async (
  title: string,
  contestants: string[],
  imageUrl: string,
  avatarUrls: string[],
  originalPostId: string
) => {
const endTime = Date.now() + 24 * 60 * 60 * 1000;
  const result = await reddit.submitCustomPost({
    subredditName: 'desibabebattle_dev',
    title,
    entry: 'battle',
postData: {
  contestants,
  imageUrl,
  avatarUrls,
  endTime,
  originalPostId,
},
  });

  console.log('CUSTOM POST ID:', result.id);
  console.log('CUSTOM POST PERMALINK:', result.permalink);
  console.log('CUSTOM POST TITLE:', result.title);
  await scheduler.runJob({
  name: 'end-battle',
  data: {
    postId: result.id,
  },
  runAt: new Date(endTime),
});

  return result;
};

export const createLeaderboardPost = async () => {
  const result = await reddit.submitCustomPost({
    subredditName: 'desibabebattle_dev',
    title: '🏆 DesiBabeBattle Rankings',
    entry: 'leaderboard',
    postData: {},
  });

  console.log('LEADERBOARD POST ID:', result.id);
  console.log('LEADERBOARD POST PERMALINK:', result.permalink);

  return result;
};
