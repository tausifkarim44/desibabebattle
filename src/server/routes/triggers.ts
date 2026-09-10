import { Hono } from 'hono';
import type { OnPostSubmitRequest, TriggerResponse } from '@devvit/web/shared';import { reddit } from '@devvit/web/server';
import { createPost } from '../core/post';
import {
  parseContestants,
  isValidContestantCount,
  getBattleDecision,
} from '../core/battle';

import { isApprovedCelebrity, celebrities } from '../core/celebrities';
export const triggers = new Hono();

triggers.post('/on-app-install', async (c) => {
  return c.json<TriggerResponse>({
    status: 'success',
    message: 'DesiBabeBattle installed successfully',
  });
});

triggers.post('/on-post-submit', async (c) => {
  const input = await c.req.json<OnPostSubmitRequest>();
console.log('TRIGGER AUTHOR:', input.author);

if (input.author?.id === 't2_2m1s4572iv') {
  console.log('Ignoring post created by the app:', input.post?.id);

  return c.json<TriggerResponse>({
    status: 'ok',
  });
}
const contestants = parseContestants(input.post?.title ?? '');
const validCount = isValidContestantCount(contestants);
const approvedContestants = contestants.every(isApprovedCelebrity);
const hasImage =
  input.post?.isMultiMedia === true &&
  input.post?.isVideo === false &&
  input.post?.isGallery === false &&
  (input.post?.mediaUrls?.length ?? 0) === 1;
const decision = getBattleDecision(
  validCount,
  approvedContestants,
  hasImage || input.post?.isVideo === true
);
const postId = input.post?.id as `t3_${string}`;
const redditPost = await reddit.getPostById(postId);

console.log('REDDIT POST URL:', redditPost.url);
console.log('REDDIT POST THUMBNAIL:', redditPost.thumbnail);
console.log('REDDIT POST GALLERY:', redditPost.gallery);


if (decision === 'INVALID BATTLE' && postId) {
  await reddit.remove(postId, false);
  console.log('Post removed:', postId);
}
if (decision === 'REVIEW' && postId) {
  await reddit.filter(postId);
  console.log('Post sent to review:', postId);
}
const avatarUrls = contestants.map((name) => {
  const celebrity = celebrities.find(
    (c) =>
      c.name.toLowerCase() === name.toLowerCase() ||
      c.aliases.some((alias) => alias.toLowerCase() === name.toLowerCase())
  );

  return celebrity?.avatar ?? '';
});
if (decision === 'VALID BATTLE') {
const battlePost = await createPost(
  input.post?.title ?? '',
  contestants,
  input.post?.mediaUrls?.[0] ?? '',
  avatarUrls,
  postId
);

  if (postId && battlePost?.permalink) {
const liveComment = await reddit.submitComment({
  id: postId,
  text:
    `🔥 **Your battle is live!**\n\n` +
    `Your submission has been turned into an official DesiBabeBattle.\n\n` +
  `👉 [Vote here](${battlePost.permalink})\n\n` +
    `Good luck! 🏆`,
  runAs: 'APP',
});

await liveComment.distinguish(true);
const battlePostData = await battlePost.getPostData();

await battlePost.setPostData({
  ...battlePostData,
  liveCommentId: liveComment.id,
});
    console.log('Creator notification posted:', postId);
  }

  console.log('Battle poll created');
}
console.log('New post submitted:', input.post?.title);
console.log('Contestants:', contestants);
console.log('Valid contestant count:', validCount);
console.log('Approved contestants:', approvedContestants);
console.log('Has image:', hasImage);
console.log('Post data:', input.post);
console.log('Decision:', decision);

  return c.json<TriggerResponse>({
    status: 'ok',
  });
});
