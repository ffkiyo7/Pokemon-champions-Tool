import { Database, Download, RefreshCw, Upload } from 'lucide-react';
import { useRef } from 'react';
import { currentDataVersion, currentRuleSet } from '../data/mockData';
import { buildExportPayload, parseTeamImport } from '../lib/exportImport';
import { useAppStore } from '../state/AppContext';
import { Badge, Button, Card } from '../components/ui';

export function SettingsPage({ onOpenRule }: { onOpenRule: () => void }) {
  const { teams, replaceTeams, clearLocalData, simulateRefresh, lastRefreshError } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportTeams = () => {
    const payload = buildExportPayload(teams);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `champions-teams-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importTeams = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    const parsedTeams = parseTeamImport(text);
    await replaceTeams(parsedTeams);
  };

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">设置</h2>
        <p className="text-xs text-textSecondary">数据版本、本地缓存、导入导出与显示偏好</p>
      </div>

      <Card>
        <p className="mb-2 text-[11px] uppercase tracking-wide text-textMuted">数据管理</p>
        <div className="divide-y divide-divider">
          <button className="flex w-full items-center justify-between py-3 text-left" onClick={onOpenRule}>
            <span>
              <span className="block text-sm">当前规则</span>
              <span className="text-xs text-textSecondary">{currentRuleSet.name}</span>
            </span>
            <Badge status="current">当前赛季</Badge>
          </button>
          <div className="flex items-center justify-between py-3">
            <span>
              <span className="block text-sm">数据版本</span>
              <span className="text-xs text-textSecondary">{currentDataVersion.updatedAt.slice(0, 10)}</span>
            </span>
            <span className="text-sm text-textSecondary">{currentDataVersion.versionName}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span>
              <span className="block text-sm">上次同步</span>
              <span className="text-xs text-textSecondary">本地模拟数据</span>
            </span>
            <Button variant="ghost" onClick={simulateRefresh}>
              <RefreshCw size={14} />
              立即刷新
            </Button>
          </div>
          <div className="flex items-center justify-between py-3">
            <span>
              <span className="block text-sm">清除本地缓存</span>
              <span className="text-xs text-textSecondary">队伍和偏好会被清空</span>
            </span>
            <Button variant="danger" onClick={clearLocalData}>清除</Button>
          </div>
        </div>
        {lastRefreshError && <p className="mt-3 rounded-lg bg-reviewBg p-2 text-xs text-warning">{lastRefreshError}</p>}
      </Card>

      <Card>
        <p className="mb-2 text-[11px] uppercase tracking-wide text-textMuted">队伍数据</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={exportTeams}>
            <Download size={14} />
            导出队伍
          </Button>
          <Button variant="ghost" onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} />
            导入队伍
          </Button>
        </div>
        <input
          ref={fileInputRef}
          className="hidden"
          type="file"
          accept="application/json"
          onChange={(event) => importTeams(event.target.files?.[0]).catch((error: Error) => alert(error.message))}
        />
        <p className="mt-3 text-[11px] text-textMuted">导入 / 导出 JSON 包含 ruleSetId、dataVersionId 和成员配置版本字段。</p>
      </Card>

      <Card>
        <p className="mb-2 text-[11px] uppercase tracking-wide text-textMuted">显示设置</p>
        <div className="divide-y divide-divider">
          <div className="flex items-center justify-between py-3">
            <span>
              <span className="block text-sm">语言</span>
              <span className="text-xs text-textSecondary">中文优先，保留英文名</span>
            </span>
            <span className="text-sm text-textSecondary">中文</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm">深色模式</span>
            <span className="h-6 w-11 rounded-full bg-accent p-1">
              <span className="block h-4 w-4 translate-x-5 rounded-full bg-page" />
            </span>
          </div>
        </div>
      </Card>

      <Card className="text-textMuted">
        <div className="flex items-center gap-2">
          <Database size={16} />
          <span className="text-sm">多规则切换 [敬请期待]</span>
        </div>
      </Card>
    </div>
  );
}
