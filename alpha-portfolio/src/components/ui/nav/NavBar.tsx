import Link from "next/link";

import { ActiveLink } from "./ActiveLink";

const NAV_ITEMS = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Login",
    href: "/login",
  },
  {
    label: "Register",
    href: "/register",
  },
];

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 bg-background/50 backdrop-blur-sm border-b border-border/20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">Alpfa Portfolio</Link>
        <div className="flex items-center gap-4">
          {NAV_ITEMS.map((item) => (
            <ActiveLink key={item.href} href={item.href} exact={true}>
              {item.label}
            </ActiveLink>
          ))}
        </div>
        {/* Mobile Menu */}
        <MobileMenu />
      </div>
    </header>
  )
}

function MobileMenu() {
  return (
    <div className="md:hidden">
      <details className="relative">
        <summary className="list-none cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
          <nav className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg p-2">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <ActiveLink href={item.href} exact={true}>
                    {item.label}
                  </ActiveLink>
                </li>
              ))}
            </ul>
          </nav>
        </summary>
      </details>
    </div>
  )
}
