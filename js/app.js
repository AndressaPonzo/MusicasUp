let allSongs = [];

function renderSongList(songs) {
  const list = document.getElementById("song-list");

  if (songs.length === 0) {
    list.innerHTML = `<p class="empty">Nenhuma música encontrada.</p>`;
    return;
  }

  list.innerHTML = "";
  songs.forEach((song) => {
    const row = document.createElement("a");
    row.className = "song-row";
    row.href = `song.html?s=${encodeURIComponent(song.slug)}`;
    row.innerHTML = `
      <span class="song-row-note">♪</span>
      <span class="song-row-title">${song.title}</span>
    `;
    list.appendChild(row);
  });
}

function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // remove acentos pra busca mais tolerante
}

async function loadSongs() {
  const list = document.getElementById("song-list");
  try {
    const res = await fetch("data/songs.json");
    if (!res.ok) throw new Error("songs.json não encontrado");
    allSongs = await res.json();

    if (!allSongs.length) {
      list.innerHTML = `<p class="empty">Nenhuma música cadastrada ainda. Adicione uma entrada em data/songs.json.</p>`;
      return;
    }

    renderSongList(allSongs);
  } catch (err) {
    list.innerHTML = `<p class="error">Não foi possível carregar as músicas. (${err.message})</p>`;
  }
}

function setupSearch() {
  const input = document.getElementById("song-search");
  input.addEventListener("input", () => {
    const query = normalize(input.value.trim());
    if (!query) {
      renderSongList(allSongs);
      return;
    }
    const filtered = allSongs.filter((song) => normalize(song.title).includes(query));
    renderSongList(filtered);
  });
}

loadSongs();
setupSearch();
