const { create, benny } = require('@open-wa/wa-automate')
const welcome = require('./lib/welcome')
const bennymsg = require('./bennymsg')
const options = require('./options')

const start = async (benny = new benny()) => {
        console.log('[SERVER] Server Started!')
        // Force it to keep the current session
        benny.onStateChanged((state) => {
            console.log('[Benny State]', state)
            if (state === 'CONFLICT' || state === 'UNLAUNCHED') benny.forceRefocus()
        })
        // listening on message
        benny.onMessage((async (message) => {
            benny.getAmountOfLoadedMessages()
            .then((msg) => {
                if (msg >= 500) {
                    benny.cutMsgCache()
                }
            })
            bennymsg(benny, message)
        }))

        benny.onGlobalParicipantsChanged((async (heuh) => {
            await welcome(benny, heuh)
            //left(benny, heuh)
            }))
        
        benny.onAddedToGroup(((chat) => {
            let totalMem = chat.groupMetadata.participants.length
            if (totalMem < 0) { 
            	benny.sendText(chat.id, `Cih member nya cuma ${totalMem}, Kalo mau invite bot, minimal jumlah mem ada 0`).then(() => benny.leaveGroup(chat.id)).then(() => benny.deleteChat(chat.id))
            } else {
                benny.sendText(chat.groupMetadata.id, `Halo warga grup *${chat.contact.name}* terimakasih sudah menginvite bot ini, untuk melihat menu silahkan kirim *!help*`)
            }
        }))

        /*benny.onAck((x => {
            const { from, to, ack } = x
            if (x !== 3) benny.sendSeen(to)
        }))*/

        // listening on Incoming Call
        benny.onIncomingCall(( async (call) => {
            await benny.sendText(call.peerJid, 'Maaf, saya tidak bisa menerima panggilan. nelfon = block!')
            .then(() => benny.contactBlock(call.peerJid))
        }))
    }

create('Benny', options(true, start))
    .then(benny => start(benny))
    .catch((error) => console.log(error))