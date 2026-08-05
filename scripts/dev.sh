#!/usr/bin/env bash
set -euo pipefail

# プロジェクトルートへ移動（どこから実行しても動く）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

PORT=3000

# ポート 3000 が使用中か確認
if lsof -ti:"$PORT" >/dev/null 2>&1; then
  PIDS="$(lsof -ti:"$PORT" | tr '\n' ' ')"
  echo ""
  echo "⚠️  ポート ${PORT} は既に使用中です（PID: ${PIDS}）"
  echo "   別のターミナルで開発サーバーが起動している可能性があります。"
  echo ""
  echo "   停止するには: kill ${PIDS}"
  echo ""
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo ""
  echo "❌ pnpm が見つかりません。先に pnpm をインストールしてください。"
  echo "   https://pnpm.io/installation"
  echo ""
  exit 1
fi

echo ""
echo "🚀 okina-app 開発サーバーを起動します..."
echo "   http://localhost:${PORT}"
echo "   停止するには Ctrl+C"
echo ""

exec pnpm dev
