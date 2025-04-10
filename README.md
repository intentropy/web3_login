# Web3 Site Login
**This is a work in progress**
This is a proof-of-concept for a website login using a Web3 Crypto browser plugin.


## How it works
This concept works by relying on private/public cryptographic methods to prove ownership of a wallet's private key.  This is done by signing a string with a wallet's private key on the client side so that the server can recover its public key.  This idea aims to prove ownership of the public key, without exposing the private key, to log into a web site.


While a public key can be recovered simply by connecting a wallet to a site, there is no proof that the browser plugin presenting the key is not arbitrarily providing a public key.  For most web3 sites this doesn't matter much, as all operations on such sites tend to interact directly with the block chain.  This is intended to act more as a standard site login, using the public/private keypair of a crypto wallet.


The method works like this:
1. A wallet is connected to the site
2. A login button is pressed on the site
3. The server end of the site sends a string of text to the client visiting the site as a login challenge
4. The client signs the challenge with a personal signature using the private key in their web wallet browser plugin
5. The signature is sent back to the server
6. The server is able to take the original message and the signature, and derive the public key of wallet which did the signing
7. The server is able to use the proven public key as a primary key in the sites database for data


A benefit of this method is that only the public key (Wallet Address) is required on the server side.  No hashed/salted passwords.


## How this prof of concept is built
This proof of concept is built with what I am most comfortable with.  It is built in Flask, and the communication between client and server is done using websockets.
It should be entirely possible to build this with other methods, such as using NodeJS or more traditional POSTs/API calls to communicate between the client and server.
