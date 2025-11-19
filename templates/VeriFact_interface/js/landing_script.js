// About Section Animations and Interactions

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll enhancement for About link
    const aboutLinks = document.querySelectorAll('a[href="#about"]');
    aboutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                const offset = 80; // Account for fixed navbar
                const elementPosition = aboutSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Simple fade-in animation for About section when scrolled into view
    const aboutSection = document.querySelector('.about');
    if (aboutSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        // Set initial state
        aboutSection.style.opacity = '0';
        aboutSection.style.transform = 'translateY(20px)';
        aboutSection.style.transition = 'all 0.6s ease';
        
        observer.observe(aboutSection);
    }
});

// VeriFact Landing Page JavaScript

// Mobile Menu Toggle
const mobileMenuButton = document.getElementById('mobileMenuButton');
const mobileMenu = document.getElementById('mobileMenu');
const closeMobileMenu = document.getElementById('closeMobileMenu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.add('active');
});

closeMobileMenu.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
});

// Close mobile menu when clicking on links
const mobileMenuLinks = mobileMenu.querySelectorAll('a');
mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
});

// Carousel Functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const totalSlides = slides.length;
const carouselTrack = document.getElementById('carouselTrack');
const indicators = document.querySelectorAll('.carousel-indicator');
const prevButton = document.getElementById('prevSlide');
const nextButton = document.getElementById('nextSlide');

// Handle image loading
function handleImageLoading() {
    const images = document.querySelectorAll('.carousel-slide img');
    
    images.forEach(img => {
        // Handle successful load
        const onLoad = () => {
            img.classList.add('loaded');
            img.classList.remove('loading');
            // Remove skeleton loader
            const skeleton = img.previousElementSibling;
            if (skeleton && skeleton.classList.contains('image-skeleton')) {
                skeleton.style.display = 'none';
            }
        };
        
        // Handle error
        const onError = () => {
            img.classList.add('loaded');
            img.classList.remove('loading');
            // Remove skeleton loader
            const skeleton = img.previousElementSibling;
            if (skeleton && skeleton.classList.contains('image-skeleton')) {
                skeleton.style.display = 'none';
            }
        };
        
        if (img.complete) {
            onLoad();
        } else {
            img.addEventListener('load', onLoad);
            img.addEventListener('error', onError);
        }
    });
}

function updateCarousel() {
    // Update slide position
    carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update indicators
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
        indicator.setAttribute('aria-selected', index === currentSlide);
    });
    
    // Handle image loading for current slide
    const currentSlideElement = slides[currentSlide];
    const currentImage = currentSlideElement.querySelector('img');
    if (currentImage && currentImage.classList.contains('loading')) {
        handleImageLoading();
    }
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
}

// Event listeners for carousel controls
nextButton.addEventListener('click', nextSlide);
prevButton.addEventListener('click', prevSlide);

// Auto-play carousel
let autoPlayInterval = setInterval(nextSlide, 5000);

// Pause auto-play on hover
const carouselContainer = document.querySelector('.carousel-container');
carouselContainer.addEventListener('mouseenter', () => {
    clearInterval(autoPlayInterval);
});

carouselContainer.addEventListener('mouseleave', () => {
    autoPlayInterval = setInterval(nextSlide, 5000);
});

// Indicator clicks
indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
        currentSlide = index;
        updateCarousel();
    });
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        prevSlide();
    } else if (e.key === 'ArrowRight') {
        nextSlide();
    }
});

// Touch support for mobile
let touchStartX = 0;
let touchEndX = 0;

carouselContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

carouselContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            nextSlide(); // Swipe left, go to next
        } else {
            prevSlide(); // Swipe right, go to previous
        }
    }
}

// Initialize image loading
handleImageLoading();

// Demo Section Functionality
const analyzeBtn = document.getElementById('analyzeBtn');
const clearBtn = document.getElementById('clearBtn');
const newsText = document.getElementById('newsText');
const demoResults = document.getElementById('demoResults');

// Demo analysis function
function analyzeNews() {
    const text = newsText.value.trim();
    
    if (!text) {
        alert('Please enter some text to analyze');
        return;
    }
    
    // Show loading state
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    analyzeBtn.disabled = true;
    
    // Show results section
    demoResults.style.display = 'block';
    
    // Simulate analysis with realistic data
    setTimeout(() => {
        performAnalysis(text);
    }, 2000);
}

function performAnalysis(text) {
    // Generate realistic analysis scores based on text characteristics
    const textLength = text.length;
    const hasUrl = text.includes('http') || text.includes('www.');
    const hasQuotes = text.includes('"') || text.includes("'");
    const hasNumbers = /\d/.test(text);
    
    // Calculate credibility score (mock algorithm)
    let credibilityScore = 75; // Base score
    
    // Adjust based on various factors
    if (hasUrl) credibilityScore += Math.random() * 10 - 5; // URLs can be good or bad
    if (hasQuotes) credibilityScore += 5; // Quotes suggest sources
    if (hasNumbers) credibilityScore += 3; // Numbers suggest data
    if (textLength > 500) credibilityScore += 5; // Longer articles often more detailed
    
    credibilityScore = Math.min(95, Math.max(25, credibilityScore));
    
    const accuracy = Math.min(95, Math.max(30, credibilityScore + Math.random() * 10 - 5));
    const reliability = Math.min(95, Math.max(40, credibilityScore + Math.random() * 15 - 7.5));
    const biasScore = Math.max(5, 100 - reliability + Math.random() * 20 - 10);
    
    // Update UI with results
    updateResults(credibilityScore, accuracy, reliability, biasScore, text);
    
    // Reset button
    analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Text';
    analyzeBtn.disabled = false;
    
    // Smooth scroll to results
    demoResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function updateResults(credibility, accuracy, reliability, bias, originalText) {
    // Update main score
    document.getElementById('scoreValue').textContent = Math.round(credibility);
    
    // Update progress bars
    animateProgressBar('accuracyBar', 'accuracyPercent', accuracy);
    animateProgressBar('reliabilityBar', 'reliabilityPercent', reliability);
    animateProgressBar('biasBar', 'biasPercent', bias);
    
    // Update summary
    const summaryText = generateSummary(credibility, originalText);
    document.getElementById('summaryText').textContent = summaryText;
    
    // Update flags
    const flags = generateFlags(credibility, accuracy, reliability, bias);
    const flagsList = document.getElementById('flagsList');
    flagsList.innerHTML = flags.map(flag => `
        <div class="flag-item ${flag.type}">
            <i class="fas ${flag.icon} flag-icon"></i>
            <div>
                <strong>${flag.title}</strong>
                <p>${flag.description}</p>
            </div>
        </div>
    `).join('');
    
    // Update score circle color based on credibility
    const scoreCircle = document.querySelector('.score-circle');
    if (credibility >= 80) {
        scoreCircle.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    } else if (credibility >= 60) {
        scoreCircle.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    } else {
        scoreCircle.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    }
}

function animateProgressBar(barId, percentId, value) {
    const bar = document.getElementById(barId);
    const percent = document.getElementById(percentId);
    
    setTimeout(() => {
        bar.style.width = value + '%';
        percent.textContent = Math.round(value) + '%';
    }, 100);
}

function generateSummary(credibility, text) {
    if (credibility >= 80) {
        return `This article appears to be highly credible with strong factual grounding and reliable sources. The content demonstrates professional journalism standards with minimal bias indicators. Key claims are well-supported by evidence and the information aligns with established facts from multiple independent sources.`;
    } else if (credibility >= 60) {
        return `This article shows moderate credibility with some factual elements but contains potential areas of concern. While certain claims appear substantiated, there are indications of bias or incomplete sourcing. Readers should seek additional verification from independent sources before accepting all claims as fact.`;
    } else {
        return `This article exhibits significant credibility concerns with multiple red flags indicating potential misinformation. The content contains unsubstantiated claims, lacks proper sourcing, and shows clear signs of bias. Extreme caution is advised, and readers should consult established, reputable sources for accurate information on this topic.`;
    }
}

function generateFlags(credibility, accuracy, reliability, bias) {
    const flags = [];
    
    if (accuracy >= 80) {
        flags.push({
            type: 'positive',
            icon: 'fas fa-check-circle',
            title: 'High Factual Accuracy',
            description: 'Claims are well-supported by evidence and align with established facts.'
        });
    } else if (accuracy < 50) {
        flags.push({
            type: 'negative',
            icon: 'fas fa-exclamation-triangle',
            title: 'Questionable Claims',
            description: 'Several claims lack proper evidence or contradict established facts.'
        });
    }
    
    if (reliability >= 75) {
        flags.push({
            type: 'positive',
            icon: 'fas fa-shield-alt',
            title: 'Reliable Sources',
            description: 'Content cites reputable sources and demonstrates proper attribution.'
        });
    } else if (reliability < 60) {
        flags.push({
            type: 'negative',
            icon: 'fas fa-times-circle',
            title: 'Source Issues',
            description: 'Lacks proper citation or relies on questionable/unverified sources.'
        });
    }
    
    if (bias <= 30) {
        flags.push({
            type: 'positive',
            icon: 'fas fa-balance-scale',
            title: 'Balanced Perspective',
            description: 'Content presents multiple viewpoints fairly without obvious bias.'
        });
    } else if (bias > 60) {
        flags.push({
            type: 'negative',
            icon: 'fas fa-exclamation-circle',
            title: 'High Bias Detected',
            description: 'Content shows strong bias toward particular viewpoints or agendas.'
        });
    }
    
    if (credibility >= 80) {
        flags.push({
            type: 'positive',
            icon: 'fas fa-award',
            title: 'Professional Standards',
            description: 'Meets high standards of journalism and factual reporting.'
        });
    }
    
    return flags;
}

function clearDemo() {
    newsText.value = '';
    demoResults.style.display = 'none';
    
    // Reset all values
    document.getElementById('scoreValue').textContent = '--';
    document.getElementById('accuracyBar').style.width = '0%';
    document.getElementById('accuracyPercent').textContent = '--%';
    document.getElementById('reliabilityBar').style.width = '0%';
    document.getElementById('reliabilityPercent').textContent = '--%';
    document.getElementById('biasBar').style.width = '0%';
    document.getElementById('biasPercent').textContent = '--%';
    document.getElementById('summaryText').textContent = 'Analysis in progress...';
    document.getElementById('flagsList').innerHTML = '';
    
    // Reset score circle color
    document.querySelector('.score-circle').style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
}

// Event listeners
analyzeBtn.addEventListener('click', analyzeNews);
clearBtn.addEventListener('click', clearDemo);

// Allow Enter key to analyze (with Shift+Enter for new line)
newsText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        analyzeNews();
    }
});

// Animated Stats Counter
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200; // Lower is faster
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseFloat(counter.getAttribute('data-target'));
                const isDecimal = target % 1 !== 0;
                const increment = target / speed;
                
                const updateCount = () => {
                    const count = parseFloat(counter.innerText);
                    
                    if (count < target) {
                        const newCount = Math.min(count + increment, target);
                        
                        if (isDecimal) {
                            counter.innerText = newCount.toFixed(1);
                        } else if (target >= 1000000) {
                            counter.innerText = (newCount / 1000000).toFixed(1) + 'M+';
                        } else if (target >= 1000) {
                            counter.innerText = (newCount / 1000).toFixed(0) + 'K+';
                        } else {
                            counter.innerText = Math.ceil(newCount);
                        }
                        
                        requestAnimationFrame(updateCount);
                    } else {
                        // Final formatting
                        if (isDecimal) {
                            counter.innerText = target.toFixed(1) + '%';
                        } else if (target >= 1000000) {
                            counter.innerText = (target / 1000000).toFixed(1) + 'M+';
                        } else if (target >= 1000) {
                            counter.innerText = (target / 1000).toFixed(0) + 'K+';
                        } else {
                            counter.innerText = target + (target === 3 ? 's' : '+');
                        }
                    }
                };
                
                updateCount();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// Testimonials Carousel Functionality
let currentTestimonialSlide = 0;
const testimonialSlides = document.querySelectorAll('.testimonial-slide');
const totalTestimonialSlides = testimonialSlides.length;
const testimonialsCarouselTrack = document.getElementById('testimonialsCarouselTrack');
const testimonialsIndicators = document.getElementById('testimonialsCarouselIndicators');

// Initialize testimonials carousel indicators
function initializeTestimonialsCarousel() {
    if (!testimonialsIndicators) return;
    
    testimonialsIndicators.innerHTML = '';
    for (let i = 0; i < totalTestimonialSlides; i++) {
        const indicator = document.createElement('div');
        indicator.className = 'testimonials-carousel-indicator';
        if (i === 0) indicator.classList.add('active');
        indicator.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
        indicator.addEventListener('click', () => goToTestimonialSlide(i));
        testimonialsIndicators.appendChild(indicator);
    }
}

function updateTestimonialsCarousel() {
    if (!testimonialsCarouselTrack) return;
    
    testimonialsCarouselTrack.style.transform = `translateX(-${currentTestimonialSlide * 100}%)`;
    
    // Update indicators
    const indicators = testimonialsIndicators.querySelectorAll('.testimonials-carousel-indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentTestimonialSlide);
    });
}

function moveTestimonialsCarousel(direction) {
    currentTestimonialSlide = (currentTestimonialSlide + direction + totalTestimonialSlides) % totalTestimonialSlides;
    updateTestimonialsCarousel();
}

function goToTestimonialSlide(index) {
    currentTestimonialSlide = index;
    updateTestimonialsCarousel();
}

// Auto-play testimonials carousel
let testimonialsAutoPlayInterval = setInterval(() => moveTestimonialsCarousel(1), 6000);

// Pause auto-play on hover for testimonials
const testimonialsCarouselContainer = document.querySelector('.testimonials-carousel-container');
if (testimonialsCarouselContainer) {
    testimonialsCarouselContainer.addEventListener('mouseenter', () => {
        clearInterval(testimonialsAutoPlayInterval);
    });
    
    testimonialsCarouselContainer.addEventListener('mouseleave', () => {
        testimonialsAutoPlayInterval = setInterval(() => moveTestimonialsCarousel(1), 6000);
    });
}

// Initialize testimonials carousel
document.addEventListener('DOMContentLoaded', () => {
    initializeTestimonialsCarousel();
    updateTestimonialsCarousel();
});

// Scroll functions for action buttons
function scrollToHowVeriFactWorks() {
    const howVeriFactWorksSection = document.getElementById('how-verifact-works');
    if (howVeriFactWorksSection) {
        howVeriFactWorksSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function scrollToTestimonials() {
    const testimonialsSection = document.getElementById('testimonials');
    if (testimonialsSection) {
        testimonialsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function scrollToDemo() {
    const demoSection = document.getElementById('demo');
    if (demoSection) {
        demoSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function scrollToHowItWorks() {
    const howItWorksSection = document.getElementById('how-it-works');
    if (howItWorksSection) {
        howItWorksSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// FAQ Toggle Function
function toggleFAQ(button) {
    const faqItem = button.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Open clicked item if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Initialize counters when page loads
animateCounters();

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navigation
window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (nav) {
        if (window.scrollY > 50) {
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-scrolled');
        }
    }
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            
            // Animate progress bars when they come into view
            if (entry.target.classList.contains('metric-bar-fill')) {
                const width = entry.target.getAttribute('data-width');
                setTimeout(() => {
                    entry.target.style.width = width;
                }, 200);
            }
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        observer.observe(card);
    });
    
    // Observe progress bars
    document.querySelectorAll('.metric-bar-fill').forEach(bar => {
        observer.observe(bar);
    });
    
    // Observe research steps
    document.querySelectorAll('.research-step').forEach(step => {
        observer.observe(step);
    });
    
    // Initialize carousel
    updateCarousel();
    
    // Add keyboard navigation for carousel
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        }
    });
    
    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    if (carouselContainer) {
        carouselContainer.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        carouselContainer.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }
    
    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            nextSlide();
        }
        if (touchEndX > touchStartX + 50) {
            prevSlide();
        }
    }
});

// Demo section functionality
const demoTextarea = document.querySelector('.demo-textarea');
const analyzeButton = document.querySelector('.analyze-button');

if (demoTextarea && analyzeButton) {
    // Character counter
    function updateCharCount() {
        const length = demoTextarea.value.length;
        const maxLength = 5000;
        const charCount = document.getElementById('charCount');
        
        if (charCount) {
            charCount.textContent = `${length}/${maxLength}`;
            if (length > maxLength * 0.9) {
                charCount.classList.add('text-red-400');
            } else {
                charCount.classList.remove('text-red-400');
            }
        }
    }
    
    demoTextarea.addEventListener('input', updateCharCount);
    
    // Analyze button functionality
    analyzeButton.addEventListener('click', function() {
        const text = demoTextarea.value.trim();
        
        if (!text) {
            showNotification('Please enter some text to analyze', 'warning');
            return;
        }
        
        // Show loading state
        analyzeButton.classList.add('loading');
        analyzeButton.disabled = true;
        
        // Simulate analysis (replace with actual API call)
        setTimeout(() => {
            analyzeButton.classList.remove('loading');
            analyzeButton.disabled = false;
            
            // Show results (mock data for demo)
            showAnalysisResults({
                credibility: 85,
                bias: 'low',
                sources: 3,
                confidence: 92
            });
        }, 2000);
    });
}

// Notification system
window.showNotification = function(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300`;
    
    // Set color based on type
    const colors = {
        info: 'bg-blue-600',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        error: 'bg-red-600'
    };
    
    notification.classList.add(colors[type] || colors.info);
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <i class="fas fa-${getIconForType(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function getIconForType(type) {
    const icons = {
        info: 'info-circle',
        success: 'check-circle',
        warning: 'exclamation-triangle',
        error: 'times-circle'
    };
    return icons[type] || icons.info;
}

// Show analysis results (mock function)
function showAnalysisResults(results) {
    const resultsContainer = document.getElementById('analysisResults');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `
        <div class="bg-gray-800 p-6 rounded-2xl mt-6 border border-gray-700">
            <h3 class="text-xl font-bold mb-4">Analysis Results</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center">
                    <div class="text-2xl font-bold text-green-400">${results.credibility}%</div>
                    <div class="text-sm text-gray-400">Credibility</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-blue-400 capitalize">${results.bias}</div>
                    <div class="text-sm text-gray-400">Bias Level</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-purple-400">${results.sources}</div>
                    <div class="text-sm text-gray-400">Sources Found</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-yellow-400">${results.confidence}%</div>
                    <div class="text-sm text-gray-400">Confidence</div>
                </div>
            </div>
            <div class="mt-4 p-3 bg-green-600/20 rounded-lg border border-green-600/50">
                <p class="text-sm text-green-300">
                    <i class="fas fa-check-circle mr-2"></i>
                    This article appears to be credible with low bias indicators.
                </p>
            </div>
        </div>
    `;
    
    // Smooth scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Performance metrics animation
function animateMetrics() {
    const metrics = document.querySelectorAll('.stat-number');
    
    metrics.forEach(metric => {
        const target = parseInt(metric.textContent);
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Handle different formats
            if (metric.textContent.includes('%')) {
                metric.textContent = Math.round(current) + '%';
            } else if (metric.textContent.includes('K+')) {
                metric.textContent = Math.round(current / 1000) + 'K+';
            } else if (metric.textContent.includes('s')) {
                metric.textContent = current.toFixed(1) + 's';
            }
        }, 30);
    });
}

// Trigger metrics animation when in view
const metricsSection = document.querySelector('.stats-grid');
if (metricsSection) {
    const metricsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateMetrics();
                metricsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    metricsObserver.observe(metricsSection);
}

// Form validation for contact section (if added)
function validateForm(form) {
    const email = form.querySelector('input[type="email"]');
    const message = form.querySelector('textarea');
    
    if (email && !email.value.includes('@')) {
        showNotification('Please enter a valid email address', 'error');
        return false;
    }
    
    if (message && message.value.trim().length < 10) {
        showNotification('Message must be at least 10 characters long', 'error');
        return false;
    }
    return true;
}

// Export functions for external use

// Trending Searches Table Functionality
class TrendingSearchesTable {
    constructor() {
        this.categorySelect = document.getElementById('categorySelect');
        this.sortSelect = document.getElementById('sortSelect');
        this.tableBody = document.getElementById('trendingTableBody');
        this.lastUpdatedSpan = document.getElementById('lastUpdated');
        this.totalSearchesSpan = document.getElementById('totalSearches');
        
        this.searchData = [
            { rank: 1, query: "COVID-19 vaccine safety", category: "health", searches: 2300, trend: 12, sparkline: [1800, 1900, 2000, 2100, 2200, 2300], timeFrame: "24h", relevance: 95 },
            { rank: 2, query: "election fraud claims", category: "politics", searches: 1800, trend: 8, sparkline: [1600, 1650, 1700, 1750, 1780, 1800], timeFrame: "24h", relevance: 88 },
            { rank: 3, query: "climate change data", category: "science", searches: 1500, trend: -3, sparkline: [1400, 1450, 1500, 1520, 1540, 1500], timeFrame: "24h", relevance: 92 },
            { rank: 4, query: "AI deepfake videos", category: "technology", searches: 1200, trend: 25, sparkline: [800, 900, 1000, 1100, 1150, 1200], timeFrame: "24h", relevance: 85 },
            { rank: 5, query: "crypto scam alerts", category: "business", searches: 987, trend: -5, sparkline: [900, 950, 1000, 1050, 1020, 987], timeFrame: "24h", relevance: 78 },
            { rank: 6, query: "celebrity death rumors", category: "entertainment", searches: 856, trend: 2, sparkline: [820, 830, 840, 850, 855, 856], timeFrame: "24h", relevance: 72 },
            { rank: 7, query: "inflation statistics 2024", category: "business", searches: 743, trend: 18, sparkline: [600, 650, 700, 720, 730, 743], timeFrame: "24h", relevance: 90 },
            { rank: 8, query: "social media misinformation", category: "technology", searches: 698, trend: -7, sparkline: [650, 670, 690, 700, 710, 698], timeFrame: "24h", relevance: 83 }
        ];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.renderTable();
        this.drawSparklines();
    }
    
    bindEvents() {
        if (this.categorySelect) {
            this.categorySelect.addEventListener('change', () => this.applyFilters());
        }
        
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', () => this.applyFilters());
        }
    }
    
    applyFilters() {
        const selectedCategory = this.categorySelect.value;
        const selectedSort = this.sortSelect.value;
        
        // First filter by category
        let filteredData = selectedCategory === 'all' 
            ? this.searchData 
            : this.searchData.filter(item => item.category === selectedCategory);
        
        // Then sort by selected criteria
        filteredData = this.sortData(filteredData, selectedSort);
        
        // Update ranks after sorting
        filteredData.forEach((item, index) => {
            item.rank = index + 1;
        });
        
        this.renderTable(filteredData);
        this.drawSparklines();
    }
    
    sortData(data, sortBy) {
        const sortedData = [...data];
        
        switch(sortBy) {
            case 'rank':
                return sortedData.sort((a, b) => a.rank - b.rank);
            case 'title':
                return sortedData.sort((a, b) => a.query.localeCompare(b.query));
            case 'volume':
                return sortedData.sort((a, b) => b.searches - a.searches);
            case 'relevance':
                return sortedData.sort((a, b) => b.relevance - a.relevance);
            default:
                return sortedData;
        }
    }
    
    renderTable(data = this.searchData) {
        if (!this.tableBody) return;
        
        this.tableBody.innerHTML = '';
        
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.rank}</td>
                <td class="search-query">"${item.query}"</td>
                <td><span class="category-tag ${item.category}">${this.capitalizeFirst(item.category)}</span></td>
                <td class="search-volume">${this.formatNumber(item.searches)}</td>
                <td class="${item.trend > 0 ? 'trend-up' : 'trend-down'}">
                    <i class="fas fa-arrow-${item.trend > 0 ? 'up' : 'down'}"></i> 
                    ${item.trend > 0 ? '+' : ''}${item.trend}%
                </td>
                <td><canvas class="sparkline" width="100" height="30" data-sparkline='${JSON.stringify(item.sparkline)}'></canvas></td>
            `;
            this.tableBody.appendChild(row);
        });
    }
    
    drawSparklines() {
        const sparklineCanvases = document.querySelectorAll('.sparkline');
        
        sparklineCanvases.forEach(canvas => {
            const data = JSON.parse(canvas.getAttribute('data-sparkline'));
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;
            
            // Clear canvas
            ctx.clearRect(0, 0, width, height);
            
            // Calculate min and max for scaling
            const max = Math.max(...data);
            const min = Math.min(...data);
            const range = max - min || 1;
            
            // Draw the sparkline
            ctx.strokeStyle = '#4f46e5';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            data.forEach((value, index) => {
                const x = (index / (data.length - 1)) * width;
                const y = height - ((value - min) / range) * height * 0.8 - height * 0.1;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            
            // Draw dots at data points
            ctx.fillStyle = '#4f46e5';
            data.forEach((value, index) => {
                const x = (index / (data.length - 1)) * width;
                const y = height - ((value - min) / range) * height * 0.8 - height * 0.1;
                
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, 2 * Math.PI);
                ctx.fill();
            });
        });
    }
    
    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }
    
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize trending searches table when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize existing functionality...
    
    // Initialize trending searches table
    const trendingTable = new TrendingSearchesTable();
    
    // Update "last updated" time every minute
    setInterval(() => {
        const lastUpdatedSpan = document.getElementById('lastUpdated');
        if (lastUpdatedSpan && lastUpdatedSpan.textContent === 'Just now') {
            lastUpdatedSpan.textContent = '1 minute ago';
        } else if (lastUpdatedSpan && lastUpdatedSpan.textContent.includes('minute')) {
            const minutes = parseInt(lastUpdatedSpan.textContent) + 1;
            lastUpdatedSpan.textContent = `${minutes} minutes ago`;
        }
    }, 60000);
});

window.VerifactApp = {
    nextSlide,
    prevSlide,
    goToSlide,
    showNotification,
    validateForm,
    TrendingSearchesTable
};
