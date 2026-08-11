// ---------- Deteccao de idioma por linha ----------
// Palavras funcionais comuns (nao especificas de nenhuma musica), para
// generalizar bem entre arquivos diferentes.
const PT_WORDS = /\b(que|não|nao|é|para|com|se|sua|seu|suas|seus|minha|meu|minhas|meus|está|esta|estão|estao|isso|esse|essa|isto|cada|dia|dias|mais|muito|muita|nunca|sempre|quero|voce|você|sou|estou|sinto|digo|fico|ficando|vida|nós|nos|eu|ele|ela|eles|elas|o|os|de|do|da|dos|das|em|na|nas|um|uma|uns|umas|mas|também|tambem|ainda|já|ja|aqui|ali|lá|la|onde|quando|como|porque|porquê|assim|então|entao|pois|todo|toda|todos|todas|tudo|nada|coisa|coisas|amor|coração|coracao|jamais)\b/i;

const EN_WORDS = /\b(the|and|my|is|am|are|was|were|will|would|its|dont|do|does|did|i|you|your|yours|that|this|these|those|every|to|in|of|an|with|for|on|at|but|or|so|just|like|know|got|get|getting|going|gonna|wanna|all|we|us|our|they|them|their|he|she|him|her|his|what|when|where|why|how|not|yes|can|could|should|must|have|has|had|been|be|being|into|from|out|up|down|over|under|it|if|than|then|there|here|now|never|always|love|heart|feel|feeling|say|said|way|day|life|time|world)\b/i;

const HAS_ACCENT = /[áàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ]/;
const HAS_CONTRACTION = /['’]\s?(s|t|m|re|ll|ve|d)\b/i;

function scoreLine(line) {
  let pt = 0;
  let en = 0;
  if (HAS_ACCENT.test(line)) pt += 3;
  const ptMatches = line.match(new RegExp(PT_WORDS, "gi"));
  if (ptMatches) pt += ptMatches.length;
  const enMatches = line.match(new RegExp(EN_WORDS, "gi"));
  if (enMatches) en += enMatches.length;
  if (HAS_CONTRACTION.test(line)) en += 2;
  return { pt, en };
}

function cleanRawLine(line) {
  // remove prefixo de transcricao automatica ">> " quando presente
  return line.replace(/^>>\s*/, "").trim();
}

function stripMarkers(text) {
  // remove marcadores de legenda automatica, ex: [music] / [música] / [singing]
  return text
    .replace(/\[[^\]]*\]/g, "") // colchetes balanceados
    .replace(/[[\]]/g, "") // sobras de colchete quebrado/sem fechar (legenda corrompida)
    .replace(/\s+([.,!?;:])/g, "$1") // remove espaço antes de pontuação (sobra de linhas "." isoladas)
    .replace(/\s{2,}/g, " ")
    .trim();
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Reconstroi a letra em ingles e a traducao em portugues a partir de um
// arquivo de legenda automatica onde a alternancia linha-a-linha nao e
// sempre 1 para 1 (uma frase pode quebrar em 2 linhas num idioma e 1 no
// outro). Classifica cada linha por idioma (em vez de confiar na posicao),
// depois reconstroi frases completas separadamente em cada idioma e as
// alinha pela ordem.
function parseLyricsFile(rawText) {
  const rawLines = rawText
    .split(/\r?\n/)
    .map(cleanRawLine)
    .filter((line) => line.length > 0);

  let prevLang = null;
  const classified = rawLines.map((line) => {
    const { pt, en } = scoreLine(line);
    let lang;
    if (pt > en) lang = "pt";
    else if (en > pt) lang = "en";
    else lang = prevLang === "en" ? "pt" : "en"; // sem sinal claro: assume alternancia
    prevLang = lang;
    return { line, lang };
  });

  const enText = classified.filter((c) => c.lang === "en").map((c) => c.line).join(" ").replace(/\s+/g, " ").trim();
  const ptText = classified.filter((c) => c.lang === "pt").map((c) => c.line).join(" ").replace(/\s+/g, " ").trim();

  const enSentences = splitSentences(enText).map(stripMarkers);
  const ptSentences = splitSentences(ptText).map(stripMarkers);

  const total = Math.max(enSentences.length, ptSentences.length);
  const pairs = [];
  for (let i = 0; i < total; i++) {
    const en = enSentences[i] || "";
    const pt = ptSentences[i] || "";
    if (!en && !pt) continue;
    pairs.push({ en, pt });
  }
  return pairs;
}

function renderLyrics(rawText) {
  const container = document.getElementById("lyrics");
  const pairs = parseLyricsFile(rawText);

  if (pairs.length === 0) {
    container.innerHTML = `<p class="empty">Não consegui identificar letra e tradução neste arquivo.</p>`;
    return;
  }

  container.innerHTML = "";
  pairs.forEach(({ en, pt }) => {
    const pair = document.createElement("div");
    pair.className = "lyric-pair";
    pair.innerHTML = `
      ${en ? `<p class="lyric-en">${en}</p>` : ""}
      ${pt ? `<p class="lyric-pt">${pt}</p>` : ""}
    `;
    container.appendChild(pair);
  });
}

async function loadSong() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("s");
  const titleEl = document.getElementById("song-title");
  const container = document.getElementById("lyrics");

  if (!slug) {
    titleEl.textContent = "Música não encontrada";
    container.innerHTML = `<p class="error">Nenhuma música foi especificada na URL.</p>`;
    return;
  }

  try {
    const songsRes = await fetch("data/songs.json");
    const songs = await songsRes.json();
    const song = songs.find((s) => s.slug === slug);

    titleEl.textContent = song ? song.title : slug;

    const txtRes = await fetch(`lyrics/${slug}.txt`);
    if (!txtRes.ok) throw new Error("arquivo de letra não encontrado em lyrics/");
    const rawText = await txtRes.text();

    renderLyrics(rawText);
  } catch (err) {
    container.innerHTML = `<p class="error">Não foi possível carregar a letra. (${err.message})</p>`;
  }
}

loadSong();
