// Global variables
let skillsSets = {
    required_skills: new Set(),
    preferred_skills: new Set()
};

// Initialize the form
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupProgressIndicator();
});

function initializeForm() {
    setupSkillsTags('required_skills', 'required_skills_tags');
    setupSkillsTags('preferred_skills', 'preferred_skills_tags');
    setupFormValidation();
    
    // Check for demo mode
    if (window.location.search.includes('demo=true')) {
        loadDemoData();
        document.getElementById('demoBanner').style.display = 'block';
    }
}

function setupSkillsTags(inputId, tagsId) {
    const input = document.getElementById(inputId);
    const tagsContainer = document.getElementById(tagsId);

    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill(inputId, tagsId);
        }
    });

    input.addEventListener('blur', function() {
        addSkill(inputId, tagsId);
    });
}

function addSkill(inputId, tagsId) {
    const input = document.getElementById(inputId);
    const tagsContainer = document.getElementById(tagsId);
    const skill = input.value.trim();
    
    if (skill && !skillsSets[inputId].has(skill.toLowerCase())) {
        skillsSets[inputId].add(skill.toLowerCase());
        
        const tag = document.createElement('div');
        tag.className = 'skill-tag';
        tag.innerHTML = `
            ${skill}
            <span class="remove" onclick="removeSkill('${skill}', this, '${inputId}')">&times;</span>
        `;
        tagsContainer.appendChild(tag);
        
        input.value = '';
        updateHiddenSkills(inputId);
    }
}

function removeSkill(skill, element, inputId) {
    skillsSets[inputId].delete(skill.toLowerCase());
    element.parentElement.remove();
    updateHiddenSkills(inputId);
}

function updateHiddenSkills(inputId) {
    const input = document.getElementById(inputId);
    input.setAttribute('data-skills', Array.from(skillsSets[inputId]).join(','));
}

function setupFormValidation() {
    const requiredInputs = document.querySelectorAll('input[required]');
    requiredInputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', validateField);
    });
}

function validateField(event) {
    const field = event.target;
    const isValid = field.value.trim() !== '';
    
    if (isValid) {
        field.style.borderColor = '#27ae60';
        field.style.boxShadow = '0 0 0 3px rgba(39, 174, 96, 0.1)';
    } else {
        field.style.borderColor = '#e74c3c';
        field.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
    }
}

function setupProgressIndicator() {
    const progressBar = document.getElementById('progressIndicator');
    
    window.addEventListener('scroll', function() {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = Math.min(scrollPercent, 100) + '%';
    });
}

function loadDemoData() {
    document.getElementById('job_title').value = 'Senior React Developer';
    document.getElementById('company_name').value = 'TechStartup Inc';
    document.getElementById('location').value = 'San Francisco, CA';
    document.getElementById('salary_range').value = '$120,000 - $150,000';
    document.getElementById('recruiter_name').value = 'Sarah Johnson';
    document.getElementById('recruiter_email').value = 'sarah@recruitment-agency.com';
    document.getElementById('company_keywords').value = 'tech startup, software company, SaaS';
    
    // Add demo skills
    setTimeout(() => {
        const demoSkills = ['React', 'JavaScript', 'Node.js', 'TypeScript'];
        demoSkills.forEach(skill => {
            skillsSets.required_skills.add(skill.toLowerCase());
            const tag = document.createElement('div');
            tag.className = 'skill-tag';
            tag.innerHTML = `${skill} <span class="remove" onclick="removeSkill('${skill}', this, 'required_skills')">&times;</span>`;
            document.getElementById('required_skills_tags').appendChild(tag);
        });
        updateHiddenSkills('required_skills');
    }, 500);
}

// Form submission - THIS IS WHERE YOU PUT YOUR N8N URL
document.getElementById('recruitmentForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const loading = document.getElementById('loading');
    const successMessage = document.getElementById('successMessage');
    
    // Validate required skills
    if (skillsSets.required_skills.size === 0) {
        alert('Please add at least one required skill');
        document.getElementById('required_skills').focus();
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    loading.style.display = 'flex';
    
    // Collect form data
    const formData = new FormData(this);
    const data = {};
    
    // Process regular form fields
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Add skills from tags
    data.required_skills = Array.from(skillsSets.required_skills).join(',');
    data.preferred_skills = Array.from(skillsSets.preferred_skills).join(',');
    
    try {
        // 🔥 REPLACE THIS URL WITH YOUR ACTUAL N8N WEBHOOK URL 🔥
        const webhookUrl = 'https://YOUR_N8N_WEBHOOK_URL_HERE/webhook/recruitment-request';
        
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            loading.style.display = 'none';
            successMessage.style.display = 'block';
            document.getElementById('requestId').textContent = result.request_id;
            
            // Scroll to success message
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            throw new Error(result.message || 'Campaign failed to start');
        }
        
    } catch (error) {
        let errorMessage = 'Error starting recruitment campaign: ';
        
        if (error.message.includes('fetch')) {
            errorMessage += 'Unable to connect to the recruitment system. Please check the webhook URL and try again.';
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
        submitBtn.disabled = false;
        loading.style.display = 'none';
        
        console.error('Campaign submission error:', error);
    }
});

// Add interactive animations
document.querySelectorAll('.form-section').forEach(section => {
    section.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    section.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        document.getElementById('submitBtn').click();
    }
});