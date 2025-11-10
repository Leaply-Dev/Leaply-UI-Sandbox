// Application Manager JavaScript

class ApplicationManager {
    constructor() {
        this.universities = [];
        this.applications = this.loadApplications();
        this.selectedUniversityId = null;
        this.init();
    }

    async init() {
        await this.loadUniversities();
        this.renderUniversityList();
        this.updateStats();
        this.setupEventListeners();
        
        // Don't call selectUniversity - let HTML content stay as-is
        // Just set up interactive elements for the default visible NUS
        this.selectedUniversityId = 'nus';
        this.setupInteractiveElementsOnly();
    }

    async loadUniversities() {
        try {
            await dataService.init();
            this.universities = await dataService.getUniversities();
        } catch (error) {
            console.error('Error loading universities:', error);
        }
    }

    loadApplications() {
        // Mock demo data for demonstration
        return [
            {
                universityId: 'nus',
                status: 'in-progress',
                progress: 56,
                fitScore: 85,
                requirements: {
                    gpa: true,
                    transcripts: true,
                    language: true,
                    sat: false,
                    essays: true,
                    recommendations: true,
                    cv: false,
                    financial: false,
                    fee: false
                },
                notes: 'Strong match for Computer Science program',
                addedDate: '2024-10-15T10:00:00Z'
            },
            {
                universityId: 'mit',
                status: 'researching',
                progress: 22,
                fitScore: 72,
                requirements: {
                    gpa: true,
                    transcripts: false,
                    language: true,
                    sat: false,
                    essays: false,
                    recommendations: false,
                    cv: false,
                    financial: false,
                    fee: false
                },
                notes: 'Dream school - highly competitive',
                addedDate: '2024-10-20T14:30:00Z'
            },
            {
                universityId: 'stanford',
                status: 'preparing',
                progress: 33,
                fitScore: 78,
                requirements: {
                    gpa: true,
                    transcripts: true,
                    language: true,
                    sat: false,
                    essays: false,
                    recommendations: false,
                    cv: false,
                    financial: false,
                    fee: false
                },
                notes: 'Great for entrepreneurship focus',
                addedDate: '2024-10-18T09:15:00Z'
            },
            {
                universityId: 'toronto',
                status: 'submitted',
                progress: 100,
                fitScore: 88,
                requirements: {
                    gpa: true,
                    transcripts: true,
                    language: true,
                    sat: true,
                    essays: true,
                    recommendations: true,
                    cv: true,
                    financial: true,
                    fee: true
                },
                notes: 'Application completed and submitted',
                addedDate: '2024-09-05T11:00:00Z'
            },
            {
                universityId: 'melbourne',
                status: 'not-started',
                progress: 0,
                fitScore: 81,
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
                notes: 'Good backup option',
                addedDate: '2024-11-01T16:45:00Z'
            }
        ];
    }

    saveApplications() {
        localStorage.setItem('leaply_applications', JSON.stringify(this.applications));
    }

    getUniversityById(id) {
        return this.universities.find(uni => uni.id === id);
    }

    getApplicationByUniversityId(id) {
        return this.applications.find(app => app.universityId === id);
    }

    renderUniversityList() {
        // Don't re-render if we already have demo HTML content
        const listElement = document.getElementById('universityList');
        const hasExistingContent = listElement.querySelector('.university-list-item');
        
        if (hasExistingContent) {
            // Just set up click handlers for existing items
            document.querySelectorAll('.university-list-item').forEach(item => {
                item.addEventListener('click', () => {
                    const universityId = item.dataset.universityId;
                    this.selectUniversity(universityId);
                });
            });
            return;
        }
        
        // Only render dynamically if no content exists
        if (this.applications.length === 0) {
            listElement.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎓</div>
                    <p>No universities added yet</p>
                    <p class="text-muted">Start by adding universities from the Explore page</p>
                </div>
            `;
            return;
        }

        listElement.innerHTML = '';
        
        this.applications.forEach(app => {
            const university = this.getUniversityById(app.universityId);
            if (!university) return;

            const item = document.createElement('div');
            item.className = `university-list-item ${this.selectedUniversityId === app.universityId ? 'active' : ''}`;
            item.dataset.universityId = app.universityId;
            
            item.innerHTML = `
                <div class="university-list-item-header">
                    <div class="university-list-logo">${university.logo}</div>
                    <div class="university-list-info">
                        <p class="university-list-name">${university.name}</p>
                        <p class="university-list-location">${university.city}, ${university.country}</p>
                    </div>
                </div>
                <div class="university-list-footer">
                    <span class="application-status-badge status-${app.status}">${app.status.replace('-', ' ')}</span>
                    <span class="fit-score-mini">${app.fitScore}% fit</span>
                </div>
                <div class="progress-mini" style="margin-top: 0.5rem;">
                    <div class="progress-mini-fill" style="width: ${app.progress}%"></div>
                </div>
            `;
            
            item.addEventListener('click', () => this.selectUniversity(app.universityId));
            listElement.appendChild(item);
        });
    }

    selectUniversity(universityId) {
        this.selectedUniversityId = universityId;
        
        // Update active state in list
        document.querySelectorAll('.university-list-item').forEach(item => {
            if (item.dataset.universityId === universityId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        this.renderUniversityDetail();
    }

    renderUniversityDetail() {
        // DO NOT render content - HTML already has demo content
        // This method now only handles updating active states
        const application = this.getApplicationByUniversityId(this.selectedUniversityId);
        
        if (!application) {
            return;
        }

        // Just ensure overview is visible and empty state is hidden
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('universityOverview').style.display = 'block';
        
        // Set up interactive elements only (checkboxes, dropdowns)
        this.setupInteractiveElementsOnly();
    }

    setupInteractiveElementsOnly() {
        // Only set up interactive elements without modifying content
        const application = this.getApplicationByUniversityId(this.selectedUniversityId);
        if (!application) return;

        // Set up status selector
        const statusSelect = document.getElementById('applicationStatus');
        if (statusSelect) {
            statusSelect.value = application.status;
            statusSelect.onchange = (e) => this.updateApplicationStatus(e.target.value);
        }

        // Set up requirements checkboxes
        document.querySelectorAll('.req-check').forEach(checkbox => {
            const reqKey = checkbox.dataset.req;
            checkbox.checked = application.requirements[reqKey] || false;
            
            checkbox.onchange = () => {
                application.requirements[reqKey] = checkbox.checked;
                this.updateProgress(application);
                this.renderUniversityList();
            };
        });
    }

    updateProgress(application) {
        // Update progress in sidebar only - don't touch main content
        const totalReqs = Object.keys(application.requirements).length;
        const completedReqs = Object.values(application.requirements).filter(v => v).length;
        const progress = Math.round((completedReqs / totalReqs) * 100);
        
        application.progress = progress;
        this.saveApplications();

        // Don't update main content - HTML has demo data
        // Only update if elements exist and we want to sync them
        // For now, leave the HTML demo values as-is
    }

    updateRequirements(university, application) {
        // Don't update requirement values - HTML has demo data
        // Only set up checkbox handlers
        document.querySelectorAll('.req-check').forEach(checkbox => {
            const reqKey = checkbox.dataset.req;
            checkbox.checked = application.requirements[reqKey] || false;
            
            checkbox.onchange = () => {
                application.requirements[reqKey] = checkbox.checked;
                this.updateProgress(application);
                this.renderUniversityList();
            };
        });
    }

    updateApplicationStatus(status) {
        const application = this.getApplicationByUniversityId(this.selectedUniversityId);
        if (application) {
            application.status = status;
            this.saveApplications();
            this.renderUniversityList();
            this.updateStats();
        }
    }

    calculateFitScore(university) {
        // Simple fit score calculation (can be enhanced)
        const userGPA = 3.5; // Default - would come from user profile
        const gpaMatch = userGPA >= university.required_gpa ? 100 : (userGPA / university.required_gpa) * 100;
        
        // Factor in acceptance rate (higher acceptance = higher fit)
        const acceptanceScore = parseFloat(university.acceptance_rate);
        
        return Math.round((gpaMatch * 0.6) + (acceptanceScore * 0.4));
    }

    updateAdmissionScore(university, fitScore) {
        // DISABLED - HTML has demo content with school-specific summary
        // Don't overwrite the personalized factors in HTML
        return;
        
        /* Original code commented out to preserve HTML demo content
        const score = fitScore || this.calculateFitScore(university);
        document.getElementById('admissionScore').textContent = score;

        // Update circular progress
        const circumference = 2 * Math.PI * 40;
        const offset = circumference - (score / 100) * circumference;
        document.getElementById('scoreFill').style.strokeDashoffset = offset;

        // Generate realistic, personalized factors based on university
        const factorsHTML = this.generatePersonalizedFactors(university, score);
        document.getElementById('factorList').innerHTML = factorsHTML;
        */
    }

    generatePersonalizedFactors(university, score) {
        // Mock student profile data
        const studentProfile = {
            gpa: 3.8,
            englishTest: 'IELTS 7.5',
            hasResearch: false,
            hasInternship: true,
            extracurriculars: 'Strong',
            volunteerWork: true
        };

        const factors = [];

        // GPA factor
        if (studentProfile.gpa >= university.required_gpa) {
            factors.push({
                indicator: 'positive',
                name: `Your GPA (${studentProfile.gpa}) exceeds requirement (${university.required_gpa})`,
                value: '✓'
            });
        } else {
            factors.push({
                indicator: 'negative',
                name: `Your GPA (${studentProfile.gpa}) below requirement (${university.required_gpa})`,
                value: '✗'
            });
        }

        // English proficiency
        factors.push({
            indicator: 'positive',
            name: `${studentProfile.englishTest} meets English requirement`,
            value: '✓'
        });

        // Work/Internship experience
        if (studentProfile.hasInternship) {
            factors.push({
                indicator: 'positive',
                name: 'Relevant internship experience',
                value: 'Good'
            });
        }

        // Research experience (important for top universities)
        if (university.global_ranking <= 20) {
            if (studentProfile.hasResearch) {
                factors.push({
                    indicator: 'positive',
                    name: 'Research publications strengthen application',
                    value: 'Strong'
                });
            } else {
                factors.push({
                    indicator: 'neutral',
                    name: 'No research experience (recommended for top schools)',
                    value: 'Consider'
                });
            }
        }

        // Extracurriculars
        if (studentProfile.extracurriculars === 'Strong') {
            factors.push({
                indicator: 'positive',
                name: 'Strong leadership & extracurricular activities',
                value: 'Good'
            });
        }

        // Financial readiness
        factors.push({
            indicator: 'neutral',
            name: 'Scholarship applications recommended',
            value: 'Action'
        });

        // Return only first 4-5 factors
        return factors.slice(0, 4).map(factor => `
            <div class="factor-item">
                <span class="factor-name">
                    <span class="factor-indicator ${factor.indicator}"></span>
                    ${factor.name}
                </span>
                <span class="factor-value">${factor.value}</span>
            </div>
        `).join('');
    }

    updateStats() {
        const total = this.applications.length;
        const inProgress = this.applications.filter(app => 
            ['researching', 'preparing', 'in-progress', 'interview'].includes(app.status)
        ).length;
        const completed = this.applications.filter(app => app.status === 'submitted').length;

        document.getElementById('totalApps').textContent = total;
        document.getElementById('inProgressApps').textContent = inProgress;
        document.getElementById('completedApps').textContent = completed;
    }

    setupEventListeners() {
        // Add university button
        document.getElementById('addUniversityBtn').addEventListener('click', () => {
            window.location.href = 'search.html';
        });

        // Remove university button
        document.getElementById('removeUniversityBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to remove this university from your applications?')) {
                this.removeApplication(this.selectedUniversityId);
            }
        });

        // Action buttons for requirements
        this.setupActionButtons();
    }

    setupActionButtons() {
        // View buttons
        document.querySelectorAll('.btn-action-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const reqName = btn.closest('.requirement-action-item').querySelector('.req-name').textContent;
                alert(`📄 Viewing: ${reqName}\n\nThis would open a document viewer or detail page.`);
            });
        });

        // Edit buttons
        document.querySelectorAll('.btn-action-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const reqName = btn.closest('.requirement-action-item').querySelector('.req-name').textContent;
                alert(`✏️ Editing: ${reqName}\n\nThis would open the essay editor or document editor.`);
            });
        });

        // Upload buttons
        document.querySelectorAll('.btn-action-upload').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const reqName = btn.closest('.requirement-action-item').querySelector('.req-name').textContent;
                alert(`📤 Upload: ${reqName}\n\nThis would open a file upload dialog.`);
            });
        });

        // Pay Now button
        document.querySelectorAll('.btn-action-pay').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const reqName = btn.closest('.requirement-action-item').querySelector('.req-name').textContent;
                alert(`💳 Payment: ${reqName}\n\nThis would redirect to the payment gateway.`);
            });
        });
    }

    removeApplication(universityId) {
        this.applications = this.applications.filter(app => app.universityId !== universityId);
        this.saveApplications();
        
        // Remove from bookmarks too
        const bookmarks = JSON.parse(localStorage.getItem('leaply_bookmarks') || '[]');
        const updatedBookmarks = bookmarks.filter(id => id !== universityId);
        localStorage.setItem('leaply_bookmarks', JSON.stringify(updatedBookmarks));
        
        this.selectedUniversityId = null;
        this.renderUniversityList();
        this.updateStats();
        
        // Show empty state
        document.getElementById('emptyState').style.display = 'block';
        document.getElementById('universityOverview').style.display = 'none';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const appManager = new ApplicationManager();
});
