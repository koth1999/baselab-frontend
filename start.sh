#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 -m venv "$project_dir/.venv"
"$project_dir/.venv/bin/pip" install -r "$project_dir/backend/requirements.txt"
(cd "$project_dir/backend" && "$project_dir/.venv/bin/uvicorn" main:app --reload --port 8000) &
(cd "$project_dir" && npm install && npm run dev)
