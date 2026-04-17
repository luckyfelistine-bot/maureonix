const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/database.json');

class Database {
  constructor() {
    this.cache = global.db;
    this.dirty = false;
    setInterval(() => this.save(), 30000); // auto-save every 30s
  }

  load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        global.db = { ...global.db, ...data };
        this.cache = global.db;
      }
    } catch {}
  }

  save() {
    if (!this.dirty) return;
    try {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(this.cache, null, 2));
      this.dirty = false;
    } catch {}
  }

  set(collection, id, data) {
    if (!this.cache[collection]) this.cache[collection] = {};
    this.cache[collection][id] = { ...this.cache[collection][id], ...data };
    this.dirty = true;
  }

  get(collection, id) {
    return this.cache[collection]?.[id];
  }

  delete(collection, id) {
    if (this.cache[collection]?.[id]) {
      delete this.cache[collection][id];
      this.dirty = true;
    }
  }
}

const db = new Database();
db.load();

module.exports = db;