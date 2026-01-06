# Kas IFB24 - Frontend

Aplikasi frontend React untuk sistem monitoring kas kelas IFB24.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **TanStack Query** - Data fetching & caching
- **React Router** - Client-side routing

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ConfirmModal.tsx
│   ├── SuccessModal.tsx
│   ├── Layout.tsx
│   └── ...
├── features/           # Feature-based screens
│   ├── auth/          # Login, change password
│   ├── dashboard/     # Main dashboard
│   ├── matrix/        # Payment matrix
│   ├── report/        # Income & expense reports
│   ├── leaderboard/   # Top contributors
│   ├── export/        # Report exports
│   └── admin/         # Admin settings
├── services/
│   └── api.ts         # API service layer
├── context/
│   └── AuthContext.tsx
├── types/
│   └── index.ts       # TypeScript types
├── lib/
│   └── utils.ts       # Utility functions
├── App.tsx            # Main app component
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## Environment

Create a `.env.local` file if needed:

```env
VITE_API_URL=http://localhost:8000/api
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 5173 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Features

- 🔐 Authentication with Laravel Sanctum
- 📊 Dashboard with statistics & charts
- 📅 Weekly payment matrix
- 📝 Income & expense reports
- 🏆 Contributor leaderboard
- 📥 PDF/Excel export
- 🌙 Dark mode UI
