import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'motion/react';

import { cn } from '@/lib/utils';

const SCROLL_SHADOW =
  '0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset';

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose?: () => void;
  closeLabel?: string;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setVisible(latest > 80);
  });

  return (
    <motion.div className={cn('sticky inset-x-0 top-0 z-50 w-full', className)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  const reduce = useReducedMotion();

  return (
    <motion.div
      animate={
        reduce
          ? undefined
          : {
              backdropFilter: visible ? 'blur(10px)' : 'none',
              boxShadow: visible ? SCROLL_SHADOW : 'none',
              width: visible ? 'min(1120px, 96%)' : '100%',
              y: visible ? 16 : 0,
            }
      }
      transition={{ type: 'spring', stiffness: 200, damping: 50 }}
      className={cn(
        'relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between gap-2 self-start rounded-full bg-transparent px-4 py-2 lg:flex dark:bg-transparent',
        visible && 'bg-white/80 dark:bg-zinc-950/80',
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        'relative z-10 hidden min-w-0 flex-1 flex-row items-center justify-center gap-0.5 overflow-hidden text-sm font-medium lg:flex',
        className,
      )}
    >
      {items.map((item, idx) => (
        <Link
          key={`link-${idx}`}
          to={item.link}
          onMouseEnter={() => setHovered(idx)}
          onClick={() => {
            onItemClick?.();
            window.scrollTo(0, 0);
          }}
          className="relative shrink-0 whitespace-nowrap px-1.5 py-2 text-[12px] text-stone-600 no-underline transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-stone-900 xl:px-2.5 xl:text-sm dark:text-zinc-300 dark:hover:text-white"
        >
          {hovered === idx && (
            <motion.div
              layoutId="nav-hover"
              className="absolute inset-0 h-full w-full rounded-full bg-stone-100 dark:bg-zinc-800"
            />
          )}
          <span className="relative z-20">{item.name}</span>
        </Link>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  const reduce = useReducedMotion();

  return (
    <motion.div
      animate={
        reduce
          ? undefined
          : {
              backdropFilter: visible ? 'blur(10px)' : 'none',
              boxShadow: visible ? SCROLL_SHADOW : 'none',
              width: visible ? '90%' : '100%',
              paddingRight: visible ? '12px' : '0px',
              paddingLeft: visible ? '12px' : '0px',
              borderRadius: visible ? '1.5rem' : '2rem',
              y: visible ? 16 : 0,
            }
      }
      transition={{ type: 'spring', stiffness: 200, damping: 50 }}
      className={cn(
        'relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden',
        visible && 'bg-white/80 dark:bg-zinc-950/80',
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        'relative z-[60] flex w-full flex-row items-center justify-between',
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
  closeLabel = 'Close menu',
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            key="mobile-nav-backdrop"
            type="button"
            aria-label={closeLabel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 cursor-default border-0 bg-stone-900/25 p-0 dark:bg-black/35"
            onClick={onClose}
          />
          <motion.div
            key="mobile-nav-panel"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className={cn(
              'absolute inset-x-0 top-16 z-50 flex w-full flex-col items-stretch justify-start gap-3 rounded-2xl border border-stone-200/80 bg-white px-4 py-5 shadow-[0_12px_40px_rgba(15,_23,_42,_0.12)] dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-[0_12px_40px_rgba(0,_0,_0,_0.45)]',
              className,
            )}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
  openLabel = 'Open menu',
  closeLabel = 'Close menu',
}: {
  isOpen: boolean;
  onClick: () => void;
  openLabel?: string;
  closeLabel?: string;
}) => {
  return (
    <button
      type="button"
      aria-label={isOpen ? closeLabel : openLabel}
      aria-expanded={isOpen}
      className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-stone-800 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-stone-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
      onClick={onClick}
    >
      {isOpen ? <X className="size-6" strokeWidth={1.5} /> : <Menu className="size-6" strokeWidth={1.5} />}
    </button>
  );
};

export const NavbarLogo = ({
  to = '/',
  children,
  className,
  onClick,
  ...props
}: {
  to?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
} & Omit<React.ComponentPropsWithoutRef<typeof Link>, 'to' | 'className' | 'onClick' | 'children'>) => {
  return (
    <Link
      to={to}
      onClick={(e) => {
        onClick?.(e);
        window.scrollTo(0, 0);
      }}
      className={cn(
        'relative z-20 me-4 flex shrink-0 items-center gap-2 px-2 py-1 text-sm font-normal text-stone-900 no-underline dark:text-zinc-50',
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
};

export const NavbarButton = ({
  to = '/',
  children,
  className,
  variant = 'primary',
  onClick,
}: {
  to?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}) => {
  const baseStyles =
    'px-4 py-2 rounded-full text-sm font-semibold relative cursor-pointer transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 active:scale-[0.98] inline-block text-center no-underline';

  const variantStyles = {
    primary:
      'bg-brand-600 text-white shadow-[0_0_24px_rgba(94,43,236,0.18),0_1px_1px_rgba(0,0,0,0.05)] dark:bg-brand-500',
    secondary: 'bg-transparent shadow-none text-stone-800 dark:text-zinc-100',
  };

  return (
    <Link
      to={to}
      onClick={() => {
        onClick?.();
        window.scrollTo(0, 0);
      }}
      className={cn(baseStyles, variantStyles[variant], className)}
    >
      {children}
    </Link>
  );
};
