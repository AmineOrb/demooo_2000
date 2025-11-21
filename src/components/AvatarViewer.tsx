interface AvatarViewerProps {
  avatarType: 'easy' | 'medium' | 'hard';
  isActive: boolean;
}

// Lightweight, dependency-free avatar placeholder used when 3D libs are not available.
// This avoids many compile/runtime errors while still showing a simple avatar UI.
export default function AvatarViewer({ avatarType, isActive }: AvatarViewerProps) {
  const colors: Record<string, { skin: string; hair: string; shirt: string }> = {
    easy: { skin: '#f4c2a0', hair: '#4a3728', shirt: '#4a90e2' },
    medium: { skin: '#d4a574', hair: '#2c1810', shirt: '#8e44ad' },
    hard: { skin: '#c89b6d', hair: '#8c8c8c', shirt: '#2c3e50' },
  };

  const cfg = colors[avatarType] || colors.medium;

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg overflow-hidden flex items-center justify-center p-6">
      <div className="bg-white/5 rounded-xl p-6 w-full h-full flex flex-col items-center justify-center gap-4">
        <svg width="140" height="160" viewBox="0 0 140 160" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="circle">
              <circle cx="70" cy="50" r="36" />
            </clipPath>
          </defs>
          <rect width="140" height="160" rx="12" fill="transparent" />
          {/* Hair */}
          <circle cx="70" cy="34" r="40" fill={cfg.hair} opacity="0.9" />
          {/* Face */}
          <g clipPath="url(#circle)">
            <circle cx="70" cy="50" r="36" fill={cfg.skin} />
          </g>
          {/* Eyes */}
          <circle cx="58" cy="50" r="4" fill="#fff" />
          <circle cx="82" cy="50" r="4" fill="#fff" />
          <circle cx="58" cy="50" r="2" fill="#2c3e50" />
          <circle cx="82" cy="50" r="2" fill="#2c3e50" />
          {/* Shirt */}
          <rect x="30" y="90" width="80" height="48" rx="8" fill={cfg.shirt} />
        </svg>

        <div className="text-center">
          <div className="text-lg font-semibold text-white">{avatarType.toUpperCase()} Avatar</div>
          <div className="text-sm text-gray-300">{isActive ? 'Active' : 'Idle'}</div>
        </div>
      </div>
    </div>
  );
}