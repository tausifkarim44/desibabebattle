async function loadProfile() {
  const nameElement = document.getElementById('name');
  const ratingElement = document.getElementById('rating');

  if (!nameElement || !ratingElement) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const name = params.get('name') ?? 'Alia Bhatt';

  try {
    const response = await fetch(
      `/api/profile/${encodeURIComponent(name)}`
    );

    if (!response.ok) {
      throw new Error('Profile not found');
    }

    const data = await response.json();
    console.log('PROFILE DATA:', data);
    const avatarElement = document.getElementById('avatar') as HTMLImageElement;

avatarElement.src = data.avatar;

    nameElement.textContent = data.name;
    ratingElement.textContent = `Elo: ${data.rating}`;
    const battlesElement = document.getElementById('battles');

if (battlesElement) {
  battlesElement.textContent = `Battles: ${data.battles}`;
}
const recordElement = document.getElementById('record');

if (recordElement) {
  recordElement.textContent =
    `Wins: ${data.wins} | Losses: ${data.losses} | Draws: ${data.draws}`;
}
const winRateElement = document.getElementById('winRate');

if (winRateElement) {
  const winRate =
    data.battles > 0
      ? ((data.wins / data.battles) * 100).toFixed(1)
      : '0.0';

  winRateElement.textContent = `Win Rate: ${winRate}%`;
}
const formElement = document.getElementById('form');

if (formElement) {
  formElement.textContent = `Recent Form: ${data.form || '—'}`;
}
const peakElement = document.getElementById('peak');

if (peakElement) {
  peakElement.textContent = `Peak Elo: ${data.peakElo}`;
}

const lowestElement = document.getElementById('lowest');

if (lowestElement) {
  lowestElement.textContent = `Lowest Elo: ${data.lowestElo}`;
}
    const rankElement = document.getElementById('rank');

if (rankElement) {
  rankElement.textContent = `Rank: ${data.rank}`;
}

  } catch (error) {
    console.error('Profile error:', error);
    nameElement.textContent = 'Profile not found';
    ratingElement.textContent = 'Elo: —';
  }
}

loadProfile();