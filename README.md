# CAX — Codex Account eXchange

Atalho para trocar rapidamente a conta padrão do Codex e manter até dez contas do Codex CLI abertas simultaneamente.

Cada conta numerada usa um `CODEX_HOME` próprio para manter as credenciais separadas. O estado retomável do Codex fica no diretório padrão `~/.codex`, compartilhado entre os perfis, para que `/resume` mostre as mesmas conversas em `cax 1`, `cax 2` e no Codex padrão.

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
| `cax list` / `cax ls` | Lista as dez contas, seus estados e os percentuais restantes dos limites de 5 horas e semanal |
| `cax N login` | Autentica a conta `N` |
| `cax N status` | Mostra se a conta `N` está conectada |
| `cax N switch` | Faz logout e login somente na conta `N` |
| `cax N logout` | Desconecta somente a conta `N` |
| `cax help` | Mostra a ajuda no terminal |

Se o navegador insistir em usar a conta errada, faça login por código e abra o endereço mostrado em uma janela anônima:

```bash
cax 2 login --device-auth
```

Os limites exibidos por `cax list` são os mesmos consultados pelo `/status` do Codex. Cada percentual vem acompanhado do tempo restante até o reset, como `70% (2h14m)` ou `95% (4d3h)`. A consulta não envia uma mensagem nem consome o limite. Se o serviço estiver temporariamente inacessível, o CAX mostra `indisp.` sem considerar a conta desconectada.

Em terminais compatíveis, o CAX colore somente a contagem regressiva para destacar a proximidade do reset. Defina `NO_COLOR=1` ou `CAX_COLOR=never` para desativar as cores; use `CAX_COLOR=always` para mantê-las mesmo quando a saída for redirecionada.

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

Ao mesmo tempo, ele define `CODEX_SQLITE_HOME=~/.codex`. Esse diretório contém o índice e outros estados retomáveis usados pelo `/resume`, mas a credencial continua sendo lida do `CODEX_HOME` de cada conta. As transcrições podem continuar fisicamente dentro do perfil que as criou; o índice compartilhado guarda o caminho delas.

Para usar outro local para o estado compartilhado, defina `CAX_SHARED_STATE_HOME`:

```bash
CAX_SHARED_STATE_HOME=/outro/diretorio cax 2
```

As variáveis `CODEX_HOME` e `CODEX_SQLITE_HOME` são oficialmente suportadas pelo Codex. Consulte a documentação de [variáveis de ambiente](https://learn.chatgpt.com/docs/config-file/environment-variables) e [autenticação](https://learn.chatgpt.com/docs/auth).

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

Os perfis e logins permanecem em `~/.codex-accounts`. Apague esse diretório somente se também quiser remover todas as credenciais e transcrições armazenadas nos perfis. O estado compartilhado padrão permanece em `~/.codex`.
