(function() {
    var loginModal = document.getElementById('loginModal');
    var signupModal = document.getElementById('signupModal');
    var termsModal = document.getElementById('termsModal');
    var privacyModal = document.getElementById('privacyModal');
    var openLogin = document.getElementById('openLogin');
    var openSignup = document.getElementById('openSignup');
    var openTerms = document.getElementById('openTerms');
    var openPrivacy = document.getElementById('openPrivacy');
    var openTermsFromSignup = document.getElementById('openTermsFromSignup');
    var openPrivacyFromSignup = document.getElementById('openPrivacyFromSignup');
    var loginForm = loginModal ? loginModal.querySelector('form') : null;
    var signupForm = signupModal ? signupModal.querySelector('form') : null;

    function open(modal) {
        if (!modal) return;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        var first = modal.querySelector('input, button');
        if (first) first.focus();
    }

    function close(modal) {
        if (!modal) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');

        // Reset all input fields
        modal.querySelectorAll('input').forEach(input => {
            input.value = '';
            // Reset password fields
            if (input.type === 'text' && input.classList.contains('password')) {
                input.type = 'password';
            }
        });

        // Reset toggle password icons
        modal.querySelectorAll('.toggle-password').forEach(icon => {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        });
    }

    if (openLogin) openLogin.addEventListener('click', function(){ open(loginModal); });
    if (openSignup) openSignup.addEventListener('click', function(){ open(signupModal); });
    if (openTerms) openTerms.addEventListener('click', function(e){ 
        e.preventDefault(); 
        open(termsModal); 
    });
    if (openPrivacy) openPrivacy.addEventListener('click', function(e){ 
        e.preventDefault(); 
        open(privacyModal); 
    });
    if (openTermsFromSignup) openTermsFromSignup.addEventListener('click', function(e){ 
        e.preventDefault(); 
        open(termsModal); 
    });
    if (openPrivacyFromSignup) openPrivacyFromSignup.addEventListener('click', function(e){ 
        e.preventDefault(); 
        open(privacyModal); 
    });

    document.querySelectorAll('[data-close]').forEach(function(btn){
        btn.addEventListener('click', function(){ close(btn.closest('.modal')); });
    });

    [loginModal, signupModal, termsModal, privacyModal].forEach(function(m){
            if (!m) return;
            m.addEventListener('click', function(e){ if (e.target === m) close(m); });
        });

        function toJSON(form) {
            var data = new FormData(form);
            var obj = {};
            data.forEach(function(value, key){ obj[key] = value; });
            return obj;
        }

        function showCustomNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `custom-notification ${type}`;
        notification.setAttribute('role', 'alert');
        notification.textContent = message;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    function handleSubmit(form, url, isSignup = false) {
        form.addEventListener('submit', function(e){
            e.preventDefault();
            
            // For signup, validate terms checkbox
            if (isSignup) {
                const agreeCheckbox = form.querySelector('input[name="agree_terms"]');
                if (!agreeCheckbox || !agreeCheckbox.checked) {
                    showCustomNotification('You must agree to the Terms and Conditions and Data Privacy Policy to create an account.', 'error');
                    return;
                }
            }
            
            var body = toJSON(form);
            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                credentials: 'same-origin'
            }).then(function(res){
                return res.json().then(function(json){ return { ok: res.ok, json: json }; });
            }).then(function(result){
                if (!result.ok) { throw new Error(result.json && result.json.message || 'Request failed'); }
                // Close modal
                close(form.closest('.modal'));
                
                if (isSignup) {
                    // For signup, show custom success message and open login modal
                    showCustomNotification('Account created successfully! Please sign in with your credentials.');
                    // Open login modal after a short delay
                    setTimeout(() => {
                        if (loginModal) open(loginModal);
                    }, 300);
                } else {
                    // For login, redirect to home interface
                    window.location.href = '/home';
                }
                }).catch(function(err){
                    showCustomNotification(err.message || 'Invalid username or password', 'error');
                });
            });
        }

        if (loginForm) handleSubmit(loginForm, '/api/login', false);
        if (signupForm) handleSubmit(signupForm, '/api/signup', true);
    })();



// Toggle password functionality
document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', () => {
        const input = icon.previousElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        }
    });
});


    window.onload = function () {
    const googleBtn = document.getElementById('googleLogin');

    googleBtn.addEventListener('click', () => {
        google.accounts.id.initialize({
            client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
            callback: handleCredentialResponse
        });
        google.accounts.id.prompt(); // Show the One Tap prompt
    });

    function handleCredentialResponse(response) {
        // response.credential contains the JWT token
        console.log("Encoded JWT ID token: " + response.credential);

        // You can now send this token to your server for verification
        // Example:
        // fetch('/google-login', {
        //     method: 'POST',
        //     headers: {'Content-Type': 'application/json'},
        //     body: JSON.stringify({token: response.credential})
        // });
    }
};

    //Aurora Background
    const canvas = document.getElementById('aurora-bg');
    const ctx = canvas.getContext('2d');

    function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    let t = 0;
    function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(1, '#ff00a2');
    gradient.addColorStop(0.20, '#00eaff');
    gradient.addColorStop(0.25, '#ff6600');
    gradient.addColorStop(0.75, '#9900ff');
    
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.4;

    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 8) {
        let y =
            Math.sin(x * 0.005 + t / 40 + i) * 60 +
            Math.cos(x * 0.008 + t / 50 + i * 20) * 40 +
            canvas.height / 2;
        ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fill();
    }
    t++;
    requestAnimationFrame(animate);
    }
    animate();