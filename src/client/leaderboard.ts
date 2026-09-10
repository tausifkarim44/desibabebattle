let rankings: any[] = [];
let currentPage = 1;

const ITEMS_PER_PAGE = 5;

async function loadLeaderboard() {
  const rankingsElement = document.getElementById('rankings');
  const prevButton = document.getElementById('prevPage') as HTMLButtonElement | null;
  const nextButton = document.getElementById('nextPage') as HTMLButtonElement | null;
  const pageInfo = document.getElementById('pageInfo');

  if (!rankingsElement) {
    return;
  }
  const rankingsContainer = rankingsElement;

  try {
 const response = await fetch('/api/leaderboard');


const data = await response.json();

    rankings = data.rankings ?? [];

    renderPage();

    prevButton?.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderPage();
      }
    });

    nextButton?.addEventListener('click', () => {
      const totalPages = Math.ceil(rankings.length / ITEMS_PER_PAGE);

      if (currentPage < totalPages) {
        currentPage++;
        renderPage();
      }
    });

    function renderPage() {
      const totalPages = Math.max(
        1,
        Math.ceil(rankings.length / ITEMS_PER_PAGE)
      );

      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const pageRankings = rankings.slice(
        start,
        start + ITEMS_PER_PAGE
      );

      rankingsContainer.innerHTML = '';

      pageRankings.forEach((contestant, index) => {
        const actualRank = start + index + 1;

        const card = document.createElement('div');
        card.className = 'ranking-card';

        card.innerHTML = `
          <div class="rank">#${actualRank}</div>

          <img
            class="avatar"
            src="${contestant.avatar}"
            alt="${contestant.name}"
          />

          <div class="info">
            <div class="name">${contestant.name}</div>
            <div class="stats">Recent Form - ${contestant.form || '—'}</div>
          </div>

          <div class="rating">
            ${contestant.rating}
            <span class="rating-label">Elo</span>
          </div>
        `;

        rankingsContainer.appendChild(card);
      });

      if (pageInfo) {
        pageInfo.textContent = `${currentPage} / ${totalPages}`;
      }

      if (prevButton) {
        prevButton.disabled = currentPage === 1;
      }

      if (nextButton) {
        nextButton.disabled = currentPage === totalPages;
      }
    }
  } catch (error) {
    console.error('Leaderboard error:', error);
    rankingsElement.innerHTML =
      '<p style="text-align:center;">Unable to load rankings.</p>';
  }
}

loadLeaderboard();