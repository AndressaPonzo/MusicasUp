# Millionaire M — Letras & Traduções

Site estático (HTML/CSS/JS puro, sem build) para ver a letra em inglês e a
tradução em português de cada música, lado a lado, linha por linha.

## Estrutura

```
site/
├── index.html          página inicial (lista de músicas)
├── song.html            página de uma música (letra + tradução)
├── css/style.css
├── js/app.js             carrega a lista de músicas na home
├── js/song.js            carrega e "parseia" o .txt de uma música
├── data/songs.json       manifesto: título + slug de cada música
└── lyrics/*.txt          seus arquivos de letra/tradução
```

## Como adicionar uma nova música

1. Pegue o seu arquivo `.txt` (letra em inglês alternada com a tradução,
   linha a linha — igual ao formato que você já usa).
2. Renomeie para um "slug" simples, sem espaços/acentos/maiúsculas.
   Exemplo: `getting-younger-every-day.txt`.
3. Coloque o arquivo dentro da pasta `lyrics/`.
4. Abra `data/songs.json` e adicione uma nova entrada:

```json
{
  "title": "Nome da Música",
  "slug": "nome-da-musica"
}
```

   (o `slug` tem que ser exatamente igual ao nome do arquivo `.txt`, sem a
   extensão).

5. Pronto — a música já aparece automaticamente na página inicial.

## Formato esperado do .txt (legenda automática do YouTube)

O parser foi feito especificamente para arquivos exportados de legenda
automática do YouTube + tradução (o formato que você usa), onde a letra
em inglês e a tradução em português se alternam linha a linha, mas **nem
sempre 1 linha para 1 linha** — às vezes uma frase quebra em 2 linhas em
um idioma e só 1 no outro:

```
day.
dia.   É isso que
That's what
I choose to say.
eu escolho dizer.
```

Em vez de simplesmente casar "linha N com linha N+1", o `js/song.js`:

1. Identifica o idioma de cada linha pelo conteúdo (acentos e palavras
   comuns de cada idioma), não pela posição.
2. Junta as linhas de cada idioma numa única sequência de texto.
3. Quebra essa sequência em frases completas (usando `.`, `!`, `?`).
4. Alinha as frases em inglês com as frases em português pela ordem.
5. Remove marcadores de legenda como `[music]` / `[música]` / `[singing]`.

Isso resolve a maior parte dos desalinhamentos comuns em legenda
automática. **Não é 100% perfeito**: se uma frase no arquivo original
não termina com `.`/`!`/`?`, ela pode colar com a frase seguinte. Se você
notar uma música com trechos mal alinhados, o mais fácil é abrir o
`.txt` e adicionar o ponto final que estiver faltando na linha em
questão — não precisa reescrever o arquivo inteiro.

> Nota técnica: o classificador de idioma evita palavras que existem
> nos dois idiomas com a mesma grafia (como "a", "as", "me", "no"), já
> que elas causavam classificações erradas em alguns arquivos. Se uma
> música nova vier com muitos trechos desalinhados, é provável que
> tenha alguma palavra ambígua parecida — me avise ao adicionar a
> música que eu investigo.

## Testar localmente

Como o site usa `fetch()` para carregar o JSON e os `.txt`, ele precisa
rodar por um servidor local (abrir o `index.html` direto no navegador com
`file://` não funciona por causa de CORS). Rode, dentro da pasta `site/`:

```bash
python3 -m http.server 8000
```

E acesse `http://localhost:8000`.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub e suba o conteúdo desta pasta (`site/`)
   para a raiz dele (ou para uma pasta `docs/`, se preferir).
2. No repositório, vá em **Settings → Pages**.
3. Em "Source", selecione a branch `main` e a pasta `/ (root)`
   (ou `/docs`, se você usou essa opção).
4. Salve. Em alguns minutos o site estará disponível em
   `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

### Sobre direitos autorais

Letras de música são obras protegidas por direitos autorais. Hospedar um
site público com letras completas — mesmo com fins de estudo — pode
infringir os direitos do autor/gravadora. Se quiser evitar esse risco,
considere:

- manter o repositório **privado** no GitHub (funciona em contas Pro, ou
  você pode simplesmente cloná-lo localmente sem publicar o Pages), ou
- usar o site apenas localmente (rodando o servidor local acima), sem
  publicar em uma URL pública.

Nada na parte técnica muda — é só uma decisão sobre onde/como publicar.
