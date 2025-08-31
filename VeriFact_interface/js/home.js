 // Send Message
          function sendMessage() {
            const input = document.getElementById("userInput");
            const chatBox = document.getElementById("chatBox");
            const chatInput = document.getElementById("chatInput");

            if (input.value.trim() === "") return;

            // Move chat input to bottom if centered
            chatInput.classList.remove("centered");
            chatInput.classList.add("bottom");

            // User bubble
            const userMsg = document.createElement("div");
            userMsg.className = "user-message";
            userMsg.innerText = input.value;
            chatBox.appendChild(userMsg);

            // Bot accordion bubble - generate 5 bot messages
            for (let i = 1; i <= 5; i++) {
              setTimeout(() => {
                const botMsg = document.createElement("div");
                botMsg.className = "bot-message";
                botMsg.innerHTML = `
                  <div class="accordion-item">
                    <div class="accordion-header">
                      <div class="url-row">
                        <strong>URL:</strong> 
                        <a href="https://example.com/${i}" target="_blank">example.com/${i}</a>
                        <i class="fa fa-check-circle"></i>
                      </div>
                      <button class="accordion-toggle"><i class="fa fa-angle-double-down"></i></button>
                    </div>
                    <div class="accordion-content">
                      <p>This is summary #${i} of the article. It explains whether the information is accurate or misleading.</p>
                    </div>
                  </div>
                `;
                chatBox.appendChild(botMsg);
                chatBox.scrollTop = chatBox.scrollHeight; // auto scroll

                // Enable toggle for this specific accordion
                const toggleBtn = botMsg.querySelector(".accordion-toggle");
                const accordionItem = botMsg.querySelector(".accordion-item");
                toggleBtn.addEventListener("click", () => {
                  accordionItem.classList.toggle("open");
                });

              }, i * 500); // delay each bot message by 0.5 sec
            }

            // Clear input
            input.value = "";
            input.style.height = "auto"; // reset textarea height
          }

          //Accordion Card
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



        // Floating dropdown for More actions
        const floatingDropdown = document.getElementById('floatingDropdown');
        document.querySelectorAll('.more-btn').forEach((btn, idx) => {
            btn.dataset.btnId = idx; // assign unique id if not present
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const dropdown = document.getElementById('floatingDropdown');
                // If already open for this button, close it
                if (dropdown.style.display === 'flex' && dropdown.dataset.currentBtn === btn.dataset.btnId) {
                    dropdown.style.display = 'none';
                    dropdown.dataset.currentBtn = '';
                    return;
                }
                const rect = btn.getBoundingClientRect();

                // Temporarily show dropdown off-screen to measure width
                dropdown.style.visibility = 'hidden';
                dropdown.style.display = 'flex';
                dropdown.style.left = '-9999px';
                dropdown.style.top = '-9999px';

                const dropdownWidth = dropdown.offsetWidth;

                // Now calculate the correct position
                let left = window.scrollX + rect.left;
                let top = window.scrollY + rect.bottom + 4;

                if (left + dropdownWidth > window.innerWidth - 8) {
                    left = window.scrollX + rect.right - dropdownWidth;
                    if (left < 8) left = 8;
                }

                // Set the correct position and show it
                dropdown.style.left = left + 'px';
                dropdown.style.top = top + 'px';
                dropdown.style.visibility = 'visible';
                dropdown.style.display = 'flex';
                dropdown.dataset.currentBtn = btn.dataset.btnId;
            });
        });
        document.addEventListener('click', function(e) {
            if (!floatingDropdown.contains(e.target)) {
                floatingDropdown.style.display = 'none';
            }
        });
        window.addEventListener('scroll', () => {
            floatingDropdown.style.display = 'none';
        });
        window.addEventListener('resize', () => {
            floatingDropdown.style.display = 'none';
        });

        // Tab functionality
        document.querySelectorAll('.tabs .tab').forEach((tab, idx) => {
            tab.addEventListener('click', function() {
                // Remove active from all tabs
                document.querySelectorAll('.tabs .tab').forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                // Set active on clicked tab
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');

                // Show/hide content
                document.getElementById('history-content').style.display = idx === 0 ? '' : 'none';
                document.getElementById('chat-content').style.display = idx === 1 ? '' : 'none';
            });
        });



        //textarea
        const textarea = document.querySelector('.chat-input textarea');
          textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
          });

          const sendBtn = document.querySelector(".chat-input .send-btn");
          const chatInput = document.querySelector(".chat-input");

          // Start with centered
          chatInput.classList.add("centered");

          sendBtn.addEventListener("click", () => {
            const message = textarea.value.trim();
            if (message !== "") {
              // Here you would normally append the message to the chat
              
              // Move chat input to bottom
              chatInput.classList.remove("centered");
              chatInput.classList.add("bottom");

              // Clear textbox
              textarea.value = "";
            }
          });



          //Accuracy 
          function updateAccuracy(truePercent, falsePercent) {
            document.querySelector('.accuracy-bar .true').style.width = truePercent + "%";
            document.querySelector('.accuracy-bar .false').style.width = falsePercent + "%";
            document.querySelector('.accuracy-bar .true-label').textContent = truePercent + "%";
            document.querySelector('.accuracy-bar .false-label').textContent = falsePercent + "%";
          }
          
          