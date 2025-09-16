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