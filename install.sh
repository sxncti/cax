#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
bin_dir="$HOME/.local/bin"
applications_dir="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
profiles_root="${CAX_PROFILES_HOME:-$HOME/.codex-accounts}"
shared_state_home="${CAX_SHARED_STATE_HOME:-$HOME/.codex}"

command -v codex >/dev/null 2>&1 || {
    printf 'Erro: instale o Codex CLI antes do CAX.\n' >&2
    exit 1
}

install -d -m 755 "$bin_dir" "$applications_dir"
install -m 755 "$project_dir/cax" "$bin_dir/cax"
install -m 644 "$project_dir/cax.desktop" "$applications_dir/cax.desktop"

install -d -m 700 "$profiles_root" "$shared_state_home"
for number in {1..10}; do
    profile_dir="$profiles_root/$number"
    install -d -m 700 "$profile_dir"
    if [[ ! -e "$profile_dir/config.toml" ]]; then
        printf 'cli_auth_credentials_store = "file"\n' > "$profile_dir/config.toml"
        chmod 600 "$profile_dir/config.toml"
    fi
done

if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$applications_dir"
fi

printf 'CAX instalado. Rode: cax help\n'
