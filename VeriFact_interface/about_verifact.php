<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VeriFact • Home</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="home.css">
    <style>
/* =========================
   Root Variables
========================= */
:root {
  --bg: #253745;
  --panel: #394e5c;
  --panel-outer: rgba(255,255,255,0.15);
  --text: #e9eef3;
  --muted: rgba(233,238,243,0.8);
  --brand-veri: #e53935;
  --brand-fact: #f9c229;
  --tab-bg: #a0adb3;
  --tab-active: #ffffff;
  --border: rgba(255,255,255,0.22);
}

/* =========================
   Base Styles
========================= */
* { 
  box-sizing: border-box; 
}

html, body { 
  height: 100%; 
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: "Inter", system-ui, -apple-system, Segoe UI, Roboto, Arial;
}

.app { 
  min-height: 100dvh; 
  display: grid; 
  grid-template-rows: auto auto auto 1fr; 
}

/* =========================
   Topbar
========================= */
.topbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 10px 14px;
  background: #11212d;
  height: 11vh;
}

.topbar .left, 
.topbar .right { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  margin-bottom: 30px;
}

.topbar .right { 
  justify-self: end; 
}

.avatar { 
  display: inline-flex; 
  align-items: center; 
  justify-content: center; 
  color: var(--text); 
}

.avatar .fa { 
  font-size: 22px; 
}

.user-name { 
  color: var(--muted); 
  font-weight: 600; 
}

.brand { 
  text-align: center; 
  font-weight: 800; 
}

.brand-veri { color: var(--brand-veri); }
.brand-fact { color: var(--brand-fact); }

.icon-btn {
  background: transparent; 
  border: 0; 
  color: var(--text); 
  cursor: pointer;
  width: 32px; 
  height: 32px; 
  display: inline-flex; 
  align-items: center; 
  justify-content: center;
}

.icon-btn .fa { 
  font-size: 20px; 
}

/* =========================
   Section Header
========================= */
.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px;
    background: #253745;
    border-bottom: 1px solid var(--border);
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 10px;
}

.section-header .title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
}

.section-header .title .fa {
    font-size: 20px;
}

.section-header .actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-right: 15px;
}

@media (max-width: 500px) {
    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        padding: 10px 6px;
    }
    .section-header .actions {
        margin-right: 0;
    }
}


/* =========================
   Media Queries
========================= */
/* Tablet screens (≤ 800px) */
@media (max-width: 800px) {
  .line { width: 220px; }
  body { font-size: 15px; } /* slightly smaller text */
}

/* Large mobile screens (≤ 500px) */
@media (max-width: 500px) {
  .line { width: 180px; }
  body { font-size: 14px; }
  .container { padding: 10px; }
  nav ul { flex-direction: column; align-items: center; }
}

/* Small mobile screens (≤ 350px) */
@media (max-width: 350px) {
  .line { width: 150px; }
  body { font-size: 13px; }
  .container { padding: 5px; }
  h1, h2, h3 { font-size: 90%; } /* shrink headers */
  button { width: 100%; } /* buttons full width */
}

/* Dropdown container */
.dropdown {
  position: relative;
  display: inline-block;
}

/* Dropdown menu */
.dropdown-menu {
  position: absolute;
  top: 110%;
  right: 0;
  background: #1b2b38;
  border-radius: 8px;
  min-width: 200px;
  width: 220px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  display: none;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
}

/* Dropdown menu links */
.dropdown-menu a {
  padding: 10px 14px;
  text-decoration: none;
  color: var(--text);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.2s ease;
}

.dropdown-menu a:hover {
  background: rgba(255,255,255,0.08);
}

.dropdown-menu.show {
  display: flex;
}

/* Divider */
.dropdown-menu .divider {
  height: 1px;
  background: rgba(255,255,255,0.2);
  margin: 6px 0;
}

.dropdown-menu button {
  background: none;
  border: none;
  text-align: left;
  padding: 10px 14px;
  font-size: 14px;
  color: #fffffff2;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.dropdown-menu button:hover {
  background: rgba(255,255,255,0.12);
}

.dropdown.open .dropdown-menu {
  display: flex;
}

.section-header {
    display: flex;
    justify-content: center; /* Center buttons */
    align-items: center;
    position: relative; /* So we can position the back icon */
  }
  
  .back-link {
    position: absolute;
    left: 10px; 
  }
  
  .back-icon {
    font-size: 20px;
    cursor: pointer;
    color: #fffffff2;
    transition: color 0.3s ease;
  }
  
  .back-icon:hover {
    color: #9ba8ab;
  }
  
  .buttons {
    display: flex;
    gap: 10px;
  }
  
  .buttons button {
    display: flex;
    justify-content: center;
    padding: 10px 15px;
    border: none;
    cursor: pointer;
    background-color: #ddd;
    border-radius: 5px;
    font-size: 16px;
  }
  
  .buttons button.active {
    background-color: #9ba8ab;
    color: white;
  }
      

  

    </style>

</head>
<body>
    <div class="app">
        <header class="topbar">
            <div class="left">
                <span class="avatar" aria-hidden="true"><i class="fa fa-user-circle"></i></span>
                <span class="user-name">User Acc.</span>
            </div>
            <div class="brand" aria-label="VeriFact">
                <span class="brand-veri">Veri</span><span class="brand-fact">Fact</span>
            </div>

            <div class="right">
            <div class="dropdown">
                <button class="icon-btn" id="settingsBtn" aria-label="Settings">
                <i class="fa fa-cog"></i>
                </button>
                <div class="dropdown-menu" id="settingsMenu">
                    <a href="about_verifact.html"><i class="fa fa-info-circle"></i> About VeriFact</a>
                    <a href="guide.html"><i class="fa fa-book"></i> Guide</a>
                    <a href="#"><i class="fa fa-comment"></i> Send Feedback</a>
                    <div class="divider"></div>
                    <a href="#"><i class="fa fa-sun"></i> Light Mode</a>
                    <a href="#"><i class="fa fa-moon"></i> Dark Mode</a>
                    <a href="#"><i class="fa fa-adjust"></i> Default Mode</a>
                    <div class="divider"></div>
                    <a href="archive.html"><i class="fa fa-archive"></i>Archive</a>
                    <a href="#" style="color: #e34234;"><i class="fa fa-sign-out" style="color: #e34234;"></i> Sign Out</a>
                    <div class="divider"></div>
                    <a href="#"><i class="fa fa-star"></i> Upgrade to Plus</a>
                    </div>
            </div>
            </div>
        </header>
        <section id="history-content" class="tab-content">
            <section class="section-header">
             <a href="home.html" class="back-link"><i class="fa fa-arrow-left back-icon"></i></a>
              
              <div class="buttons" id="btn">
                <button class="filter-btn" data-filter="all">Overview</button>
                <button class="filter-btn" data-filter="Attraction">Mission-Vision</button>
                <button class="filter-btn" data-filter="restaurant">Privacy</button>
                <button class="filter-btn" data-filter="food">Terms of Use</button>
              </div>
            </section>
          </section>
          
            
            
          </section>

  
        </main>

        <script>

            (function(){
                var items = document.querySelectorAll('.accordion-item');
                items.forEach(function(item){
                    var toggle = item.querySelector('.accordion-toggle');
                    if (!toggle) return;
                    toggle.addEventListener('click', function(){
                        item.classList.toggle('open');
                        var isOpen = item.classList.contains('open');
                        toggle.setAttribute('aria-expanded', isOpen);
                    });
                });
            })();
    
            // Settings dropdown (topbar)
            document.getElementById("settingsBtn").addEventListener("click", function() {
              document.getElementById("settingsMenu").classList.toggle("show");
            });
            window.addEventListener("click", function(e) {
              if (!e.target.closest(".dropdown")) {
                document.getElementById("settingsMenu").classList.remove("show");
              }
            });
    
            document.querySelectorAll(".dropdown .icon-btn").forEach(btn => {
              btn.addEventListener("click", (e) => {
                const parent = btn.closest(".dropdown");
                parent.classList.toggle("open");
                document.querySelectorAll(".dropdown").forEach(d => {
                  if (d !== parent) d.classList.remove("open");
                });
                e.stopPropagation();
              });
            });
            document.addEventListener("click", () => {
              document.querySelectorAll(".dropdown").forEach(d => d.classList.remove("open"));
            });

            document.addEventListener("DOMContentLoaded", function () {
                const buttons = document.querySelectorAll(".filter-btn");
                const items = document.querySelectorAll(".gallery-item li");
                
                function filterItems(filter) {
                    items.forEach(item => {
                        if (filter === "all" || item.classList.contains(filter)) {
                            item.style.display = "block";
                        } else {
                            item.style.display = "none";
                        }
                    });
                }
                
                buttons.forEach(button => {
                    button.addEventListener("click", function () {
                        buttons.forEach(btn => btn.classList.remove("active"));
                        this.classList.add("active");
                        filterItems(this.getAttribute("data-filter"));
                    });
                });
                
                filterItems("all");
            });
            
            
            
            document.addEventListener("DOMContentLoaded", function () {
                const scrollToTopBtn = document.getElementById("scrollToTop");
            
                window.addEventListener("scroll", function () {
                    if (window.scrollY > 300) {
                        scrollToTopBtn.classList.add("show");
                    } else {
                        scrollToTopBtn.classList.remove("show");
                    }
                });
            
                scrollToTopBtn.addEventListener("click", function () {
                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                });
            });



        </script>

        
</body>
</html>