// commands/group.js – Group admin & management
module.exports = {
    add: async (maureonix, m, { text, mess, prefix, command, store, db }) => {
        if (!m.isGroup) return m.reply(mess.group);
        if (!m.isAdmin) return m.reply(mess.admin);
        if (!m.isBotAdmin) return m.reply(mess.botAdmin);
        if (text || m.quoted) {
            const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender;
            const findJid = maureonix.findJidByLid(numbersOnly.replace(/[^0-9]/g, '') + '@lid', store);
            const klss = numbersOnly.replace(/[^0-9]/g, '') + (findJid ? '@lid' : '@s.whatsapp.net');
            const nmrnya = maureonix.findJidByLid(klss, store, true);
            try {
                const res = await maureonix.groupParticipantsUpdate(m.chat, [nmrnya], 'add');
                for (let i of (res || [])) {
                    const statusMessages = { 200: `Successfully added @${nmrnya.split('@')[0]} to the group!`, 401: 'They have blocked the bot!', 409: 'They are already in the group!', 500: 'Group is full!' };
                    if (statusMessages[i.status]) await m.reply(statusMessages[i.status]);
                    else if (i.status == 408) {
                        const invv = await maureonix.groupInviteCode(m.chat).catch(() => null);
                        await m.reply(`@${nmrnya.split('@')[0]} recently left the group!\n\nBecause of privacy, an invitation is being sent\n-> wa.me/${nmrnya.replace(/\D/g, '')}`);
                        if (invv) await maureonix.sendMessage(nmrnya, { text: `https://chat.whatsapp.com/${invv}\n\nAdmin: @${m.sender.split('@')[0]}\nInvites you to the group 🙇` }).catch(() => {});
                    } else if (i.status == 403) {
                        try {
                            const attrs = i?.content?.content?.[0]?.attrs;
                            if (attrs?.code && attrs?.expiration) await maureonix.sendGroupInviteV4(m.chat, nmrnya, attrs.code, attrs.expiration, m.metadata.subject, `Admin: @${m.sender.split('@')[0]}\nInvites you to the group 🙇`, null, { mentions: [m.sender] });
                            else {
                                const invv = await maureonix.groupInviteCode(m.chat).catch(() => null);
                                if (invv) await maureonix.sendMessage(nmrnya, { text: `https://chat.whatsapp.com/${invv}\n\nAdmin: @${m.sender.split('@')[0]}\nInvites you to the group 🙇` }).catch(() => {});
                            }
                            await m.reply(`@${nmrnya.split('@')[0]} is a private account, cannot add directly\nInvitation sent`, { mentions: [nmrnya] });
                        } catch (invErr) {
                            const invv = await maureonix.groupInviteCode(m.chat).catch(() => null);
                            if (invv) await maureonix.sendMessage(nmrnya, { text: `https://chat.whatsapp.com/${invv}\n\nAdmin: @${m.sender.split('@')[0]}\nInvites you to the group 🙇` }).catch(() => {});
                            await m.reply(`@${nmrnya.split('@')[0]} is a private account, cannot add directly\nInvitation sent`, { mentions: [nmrnya] });
                        }
                    } else await m.reply('Failed to add user\nStatus: ' + i.status);
                }
            } catch (e) { m.reply('An error occurred! Failed to add user\n' + (e?.message || '')); }
        } else m.reply(`⚠️ *Add Command*\n\nTo add someone to the group:\n📌 With number: ${prefix + command} *94xxxxxxxxx*\n\nExample: ${prefix + command} 254712345678`);
    },
    kick: async (maureonix, m, { text, mess, prefix, command, store }) => {
        if (!m.isGroup) return m.reply(mess.group);
        if (!m.isAdmin) return m.reply(mess.admin);
        if (!m.isBotAdmin) return m.reply(mess.botAdmin);
        if (text || m.quoted) {
            const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender;
            const findJid = maureonix.findJidByLid(numbersOnly.replace(/[^0-9]/g, '') + '@lid', store);
            const klss = numbersOnly.replace(/[^0-9]/g, '') + (findJid ? '@lid' : '@s.whatsapp.net');
            const nmrnya = maureonix.findJidByLid(klss, store, true);
            await maureonix.groupParticipantsUpdate(m.chat, [nmrnya], 'remove').then(() => m.reply(`╔══════════════════╗\n║  🦵 *Kicked from group* 🦵\n╠══════════════════╣\n║\n║ ✅ @${nmrnya.split('@')[0]}\n║ *Successfully removed*\n║ *from the group!*\n║\n║ 🏅 Group: ${m.metadata.subject}\n║ 👤 By: @${m.sender.split('@')[0]}\n╚══════════════════╝`, { mentions: [nmrnya, m.sender] })).catch(() => m.reply('❌ Kick failed!'));
        } else m.reply(`⚠️ *Kick Command*\n\nTo remove someone:\n📌 By reply: *(reply to their message)*\n📌 With number: ${prefix + command} *94xxxxxxxxx*\n\nExample: ${prefix + command} 254712345678`);
    },
    promote: async (maureonix, m, { text, mess, prefix, command, store }) => {
        if (!m.isGroup) return m.reply(mess.group);
        if (!m.isAdmin) return m.reply(mess.admin);
        if (!m.isBotAdmin) return m.reply(mess.botAdmin);
        if (text || m.quoted) {
            const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender;
            const findJid = maureonix.findJidByLid(numbersOnly.replace(/[^0-9]/g, '') + '@lid', store);
            const klss = numbersOnly.replace(/[^0-9]/g, '') + (findJid ? '@lid' : '@s.whatsapp.net');
            const nmrnya = maureonix.findJidByLid(klss, store, true);
            await maureonix.groupParticipantsUpdate(m.chat, [nmrnya], 'promote').then(() => m.reply(`╔══════════════════╗\n║  👑 *Admin Promotion* 👑\n╠══════════════════╣\n║\n║ ✅ @${nmrnya.split('@')[0]}\n║ *Successfully promoted*\n║ *to Admin!*\n║\n║ 🏅 Group: ${m.metadata.subject}\n║ 👤 By: @${m.sender.split('@')[0]}\n╚══════════════════╝`, { mentions: [nmrnya, m.sender] })).catch(() => m.reply('❌ Promote failed!'));
        } else m.reply(`⚠️ *Promote Command*\n\nTo promote someone to Admin:\n📌 By reply: *(reply to their message)*\n📌 With number: ${prefix + command} *94xxxxxxxxx*\n\nExample: ${prefix + command} 254712345678`);
    },
    demote: async (maureonix, m, { text, mess, prefix, command, store }) => {
        if (!m.isGroup) return m.reply(mess.group);
        if (!m.isAdmin) return m.reply(mess.admin);
        if (!m.isBotAdmin) return m.reply(mess.botAdmin);
        if (text || m.quoted) {
            const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender;
            const findJid = maureonix.findJidByLid(numbersOnly.replace(/[^0-9]/g, '') + '@lid', store);
            const klss = numbersOnly.replace(/[^0-9]/g, '') + (findJid ? '@lid' : '@s.whatsapp.net');
            const nmrnya = maureonix.findJidByLid(klss, store, true);
            await maureonix.groupParticipantsUpdate(m.chat, [nmrnya], 'demote').then(() => m.reply(`╔══════════════════╗\n║  🚫 *Admin Demotion* 🚫\n╠══════════════════╣\n║\n║ ✅ @${nmrnya.split('@')[0]}\n║ *Successfully demoted*\n║ *from Admin!*\n║\n║ 🏅 Group: ${m.metadata.subject}\n║ 👤 By: @${m.sender.split('@')[0]}\n╚══════════════════╝`, { mentions: [nmrnya, m.sender] })).catch(() => m.reply('❌ Demote failed!'));
        } else m.reply(`⚠️ *Demote Command*\n\nTo demote an Admin:\n📌 By reply: *(reply to their message)*\n📌 With number: ${prefix + command} *94xxxxxxxxx*\n\nExample: ${prefix + command} 254712345678`);
    },
    tagall: async (maureonix, m, { q, listv, store, pickRandom }) => {
        if (!m.isGroup) return m.reply(mess.group);
        if (!m.isAdmin) return m.reply(mess.admin);
        if (!m.isBotAdmin) return m.reply(mess.botAdmin);
        let setv = pickRandom(listv);
        let members = m.metadata.participants.map(p => {
            if (p.id && p.id.endsWith('@lid') && p.lid) {
                const real = maureonix.findJidByLid ? maureonix.findJidByLid(p.id, store) : null;
                return { ...p, id: (real && !real.endsWith('@lid')) ? real : (p.jid || p.id) };
            }
            return p;
        }).filter(p => p.id && !p.id.endsWith('@lid'));
        if (!members.length) members = m.metadata.participants;
        let chunkSize = 50;
        if (m.quoted) {
            const quotedType = m.quoted.type;
            const allMentions = members.map(a => a.id);
            const isMedia = /image|video|audio|document|sticker|ptt|voice/.test(quotedType);
            if (isMedia) {
                let captionTeks = `*Tagging everyone*\n\n*Message:* ${q ? q : ''}\n\n`;
                for (let mem of members.slice(0, 50)) captionTeks += `${setv} @${mem.id.split('@')[0]}\n`;
                try {
                    const mediaBuffer = await m.quoted.download();
                    const mediaMime = m.quoted.msg?.mimetype || m.quoted.mimetype || 'application/octet-stream';
                    let mediaMsg = {};
                    if (/image/.test(quotedType)) mediaMsg = { image: mediaBuffer, caption: captionTeks, mentions: allMentions };
                    else if (/video/.test(quotedType)) mediaMsg = { video: mediaBuffer, caption: captionTeks, mentions: allMentions };
                    else if (/audio|ptt|voice/.test(quotedType)) {
                        await maureonix.sendMessage(m.chat, { audio: mediaBuffer, mimetype: mediaMime, ptt: /ptt|voice/.test(quotedType) }, { quoted: m });
                        mediaMsg = { text: captionTeks, mentions: allMentions };
                    } else if (/document/.test(quotedType)) {
                        await maureonix.sendMessage(m.chat, { document: mediaBuffer, mimetype: mediaMime, fileName: m.quoted.msg?.fileName || 'file' }, { quoted: m });
                        mediaMsg = { text: captionTeks, mentions: allMentions };
                    } else if (/sticker/.test(quotedType)) {
                        await maureonix.sendMessage(m.chat, { sticker: mediaBuffer }, { quoted: m });
                        if (captionTeks) await maureonix.sendMessage(m.chat, { text: captionTeks, mentions: allMentions }, { quoted: m });
                        mediaMsg = null;
                    }
                    if (mediaMsg) await maureonix.sendMessage(m.chat, mediaMsg, { quoted: m });
                } catch (e) { await maureonix.sendMessage(m.chat, { forward: m.quoted.fakeObj(), mentions: allMentions }, {}); }
            } else await maureonix.sendMessage(m.chat, { forward: m.quoted.fakeObj(), mentions: allMentions }, {});
            for (let i = 50; i < members.length; i += chunkSize) {
                let chunk = members.slice(i, i + chunkSize);
                let teks = '';
                for (let mem of chunk) teks += `${setv} @${mem.id.split('@')[0]}\n`;
                await maureonix.sendMessage(m.chat, { text: teks, mentions: chunk.map(a => a.id) }, { quoted: m });
                await new Promise(res => setTimeout(res, 1000));
            }
        } else {
            for (let i = 0; i < members.length; i += chunkSize) {
                let chunk = members.slice(i, i + chunkSize);
                let teks = i === 0 ? `*Tagging everyone*\n\n*Message:* ${q ? q : ''}\n\n` : '';
                for (let mem of chunk) teks += `${setv} @${mem.id.split('@')[0]}\n`;
                await maureonix.sendMessage(m.chat, { text: teks, mentions: chunk.map(a => a.id) }, { quoted: m });
                await new Promise(res => setTimeout(res, 1000));
            }
        }
    },
    hidetag: async (maureonix, m, { q, mess }) => {
        if (!m.isGroup) return m.reply(mess.group);
        if (!m.isAdmin) return m.reply(mess.admin);
        if (!m.isBotAdmin) return m.reply(mess.botAdmin);
        try {
            const members = m.metadata?.participants?.map(a => a.id) || [];
            await m.reply(q ? q : '', { mentions: members });
        } catch (e) { m.reply('❌ hidetag error: ' + e?.message); }
    },
    linkgroup: async (maureonix, m, { mess, store }) => {
        if (!m.isGroup) return m.reply(mess.group);
        if (!m.isAdmin) return m.reply(mess.admin);
        if (!m.isBotAdmin) return m.reply(mess.botAdmin);
        let response = await maureonix.groupInviteCode(m.chat);
        await m.reply(`https://chat.whatsapp.com/${response}\n\nLink Group : ${(store.groupMetadata[m.chat] ? store.groupMetadata[m.chat] : (store.groupMetadata[m.chat] = await maureonix.groupMetadata(m.chat))).subject}`, { detectLink: true });
    },
    revoke: async (maureonix, m, { mess }) => {
        if (!m.isGroup) return m.reply(mess.group);
        if (!m.isAdmin) return m.reply(mess.admin);
        if (!m.isBotAdmin) return m.reply(mess.botAdmin);
        await maureonix.groupRevokeInvite(m.chat).then(() => m.reply(`✅ Success! Group link reset for: ${m.metadata.subject}`)).catch(() => m.reply('Failed!'));
    },
    setname: async (maureonix, m, { text, mess, prefix, command }) => {
        if (!m.isGroup) return m.reply(mess.group);
        if (!m.isAdmin) return m.reply(mess.admin);
        if (!m.isBotAdmin) return m.reply(mess.botAdmin);
        if (text || m.quoted) {
            const teksnya = text ? text : m.quoted.text;
            await maureonix.groupUpdateSubject(m.chat, teksnya).catch(() => m.reply('Failed!'));
        } else m.reply(`⚠️ *Setname Command*\n\nTo change the group name:\n📌 ${prefix + command} *New Name*\n\nExample: ${prefix + command} Maureonix Group`);
    },
    setdesc: async (maureonix, m, { text, mess, prefix, command }) => {
        if (!m.isGroup) return m.reply(mess.group);
        if (!m.isAdmin) return m.reply(mess.admin);
        if (!m.isBotAdmin) return m.reply(mess.botAdmin);
        if (text || m.quoted) {
            const teksnya = text ? text : m.quoted.text;
            await maureonix.groupUpdateDescription(m.chat, teksnya).catch(() => m.reply('Failed!'));
        } else m.reply(`⚠️ *Setdesc Command*\n\nTo change the group description:\n📌 ${prefix + command} *Description*\n\nExample: ${prefix + command} Welcome everyone!`);
    },
    setppgc: async (maureonix, m, { text, mess, prefix, command, generateProfilePicture }) => {
        if (!m.isGroup) return m.reply(mess.group);
        if (!m.isAdmin) return m.reply(mess.admin);
        if (!m.isBotAdmin) return m.reply(mess.botAdmin);
        if (!m.quoted) return m.reply('Reply to an image for the group profile picture');
        if (!/image/.test(m.quoted?.type)) return m.reply(`📌 Reply to an image (caption: *${prefix + command}*)`);
        let media = await m.quoted.download();
        let { img } = await generateProfilePicture(media, text.length > 0 ? null : 512);
        await maureonix.query({ tag: 'iq', attrs: { target: m.chat, to: '@s.whatsapp.net', type: 'set', xmlns: 'w:profile:picture' }, content: [{ tag: 'picture', attrs: { type: 'image' }, content: img }] });
        m.reply('Success');
    },
    delete: async (maureonix, m) => {
        if (!m.quoted) return m.reply('Reply to the message you want to delete');
        await maureonix.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: m.isBotAdmin ? false : true, id: m.quoted.id, participant: m.quoted.sender } });
    },
    pin: async (maureonix, m, { mess }) => {
        if (!m.isGroup) return m.reply(mess.group);
        if (!m.isAdmin) return m.reply(mess.admin);
        if (!m.isBotAdmin) return m.reply(mess.botAdmin);
        await maureonix.sendMessage(m.chat, { pin: { type: 1, time: 2592000, key: m.quoted ? m.quoted.key : m.key } });
    },
    unpin: async (maureonix, m, { mess }) => {
        if (!m.isGroup) return m.reply(mess.group);
        if (!m.isAdmin) return m.reply(mess.admin);
        if (!m.isBotAdmin) return m.reply(mess.botAdmin);
        await maureonix.sendMessage(m.chat, { pin: { type: 0, time: 2592000, key: m.quoted ? m.quoted.key : m.key } });
    },
    groupmenu: async (maureonix, m, { prefix }) => {
        const msg = `╔══════════════════════╗\n║  *👥 GROUP COMMANDS*  ║\n╚══════════════════════╝\n\n📌 *Member Management*\n▸ ${prefix}add @user – Add member\n▸ ${prefix}kick @user – Remove member\n▸ ${prefix}promote @user – Make admin\n▸ ${prefix}demote @user – Remove admin\n▸ ${prefix}warn @user – Issue warning\n▸ ${prefix}unwarn @user – Clear warnings\n\n📌 *Group Info & Settings*\n▸ ${prefix}setname <name> – Change group name\n▸ ${prefix}setdesc <desc> – Change description\n▸ ${prefix}setppgc – Reply to image to set group photo\n▸ ${prefix}linkgroup – Get invite link\n▸ ${prefix}revoke – Reset invite link\n▸ ${prefix}group open/close – Allow/restrict messaging\n\n📌 *Tagging*\n▸ ${prefix}tagall <message> – Mention everyone\n▸ ${prefix}hidetag <message> – Hidden mention\n▸ ${prefix}totag – Reply to forward with hidden mentions\n\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },
    // Aliases
    dor: async (maureonix, m, ctx) => { await module.exports.kick(maureonix, m, ctx); },
    h: async (maureonix, m, ctx) => { await module.exports.hidetag(maureonix, m, ctx); },
    linkgc: async (maureonix, m, ctx) => { await module.exports.linkgroup(maureonix, m, ctx); },
    newlink: async (maureonix, m, ctx) => { await module.exports.revoke(maureonix, m, ctx); },
    del: async (maureonix, m, ctx) => { await module.exports.delete(maureonix, m, ctx); },
    d: async (maureonix, m, ctx) => { await module.exports.delete(maureonix, m, ctx); },
};