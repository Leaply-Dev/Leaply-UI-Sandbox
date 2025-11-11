/**
 * Data Service
 * Handles loading and filtering of universities and scholarships data
 */

class DataService {
  constructor() {
    this.universities = [];
    this.scholarships = [];
    this.loaded = false;
  }

  /**
   * Initialize and load all data
   */
  async init() {
    if (this.loaded) return;
    
    try {
      await Promise.all([
        this.loadUniversities(),
        this.loadScholarships()
      ]);
      this.loaded = true;
      console.log('Data service initialized successfully');
    } catch (error) {
      console.error('Error initializing data service:', error);
      throw error;
    }
  }

  /**
   * Load universities from JSON file
   */
  async loadUniversities() {
    try {
      const response = await fetch('/src/data/universities.json');
      if (!response.ok) throw new Error('Failed to load universities');
      const data = await response.json();
      this.universities = data.universities;
      return this.universities;
    } catch (error) {
      console.error('Error loading universities:', error);
      throw error;
    }
  }

  /**
   * Load scholarships from JSON file
   */
  async loadScholarships() {
    try {
      const response = await fetch('/src/data/scholarships.json');
      if (!response.ok) throw new Error('Failed to load scholarships');
      const data = await response.json();
      this.scholarships = data.scholarships;
      return this.scholarships;
    } catch (error) {
      console.error('Error loading scholarships:', error);
      throw error;
    }
  }

  /**
   * Get all universities
   */
  getUniversities() {
    return [...this.universities];
  }

  /**
   * Get all scholarships
   */
  getScholarships() {
    return [...this.scholarships];
  }

  /**
   * Get university by ID
   */
  getUniversityById(id) {
    return this.universities.find(uni => uni.id === id);
  }

  /**
   * Get scholarship by ID
   */
  getScholarshipById(id) {
    return this.scholarships.find(sch => sch.id === id);
  }

  /**
   * Get featured universities
   */
  getFeaturedUniversities(limit = 6) {
    return this.universities
      .filter(uni => uni.featured)
      .slice(0, limit);
  }

  /**
   * Get featured scholarships
   */
  getFeaturedScholarships(limit = 6) {
    return this.scholarships
      .filter(sch => sch.featured)
      .slice(0, limit);
  }

  /**
   * Get random universities
   */
  getRandomUniversities(count = 3) {
    const shuffled = [...this.universities].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Filter universities based on criteria
   */
  filterUniversities(filters = {}) {
    let filtered = [...this.universities];

    // Filter by country
    if (filters.country && filters.country.length > 0) {
      filtered = filtered.filter(uni => 
        filters.country.includes(uni.country)
      );
    }

    // Filter by region
    if (filters.region && filters.region.length > 0) {
      filtered = filtered.filter(uni => 
        filters.region.includes(uni.region)
      );
    }

    // Filter by tuition range
    if (filters.tuitionMin !== undefined || filters.tuitionMax !== undefined) {
      filtered = filtered.filter(uni => {
        // Convert all to USD for comparison (simplified)
        const tuition = uni.tuition_range.max;
        const min = filters.tuitionMin || 0;
        const max = filters.tuitionMax || Infinity;
        return tuition >= min && tuition <= max;
      });
    }

    // Filter by GPA requirement
    if (filters.gpaMin !== undefined) {
      filtered = filtered.filter(uni => 
        uni.required_gpa <= (filters.gpaMin + 0.3) // Allow some flexibility
      );
    }

    // Filter by acceptance rate
    if (filters.acceptanceRateMin !== undefined) {
      filtered = filtered.filter(uni => 
        uni.acceptance_rate >= filters.acceptanceRateMin
      );
    }

    // Filter by ranking
    if (filters.rankingMax !== undefined) {
      filtered = filtered.filter(uni => 
        uni.global_ranking <= filters.rankingMax
      );
    }

    // Filter by field of study
    if (filters.field && filters.field.length > 0) {
      filtered = filtered.filter(uni => 
        uni.main_fields.some(field => 
          filters.field.some(f => 
            field.toLowerCase().includes(f.toLowerCase())
          )
        )
      );
    }

    // Filter by degree level
    if (filters.degreeLevel && filters.degreeLevel.length > 0) {
      filtered = filtered.filter(uni => 
        uni.degree_levels.some(level => 
          filters.degreeLevel.includes(level)
        )
      );
    }

    // Search by name or description
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(uni => 
        uni.name.toLowerCase().includes(searchLower) ||
        uni.description.toLowerCase().includes(searchLower) ||
        uni.city_or_state.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }

  /**
   * Filter scholarships based on criteria
   */
  filterScholarships(filters = {}) {
    let filtered = [...this.scholarships];

    // Filter by country
    if (filters.country && filters.country.length > 0) {
      filtered = filtered.filter(sch => 
        filters.country.includes(sch.country) ||
        sch.country.includes('Multiple')
      );
    }

    // Filter by degree level
    if (filters.degreeLevel && filters.degreeLevel.length > 0) {
      filtered = filtered.filter(sch => 
        sch.degree_levels.some(level => 
          filters.degreeLevel.includes(level)
        )
      );
    }

    // Filter by field of study
    if (filters.field && filters.field.length > 0) {
      filtered = filtered.filter(sch => 
        sch.field_of_study.some(field => 
          filters.field.some(f => 
            field.toLowerCase().includes(f.toLowerCase()) ||
            field === 'All fields'
          )
        )
      );
    }

    // Filter by scholarship type
    if (filters.type) {
      filtered = filtered.filter(sch => 
        sch.amount.type === filters.type
      );
    }

    // Filter by deadline
    if (filters.deadlineAfter) {
      const afterDate = new Date(filters.deadlineAfter);
      filtered = filtered.filter(sch => 
        new Date(sch.deadline) >= afterDate
      );
    }

    // Search by name or provider
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(sch => 
        sch.name.toLowerCase().includes(searchLower) ||
        sch.provider.toLowerCase().includes(searchLower) ||
        sch.description.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }

  /**
   * Sort universities
   */
  sortUniversities(universities, sortBy = 'ranking', order = 'asc') {
    const sorted = [...universities];
    
    sorted.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'ranking':
          compareValue = a.global_ranking - b.global_ranking;
          break;
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'acceptance_rate':
          compareValue = a.acceptance_rate - b.acceptance_rate;
          break;
        case 'tuition':
          compareValue = a.tuition_range.max - b.tuition_range.max;
          break;
        case 'country':
          compareValue = a.country.localeCompare(b.country);
          break;
        default:
          compareValue = 0;
      }
      
      return order === 'asc' ? compareValue : -compareValue;
    });
    
    return sorted;
  }

  /**
   * Calculate fit score between user profile and university
   * Returns percentage and reasoning
   */
  calculateFitScore(userProfile, university) {
    if (!userProfile) {
      return { score: 0, reasons: ['Complete your profile to see fit scores'] };
    }

    let score = 0;
    const reasons = [];
    const weights = {
      gpa: 25,
      budget: 20,
      field: 20,
      location: 15,
      language: 10,
      acceptance: 10
    };

    // GPA Match (25%)
    if (userProfile.gpa) {
      const gpaDiff = userProfile.gpa - university.required_gpa;
      if (gpaDiff >= 0.2) {
        score += weights.gpa;
        reasons.push('Your GPA exceeds requirements');
      } else if (gpaDiff >= 0) {
        score += weights.gpa * 0.8;
        reasons.push('Your GPA meets requirements');
      } else if (gpaDiff >= -0.2) {
        score += weights.gpa * 0.5;
        reasons.push('Your GPA is slightly below requirements');
      }
    }

    // Budget Match (20%)
    if (userProfile.budget) {
      const tuition = university.tuition_range.max;
      if (userProfile.budget >= tuition * 1.5) {
        score += weights.budget;
        reasons.push('Tuition is well within your budget');
      } else if (userProfile.budget >= tuition) {
        score += weights.budget * 0.7;
        reasons.push('Tuition fits your budget');
      } else if (university.scholarships.length > 0) {
        score += weights.budget * 0.5;
        reasons.push('Scholarships available to help with costs');
      }
    }

    // Field of Study Match (20%)
    if (userProfile.intended_major) {
      const matchesField = university.main_fields.some(field => 
        field.toLowerCase().includes(userProfile.intended_major.toLowerCase()) ||
        userProfile.intended_major.toLowerCase().includes(field.toLowerCase())
      );
      if (matchesField) {
        score += weights.field;
        reasons.push('Strong programs in your field of interest');
      }
    }

    // Location Preference Match (15%)
    if (userProfile.preferred_countries && userProfile.preferred_countries.length > 0) {
      if (userProfile.preferred_countries.includes(university.country)) {
        score += weights.location;
        reasons.push('Located in your preferred country');
      }
    } else {
      // If no preference, give partial score
      score += weights.location * 0.5;
    }

    // Language Requirements (10%)
    if (userProfile.english_score) {
      // Simplified check - in real app would parse requirements
      score += weights.language;
      reasons.push('You meet language requirements');
    }

    // Acceptance Rate (10%)
    if (university.acceptance_rate > 20) {
      score += weights.acceptance;
      reasons.push('Reasonable acceptance rate');
    } else if (university.acceptance_rate > 10) {
      score += weights.acceptance * 0.7;
      reasons.push('Competitive but achievable');
    } else {
      score += weights.acceptance * 0.4;
      reasons.push('Highly selective');
    }

    return {
      score: Math.round(score),
      reasons: reasons.slice(0, 3) // Top 3 reasons
    };
  }

  /**
   * Get statistics about the database
   */
  getStatistics() {
    return {
      totalUniversities: this.universities.length,
      totalScholarships: this.scholarships.length,
      countriesCount: new Set(this.universities.map(u => u.country)).size,
      regionsCount: new Set(this.universities.map(u => u.region)).size,
      averageAcceptanceRate: (
        this.universities.reduce((sum, u) => sum + u.acceptance_rate, 0) / 
        this.universities.length
      ).toFixed(1)
    };
  }
}

// Create singleton instance
const dataService = new DataService();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = dataService;
}
