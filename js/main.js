// Leaply - Interactive Features
// Modern JavaScript for smooth user interactions

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileNavigation();
    initSmoothScrolling();
    initSearchFilters();
    initCarousel();
    initAnimations();
    initFormValidation();
    initTabs();
});

// Mobile Navigation
function initMobileNavigation() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
            
            // Update toggle button text
            const isOpen = mobileNav.classList.contains('active');
            mobileToggle.innerHTML = isOpen ? '✕' : '☰';
        });
        
        // Close mobile nav when clicking on links
        const mobileLinks = mobileNav.querySelectorAll('.nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileNav.classList.remove('active');
                mobileToggle.innerHTML = '☰';
            });
        });
    }
}

// Smooth Scrolling for Navigation Links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // If target is a tab panel, activate its tab first
                if (targetElement.getAttribute('role') === 'tabpanel') {
                    const panelId = targetElement.id;
                    const relatedTab = document.querySelector(`[role="tab"][aria-controls="${panelId}"]`);
                    if (relatedTab) {
                        relatedTab.click();
                    }
                }
                const headerOffset = 80;
                const elementPosition = targetElement.offsetTop;
                const offsetPosition = elementPosition - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Search and Filter Functionality
function initSearchFilters() {
    const searchInput = document.querySelector('.search-input input');
    const filterSelects = document.querySelectorAll('.filter-select');
    const searchResults = document.querySelector('.search-results');
    
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch();
            }, 300);
        });
    }
    
    filterSelects.forEach(select => {
        select.addEventListener('change', performSearch);
    });
    
    function performSearch() {
        const query = searchInput ? searchInput.value.toLowerCase() : '';
        const filters = {};
        
        filterSelects.forEach(select => {
            if (select.value) {
                filters[select.name] = select.value;
            }
        });
        
        // Filter cards based on search and filters
        const cards = document.querySelectorAll('.university-card, .scholarship-card');
    let visibleCount = 0;
        
        cards.forEach(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.card-description')?.textContent.toLowerCase() || '';
            const location = card.querySelector('.card-location')?.textContent.toLowerCase() || '';
            
            let shouldShow = true;
            
            // Text search
            if (query && !title.includes(query) && !description.includes(query) && !location.includes(query)) {
                shouldShow = false;
            }
            
            // Filter checks
            Object.keys(filters).forEach(filterKey => {
                const filterValue = filters[filterKey];
                const cardData = card.dataset[filterKey];
                
                if (cardData && cardData !== filterValue) {
                    shouldShow = false;
                }
            });
            
            if (shouldShow) {
                card.style.display = 'block';
                card.classList.add('fade-in-up');
                visibleCount++;
            } else {
                card.style.display = 'none';
                card.classList.remove('fade-in-up');
            }
        });
        
        // Update results count
        if (searchResults) {
            const countElement = searchResults.querySelector('.results-count');
            if (countElement) {
                // Count visible cards in the active panel only
                const activeTab = document.querySelector('[role="tab"][aria-selected="true"]');
                const activePanelId = activeTab ? activeTab.getAttribute('aria-controls') : null;
                if (activePanelId) {
                    const activePanel = document.getElementById(activePanelId);
                    const visibleInPanel = activePanel ? Array.from(activePanel.querySelectorAll('.card')).filter(c => c.style.display !== 'none').length : visibleCount;
                    countElement.textContent = `${visibleInPanel} results found`;
                } else {
                    countElement.textContent = `${visibleCount} results found`;
                }
            }
        }
    }
}

// Testimonials Carousel
function initCarousel() {
    const carousel = document.querySelector('.testimonials-carousel');
    const slides = document.querySelectorAll('.testimonial-slide');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const indicators = document.querySelectorAll('.carousel-indicator');
    
    if (!carousel || slides.length === 0) return;
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        
        currentSlide = index;
    }
    
    function nextSlide() {
        const next = (currentSlide + 1) % totalSlides;
        showSlide(next);
    }
    
    function prevSlide() {
        const prev = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(prev);
    }
    
    // Button listeners
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    
    // Indicator listeners
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => showSlide(index));
    });
    
    // Auto-play
    setInterval(nextSlide, 5000);
    
    // Initialize first slide
    showSlide(0);
}

// Scroll Animations
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe cards and sections
    const animatedElements = document.querySelectorAll('.card, .section-content, .hero-content');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// Form Validation
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                // Clear error state on input
                this.classList.remove('error');
                const errorMsg = this.parentNode.querySelector('.error-message');
                if (errorMsg) {
                    errorMsg.remove();
                }
            });
        });
    });
    
    function validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    function validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        let isValid = true;
        let errorMessage = '';
        
        // Clear previous error
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Required field check
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Email validation
        else if (fieldType === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        // Phone validation
        else if (fieldType === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }
        
        // Show error if invalid
        if (!isValid) {
            field.classList.add('error');
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = errorMessage;
            errorElement.style.color = '#e74c3c';
            errorElement.style.fontSize = '0.875rem';
            errorElement.style.marginTop = '0.25rem';
            field.parentNode.appendChild(errorElement);
        }
        
        return isValid;
    }
}

// Progress Tracker for Student Profile
function updateProgress(completedSteps) {
    const steps = document.querySelectorAll('.progress-step');
    
    steps.forEach((step, index) => {
        step.classList.remove('completed', 'active');
        
        if (index < completedSteps) {
            step.classList.add('completed');
        } else if (index === completedSteps) {
            step.classList.add('active');
        }
    });
}

// University/Scholarship Card Interactions
function initCardInteractions() {
    const cards = document.querySelectorAll('.university-card, .scholarship-card');
    
    cards.forEach(card => {
        // Add bookmark functionality
        const bookmarkBtn = card.querySelector('.bookmark-btn');
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                this.classList.toggle('bookmarked');
                
                // Update icon
                const icon = this.querySelector('.bookmark-icon');
                if (icon) {
                    icon.textContent = this.classList.contains('bookmarked') ? '★' : '☆';
                }
                
                // Show feedback
                showToast(this.classList.contains('bookmarked') ? 'Added to bookmarks' : 'Removed from bookmarks');
            });
        }
        
        // Card click for details
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on bookmark button
            if (e.target.closest('.bookmark-btn')) {
                return;
            }
            
            const cardId = this.dataset.id;
            const cardTitle = this.querySelector('h3')?.textContent || 'this item';
            
            if (cardId) {
                // Show feedback to user
                showToast(`Opening details for ${cardTitle}...`, 'info');
                
                // In a real app, this would navigate to a detail page
                console.log(`View details for ${cardId}`);
                
                // Simulate navigation delay
                setTimeout(() => {
                    showToast(`Details page for ${cardTitle} would open here`, 'info');
                }, 1000);
            } else {
                showToast(`Click to view details for ${cardTitle}`, 'info');
            }
        });
    });
}

// Toast Notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? '#8dc641' : type === 'info' ? '#3bb64b' : '#e74c3c',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        zIndex: '9999',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.backgroundColor = '#ffffff';
            header.style.backdropFilter = 'none';
        }
    }
});

// Initialize card interactions when DOM is ready
document.addEventListener('DOMContentLoaded', initCardInteractions);

// Accessible Tabs for Search Results
function initTabs() {
    const tablist = document.querySelector('[role="tablist"]');
    const tabs = tablist ? tablist.querySelectorAll('[role="tab"]') : [];
    if (!tablist || tabs.length === 0) return;

    const panels = document.querySelectorAll('[role="tabpanel"]');
    const resultsTitle = document.getElementById('results-title') || document.querySelector('.results-header h2');
    const resultsCount = document.querySelector('.results-count');

    function activateTab(tab) {
        tabs.forEach(t => {
            const selected = t === tab;
            t.setAttribute('aria-selected', selected ? 'true' : 'false');
            t.tabIndex = selected ? 0 : -1;
        });

        panels.forEach(panel => {
            const isTarget = panel.id === tab.getAttribute('aria-controls');
            panel.classList.toggle('hidden', !isTarget);
        });

        // Update title and count heuristically
        if (resultsTitle) {
            const isScholarships = tab.id.includes('scholarships');
            resultsTitle.textContent = isScholarships ? 'Scholarships' : 'Universities';
        }

        if (resultsCount) {
            // Count visible cards inside the active panel
            const panelId = tab.getAttribute('aria-controls');
            const activePanel = document.getElementById(panelId);
            const visibleCards = activePanel ? Array.from(activePanel.querySelectorAll('.card')).filter(c => c.style.display !== 'none') : [];
            resultsCount.textContent = `${visibleCards.length} results found`;
        }
    }

    // Click activation
    tabs.forEach(tab => {
        tab.addEventListener('click', () => activateTab(tab));
    });

    // Keyboard navigation
    tablist.addEventListener('keydown', (e) => {
        const currentIndex = Array.from(tabs).findIndex(t => t.getAttribute('aria-selected') === 'true');
        let newIndex = currentIndex;

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                newIndex = (currentIndex + 1) % tabs.length;
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                break;
            case 'Home':
                newIndex = 0;
                break;
            case 'End':
                newIndex = tabs.length - 1;
                break;
            default:
                return;
        }
        e.preventDefault();
        tabs[newIndex].focus();
        activateTab(tabs[newIndex]);
    });

    // Ensure initial state is correct
    const initiallySelected = Array.from(tabs).find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
    activateTab(initiallySelected);
}
