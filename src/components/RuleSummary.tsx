import { ChevronRight, RefreshCw } from 'lucide-react';
import { currentDataVersion, currentRuleSet } from '../data';
import { useAppStore } from '../state/AppContext';
import { Badge, Button, Card, Chip } from './ui';

export function SyncStrip() {
  const { lastRefreshError } = useAppStore();
  return (
    <div className={`mb-3 flex min-h-9 items-center justify-between rounded-lg px-3 text-xs ${lastRefreshError ? 'bg-reviewBg text-warning' : 'bg-legalBg text-success'}`}>
      <span>
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-current" />
        {lastRefreshError ? '使用本地缓存 · 数据读取受限' : `本地缓存可用 · ${currentDataVersion.versionName}`}
      </span>
      <Button variant="ghost" className="h-7 min-h-0 px-2 text-[11px]" disabled title="当前版本暂不支持远程刷新">
        <RefreshCw size={12} />
        暂不支持远程刷新
      </Button>
    </div>
  );
}

export function RuleSummary({ onOpen }: { onOpen: () => void }) {
  return (
    <button className="w-full text-left" onClick={onOpen}>
      <Card className="mb-3">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold">{currentRuleSet.name}</h2>
              <Badge status="current">当前赛季</Badge>
            </div>
            <p className="mt-1 text-xs text-textSecondary">2026.04.08 - 2026.06.17 UTC</p>
          </div>
          <ChevronRight className="text-textMuted" size={18} />
        </div>
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <Chip>双打为主</Chip>
          <Chip>Mega 可用</Chip>
          <Chip>Lv.50</Chip>
          <Chip>道具不可重复</Chip>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-success">官方数据源状态可追溯</span>
          <span className="text-textMuted">{currentDataVersion.versionName}</span>
        </div>
      </Card>
    </button>
  );
}
