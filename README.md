# CAX — Codex Account eXchange

Atalho para trocar rapidamente a conta padrão do Codex e manter até dez contas do Codex CLI abertas simultaneamente.

Cada conta numerada usa um `CODEX_HOME` próprio para manter as credenciais separadas. O estado retomável do Codex fica no diretório padrão `~/.codex`, compartilhado entre os perfis, para que `/resume` mostre as mesmas conversas em `cax 1`, `cax 2` e no Codex padrão.

## Requisitos

- Linux com Bash 4 ou mais recente
- [Codex CLI](https://learn.chatgpt.com/docs/codex/cli) instalado
- Login do ChatGPT disponível para cada conta

## Instalação

```bash
git clone https://github.com/sxncti/cax.git
cd cax
./install.sh
```

O instalador coloca o comando em `~/.local/bin/cax`, adiciona o lançador **CAX — Trocar conta do Codex** ao menu de aplicativos e prepara os perfis `1` a `10`.

## Atualização

Se você manteve a pasta clonada na instalação original, entre nela e rode:

```bash
git pull --ff-only
./install.sh
```

O instalador substitui somente o comando e o lançador. As contas, credenciais e conversas existentes em `~/.codex-accounts` e `~/.codex` são preservadas.

Se você apagou a pasta original, clone o projeto novamente em qualquer diretório e execute o instalador:

```bash
git clone https://github.com/sxncti/cax.git
cd cax
./install.sh
```

No Windows, use esses mesmos comandos dentro do WSL; a instalação nativa pelo PowerShell ou Prompt de Comando ainda não é suportada. O macOS também ainda não é suportado, pois o CAX requer recursos ausentes no Bash fornecido pelo sistema.

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
| `cax list` / `cax ls` | Lista as dez contas, seus e-mails, estados e os limites restantes de 5 horas e semanal |
| `cax N login` | Autentica a conta `N` |
| `cax N status` | Mostra se a conta `N` está conectada |
| `cax N switch` | Faz logout e login somente na conta `N` |
| `cax N logout` | Desconecta somente a conta `N` |
| `cax help` | Mostra a ajuda no terminal |
| `cax auto "TAREFA"` | Executa uma tarefa autônoma e troca de conta se o limite acabar |
| `cax auto resume UUID` | Continua uma sessão existente com troca automática de conta |

Se o navegador insistir em usar a conta errada, faça login por código e abra o endereço mostrado em uma janela anônima:

```bash
cax 2 login --device-auth
```

O `cax list` mostra a parte anterior ao `@` do e-mail associado a cada login do ChatGPT. Os limites são os mesmos consultados pelo `/status` do Codex, e cada percentual vem acompanhado de uma pilha visual com cinco segmentos e do tempo restante até o reset, como `70% [■■■■□] (2h14m)`. A consulta não envia uma mensagem nem consome o limite. Se o serviço estiver temporariamente inacessível, o CAX mostra `indisp.` sem considerar a conta desconectada.

Em terminais compatíveis, o CAX colore somente a contagem regressiva para destacar a proximidade do reset. Defina `NO_COLOR=1` ou `CAX_COLOR=never` para desativar as cores; use `CAX_COLOR=always` para mantê-las mesmo quando a saída for redirecionada.

## Continuação automática

Para uma tarefa autônoma longa, use:

```bash
cax auto "implemente a tarefa, execute os testes e corrija eventuais falhas"
```

O CAX escolhe a conta conectada com a melhor combinação de limite de 5 horas e semanal. Se o Codex encerrar o turno por falta de limite, o CAX preserva o UUID da sessão, escolhe outra conta com limite e continua o mesmo trabalho automaticamente.

Também é possível assumir uma sessão já existente:

```bash
cax auto resume 00000000-0000-0000-0000-000000000000
```

O modo `auto` usa a execução não interativa do Codex com sandbox `workspace-write` e revisão automática de aprovações. Ele troca de conta somente quando a saída informa esgotamento de créditos ou limite; outros erros são devolvidos normalmente. Use apenas contas que você está autorizado a acessar.

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
