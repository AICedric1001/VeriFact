(function() {
    var loginModal = document.getElementById('loginModal');
    var signupModal = document.getElementById('signupModal');
    var openLogin = document.getElementById('openLogin');
    var openSignup = document.getElementById('openSignup');

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

    document.querySelectorAll('[data-close]').forEach(function(btn){
        btn.addEventListener('click', function(){ close(btn.closest('.modal')); });
    });

    [loginModal, signupModal].forEach(function(m){
        if (!m) return;
        m.addEventListener('click', function(e){ if (e.target === m) close(m); });
    });
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
