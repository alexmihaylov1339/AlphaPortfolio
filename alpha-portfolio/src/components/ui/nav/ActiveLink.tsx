'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {useMemo} from 'react';
import {clsx} from 'clsx';

type ActiveLinkProps = {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
  className?: string;
  activeClassName?: string;
};

export const ActiveLink = ({ href, children, exact = false, className, activeClassName }: ActiveLinkProps) => {
  const pathname = usePathname();

  const isActive = useMemo(() => {
    if(!pathname) return false;

    return exact ? pathname === href : pathname.startsWith(href);
  }, [pathname, href, exact]);

  return (
    <Link href={href} className={clsx(className, isActive && activeClassName)}>
      {children}
    </Link>
  );
};

