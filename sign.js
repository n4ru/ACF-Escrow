const arkjs = require('arkjs');
const crypto = arkjs.crypto;
const fs = require('fs');
const pass = process.argv.slice(3).join(" ");

const dump = tx => fs.writeFileSync('./tx.json', JSON.stringify(tx, null, 4));

const sign = (multi, second) => {
    let tx = fs.existsSync('./tx.json') ? require('./tx.json') : null
    if (tx) {
        if (!tx.type) tx.type = 0;
        if (!(!multi && !second) && !tx.signature) {
            console.log("Please apply the first signature to this transaction.")
        } else {
            let keys = crypto.getKeys(pass);
            if (!tx.timestamp) tx.timestamp = arkjs.slots.getTime();
            console.log("Passphrase:", pass, "\nPublic key:", crypto.getKeys(pass).publicKey);
            // First Signature Signing
            if (!multi && !second) {
                tx.senderPublicKey = keys.publicKey;
                tx.senderId = crypto.getAddress(keys.publicKey);
                if (!tx.recipientId) tx.recipientId = tx.senderId;
                delete tx.signatures;
                delete tx.signSignature;
                tx.timestamp = arkjs.slots.getTime();
                tx.signature = keys.sign(crypto.getHash(tx, true, true)).toDER().toString("hex");
                console.log("Added first signature.")
            }
            // Second Signature Signing
            if (!multi && second) {
                tx.signSignature = keys.sign(crypto.getHash(tx, true, true)).toDER().toString("hex");
                console.log("Added second signature.")
            }
            // Multisig Signing
            if (multi) {
                if (!tx.signatures) tx.signatures = [];
                tx.signatures = tx.signatures.concat([keys.sign(crypto.getHash(tx, true, true)).toDER().toString("hex")])
                console.log("Added multisignature.")
            }
            tx.id = crypto.getId(tx);
            if (multi) tx.ready = true;
            dump(tx);
        }
    } else {
        console.log("No transaction found.")
    }
}

const send = (recipient, amount) => {
    let tx = {
        "type": 0,
        "amount": amount * 100000000,
        "fee": 10000000,
        "recipientId": recipient
    }
    dump(tx);
    console.log("Created normal transaction.");
}

const vote = (publicKey, voteType) => {
    let tx = {
        "type": 3,
        "amount": 0,
        "fee": 100000000,
        "asset": { "votes": [`${voteType ? '-' : '+'}${publicKey}`] }
    }
    dump(tx);
    console.log("Created vote transaction.");
}

const makesecond = (pubkey) => {
    let tx = {
        "type": 1,
        "amount": 0,
        "fee": 500000000,
        "asset": {
            "signature": {
                "publicKey": pubkey
            }
        }
    }
    dump(tx);
    console.log("Created second passphrase registration.");
}

const create = (group) => {
    let min = group[0];
    group = group.slice(1);
    if (min > 1 && min <= 16 && min <= group.length && group.length <= 16) {
        let tx = {
            "type": 4,
            "amount": 0,
            "fee": 500000000 + group.length * 500000000,
            "asset": {
                "multisignature": {
                    "min": parseInt(min),
                    "keysgroup": group.map(key => `+${key}`),
                    "lifetime": 24
                }
            }
        }
        dump(tx);
        console.log("Created multisig registration.");
    } else {
        console.log("Minimum signatures must be greater than 1 and less than 17, and not exceed keys length.");
    }
}

switch (process.argv[2]) {
    case "key":
        console.log("Passphrase:", pass, "\nPublic key:", crypto.getKeys(pass).publicKey);
        break;
    case "signmulti":
        sign(true);
        break;
    case "signfirst":
        sign(false);
        break;
    case "signsecond":
        sign(false, true);
        break;
    case "send":
        send(process.argv[3], process.argv[4]);
        break;
    case "vote":
        vote(process.argv[3]);
        break;
    case "unvote":
        vote(process.argv[3], true);
        break;
    case "makesecond":
        makesecond(pass);
        break;
    case "makemulti":
        create(pass.split(" "))
        break;
}