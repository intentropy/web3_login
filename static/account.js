/*
    Connect account and login using web3

    This relies on both web3 and socketio

*/

// Grab connect button
let accessButton = document.getElementById( "connect_account" );
let logoutButton = document.getElementById( "logout_account" );

// Make initial check for web3 wallet
let eth;
if( window.ethereum ){
    eth = window.ethereum;
} else {
    // Force logout if no Eth
    eth = null;
}

if( eth ){
    let account;

    // Eth Events
    eth.on(
        "accountsChanged",
        account_change => {
            checkAccount();
        }
    )


    // Websocket Events
    socket.on( "challenge" , function( challenge ){
        signMessage( challenge , account );
        }
    );

    socket.on( 
        "auth_verified", 
        function( authVerified ){
            if( !authVerified ){
                accessButton.disabled = false;
            } else {
                location.reload()
            }
        }
    );



    // Access Button
    if( accessButton ){
        // Show connect only if eth is available
        //accessButton.setAttribute( "onClick" , "connectAccount()" );
        accessButton.removeEventListener( "click" , logoutAccount );
        accessButton.removeEventListener( "click" , authLogin );
        accessButton.addEventListener( "click" , connectAccount );
        //accessButton.classList.toggle( "connect_account" );
        function connectAccount(){
            accessButton.disabled = true;
            getAccount();
        }
        async function getAccount(){
            await eth.request(
                { method: "eth_requestAccounts" }
            )
            .then( handleAccount )
            .catch( error => accessButton.disabled = false );
        }
        function authLogin(){
            // Auth login after wallet connect
            accessButton.disabled = true;
            socket.emit( "auth_login", account  );
        }
    }


    // Logout Button
    if( logoutButton ){
        //logoutButton.setAttribute( "onClick" , "logoutAccount()" );
        logoutButton.removeEventListener( "click" , connectAccount );
        logoutButton.removeEventListener( "click" , authLogin );
        logoutButton.addEventListener( "click" , logoutAccount );
        function logoutAccount(){
            logout();
        }
    }


    // Handle eth accounts
    async function checkAccount(){
        await eth.request(
            { method: "eth_accounts" }
        )
        .then( handleAccount );
    }

    function handleAccount( accounts ){
        let original_account = account;
        account = accounts[ 0 ];
        if( accessButton ){
            if( account ){
                // Login
                accessButton.disabled = false;
                //accessButton.classList.toggle( "connect_account" );
                //accessButton.setAttribute( "onClick" , "authLogin()" );
                accessButton.removeEventListener( "click" , logoutAccount );
                accessButton.removeEventListener( "click" , connectAccount );
                accessButton.addEventListener( "click" , authLogin );
                accessButton.innerText = "Sign to Log In";
            } else {
                // Connect
                accessButton.disabled = false;
                //accessButton.classList.toggle( "connect_account" );
                //accessButton.setAttribute( "onClick" , "connectAccount()" );
                accessButton.removeEventListener( "click" , logoutAccount );
                accessButton.removeEventListener( "click" , authLogin );
                accessButton.addEventListener( "click" , connectAccount );
                accessButton.innerText = "Connect to Log In";
            }
        } else {
            // Index
            if( account ){
                // Check if account changed
                if( account != original_account ){
                    swapAccounts( account );
                }
            } else {
                // Send logout over socket
                logout()
            }
        }
    }

    function swapAccounts( account ){
        socket.emit( "swap_account" , account );
    }

    function logout(){
        socket.emit( "logout" , true );
    }

    // Cryptographic verification functions
    async function signMessage( message , account ){
        await eth.request( 
            {
                method: "personal_sign",
                params: [
                    message,
                    account,
                ],
            }
        ).then( submitSignedMessage );
    }
    function submitSignedMessage( signed ){
        socket.emit( "verify_signature" , signed );
    }

    checkAccount();

} else {
    // No wallet plugin, disable the button
    if( accessButton ){
        accessButton.className = 'header_panel_content_connect_account_disabled';
    }
}
