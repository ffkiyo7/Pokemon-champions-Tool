import type { LucideIcon } from 'lucide-react';
import { IconButton } from './ui';

export function Header({ rightIcon, onRightClick }: { rightIcon: LucideIcon; onRightClick: () => void }) {
  return (
    <header className="mb-3 flex items-center justify-between">
      <div>
        <h1 className="text-[17px] font-semibold tracking-normal">Champions Tool</h1>
        <p className="text-xs text-textSecondary">Regulation Set M-A · 移动端 MVP</p>
      </div>
      <IconButton icon={rightIcon} label="页面操作" onClick={onRightClick} />
    </header>
  );
}
