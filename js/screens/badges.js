/*
  badges.js
  Tab "Lencana": seluruh pencapaian di satu tempat (sebelumnya bagian
  "Achievement" di bawah Profil). Data dari appState.getBadgesWithStatus.
*/

import { getBadgesWithStatus } from '../state/appState.js';
import { icons } from '../ui/icons.js';
import { pageHeader } from '../ui/pageHeader.js';

export function renderBadges(container) {
  const badges = getBadgesWithStatus();
  const earnedCount = badges.filter((b) => b.earned).length;

  const badgesHtml = badges
    .map(
      (badge) => `
      <li class="card card--static badge-card ${badge.earned ? 'is-unlocked' : 'is-locked'}">
        <span class="badge-icon" aria-hidden="true">${badge.earned ? icons[badge.icon] : icons.lock}</span>
        <span class="badge-card__name">${badge.title}</span>
        <span class="badge-card__desc">${badge.description}</span>
        <span class="sr-only">${badge.earned ? 'Sudah didapat' : 'Belum didapat'}</span>
      </li>`
    )
    .join('');

  container.innerHTML = `
    <div class="screen badges">
      ${pageHeader({ title: 'Lencana', subtitle: `${earnedCount} dari ${badges.length} lencana didapat` })}
      <ul class="badge-grid">${badgesHtml}</ul>
    </div>
  `;
}
