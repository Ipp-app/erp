# AI Rules for cyber-tech-interface Application

This document outlines the core technologies used in this project and provides guidelines for using specific libraries to maintain consistency and efficiency.

## 🚀 Tech Stack Overview

*   **Frontend Framework:** React (with TypeScript)
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **UI Component Library:** shadcn/ui (built on Radix UI primitives)
*   **Routing:** React Router DOM
*   **Backend/Database:** Supabase (for authentication and data management)
*   **Data Fetching/Caching:** React Query
*   **Icons:** Lucide React
*   **Notifications:** React Hot Toast (integrated via `useToast` hook)
*   **Utility for Class Names:** `clsx` and `tailwind-merge`

## 📚 Library Usage Guidelines

To ensure consistency, maintainability, and leverage the existing setup, please adhere to the following rules when developing or modifying features:

*   **UI Components:**
    *   **Always** prioritize using components from `shadcn/ui` (e.g., `Button`, `Input`, `Card`, `Dialog`, `Table`).
    *   If a required component is not available in `shadcn/ui`, create a new, small, and focused component in `src/components/ui/` that follows the existing `shadcn/ui` styling conventions (using Tailwind CSS).
    *   Do **not** modify existing `shadcn/ui` component files directly. If a change is needed, create a new component that wraps or extends the `shadcn/ui` component.

*   **Styling:**
    *   **Exclusively** use Tailwind CSS for all styling. Avoid inline styles where Tailwind classes can be used.
    *   For dynamic class names, use the `cn` utility function from `src/lib/utils.ts` (which combines `clsx` and `tailwind-merge`).

*   **Routing:**
    *   Use `react-router-dom` for all client-side navigation.
    *   Keep the main application routes defined in `src/App.tsx`.

*   **State Management:**
    *   For local component state, use React's `useState` and `useReducer` hooks.
    *   For global UI state (like theme), use React Context (e.g., `ThemeContext` in `src/components/ui/GlobalUI.tsx`).
    *   For server-side data fetching, caching, and synchronization, use `@tanstack/react-query`.

*   **Backend Interactions:**
    *   All database and authentication interactions should be performed using the `supabase` client from `src/lib/supabaseClient.ts`.
    *   Leverage the `useAuth` hook (`src/hooks/useAuth.ts`) for authentication logic.
    *   Utilize the `useCRUD` hook (`src/hooks/useCRUD.ts`) for common Create, Read, Update, Delete operations on Supabase tables.

*   **Icons:**
    *   Use icons from the `lucide-react` library.

*   **Notifications:**
    *   For displaying toast notifications, use the `useToast` hook and `Toaster` component (already integrated from `src/hooks/use-toast.ts` and `src/components/ui/toaster.tsx`).

*   **File Structure:**
    *   New pages should be placed in `src/pages/`.
    *   New reusable components should be placed in `src/components/` (or `src/components/common/` for generic ones, `src/components/ui/` for themed UI elements).
    *   New hooks should be placed in `src/hooks/`.
    *   New utility functions or configurations should be placed in `src/lib/`.

By following these guidelines, we ensure a consistent, maintainable, and scalable codebase.