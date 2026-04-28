import type { LucideIcon } from 'lucide-react';
import type { LegalityStatus, PokemonType } from '../types';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-border bg-card p-3 ${className}`}>{children}</section>;
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  const variants = {
    primary: 'bg-accent text-page',
    ghost: 'border border-accent/40 bg-transparent text-accent',
    danger: 'border border-danger/40 bg-transparent text-danger',
  };
  return (
    <button
      className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition active:scale-[0.98] ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({ icon: Icon, label, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon: LucideIcon; label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-textSecondary active:scale-[0.98]"
      {...props}
    >
      <Icon size={18} />
    </button>
  );
}

export function Chip({
  children,
  active,
  className = '',
}: {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-7 shrink-0 items-center rounded-md border px-2 text-xs ${
        active ? 'border-accent bg-accent text-page' : 'border-border bg-card text-textSecondary'
      } ${className}`}
    >
      {children}
    </span>
  );
}

export function Badge({ status, children }: { status?: LegalityStatus | 'version' | 'current'; children: React.ReactNode }) {
  const styles: Record<string, string> = {
    legal: 'bg-legalBg text-success',
    illegal: 'bg-missingBg text-danger',
    'needs-review': 'bg-reviewBg text-warning',
    'missing-config': 'bg-missingBg text-danger',
    version: 'bg-[#1e2a45] text-accent',
    current: 'bg-[#1e2a45] text-accent',
  };
  return <span className={`inline-flex rounded px-1.5 py-1 text-[11px] font-semibold ${styles[status ?? 'version']}`}>{children}</span>;
}

const typeColors: Record<PokemonType, string> = {
  Normal: '#a8a77a',
  Fire: '#ee8130',
  Water: '#6390f0',
  Electric: '#f7d02c',
  Grass: '#7ac74c',
  Ice: '#96d9d6',
  Fighting: '#c22e28',
  Poison: '#a33ea1',
  Ground: '#e2bf65',
  Flying: '#a98ff3',
  Psychic: '#f95587',
  Bug: '#a6b91a',
  Rock: '#b6a136',
  Ghost: '#735797',
  Dragon: '#6f35fc',
  Dark: '#705746',
  Steel: '#b7b7ce',
  Fairy: '#d685ad',
};

export function TypeBadge({ type }: { type: PokemonType }) {
  return (
    <span
      className="inline-flex h-5 min-w-12 shrink-0 items-center justify-center rounded px-1.5 text-[10px] font-semibold leading-none"
      style={{ backgroundColor: `${typeColors[type]}24`, color: typeColors[type] }}
    >
      {type}
    </span>
  );
}

export function EmptyState({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-border bg-secondary px-4 py-8 text-center">
      <p className="mb-3 text-sm text-textSecondary">{title}</p>
      {action}
    </div>
  );
}
