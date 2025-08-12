# FoodCritic Frontend

React + TypeScript frontend for the FoodCritic restaurant discovery application.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Query** for server state management
- **React Router** for navigation
- **React Hot Toast** for notifications

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your Google Places API key
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env.local` file with:

```
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
VITE_API_BASE_URL=http://localhost:8080/api
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Navbar)
│   ├── review/         # Review-related components
│   ├── search/         # Search components
│   └── ui/             # Basic UI components
├── contexts/           # React contexts (Auth)
├── lib/                # API client and utilities
├── pages/              # Page components
├── services/           # Business logic services
└── types/              # TypeScript type definitions
```

## Features

- Restaurant search with Google Places integration
- Location-based restaurant discovery
- User authentication and profiles
- Restaurant reviews and ratings
- Responsive design for all devices