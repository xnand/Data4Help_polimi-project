function Module(a) {
    var businessName = document.modulo.businessName.value;
    var vat = document.modulo.vat.value;
    var email = document.modulo.email.value;
    var message = document.modulo.message.value;

    var email_reg_exp = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-]{2,})+.)+([a-zA-Z0-9]{2,})+$/;


    if ((businessName == "") || (businessName == "undefined")||(businessName == "Business Name")) {
        alert("All fields are mandatory.");
        document.modulo.businessName.focus();
        return false;
    }

    else if ((vat == "") || (vat == "undefined")||(vat == "VAT")) {
        alert("All fields are mandatory.");
        document.modulo.vat.focus();
        return false;
    }

    else if ((email == "") || (email == "undefined")||(email == "Email")) {
        alert("All fields are mandatory.");
        document.modulo.email.focus();
        return false;
    }

    else if ((message == "") || (message == "undefined")||(message == "Tell us why you want to use our services:")||message == "Write your questions here:") {
        alert("All fields are mandatory.");
        document.modulo.message.focus();
        return false;
    }

    else if (!email_reg_exp.test(email)) {
        alert("Email not valid.");
        document.modulo.email.select();
        return false;
    }

     else {
        alert("Message will now be sent.");
        if(a==0){
            document.modulo.action = "/send";
        }
        else{
            document.modulo.action = "/sendInfo";
        }
        document.modulo.submit();
    }
}
