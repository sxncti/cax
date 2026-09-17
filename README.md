# CAX — Codex Account eXchange

Atalho para trocar rapidamente a conta padrão do Codex e manter até dez contas do Codex CLI abertas simultaneamente.

Cada conta numerada usa um `CODEX_HOME` próprio. Isso separa credenciais, configurações, logs e sessões, sem precisar fazer logout de uma conta para abrir outra.

## Requisitos

- Linux com Bash
- [Codex CLI](https://learn.chatgpt.com/docs/codex/cli) instalado
- Login do ChatGPT disponível para cada conta

## Instalação

```bash
git clone https://github.com/sxncti/cax.git
cd cax
./install.sh
```

O instalador coloca o comando em `~/.local/bin/cax`, adiciona o lançador **CAX — Trocar conta do Codex** ao menu de aplicativos e prepara os perfis `1` a `10`.

## Uso rápido

Abra contas diferentes em terminais diferentes:

```bash
# Terminal 1
cax 1

# Terminal 2
cax 2

# Terminal 3
cax 3
```

No primeiro uso de cada número, o CAX abre o navegador para autenticação. Depois disso, basta executar novamente `cax 1`, `cax 2` etc. A credencial fica armazenada no perfil correspondente e o Codex renova os tokens automaticamente enquanto forem válidos.

Você só precisará autenticar novamente se fizer logout ou switch, revogar a sessão, ou se a credencial deixar de ser válida.

## Comandos

| Comando | Ação |
| --- | --- |
| `cax` | Faz logout da conta padrão e abre o navegador para outra conta |
| `cax 1` … `cax 10` | Abre o Codex com a conta numerada |
| `cax list` | Lista as dez contas e seus estados |
| `cax N login` | Autentica a conta `N` |
| `cax N status` | Mostra se a conta `N` está conectada |
| `cax N switch` | Faz logout e login somente na conta `N` |
| `cax N logout` | Desconecta somente a conta `N` |
| `cax help` | Mostra a ajuda no terminal |

Se o navegador insistir em usar a conta errada, faça login por código e abra o endereço mostrado em uma janela anônima:

```bash
cax 2 login --device-auth
```

## Como funciona

Os perfis ficam separados em:

```text
~/.codex-accounts/
├── 1/
├── 2/
├── 3/
├── ...
└── 10/
```

O CAX define `CODEX_HOME` para o diretório da conta selecionada e força `cli_auth_credentials_store = "file"`. Assim, cada perfil mantém seu próprio `auth.json`.

A variável `CODEX_HOME` é oficialmente suportada pelo Codex para definir a raiz de configurações, autenticação, logs, sessões e skills. Consulte a documentação de [variáveis de ambiente](https://learn.chatgpt.com/docs/config-file/environment-variables) e [autenticação](https://learn.chatgpt.com/docs/auth).

## Segurança

Os arquivos `auth.json` contêm tokens de acesso. O CAX cria os diretórios dos perfis com permissão `700`, mas você ainda deve tratá-los como senhas:

- não envie `~/.codex-accounts` para o Git;
- não compartilhe os arquivos `auth.json`;
- não cole o conteúdo deles em chats ou chamados de suporte.

Este repositório não contém credenciais.

## Remoção

Remova apenas o comando e o lançador:

```bash
rm ~/.local/bin/cax
rm ~/.local/share/applications/cax.desktop
```

Os perfis e logins permanecem em `~/.codex-accounts`. Apague esse diretório somente se também quiser remover todas as credenciais e sessões do CAX.
