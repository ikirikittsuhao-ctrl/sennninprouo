const StorageManager = {
  get(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
  },
  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  add(key, item) {
    let list = this.get(key);
    list = list.filter(x => x.id !== item.id);
    list.unshift(item);
    this.save(key, list);
  },
  remove(key, id) {
    let list = this.get(key);
    list = list.filter(x => x.id !== id);
    this.save(key, list);
  },
  getPlaylists() {
    return JSON.parse(localStorage.getItem("playlists")) || {};
  },
  savePlaylists(data) {
    localStorage.setItem("playlists", JSON.stringify(data));
  },
  createPlaylist(name) {
    let p = this.getPlaylists();
    if (!p[name]) p[name] = [];
    this.savePlaylists(p);
  },
  addToPlaylist(name, item) {
    let p = this.getPlaylists();
    if (!p[name]) p[name] = [];
    p[name] = p[name].filter(x => x.id !== item.id);
    p[name].unshift(item);
    this.savePlaylists(p);
  },
  removeFromPlaylist(name, id) {
    let p = this.getPlaylists();
    if (p[name]) {
      p[name] = p[name].filter(x => x.id !== id);
      this.savePlaylists(p);
    }
  }
};
