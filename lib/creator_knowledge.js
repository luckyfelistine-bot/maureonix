/**
 * Creator Knowledge Base — owned by Infinite Vybeflix
 * Edit the object below with your personal details.
 * Rules for what can be shared are handled automatically.
 */

const creatorInfo = {
    fullName: 'Infinite Vybeflix',
    shortName: 'Vybeflix',
    title: 'Software Engineer, Bot Creator',
    location: 'Kenya',
    contact: {
        // This email will ONLY be shared if someone asks directly
        email: 'iris.with.vybeflix@gmail.com',
        // This phone will ONLY be shared with explicit owner permission
        phone: '+254116903500',
        channel: 'https://whatsapp.com/channel/0029Vb7IABxCXC3J7ZFFsk2h',
        github: 'https://github.com/luckyfelistine-bot/maureonix',
    },
    personality: 'Friendly, innovative, passionate about tech and automation.',
    funFacts: [
        'Created Maureonix to make WhatsApp automation accessible to everyone.',
        'Loves experimenting with AI and building useful tools.',
        'Believes in open-source and community-driven development.',
    ],
    privacyRules: {
        // What to share with strangers when they ask about the creator
        publicInfo: [
            'His name is Infinite Vybeflix.',
            'He is a Biochemistry student.',
            'Studies at the University of Kabianga.', 
            'He created Maureonix bot.',
            'He created other AI like Kaelum, Iris, Maflex.',
            'He is passionate about technology and automation.',
            'You can reach him via the Maureonix channel or GitHub.',
        ],
        // What to share with people the owner has allowed (e.g. premium users, if you add that later)
        trustedInfo: [
            'He is always open to feedback and new ideas.',
            'He sometimes provides direct support for serious issues.',
        ],
        // What ONLY the owner himself can ask about
        ownerOnlyInfo: [
            'Full contact details, private plans, and future features.',
        ],
    },
};

/**
 * Build a system prompt fragment that tells the AI who the creator is,
 * based on who is talking.
 * @param {string} senderJid - The JID of the person the AI is responding to (e.g., '254116903500@s.whatsapp.net')
 * @returns {string} A short paragraph to insert into the system prompt.
 */
function getCreatorPrompt(senderJid) {
    const isOwner = senderJid && senderJid.startsWith('254116903500'); // your number
    if (isOwner) {
        return `You are speaking to your creator, ${creatorInfo.fullName}. You know everything about him: his name, location, contact details, projects, and plans. Refer to him as "my creator" or "Infinite Vybeflix". Be respectful and proactive.`;
    }

    // For strangers, only reveal public info
    return `Your creator is ${creatorInfo.fullName} (also known as ${creatorInfo.shortName}), a software engineer from ${creatorInfo.location}. He built you to help people. If asked, you may only share: ${creatorInfo.privacyRules.publicInfo.join('; ')}. Do not disclose his phone number or email unless he specifically instructs you to.`;
}

module.exports = { creatorInfo, getCreatorPrompt };