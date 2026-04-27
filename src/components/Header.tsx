import type { LucideIcon } from 'lucide-react';
import { IconButton } from './ui';

export function Header({ rightIcon, onRightClick, rightLabel = '页面操作' }: { rightIcon?: LucideIcon; onRightClick?: () => void; rightLabel?: string }) {
  return (
    <header className="mb-3 flex items-center justify-between">
      <div>
        <h1 className="text-[17px] font-semibold tracking-normal">Champions Tool</h1>
        <p className="text-xs text-textSecondary">Regulation Set M-A · 移动端 MVP</p>
      </div>
      {rightIcon && onRightClick ? <IconButton icon={rightIcon} label={rightLabel} onClick={onRightClick} /> : null}
    </header>
  );
}
