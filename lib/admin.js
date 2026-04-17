async function setAntiLink(conn, chat, status) {
  global.db.groups[chat] = global.db.groups[chat] || {};
  global.db.groups[chat].antilink = status;
  return status;
}

async function setAntiDelete(conn, chat, status) {
  global.db.groups[chat] = global.db.groups[chat] || {};
  global.db.groups[chat].antidelete = status;
  return status;
}

async function setAntiSpam(conn, chat, status) {
  global.db.groups[chat] = global.db.groups[chat] || {};
  global.db.groups[chat].antispam = status;
  return status;
}

async function setWelcome(conn, chat, text) {
  global.db.groups[chat] = global.db.groups[chat] || {};
  global.db.groups[chat].welcomeText = text;
  return true;
}

async function setGoodbye(conn, chat, text) {
  global.db.groups[chat] = global.db.groups[chat] || {};
  global.db.groups[chat].goodbyeText = text;
  return true;
}

async function setAutoSticker(conn, chat, status) {
  global.db.groups[chat] = global.db.groups[chat] || {};
  global.db.groups[chat].autosticker = status;
  return status;
}

async function setMute(conn, chat, durationMs) {
  await conn.groupSettingUpdate(chat, 'announcement');
  if (durationMs) setTimeout(() => conn.groupSettingUpdate(chat, 'not_announcement'), durationMs);
  return true;
}

async function setUnmute(conn, chat) {
  await conn.groupSettingUpdate(chat, 'not_announcement');
  return true;
}

async function deleteMessage(conn, chat, key) {
  await conn.sendMessage(chat, { delete: key });
}

async function getGroupInfo(conn, chat) {
  const meta = await conn.groupMetadata(chat);
  return {
    name: meta.subject,
    desc: meta.desc,
    size: meta.participants.length,
    created: meta.creation,
    owner: meta.owner
  };
}

async function inviteCode(conn, chat) {
  const code = await conn.groupInviteCode(chat);
  return `https://chat.whatsapp.com/${code}`;
}

async function revokeInvite(conn, chat) {
  await conn.groupRevokeInvite(chat);
  return true;
}

async function tagAll(conn, chat, text, participants) {
  await conn.sendMessage(chat, { text: text || 'Attention!', mentions: participants.map(p => p.id) });
}

async function hideTag(conn, chat, text, participants) {
  await conn.sendMessage(chat, { text, mentions: participants.map(p => p.id) });
}

async function addMember(conn, chat, jid) {
  await conn.groupParticipantsUpdate(chat, [jid], 'add');
}

async function kickMember(conn, chat, jid) {
  await conn.groupParticipantsUpdate(chat, [jid], 'remove');
}

async function promote(conn, chat, jid) {
  await conn.groupParticipantsUpdate(chat, [jid], 'promote');
}

async function demote(conn, chat, jid) {
  await conn.groupParticipantsUpdate(chat, [jid], 'demote');
}

async function warn(groupId, userId, reason) {
  global.warnings = global.warnings || {};
  global.warnings[groupId] = global.warnings[groupId] || {};
  global.warnings[groupId][userId] = global.warnings[groupId][userId] || [];
  global.warnings[groupId][userId].push({ reason, date: Date.now() });
  return global.warnings[groupId][userId].length;
}

function getWarnings(groupId, userId) {
  return global.warnings?.[groupId]?.[userId]?.length || 0;
}

function clearWarns(groupId, userId) {
  if (global.warnings?.[groupId]?.[userId]) delete global.warnings[groupId][userId];
}

async function setFilter(conn, chat, trigger, response) {
  global.db.groups[chat] = global.db.groups[chat] || {};
  global.db.groups[chat].filters = global.db.groups[chat].filters || {};
  global.db.groups[chat].filters[trigger.toLowerCase()] = response;
  return true;
}

async function deleteFilter(conn, chat, trigger) {
  if (global.db.groups[chat]?.filters) delete global.db.groups[chat].filters[trigger.toLowerCase()];
  return true;
}

module.exports = {
  setAntiLink, setAntiDelete, setAntiSpam, setWelcome, setGoodbye, setAutoSticker,
  setMute, setUnmute, deleteMessage, getGroupInfo, inviteCode, revokeInvite,
  tagAll, hideTag, addMember, kickMember, promote, demote,
  warn, getWarnings, clearWarns, setFilter, deleteFilter
};