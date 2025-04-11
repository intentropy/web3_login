#!/usr/bin/env python3
"""Web3 Login Proof of Concept

Description:
    This is a work in progress, and the code, at this stage, is likely incomplete.
    This is the server side Flask application for the Web3 login proof-of-concept.

Code Author:
    Shane Hutter <shane@intentropy.au>
"""

from flask          import Flask
from flask_socketio import SocketIO , emit
from flask_session  import Session , session

from eth_account.messages   import encode_defunct
from eth_account.account    import Account

from base64         import b64encode
from Crypto.Random  import get_random_bytes

SESSION_KEY = "ChangeMePlease"

# Flask App
app = Flask( __name__ , static_url_path = "static" )

app.secret_key = SESSION_KEY
Session( app )


# Functions
def _gen_challange_random( size ):
    """Generate a random string to add to the verification challange"""
    return b64encode( get_random_bytes( size ) ).decode()


# Socket IO 
socketio = SocketIO( app )

@socketio.on( "auth_login" )
def auth_login( proposed_account ):
    """Recieve the login request with account
    Generate a challenge and send it"""
    _proposed_account = proposed_account.lower()
    session.update( { "proposed_account": _proposed_account } )
    _challenge = f"""Sign this with a personal signature using your crypto wallet to log in.\n\nAccount:\n{_proposed_account}\n\nVerification Code:\n{_gen_challange_random(128)}"""
    session.update( { "challenge": _challenge } )
    emit( "challenge" , _challenge )

@socketio.on( "verify_signature" )
def verify_signature( signed ):
    """Verify Signature, and log in if pass"""
    signed = bytearray.fromhex( signed[ 2: ] )
    _challenge = session.get( "challenge" )
    _challenge = encode_defunct( text = session.get( "challenge" ) )
    _recovered_account = Account.recover_message( _challenge , signature = signed ).lower()
    _verify = _recovered_account == session.get( "proposed_account" )
    if _verify:
        session.pop( "challenge" )
        session.update( { "account": _recovered_account } )
    emit( "auth_verified" , _verify )

@socketio.on( "logout" )
def logout( do_logout ):
    """Session logout"""
    if do_logout:
        session.pop( "account" )
        emit( "load_page" , f"http://127.0.0.1:8000/" )


# App Routes
@app.route( "/" )
def index():
    # Set some session data early
    session[ "page" ] = "index"
    

