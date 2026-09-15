# Запуск dev-сервера «Зови» на http://localhost:3100.
# Путь к Node задан явно: у программ, запущенных до установки Node, в PATH его ещё нет.
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot
$env:Path = "C:\Program Files\nodejs;" + $env:Path
# Не отправлять анонимную статистику использования в Vercel.
$env:NEXT_TELEMETRY_DISABLED = "1"
& "C:\Program Files\nodejs\node.exe" "node_modules\next\dist\bin\next" dev --port 3100
