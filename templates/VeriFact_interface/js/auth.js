(function() {
        var loginModal = document.getElementById('loginModal');
        var signupModal = document.getElementById('signupModal');
        var openLogin = document.getElementById('openLogin');
        var openSignup = document.getElementById('openSignup');
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

        function toJSON(form) {
            var data = new FormData(form);
            var obj = {};
            data.forEach(function(value, key){ obj[key] = value; });
            return obj;
        }

        function handleSubmit(form, url) {
            form.addEventListener('submit', function(e){
                e.preventDefault();
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
                    // Close modal and optionally redirect
                    close(form.closest('.modal'));
                    window.location.href = '/';
                }).catch(function(err){
                    alert(err.message || 'Something went wrong');
                });
            });
        }

        if (loginForm) handleSubmit(loginForm, '/api/login');
        if (signupForm) handleSubmit(signupForm, '/api/signup');
    })();