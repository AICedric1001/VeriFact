<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VeriFact</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <meta name="color-scheme" content="dark light">
    <link rel="stylesheet" href="css/auth.css">
</head>
<body>
    <div class="screen">
        <header class="brand" aria-label="VeriFact">
            <span class="brand-veri">Veri</span><span class="brand-fact">Fact</span>
        </header>

        <main class="auth-panel" role="main">
            <button class="btn btn-google" type="button">
                <span class="google-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#EA4335" d="M24 9.5c3.64 0 6.9 1.26 9.48 3.72l7.1-7.1C36.86 1.9 30.9 0 24 0 14.62 0 6.44 5.38 2.56 13.2l8.82 6.84C13.52 14.18 18.34 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.1 24.55c0-1.62-.15-3.18-.42-4.68H24v8.86h12.4c-.54 2.94-2.18 5.44-4.66 7.12l7.1 5.48C43.75 37.6 46.1 31.6 46.1 24.55z"/>
                        <path fill="#FBBC05" d="M11.38 28.04c-.52-1.54-.82-3.18-.82-4.89s.3-3.36.84-4.9l-8.84-6.85C.84 14.47 0 19.1 0 23.15c0 4.06.84 8.68 2.56 12.75l8.82-7.86z"/>
                        <path fill="#34A853" d="M24 46.3c6.48 0 11.92-2.14 15.9-5.87l-7.1-5.48c-2.02 1.4-4.62 2.24-8.8 2.24-5.66 0-10.48-4.68-12.62-10.54l-8.82 7.86C6.44 42.62 14.62 46.3 24 46.3z"/>
                    </svg>
                </span>
                <span class="btn-label">Continue with Google</span>
            </button>
            <button class="btn btn-hollow" id="openSignup" type="button">Sign up</button>
            <button class="btn btn-hollow" id="openLogin" type="button">Log in</button>
        </main>

        <footer class="tagline">Let's Confirm</footer>
    </div>

    <!-- Login Modal -->
    <div id="loginModal" class="modal" aria-hidden="true" role="dialog" aria-labelledby="loginTitle">
        <div class="modal-card">
            <div class="modal-header">
                <h3 class="modal-title" id="loginTitle">Log in</h3>
                <button class="modal-close" type="button" aria-label="Close" data-close>×</button>
            </div>
            <form class="form" autocomplete="on">
                <label>
                    <span>Username</span>
                    <input class="input" type="text" name="username" placeholder="Enter username" required>
                </label>
                <label>
                    <span>Password</span>
                    <input class="input" type="password" name="password" placeholder="Enter password" required>
                </label>
                <label class="terms">
                    <input type="checkbox" name="agree_terms" required>
                    <span>I agree to the <a href="#" class="link">Terms and Conditions</a></span>
                </label>
                <div class="form-row left">
                    <a href="#" class="link" id="forgotPassword">Forget password</a>
                </div>
                <button class="btn btn-google" type="submit">Login</button>
            </form>
        </div>
    </div>

    <!-- Sign Up Modal -->
    <div id="signupModal" class="modal" aria-hidden="true" role="dialog" aria-labelledby="signupTitle">
        <div class="modal-card">
            <div class="modal-header">
                <h3 class="modal-title" id="signupTitle">Sign up</h3>
                <button class="modal-close" type="button" aria-label="Close" data-close>×</button>
            </div>
            <form class="form" autocomplete="on">
                <label>
                    <span>Username</span>
                    <input class="input" type="text" name="new_username" placeholder="Choose a username" required>
                </label>
                <label>
                    <span>Password</span>
                    <input class="input" type="password" name="new_password" placeholder="Create a password" required>
                </label>
                <button class="btn btn-google" type="submit">Create account</button>
            </form>
        </div>
    </div>

    <script src="js/auth.js"></script>
</body>
</html>