// Application Manager JavaScript

class ApplicationManager {
    constructor() {
        this.universities = [];
        this.applications = [];
        this.selectedUniversityId = null;
        this.isModifyMode = false;
        this.init();
    }

    async init() {
        await this.loadUniversities();
        this.loadApplications();
        this.renderUniversityList();
        this.updateStats();
        this.updateUniversityCount();
        this.setupEventListeners();
        
        // Select first university if available
        if (this.applications.length > 0) {
            this.selectedUniversityId = this.applications[0].universityId;
            this.selectUniversity(this.selectedUniversityId);
        } else {
            // Show empty state
            document.getElementById('emptyState').style.display = 'block';
            document.getElementById('universityOverview').style.display = 'none';
        }
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
        // Load applications from universities with onTrack=true
        this.applications = this.universities
            .filter(uni => uni.onTrack === true)
            .map(uni => {
                const tracking = uni.application_tracking || {};
                const requirements = tracking.requirements || {};
                
                // Calculate requirements object from application_tracking data
                const reqObj = {
                    gpa: this.isRequirementCompleted(requirements.academic, 'GPA Requirements'),
                    transcripts: this.isRequirementCompleted(requirements.academic, 'Official Transcripts'),
                    language: this.isRequirementCompleted(requirements.test_scores, 'Language Test'),
                    sat: this.isRequirementCompleted(requirements.test_scores, 'SAT/ACT Scores'),
                    essays: this.isRequirementCompleted(requirements.personal, 'Personal Statement'),
                    recommendations: this.isRequirementCompleted(requirements.personal, 'Recommendation Letters'),
                    cv: this.isRequirementCompleted(requirements.personal, 'CV/Resume'),
                    financial: this.isRequirementCompleted(requirements.financial, 'Financial Documents'),
                    fee: this.isRequirementCompleted(requirements.financial, 'Application Fee')
                };
                
                return {
                    universityId: uni.id,
                    status: tracking.status || 'not-started',
                    progress: tracking.progress || 0,
                    fitScore: tracking.fitScore || 0,
                    requirements: reqObj,
                    application_tracking: tracking, // Keep full tracking data for detailed view
                    notes: '',
                    addedDate: new Date().toISOString()
                };
            });
    }

    isRequirementCompleted(category, requirementName) {
        if (!category || !Array.isArray(category)) return false;
        const req = category.find(r => r.name === requirementName);
        return req && req.status === 'completed';
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
        const listElement = document.getElementById('universityList');
        
        // Show empty state if no applications
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
            if (!university) {
                console.warn(`University with ID ${app.universityId} not found`);
                return;
            }

            const item = document.createElement('div');
            item.className = `university-list-item ${this.selectedUniversityId === app.universityId ? 'active' : ''}`;
            item.dataset.universityId = app.universityId;
            
            // Get logo URL - always render as image if URL exists
            const logoUrl = this.getLogoUrl(university);
            const fallbackEmoji = (!logoUrl && university.logo && !university.logo.startsWith('http') && !university.logo.startsWith('/')) ? university.logo : '🎓';
            
            // Always render as image tag if we have a URL
            let logoHTML = '';
            if (logoUrl) {
                logoHTML = `<img src="${logoUrl}" alt="${university.name}" class="university-logo-img" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="university-logo-fallback" style="display: none;">${fallbackEmoji}</div>`;
            } else {
                // Fallback to emoji div if no logo URL available
                logoHTML = `<div class="university-logo-fallback">${fallbackEmoji}</div>`;
            }
            
            // Get field of study
            const fieldOfStudy = this.getFieldOfStudy(university);
            
            // Get step information
            const stepInfo = this.getStepInfo(app.status);
            
            // Determine color based on fit score (matching search.js)
            let fitColor = '#9ca3af'; // grey for <50
            if (app.fitScore >= 85) {
                fitColor = '#22c55e'; // green for >=85
            } else if (app.fitScore >= 50) {
                fitColor = '#3b82f6'; // blue for 50-84
            }
            
            // Calculate circumference for SVG circle (radius = 20, so circumference = 2 * π * 20 ≈ 125.66)
            const radius = 20;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (app.fitScore / 100) * circumference;
            
            item.innerHTML = `
                <button class="btn-delete-university" data-university-id="${app.universityId}" style="display: none;">🗑️</button>
                <div class="university-list-item-content">
                    <div class="university-list-item-header">
                        <div class="university-list-logo">${logoHTML}</div>
                        <div class="fit-score-wrapper">
                            <div class="fit-ring-container">
                                <svg class="fit-ring" width="44" height="44">
                                    <circle class="fit-ring-bg" cx="22" cy="22" r="${radius}" fill="none" stroke="#e5e7eb" stroke-width="3"/>
                                    <circle class="fit-ring-progress" cx="22" cy="22" r="${radius}" fill="none" stroke="${fitColor}" stroke-width="3" 
                                            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" 
                                            stroke-linecap="round" transform="rotate(-90 22 22)"/>
                                </svg>
                                <span class="fit-ring-text" style="color: ${fitColor}">${app.fitScore}</span>
                            </div>
                            <span class="fit-score-label">Fit score</span>
                        </div>
                    </div>
                    <p class="university-field-of-study">${fieldOfStudy}</p>
                    <p class="university-list-name">${university.name}</p>
                    <div class="university-step-info">
                        <span class="step-label">Step ${stepInfo.step}/8:</span>
                        <span class="step-name">${stepInfo.name}</span>
                    </div>
                </div>
            `;
            
            item.addEventListener('click', (e) => {
                // Don't select if clicking on delete button or in modify mode
                if (!e.target.classList.contains('btn-delete-university') && !this.isModifyMode) {
                    this.selectUniversity(app.universityId);
                }
            });
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
        const application = this.getApplicationByUniversityId(this.selectedUniversityId);
        const university = this.getUniversityById(this.selectedUniversityId);
        
        if (!application || !university) {
            return;
        }

        // Show overview and hide empty state
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('universityOverview').style.display = 'block';
        
        // Render Information Section
        this.renderInformationSection(university, application);
        
        // Render Admission Probability
        this.renderAdmissionProbability(university, application);
        
        // Render Quick Info Cards
        this.renderQuickInfoCards(university);
        
        // Render Application Progress & Requirements
        this.renderApplicationProgress(application);
        
        // Set up interactive elements
        this.setupInteractiveElementsOnly();
    }

    renderInformationSection(university, application) {
        // Field
        const field = this.getFieldOfStudy(university);
        const fieldElement = document.getElementById('uniField');
        if (fieldElement) {
            fieldElement.textContent = field;
        }

        // University Logo
        const logoElement = document.getElementById('uniLogoLarge');
        if (logoElement) {
            const logoUrl = this.getLogoUrl(university);
            if (logoUrl) {
                logoElement.innerHTML = `<img src="${logoUrl}" alt="${university.name}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;">`;
            } else {
                logoElement.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2rem; background: #f3f4f6; border-radius: 8px;">🎓</div>`;
            }
        }

        // University Name
        const nameElement = document.getElementById('uniName');
        if (nameElement) nameElement.textContent = university.name;

        // Location
        const locationElement = document.getElementById('uniLocation');
        if (locationElement) {
            locationElement.textContent = `📍 ${university.city_or_state}, ${university.country}`;
        }

        // Ranking
        const rankingElement = document.getElementById('uniRanking');
        if (rankingElement) {
            rankingElement.textContent = `#${university.global_ranking} Global`;
        }

        // Fit Score
        const fitScoreElement = document.getElementById('uniFitScore');
        if (fitScoreElement) {
            fitScoreElement.textContent = `${application.fitScore}% Fit`;
        }

        // Days to Deadline
        const daysLeft = this.calculateDaysToDeadline(application);
        const daysLeftElement = document.getElementById('daysLeft');
        if (daysLeftElement) {
            if (daysLeft === null) {
                daysLeftElement.textContent = 'N/A';
            } else if (daysLeft < 0) {
                daysLeftElement.textContent = `Overdue ${Math.abs(daysLeft)} days`;
            } else {
                daysLeftElement.textContent = `${daysLeft} days`;
            }
        }

        // Progress
        const progressElement = document.getElementById('progressValue');
        if (progressElement) {
            progressElement.textContent = `${application.progress}%`;
        }

        // Requirements Met
        const requirements = application.application_tracking?.requirements || {};
        const totalReqs = this.countTotalRequirements(requirements);
        const completedReqs = this.countCompletedRequirements(requirements);
        const requirementsMetElement = document.getElementById('requirementsMet');
        if (requirementsMetElement) {
            requirementsMetElement.textContent = `${completedReqs} of ${totalReqs}`;
        }

        // Application Fee (mock data for now)
        const feeElement = document.getElementById('applicationFee');
        if (feeElement) {
            feeElement.textContent = '$50';
        }
    }

    renderQuickInfoCards(university) {
        // Tuition
        const tuitionElement = document.getElementById('infoTuition');
        if (tuitionElement && university.tuition_range) {
            const min = university.tuition_range.min?.toLocaleString() || 'N/A';
            const max = university.tuition_range.max?.toLocaleString() || 'N/A';
            const currency = university.tuition_range.currency || 'USD';
            if (min === max) {
                tuitionElement.textContent = `${currency} ${min}`;
            } else {
                tuitionElement.textContent = `${currency} ${min}-${max}`;
            }
        }

        // Acceptance Rate
        const acceptanceElement = document.getElementById('infoAcceptance');
        if (acceptanceElement && university.acceptance_rate) {
            acceptanceElement.textContent = `${university.acceptance_rate}%`;
        }

        // International Students
        const internationalElement = document.getElementById('infoInternational');
        if (internationalElement && university.international_student_ratio) {
            internationalElement.textContent = `${university.international_student_ratio}%`;
        }

        // Total Students
        const studentsElement = document.getElementById('infoStudents');
        if (studentsElement && university.total_students) {
            studentsElement.textContent = `${university.total_students.toLocaleString()}+`;
        }
    }

    renderAdmissionProbability(university, application) {
        const fitScore = application.fitScore || 0;
        
        // Update score display
        const scoreElement = document.getElementById('admissionScore');
        if (scoreElement) {
            scoreElement.textContent = fitScore;
        }

        // Update circular progress
        const circumference = 2 * Math.PI * 40;
        const offset = circumference - (fitScore / 100) * circumference;
        const scoreFill = document.getElementById('scoreFill');
        if (scoreFill) {
            scoreFill.style.strokeDashoffset = offset;
        }

        // Generate and render factors
        const factors = this.generatePersonalizedFactors(university, fitScore);
        const factorList = document.getElementById('factorList');
        if (factorList) {
            factorList.innerHTML = factors.map(factor => `
                <div class="factor-item">
                    <span class="factor-name">
                        <span class="factor-indicator ${factor.indicator}"></span>
                        ${factor.name}
                    </span>
                    <span class="factor-value">${factor.value}</span>
                </div>
            `).join('');
        }

        // Show Action button if any factor has "Consider" status
        const hasConsider = factors.some(f => f.value === 'Consider' || f.value === 'Action');
        const actionBtn = document.getElementById('admissionActionBtn');
        if (actionBtn) {
            actionBtn.style.display = hasConsider ? 'block' : 'none';
        }
    }

    renderApplicationProgress(application) {
        const stepInfo = this.getStepInfo(application.status);
        
        // Update step number and name
        const stepNumberElement = document.getElementById('currentStepNumber');
        if (stepNumberElement) stepNumberElement.textContent = stepInfo.step;
        
        const stepNameElement = document.getElementById('currentStepName');
        if (stepNameElement) stepNameElement.textContent = stepInfo.name;

        // Update progress percentage
        const progressPercentage = document.getElementById('progressPercentage');
        if (progressPercentage) progressPercentage.textContent = `${application.progress}%`;

        // Update progress bar
        const progressFill = document.getElementById('progressFill');
        if (progressFill) progressFill.style.width = `${application.progress}%`;

        // Render Todo and Completed lists
        const requirements = application.application_tracking?.requirements || {};
        this.renderRequirementsLists(requirements);
    }

    renderRequirementsLists(requirements) {
        const todoList = document.getElementById('todoList');
        const completedList = document.getElementById('completedList');
        const todoCountBadge = document.getElementById('todoCountBadge');
        const completedCountBadge = document.getElementById('completedCountBadge');
        
        if (!todoList || !completedList) return;

        // Collect all requirements
        const allReqs = [];
        Object.keys(requirements).forEach(category => {
            if (Array.isArray(requirements[category])) {
                requirements[category].forEach(req => {
                    allReqs.push({
                        ...req,
                        category: category
                    });
                });
            }
        });

        // Separate into todo and completed
        const todoItems = allReqs.filter(req => req.status === 'pending');
        const completedItems = allReqs.filter(req => req.status === 'completed');

        // Update count badges
        if (todoCountBadge) {
            todoCountBadge.textContent = todoItems.length;
        }
        if (completedCountBadge) {
            completedCountBadge.textContent = completedItems.length;
        }

        // Render Todo list
        if (todoItems.length === 0) {
            todoList.innerHTML = '<div class="empty-list-message">No pending requirements</div>';
        } else {
            todoList.innerHTML = todoItems.map(req => {
                const actionClass = this.getActionButtonClass(req.action);
                return `
                    <div class="requirement-action-item pending">
                        <div class="req-action-left">
                            <div class="req-status-icon">⏳</div>
                            <div class="req-info">
                                <div class="req-name">${req.name}</div>
                                <div class="req-detail">${req.detail || 'Pending'}</div>
                            </div>
                        </div>
                        <button class="btn-action ${actionClass}">${req.action || 'Action'}</button>
                    </div>
                `;
            }).join('');
        }

        // Render Completed list
        if (completedItems.length === 0) {
            completedList.innerHTML = '<div class="empty-list-message">No completed requirements yet</div>';
        } else {
            completedList.innerHTML = completedItems.map(req => {
                const actionClass = this.getActionButtonClass(req.action);
                return `
                    <div class="requirement-action-item completed">
                        <div class="req-action-left">
                            <div class="req-status-icon">✓</div>
                            <div class="req-info">
                                <div class="req-name">${req.name}</div>
                                <div class="req-detail">${req.detail || 'Completed'}</div>
                            </div>
                        </div>
                        <button class="btn-action ${actionClass}">${req.action || 'View'}</button>
                    </div>
                `;
            }).join('');
        }
    }

    getActionButtonClass(action) {
        if (!action) return 'btn-action-view';
        const actionLower = action.toLowerCase();
        if (actionLower.includes('edit')) return 'btn-action-edit';
        if (actionLower.includes('upload')) return 'btn-action-upload';
        if (actionLower.includes('pay')) return 'btn-action-pay';
        return 'btn-action-view';
    }

    countTotalRequirements(requirements) {
        let total = 0;
        Object.keys(requirements).forEach(category => {
            if (Array.isArray(requirements[category])) {
                total += requirements[category].length;
            }
        });
        return total;
    }

    countCompletedRequirements(requirements) {
        let completed = 0;
        Object.keys(requirements).forEach(category => {
            if (Array.isArray(requirements[category])) {
                completed += requirements[category].filter(req => req.status === 'completed').length;
            }
        });
        return completed;
    }

    calculateDaysToDeadline(application) {
        // Check if deadline exists in application_tracking
        const deadline = application.application_tracking?.deadline;
        if (!deadline) {
            // Default to 60 days from now if no deadline set
            const defaultDeadline = new Date();
            defaultDeadline.setDate(defaultDeadline.getDate() + 60);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            defaultDeadline.setHours(0, 0, 0, 0);
            const diffTime = defaultDeadline - today;
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        try {
            const deadlineDate = new Date(deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            deadlineDate.setHours(0, 0, 0, 0);
            const diffTime = deadlineDate - today;
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } catch {
            return null;
        }
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
        return factors.slice(0, 4);
    }

    formatStatus(status) {
        // Convert status value to readable format
        const statusMap = {
            'planning-phase': 'Planning Phase',
            'exploring-programs': 'Exploring Programs',
            'gathering-documents': 'Gathering Documents',
            'submitting-application': 'Submitting Application',
            'application-submitted': 'Application Submitted',
            'interview-scheduled': 'Interview Scheduled',
            'offer-received': 'Offer Received',
            'not-accepted': 'Not Accepted'
        };
        return statusMap[status] || status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    getStepInfo(status) {
        // Map status to step number and name (8 total steps)
        const stepMap = {
            'planning-phase': { step: 1, name: 'Planning Phase' },
            'exploring-programs': { step: 2, name: 'Exploring Programs' },
            'gathering-documents': { step: 3, name: 'Gathering Documents' },
            'submitting-application': { step: 4, name: 'Submitting Application' },
            'application-submitted': { step: 5, name: 'Application Submitted' },
            'interview-scheduled': { step: 6, name: 'Interview Scheduled' },
            'offer-received': { step: 7, name: 'Offer Received' },
            'not-accepted': { step: 8, name: 'Not Accepted' }
        };
        return stepMap[status] || { step: 1, name: 'Planning Phase' };
    }

    getFieldOfStudy(university) {
        // Get field of study - use first notable field or main field
        if (university.notable_fields && university.notable_fields.length > 0) {
            return university.notable_fields[0];
        }
        if (university.main_fields && university.main_fields.length > 0) {
            return university.main_fields[0];
        }
        return 'General Studies';
    }

    getLogoUrl(university) {
        // First priority: Check for local logo file in /icons directory
        if (university.id) {
            return `/icons/${university.id}.jpg`;
        }
        
        // Final fallback
        return null;
    }

    updateStats() {
        const total = this.applications.length;
        const inProgress = this.applications.filter(app => 
            ['exploring-programs', 'gathering-documents', 'submitting-application', 'interview-scheduled'].includes(app.status)
        ).length;
        const completed = this.applications.filter(app => app.status === 'application-submitted').length;

        // Update mobile stats
        const totalAppsEl = document.getElementById('totalApps');
        const inProgressAppsEl = document.getElementById('inProgressApps');
        const completedAppsEl = document.getElementById('completedApps');
        
        if (totalAppsEl) totalAppsEl.textContent = total;
        if (inProgressAppsEl) inProgressAppsEl.textContent = inProgress;
        if (completedAppsEl) completedAppsEl.textContent = completed;
        
        // Update desktop stats
        const totalAppsDesktopEl = document.getElementById('totalAppsDesktop');
        const inProgressAppsDesktopEl = document.getElementById('inProgressAppsDesktop');
        const completedAppsDesktopEl = document.getElementById('completedAppsDesktop');
        
        if (totalAppsDesktopEl) totalAppsDesktopEl.textContent = total;
        if (inProgressAppsDesktopEl) inProgressAppsDesktopEl.textContent = inProgress;
        if (completedAppsDesktopEl) completedAppsDesktopEl.textContent = completed;
    }

    setupEventListeners() {
        // Sidebar toggle for mobile
        const sidebarToggle = document.getElementById('sidebarToggle');
        const dashboardSidebar = document.getElementById('dashboardSidebar');
        
        if (sidebarToggle && dashboardSidebar) {
            // Initialize sidebar as collapsed on mobile
            if (window.innerWidth < 768) {
                dashboardSidebar.classList.add('collapsed');
            }
            
            sidebarToggle.addEventListener('click', () => {
                dashboardSidebar.classList.toggle('collapsed');
                dashboardSidebar.classList.toggle('expanded');
            });
            
            // Handle window resize
            window.addEventListener('resize', () => {
                if (window.innerWidth >= 768) {
                    dashboardSidebar.classList.remove('collapsed', 'expanded');
                } else if (!dashboardSidebar.classList.contains('expanded') && !dashboardSidebar.classList.contains('collapsed')) {
                    dashboardSidebar.classList.add('collapsed');
                }
            });
        }
        
        // Modify button - toggle modify mode
        const modifyBtn = document.getElementById('modifyBtn');
        if (modifyBtn) {
            modifyBtn.addEventListener('click', () => {
                this.toggleModifyMode();
            });
        }

        // Add university card
        const addUniversityCard = document.getElementById('addUniversityCard');
        if (addUniversityCard) {
            addUniversityCard.addEventListener('click', () => {
                window.location.href = 'search.html';
            });
        }

        // Remove university button (in detail view)
        const removeUniversityBtn = document.getElementById('removeUniversityBtn');
        if (removeUniversityBtn) {
            removeUniversityBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to remove this university from your applications?')) {
                    this.removeApplication(this.selectedUniversityId);
                }
            });
        }

        // Admission action button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#admissionActionBtn')) {
                alert('This would open an action page to address the factors that need consideration.');
            }
        });

        // Tab switching
        this.setupTabs();

        // Setup delete button handlers
        this.setupDeleteButtons();

        // Action buttons for requirements
        this.setupActionButtons();
    }

    toggleModifyMode() {
        this.isModifyMode = !this.isModifyMode;
        
        // Update button text
        const modifyBtn = document.getElementById('modifyBtn');
        if (modifyBtn) {
            if (this.isModifyMode) {
                modifyBtn.innerHTML = '<span>✅</span>';
                modifyBtn.classList.add('btn-secondary');
                modifyBtn.classList.remove('btn-primary');
            } else {
                modifyBtn.innerHTML = '<span>✏️</span>';
                modifyBtn.classList.add('btn-primary');
                modifyBtn.classList.remove('btn-secondary');
            }
        }

        // Show/hide Add University card
        const addUniversityCard = document.getElementById('addUniversityCard');
        if (addUniversityCard) {
            addUniversityCard.style.display = this.isModifyMode ? 'block' : 'none';
        }

        // Show/hide delete buttons
        document.querySelectorAll('.btn-delete-university').forEach(btn => {
            btn.style.display = this.isModifyMode ? 'block' : 'none';
        });

        // Disable/enable click on university items when in modify mode
        document.querySelectorAll('.university-list-item').forEach(item => {
            if (this.isModifyMode) {
                item.style.cursor = 'default';
            } else {
                item.style.cursor = 'pointer';
            }
        });
    }

    setupDeleteButtons() {
        // Use event delegation for dynamically added buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-delete-university')) {
                e.stopPropagation(); // Prevent triggering university selection
                const universityId = e.target.dataset.universityId;
                if (confirm(`Are you sure you want to remove this university from your applications?`)) {
                    this.removeApplication(universityId);
                    // Exit modify mode after deletion
                    if (this.isModifyMode) {
                        this.toggleModifyMode();
                    }
                }
            }
        });
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;

                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Add active class to clicked button
                button.classList.add('active');

                // Show corresponding content
                const targetContent = document.getElementById(`tabContent${targetTab.charAt(0).toUpperCase() + targetTab.slice(1)}`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    setupActionButtons() {
        // Use event delegation for dynamically added buttons
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-action');
            if (!btn) return;

            e.preventDefault();
            const reqItem = btn.closest('.requirement-action-item');
            if (!reqItem) return;

            const reqName = reqItem.querySelector('.req-name')?.textContent || 'Requirement';
            
            if (btn.classList.contains('btn-action-view')) {
                alert(`📄 Viewing: ${reqName}\n\nThis would open a document viewer or detail page.`);
            } else if (btn.classList.contains('btn-action-edit')) {
                alert(`✏️ Editing: ${reqName}\n\nThis would open the essay editor or document editor.`);
            } else if (btn.classList.contains('btn-action-upload')) {
                alert(`📤 Upload: ${reqName}\n\nThis would open a file upload dialog.`);
            } else if (btn.classList.contains('btn-action-pay')) {
                alert(`💳 Payment: ${reqName}\n\nThis would redirect to the payment gateway.`);
            }
        });
    }

    removeApplication(universityId) {
        this.applications = this.applications.filter(app => app.universityId !== universityId);
        this.saveApplications();
        
        // Remove from bookmarks too
        const bookmarks = JSON.parse(localStorage.getItem('leaply_bookmarks') || '[]');
        const updatedBookmarks = bookmarks.filter(id => id !== universityId);
        localStorage.setItem('leaply_bookmarks', JSON.stringify(updatedBookmarks));
        
        // Remove the university item from DOM (find the university-list-item, not the button)
        const itemToRemove = document.querySelector(`.university-list-item[data-university-id="${universityId}"]`);
        if (itemToRemove) {
            itemToRemove.remove();
        }
        
        // Update count in header
        this.updateUniversityCount();
        
        // Update selected university if it was the deleted one
        if (this.selectedUniversityId === universityId) {
            this.selectedUniversityId = null;
            // Show empty state if no more universities
            if (this.applications.length === 0) {
                document.getElementById('emptyState').style.display = 'block';
                document.getElementById('universityOverview').style.display = 'none';
            } else {
                // Select the first remaining university
                const firstApp = this.applications[0];
                if (firstApp) {
                    this.selectUniversity(firstApp.universityId);
                }
            }
        }
        
        this.updateStats();
    }

    updateUniversityCount() {
        const count = this.applications.length;
        const header = document.querySelector('.sidebar-header h2');
        if (header) {
            header.textContent = `Target Universities (${count})`;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const appManager = new ApplicationManager();
});
