// Search/Explore Page JavaScript

class SearchManager {
    constructor() {
        this.universities = [];
        this.scholarships = [];
        this.filteredUniversities = [];
        this.filteredScholarships = [];
        this.activeTab = 'universities';
        this.filters = {
            search: '',
            country: [],
            ranking: [],
            tuition: [],
            field: [],
            scholarship: false,
            funding: [],
            degree: [],
            schCountry: []
        };
        this.sortBy = 'fit';
        this.bookmarks = this.loadBookmarks();
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.applyFilters();
        this.renderResults();
    }

    async loadData() {
        try {
            await dataService.init();
            this.universities = await dataService.getUniversities();
            this.scholarships = await dataService.getScholarships();
            
            // Calculate fit scores for universities
            this.universities = this.universities.map(uni => ({
                ...uni,
                fitScore: this.calculateFitScore(uni)
            }));
            
            document.getElementById('loadingState').style.display = 'none';
        } catch (error) {
            console.error('Error loading data:', error);
            document.getElementById('loadingState').style.display = 'none';
        }
    }

    calculateFitScore(university) {
        // Simple fit score calculation based on multiple factors
        let score = 70; // Base score
        
        // Adjust based on acceptance rate (higher acceptance = more accessible)
        const acceptanceBonus = university.acceptance_rate > 20 ? 10 : university.acceptance_rate > 10 ? 5 : 0;
        score += acceptanceBonus;
        
        // Adjust based on scholarship availability
        if (university.scholarships && university.scholarships.length > 0) {
            score += 10;
        }
        
        // Adjust based on international student ratio
        if (university.international_student_ratio > 25) {
            score += 5;
        }
        
        // Randomize slightly for demo purposes
        score += Math.floor(Math.random() * 10) - 5;
        
        return Math.min(Math.max(score, 50), 100); // Clamp between 50-100
    }

    loadBookmarks() {
        return JSON.parse(localStorage.getItem('leaply_bookmarks') || '[]');
    }

    saveBookmarks() {
        localStorage.setItem('leaply_bookmarks', JSON.stringify(this.bookmarks));
    }

    toggleBookmark(universityId) {
        const index = this.bookmarks.indexOf(universityId);
        if (index > -1) {
            this.bookmarks.splice(index, 1);
        } else {
            this.bookmarks.push(universityId);
        }
        this.saveBookmarks();
        this.renderResults();
    }

    isBookmarked(universityId) {
        return this.bookmarks.includes(universityId);
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.activeTab = btn.dataset.tab;
                this.updateTabUI();
                this.renderResults();
            });
        });

        // Search input
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        searchBtn.addEventListener('click', () => {
            this.filters.search = searchInput.value;
            this.applyFilters();
            this.renderResults();
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.filters.search = searchInput.value;
                this.applyFilters();
                this.renderResults();
            }
        });

        // Quick filter chips
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const country = chip.dataset.country;
                const field = chip.dataset.field;
                
                if (country) {
                    this.toggleArrayFilter('country', country);
                } else if (field) {
                    this.toggleArrayFilter('field', field);
                }
                
                chip.classList.toggle('active');
                this.updateFilterCheckboxes();
                this.applyFilters();
                this.renderResults();
            });
        });

        // Filter checkboxes
        document.querySelectorAll('.filter-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const name = checkbox.name;
                const value = checkbox.value;
                
                if (name === 'scholarship') {
                    this.filters.scholarship = checkbox.checked;
                } else {
                    this.toggleArrayFilter(name, value);
                }
                
                this.applyFilters();
                this.renderResults();
            });
        });

        // Clear filters
        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Reset search
        document.getElementById('resetSearch').addEventListener('click', () => {
            this.clearFilters();
        });

        // Sort by
        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.applySort();
            this.renderResults();
        });
    }

    toggleArrayFilter(filterName, value) {
        const filterKey = filterName === 'sch-country' ? 'schCountry' : filterName;
        const index = this.filters[filterKey].indexOf(value);
        
        if (index > -1) {
            this.filters[filterKey].splice(index, 1);
        } else {
            this.filters[filterKey].push(value);
        }
    }

    updateFilterCheckboxes() {
        document.querySelectorAll('.filter-checkbox input').forEach(checkbox => {
            const name = checkbox.name;
            const value = checkbox.value;
            const filterKey = name === 'sch-country' ? 'schCountry' : name;
            
            if (name === 'scholarship') {
                checkbox.checked = this.filters.scholarship;
            } else if (this.filters[filterKey]) {
                checkbox.checked = this.filters[filterKey].includes(value);
            }
        });
    }

    clearFilters() {
        this.filters = {
            search: '',
            country: [],
            ranking: [],
            tuition: [],
            field: [],
            scholarship: false,
            funding: [],
            degree: [],
            schCountry: []
        };
        
        document.getElementById('searchInput').value = '';
        document.querySelectorAll('.filter-checkbox input').forEach(cb => cb.checked = false);
        document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
        
        this.applyFilters();
        this.renderResults();
    }

    updateTabUI() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === this.activeTab);
        });
        
        // Show/hide filter containers
        document.getElementById('universityFilters').style.display = 
            this.activeTab === 'universities' ? 'block' : 'none';
        document.getElementById('scholarshipFilters').style.display = 
            this.activeTab === 'scholarships' ? 'block' : 'none';
        
        // Show/hide results
        document.getElementById('universityResults').style.display = 
            this.activeTab === 'universities' ? 'grid' : 'none';
        document.getElementById('scholarshipResults').style.display = 
            this.activeTab === 'scholarships' ? 'grid' : 'none';
        
        // Update title
        document.getElementById('resultsTitle').textContent = 
            this.activeTab === 'universities' ? 'Universities' : 'Scholarships';
    }

    applyFilters() {
        if (this.activeTab === 'universities') {
            this.filteredUniversities = this.universities.filter(uni => {
                // Search filter
                if (this.filters.search) {
                    const searchLower = this.filters.search.toLowerCase();
                    const matchesSearch = 
                        uni.name.toLowerCase().includes(searchLower) ||
                        uni.country.toLowerCase().includes(searchLower) ||
                        uni.main_fields.some(f => f.toLowerCase().includes(searchLower));
                    
                    if (!matchesSearch) return false;
                }
                
                // Country filter
                if (this.filters.country.length > 0) {
                    if (!this.filters.country.includes(uni.country)) return false;
                }
                
                // Ranking filter
                if (this.filters.ranking.length > 0) {
                    const inRange = this.filters.ranking.some(range => {
                        if (range === '1-10') return uni.global_ranking <= 10;
                        if (range === '11-50') return uni.global_ranking >= 11 && uni.global_ranking <= 50;
                        if (range === '51-100') return uni.global_ranking >= 51 && uni.global_ranking <= 100;
                        return false;
                    });
                    if (!inRange) return false;
                }
                
                // Tuition filter (convert to USD for comparison)
                if (this.filters.tuition.length > 0) {
                    const tuitionUSD = this.convertToUSD(uni.tuition_range.min, uni.tuition_range.currency);
                    const inRange = this.filters.tuition.some(range => {
                        if (range === '0-10000') return tuitionUSD < 10000;
                        if (range === '10000-30000') return tuitionUSD >= 10000 && tuitionUSD < 30000;
                        if (range === '30000-50000') return tuitionUSD >= 30000 && tuitionUSD < 50000;
                        if (range === '50000+') return tuitionUSD >= 50000;
                        return false;
                    });
                    if (!inRange) return false;
                }
                
                // Field filter
                if (this.filters.field.length > 0) {
                    const hasField = this.filters.field.some(field => 
                        uni.main_fields.some(f => f.toLowerCase().includes(field.toLowerCase()))
                    );
                    if (!hasField) return false;
                }
                
                // Scholarship filter
                if (this.filters.scholarship) {
                    if (!uni.scholarships || uni.scholarships.length === 0) return false;
                }
                
                return true;
            });
            
            this.applySort();
        } else {
            this.filteredScholarships = this.scholarships.filter(sch => {
                // Search filter
                if (this.filters.search) {
                    const searchLower = this.filters.search.toLowerCase();
                    const matchesSearch = 
                        sch.name.toLowerCase().includes(searchLower) ||
                        sch.provider.toLowerCase().includes(searchLower) ||
                        sch.country.toLowerCase().includes(searchLower);
                    
                    if (!matchesSearch) return false;
                }
                
                // Funding type filter
                if (this.filters.funding.length > 0) {
                    if (!this.filters.funding.includes(sch.amount.type)) return false;
                }
                
                // Degree level filter
                if (this.filters.degree.length > 0) {
                    const hasLevel = this.filters.degree.some(level => 
                        sch.degree_levels.includes(level)
                    );
                    if (!hasLevel) return false;
                }
                
                // Country filter
                if (this.filters.schCountry.length > 0) {
                    if (!this.filters.schCountry.includes(sch.country)) return false;
                }
                
                return true;
            });
        }
    }

    applySort() {
        switch (this.sortBy) {
            case 'fit':
                this.filteredUniversities.sort((a, b) => b.fitScore - a.fitScore);
                break;
            case 'ranking':
                this.filteredUniversities.sort((a, b) => a.global_ranking - b.global_ranking);
                break;
            case 'tuition-low':
                this.filteredUniversities.sort((a, b) => {
                    const aUSD = this.convertToUSD(a.tuition_range.min, a.tuition_range.currency);
                    const bUSD = this.convertToUSD(b.tuition_range.min, b.tuition_range.currency);
                    return aUSD - bUSD;
                });
                break;
            case 'tuition-high':
                this.filteredUniversities.sort((a, b) => {
                    const aUSD = this.convertToUSD(a.tuition_range.max, a.tuition_range.currency);
                    const bUSD = this.convertToUSD(b.tuition_range.max, b.tuition_range.currency);
                    return bUSD - aUSD;
                });
                break;
            case 'acceptance':
                this.filteredUniversities.sort((a, b) => b.acceptance_rate - a.acceptance_rate);
                break;
        }
    }

    convertToUSD(amount, currency) {
        // Simplified conversion rates
        const rates = {
            'USD': 1,
            'GBP': 1.27,
            'EUR': 1.08,
            'CAD': 0.74,
            'AUD': 0.65,
            'SGD': 0.74,
            'CHF': 1.13,
            'JPY': 0.0067,
            'CNY': 0.14,
            'KRW': 0.00075,
            'HKD': 0.13
        };
        
        return amount * (rates[currency] || 1);
    }

    renderResults() {
        // Update counts
        document.getElementById('universityCount').textContent = this.filteredUniversities.length;
        document.getElementById('scholarshipCount').textContent = this.filteredScholarships.length;
        
        if (this.activeTab === 'universities') {
            this.renderUniversities();
        } else {
            this.renderScholarships();
        }
    }

    renderUniversities() {
        const container = document.getElementById('universityResults');
        const emptyState = document.getElementById('emptyState');
        
        if (this.filteredUniversities.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            document.getElementById('resultsCount').textContent = 'No results found';
            return;
        }
        
        emptyState.style.display = 'none';
        document.getElementById('resultsCount').textContent = 
            `Showing ${this.filteredUniversities.length} ${this.filteredUniversities.length === 1 ? 'result' : 'results'}`;
        
        container.innerHTML = this.filteredUniversities.map(uni => {
            const tuitionUSD = this.convertToUSD(uni.tuition_range.min, uni.tuition_range.currency);
            const isBookmarked = this.isBookmarked(uni.id);
            const isAdded = this.isInApplications(uni.id);
            
            return `
                <div class="university-card" data-id="${uni.id}">
                    <div class="card-header-row">
                        <div class="university-logo">${uni.logo || '🎓'}</div>
                        <div class="card-header-info">
                            <h3 class="university-name">${uni.name}</h3>
                            <p class="university-location">📍 ${uni.city_or_state}, ${uni.country}</p>
                        </div>
                        <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
                                data-id="${uni.id}" 
                                onclick="searchManager.toggleBookmark('${uni.id}'); event.stopPropagation();">
                            ${isBookmarked ? '★' : '☆'}
                        </button>
                    </div>
                    
                    <div class="card-badges">
                        <span class="card-badge badge-ranking">#${uni.global_ranking} Global</span>
                        <span class="card-badge badge-fit">${uni.fitScore}% Fit</span>
                    </div>
                    
                    <div class="card-stats">
                        <div class="stat-item">
                            <span class="stat-label">Tuition (approx.)</span>
                            <span class="stat-value">$${Math.round(tuitionUSD).toLocaleString()}/year</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Acceptance Rate</span>
                            <span class="stat-value">${uni.acceptance_rate}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">International Students</span>
                            <span class="stat-value">${uni.international_student_ratio}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Total Students</span>
                            <span class="stat-value">${(uni.total_students / 1000).toFixed(0)}k+</span>
                        </div>
                    </div>
                    
                    <p class="card-description">${uni.description || 'Leading university with excellent academic programs and research opportunities.'}</p>
                    
                    <div class="card-actions">
                        <button class="btn-view-details" onclick="searchManager.viewUniversityDetails('${uni.id}'); event.stopPropagation();">
                            Learn More
                        </button>
                        <button class="btn-add-to-dashboard ${isAdded ? 'added' : ''}" 
                                onclick="searchManager.addToApplications('${uni.id}'); event.stopPropagation();">
                            ${isAdded ? '✓ In My Goals' : 'Strive For It!'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderScholarships() {
        const container = document.getElementById('scholarshipResults');
        const emptyState = document.getElementById('emptyState');
        
        if (this.filteredScholarships.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            document.getElementById('resultsCount').textContent = 'No results found';
            return;
        }
        
        emptyState.style.display = 'none';
        document.getElementById('resultsCount').textContent = 
            `Showing ${this.filteredScholarships.length} ${this.filteredScholarships.length === 1 ? 'result' : 'results'}`;
        
        container.innerHTML = this.filteredScholarships.map(sch => {
            return `
                <div class="scholarship-card" data-id="${sch.id}">
                    <div class="scholarship-header">
                        <h3 class="scholarship-name">${sch.name}</h3>
                        <p class="scholarship-provider">by ${sch.provider}</p>
                    </div>
                    
                    <div class="scholarship-amount">
                        ${sch.amount.type} Funding • ${sch.amount.value}
                    </div>
                    
                    <div class="scholarship-details">
                        <div class="detail-item">
                            <span class="detail-icon">🌍</span>
                            <span>${sch.country}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">🎓</span>
                            <span>${sch.degree_levels.join(', ')}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">📅</span>
                            <span>Deadline: ${new Date(sch.deadline).toLocaleDateString()}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">📚</span>
                            <span>${sch.field_of_study.join(', ')}</span>
                        </div>
                    </div>
                    
                    <p class="scholarship-description">${sch.description}</p>
                    
                    <div class="card-actions">
                        <button class="btn-view-details" onclick="window.open('${sch.website}', '_blank'); event.stopPropagation();">
                            Explore
                        </button>
                        <button class="btn-add-to-dashboard" onclick="searchManager.saveScholarship('${sch.id}'); event.stopPropagation();">
                            Claim Your Future
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    isInApplications(universityId) {
        const applications = JSON.parse(localStorage.getItem('leaply_applications') || '[]');
        return applications.some(app => app.universityId === universityId);
    }

    viewUniversityDetails(universityId) {
        // For now, just show an alert. In a real app, this would navigate to a detail page
        alert(`📚 University Details\n\nThis would open a detailed page for this university with:\n• Complete program information\n• Admission requirements\n• Campus life details\n• Application timeline\n• Contact information`);
    }

    addToApplications(universityId) {
        const applications = JSON.parse(localStorage.getItem('leaply_applications') || '[]');
        
        // Check if already added
        if (applications.some(app => app.universityId === universityId)) {
            alert('✓ This university is already in your goals! Keep pushing forward!');
            return;
        }
        
        // Add to applications
        applications.push({
            universityId: universityId,
            status: 'not-started',
            progress: 0,
            fitScore: this.universities.find(u => u.id === universityId)?.fitScore || 70,
            requirements: {
                gpa: false,
                transcripts: false,
                language: false,
                sat: false,
                essays: false,
                recommendations: false,
                cv: false,
                financial: false,
                fee: false
            },
            notes: '',
            addedDate: new Date().toISOString()
        });
        
        localStorage.setItem('leaply_applications', JSON.stringify(applications));
        
        // Also add to bookmarks
        if (!this.isBookmarked(universityId)) {
            this.toggleBookmark(universityId);
        }
        
        this.renderResults();
        alert('🎯 Amazing! Your dream is now in your dashboard. Let\'s make it happen!');
    }

    saveScholarship(scholarshipId) {
        const savedScholarships = JSON.parse(localStorage.getItem('leaply_saved_scholarships') || '[]');
        
        if (savedScholarships.includes(scholarshipId)) {
            alert('✓ You\'ve already saved this opportunity!');
            return;
        }
        
        savedScholarships.push(scholarshipId);
        localStorage.setItem('leaply_saved_scholarships', JSON.stringify(savedScholarships));
        
        alert('💰 Great choice! This scholarship is now saved in your dashboard!');
    }
}

// Initialize when DOM is ready
let searchManager;
document.addEventListener('DOMContentLoaded', () => {
    searchManager = new SearchManager();
});
