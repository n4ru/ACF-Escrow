const arkjs = require('arkjs');
const crypto = arkjs.crypto;
let tx;
const pass = process.argv.slice(3).join(" ");

const sign = (multi, second) => {
    tx = require('./tx.json');
    multi && !tx.signatures && (tx.signatures = []);
    !tx.type && (tx.type = 0);
    !multi && !second && (tx.timestamp = arkjs.slots.getTime()) && (tx.signature = crypto.getKeys(pass).sign(crypto.getHash(tx, true, true)).toDER().toString("hex"));
    !tx.timestamp && (tx.timestamp = arkjs.slots.getTime());
    multi && (tx.signatures = tx.signatures.concat([crypto.getKeys(pass).sign(crypto.getHash(tx, true, true)).toDER().toString("hex")]));
    !multi && second && (tx.signSignature = crypto.getKeys(pass).sign(crypto.getHash(tx, true, true)).toDER().toString("hex"));
    tx.id = crypto.getId(tx);
    multi && (tx.ready = true);
    console.log(JSON.stringify(tx, null, 4))
}

switch (process.argv[2]) {
    case "key":
        console.log("Passphrase:", pass)
        console.log("Public key:", crypto.getKeys(pass).publicKey);
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
}