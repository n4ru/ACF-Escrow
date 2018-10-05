![ACF Escrow](https://i.imgur.com/aRgSztC.png)

# ACF Escrow Tool

This command-line interface was created to manage the ACF escrow wallet and can be used to manage existing multisignature wallets and create new ones. 

## Installation & Usage

```npm install arkjs``` for the sole dependency. If you need to sign an existing transaction, simply throw the JSON object into the working directly under the name `tx.json`. 

## Generate Public Key

```node sign.js key <privatekey>```

Passphrase can be split up into multiple words. Returns the provided private key and the corresponding public key.

Example Response:

```
Passphrase: test
Public key: 025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca
```

## Creating Transactions

Any transaction creation will overwrite the existing transaction saved to `tx.json`. All transactions are created barebones and unsigned.

### Send (Type 0)

```node sign.js send <recipientaddress> <amount>```

Create a transaction to send ark to a receiving address. Amount is in ARK, not arktoshis.

### Vote (Type 1)

```node sign.js <vote/unvote> <publickey>```

Create a vote or unvote transaction for a delegate. Note that the delegate's public key must be provided, **NOT** their delegate name.

### Register Multisig (Type 4)

```node sign.js makemulti <minimumsignatures> <publickey1> ... <publickey16>```

Register a wallet as multisig. Pass the number of required signatures to verify a transaction, and then pass the public keys of all signatories on the wallet. Minimum number of signatures must be between 2 and 16. All signatures must be present on the multisig registration.

## Signing Transactions

Any transaction signing will modify and apply to the existing transaction saved to `tx.json`. If a signature of that type exists, it will be overwritten. Transaction IDs are recalculated with every signing.

### Sign using First Passphrase

```node sign.js signfirst <privatekey>```

Sign the existing transaction with your first passphrase. Any required fields that do not exist in the transaction will be created upon the first signing. Second signatures and multisig signatures will be erased upon applying the first signature, and the timestamp will be refreshed.

### Sign using Second Passphrase

```node sign.js signsecond <privatekey>```

Sign the existing transaction with your second passphrase.

### Sign using Multisig Passphrase

```node sign.js signmulti <privatekey>```

Sign the existing transaction with your multisig passphrase. Existing multisig signatures will not be affected.

## License

[MIT](LICENSE) © [George Kushnir](https://n4ru.it)