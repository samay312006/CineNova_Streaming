# CineNova Codebase Report

This report provides a comprehensive overview of the CineNova codebase, its architecture, components, and the data structures used.

## 🏗️ Architecture Overview

CineNova is a modern web application built with **Next.js 16** using the **App Router** architecture. It is designed as a centralized streaming hub that aggregates content across various subscription platforms.

### Tech Stack
- **Frontend**: React 19, Next.js 16, TypeScript
- **Styling**: Tailwind CSS 4, Lucide React (icons)
- **Backend**: Next.js API Routes (Serverless)
- **Database**: MongoDB (Cloud Atlas) with **Mongoose** ODM
- **External API**: OMDB API for movie and show metadata
- **Authentication**: Custom authentication using `bcryptjs` for secure password hashing

---

## 📂 Project Structure

The project follows the standard Next.js App Router structure:

| Directory | Purpose |
| :--- | :--- |
| `src/app/` | Contains the application's pages, layouts, and API routes. |
| `src/app/api/` | Backend logic for authentication and database testing. |
| `src/app/landing/` | Landing page for unauthenticated users. |
| `src/app/home/` | Main dashboard for authenticated users. |
| `src/lib/` | Utility functions, shared logic, and database models. |
| `src/lib/models/` | Mongoose schemas for MongoDB. |
| `public/` | Static assets like logos and icons. |

---

## 🛠️ Key Components & Logic

### 1. Database Connection (`src/lib/mongodb.ts`)
Uses a connection caching mechanism to prevent multiple database connections during development and serverless execution.

### 2. Authentication Flow
- **Signup**: Logic in `src/app/api/auth/signup/route.ts` creates new users and hashes passwords.
- **Login**: Logic in `src/app/api/auth/login/route.ts` verifies credentials.

### 3. Movie Discovery Logic (`src/lib/tmdb.ts`)
Despite the filename (likely a placeholder name for "The Movie Database"), the code actually uses the **OMDB API**. It includes:
- **Platform Catalogs**: Hardcoded lists of popular titles for Netflix, Disney+, HBO Max, etc.
- **Live Search**: Functionality to search for movies using the OMDB API.
- **Trailer Integration**: Generates YouTube search links for trailers on the fly.

---

## 📊 Data Structures

The codebase relies on several well-defined TypeScript interfaces and Mongoose schemas to manage data.

### 1. User Model (Database)
Located in `src/lib/models/User.ts`.

```typescript
{
  name: String (required),
  email: String (unique, required),
  password: String (hashed),
  timestamps: true // adds createdAt and updatedAt
}
```

### 2. Platform Interface (UI/Logic)
Defines the streaming platforms supported by the app.

```typescript
interface Platform {
  id: string;      // e.g., "netflix"
  name: string;    // e.g., "Netflix"
  icon: string;    // Display icon
  color: string;   // Brand color
  gradient: string; // CSS gradient classes
  tagline: string; // Catchphrase
}
```

### 3. Movie Interface (UI/Data)
The primary data structure for content items.

```typescript
interface Movie {
  id: string;           // IMDb ID
  title: string;
  poster_path: string;  // Image URL
  description: string;
  year: string;
  rating: string;
  genre: string;
  runtime: string;
  match: number;        // Random compatibility score (85-100%)
  videoSearch: string;  // URL encoded search query
  trailerUrl: string;   // Direct YouTube search link
}
```

---

## 🔄 Data Flow

1. **User Interaction**: User searches for a movie or selects a platform.
2. **API Interaction**: The `fetchMovies` helper in `tmdb.ts` calls OMDB API.
3. **Data Transformation**: Raw API response is mapped to the `Movie` interface.
4. **Local State**: The user's "connected platforms" are persisted in `localStorage`.
5. **Session Management**: Handled via the `/api/auth` endpoints (currently being implemented).

---

> [!TIP]
> **Extensibility**: The catalog for platforms is currently static in `src/lib/tmdb.ts`. For a production app, these lists would likely be fetched from a dynamic content API or a database collection.
