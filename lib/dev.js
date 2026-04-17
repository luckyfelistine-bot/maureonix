const crypto = require('crypto');

class DevKit {
  uuid() { return crypto.randomUUID(); }
  
  password(len = 16, opts = {upper:true, lower:true, num:true, sym:true}) {
    let c = '';
    if (opts.lower) c += 'abcdefghijklmnopqrstuvwxyz';
    if (opts.upper) c += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (opts.num) c += '0123456789';
    if (opts.sym) c += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let p = '';
    for (let i=0;i<len;i++) p += c[Math.floor(Math.random()*c.length)];
    const entropy = Math.log2(Math.pow(c.length, len)).toFixed(0);
    return { pass: p, length: len, entropy: `${entropy} bits` };
  }

  json(str) {
    try { const o = JSON.parse(str); return { valid: true, pretty: JSON.stringify(o, null, 2), keys: Object.keys(o).length }; }
    catch(e) { return { valid: false, error: e.message }; }
  }

  regex(pattern, flags, text) {
    try {
      const re = new RegExp(pattern, flags);
      const m = text.match(re);
      return { matches: m || [], count: m?.length || 0, groups: m?.groups };
    } catch(e) { return { error: e.message }; }
  }

  encode(type, str) {
    if (type === 'base64') return Buffer.from(str).toString('base64');
    if (type === 'url') return encodeURIComponent(str);
    if (type === 'html') return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return 'Unknown type';
  }

  decode(type, str) {
    if (type === 'base64') return Buffer.from(str, 'base64').toString('utf8');
    if (type === 'url') return decodeURIComponent(str);
    if (type === 'html') return str.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
    return 'Unknown type';
  }

  lorem(words = 50) {
    const d = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(' ');
    return Array.from({length: words}, () => d[Math.floor(Math.random()*d.length)]).join(' ');
  }

  palette() {
    const s = [
      ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7'],
      ['#2C3E50','#E74C3C','#ECF0F1','#3498DB','#2980B9'],
      ['#DDA0DD','#98D8C8','#F7DC6F','#BB8FCE','#85C1E9']
    ];
    return s[Math.floor(Math.random()*s.length)];
  }

  checksum(buf, algo = 'sha256') {
    return crypto.createHash(algo).update(buf).digest('hex');
  }

  qrData(type, data) {
    // Returns text for QR generation
    if (type === 'wifi') return `WIFI:T:WPA;S:${data.ssid};P:${data.pass};;`;
    if (type === 'vcard') return `BEGIN:VCARD\nVERSION:3.0\nFN:${data.name}\nTEL:${data.phone}\nEMAIL:${data.email}\nEND:VCARD`;
    if (type === 'email') return `mailto:${data.to}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(data.body)}`;
    return data;
  }
}

module.exports = new DevKit();