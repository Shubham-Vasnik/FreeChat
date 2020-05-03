


function onConfirmPasswordChange(){
    const passwd = document.querySelector("#passwd");
    const confirmPasswd = document.querySelector("#confirmPasswd");
    const submitBtn = document.querySelector("#submit-btn");
    const passwdError = document.querySelector("#error-box");
    if(passwd.value === confirmPasswd.value){
        submitBtn.disabled=false;
        passwdError.classList.add("password-error");
    }
    else{
        submitBtn.disabled=true;
        passwdError.classList.remove("password-error");
    }
    
}