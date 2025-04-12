import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { Loader2 } from "lucide-react";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dream 5 Application" },
    { name: "description", content: "Welcome to Dream 5 Application!" },
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);
  return (
    <>
      <Header />
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
          <div className="relative">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      )}
      <Outlet />
    </>
  );
}

function Header() {
  return (
    <header className="bg-white border-b border-gray-200 z-50">
      <nav className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold">
          Dream5
        </Link>
        {import.meta.env.DEV && (
          <span className="px-2 py-1 text-xs font-medium bg-red-400 text-white rounded-full">
            DEV
          </span>
        )}
        <Link
          to="/matches"
          className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/80 active:bg-primary/90 transition-colors"
        >
          Matches
        </Link>
        <Link
          to="/matches/chart"
          className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/80 active:bg-primary/90 transition-colors"
        >
          Charts
        </Link>
        <Link
          to="/users"
          className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/80 active:bg-primary/90 transition-colors"
        >
          Users
        </Link>
      </nav>
    </header>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <>
      <Header />
      <main className="pt-16 p-4 container mx-auto">
        <h1>{message}</h1>
        <p>{details}</p>
        {stack && (
          <pre className="w-full p-4 overflow-x-auto">
            <code>{stack}</code>
          </pre>
        )}
      </main>
    </>
  );
}
