// User data storage
let userData = {
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    jobTitle: '',
    completionDate: '',
    certificateId: ''
};

let currentModule = 1;
const totalModules = 6;

// Generate unique certificate ID
function generateCertificateId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `CTA-${timestamp}-${random}`;
}

// Format date
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
}

// Registration Form Handler
document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Store user data
    userData.fullName = document.getElementById('fullName').value;
    userData.email = document.getElementById('email').value;
    userData.phone = document.getElementById('phone').value;
    userData.organization = document.getElementById('organization').value;
    userData.jobTitle = document.getElementById('jobTitle').value;
    
    // Hide registration, show course content
    document.getElementById('registration').classList.add('hidden');
    document.getElementById('courseContent').classList.remove('hidden');
    
    // Initialize course
    updateProgress();
    showModule(1);
});

// Update progress bar
function updateProgress() {
    const progress = (currentModule / totalModules) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('currentModule').textContent = currentModule;
    document.getElementById('totalModules').textContent = totalModules;
}

// Show specific module
function showModule(moduleNumber) {
    // Hide all modules
    const modules = document.querySelectorAll('.module');
    modules.forEach(module => {
        module.classList.add('hidden');
    });
    
    // Show current module
    const currentModuleElement = document.querySelector(`[data-module="${moduleNumber}"]`);
    if (currentModuleElement) {
        currentModuleElement.classList.remove('hidden');
    }
    
    // Update button states
    document.getElementById('prevModule').disabled = (moduleNumber === 1);
    
    // Change next button text on last module
    const nextButton = document.getElementById('nextModule');
    if (moduleNumber === totalModules) {
        nextButton.textContent = 'Proceed to Assessment';
    } else {
        nextButton.textContent = 'Next Module';
    }
}

// Previous Module Button
document.getElementById('prevModule').addEventListener('click', function() {
    if (currentModule > 1) {
        currentModule--;
        updateProgress();
        showModule(currentModule);
        window.scrollTo(0, 0);
    }
});

// Next Module Button
document.getElementById('nextModule').addEventListener('click', function() {
    if (currentModule < totalModules) {
        currentModule++;
        updateProgress();
        showModule(currentModule);
        window.scrollTo(0, 0);
    } else {
        // Proceed to exam
        document.getElementById('courseContent').classList.add('hidden');
        document.getElementById('examSection').classList.remove('hidden');
        window.scrollTo(0, 0);
    }
});

// Exam Form Handler
document.getElementById('examForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Correct answers
    const correctAnswers = {
        q1: 'c',
        q2: 'b',
        q3: 'c',
        q4: 'b',
        q5: 'd',
        q6: 'b',
        q7: 'b',
        q8: 'c',
        q9: 'c',
        q10: 'b'
    };
    
    // Calculate score
    let score = 0;
    const totalQuestions = Object.keys(correctAnswers).length;
    
    for (let question in correctAnswers) {
        const selectedAnswer = document.querySelector(`input[name="${question}"]:checked`);
        if (selectedAnswer && selectedAnswer.value === correctAnswers[question]) {
            score++;
        }
    }
    
    const percentage = (score / totalQuestions) * 100;
    
    // Check if passed (80% or higher)
    if (percentage >= 80) {
        // Generate certificate data
        userData.completionDate = formatDate(new Date());
        userData.certificateId = generateCertificateId();
        
        // Show certificate
        displayCertificate();
        document.getElementById('examSection').classList.add('hidden');
        document.getElementById('certificateSection').classList.remove('hidden');
        window.scrollTo(0, 0);
    } else {
        alert(`You scored ${score} out of ${totalQuestions} (${percentage.toFixed(0)}%). You need 80% to pass. Please review the course material and try again.`);
        
        // Reset exam
        document.getElementById('examForm').reset();
        
        // Go back to course content
        document.getElementById('examSection').classList.add('hidden');
        document.getElementById('courseContent').classList.remove('hidden');
        currentModule = 1;
        updateProgress();
        showModule(1);
        window.scrollTo(0, 0);
    }
});

// Display Certificate
function displayCertificate() {
    document.getElementById('certName').textContent = userData.fullName;
    document.getElementById('certDate').textContent = userData.completionDate;
    document.getElementById('certId').textContent = userData.certificateId;
}

// Download Certificate as PDF using html2canvas and jsPDF
document.getElementById('downloadCert').addEventListener('click', async function() {
    // Show loading message
    const button = this;
    const originalText = button.textContent;
    button.textContent = 'Generating PDF...';
    button.disabled = true;
    
    // Load libraries dynamically
    const script1 = document.createElement('script');
    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    document.head.appendChild(script1);
    
    const script2 = document.createElement('script');
    script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    document.head.appendChild(script2);
    
    // Wait for libraries to load
    await new Promise(resolve => {
        let loaded = 0;
        script1.onload = () => {
            loaded++;
            if (loaded === 2) resolve();
        };
        script2.onload = () => {
            loaded++;
            if (loaded === 2) resolve();
        };
    });
    
    const certificate = document.getElementById('certificate');
    
    try {
        // Generate canvas from certificate with high quality settings
        const canvas = await html2canvas(certificate, {
            scale: 3, // High quality for crisp text
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            allowTaint: true,
            imageTimeout: 0,
            windowWidth: certificate.scrollWidth,
            windowHeight: certificate.scrollHeight
        });
        
        // Convert to PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
            compress: true
        });
        
        const pdfWidth = 297; // A4 landscape width in mm
        const pdfHeight = 210; // A4 landscape height in mm
        
        // Calculate dimensions to fit properly
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        
        let imgWidth = pdfWidth;
        let imgHeight = pdfWidth / ratio;
        
        // If height is too tall, scale by height instead
        if (imgHeight > pdfHeight) {
            imgHeight = pdfHeight;
            imgWidth = pdfHeight * ratio;
        }
        
        // Center the image
        const xOffset = (pdfWidth - imgWidth) / 2;
        const yOffset = (pdfHeight - imgHeight) / 2;
        
        // Convert to PNG with high quality for sharp text
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
        
        // Create filename with user's name (sanitized for file system)
        const sanitizedName = userData.fullName.replace(/[^a-z0-9]/gi, '_');
        pdf.save(`${sanitizedName}_Terrorism_Awareness_Certificate.pdf`);
        
        // Reset button
        button.textContent = originalText;
        button.disabled = false;
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try using your browser\'s print function (Ctrl+P or Cmd+P) and save as PDF instead.');
        button.textContent = originalText;
        button.disabled = false;
    }
});

// Print Certificate (lightweight alternative)
document.getElementById('printCert').addEventListener('click', function() {
    window.print();
});

// Email Certificate to Credlytics
document.getElementById('emailCert').addEventListener('click', function() {
    const subject = encodeURIComponent('Terrorism Awareness Training - Certificate Submission');
    const sanitizedName = userData.fullName.replace(/[^a-z0-9]/gi, '_');
    const filename = `${sanitizedName}_Terrorism_Awareness_Certificate.pdf`;
    
    const body = encodeURIComponent(
        `Dear Credlytics Team,\n\n` +
        `Please find my completed Proactive Terrorism Awareness Training details:\n\n` +
        `Name: ${userData.fullName}\n` +
        `Email: ${userData.email}\n` +
        `Phone: ${userData.phone}\n` +
        `Organization: ${userData.organization}\n` +
        `Job Title: ${userData.jobTitle}\n` +
        `Completion Date: ${userData.completionDate}\n` +
        `Certificate ID: ${userData.certificateId}\n\n` +
        `IMPORTANT: I will attach my certificate PDF (${filename}) to this email.\n\n` +
        `Best regards,\n${userData.fullName}`
    );
    
    const mailtoLink = `mailto:verify@credlytics.co.uk?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
    
    // Show reminder to attach certificate
    setTimeout(() => {
        alert('REMINDER: Please download your certificate first, then attach it to the email before sending.\n\n' +
              'Steps:\n' +
              '1. Click "Download Certificate (PDF)" button\n' +
              '2. Attach the downloaded PDF to the email\n' +
              '3. Send the email to verify@credlytics.co.uk\n\n' +
              'Certificate ID: ' + userData.certificateId);
    }, 500);
});

// Smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        
        if (targetId === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
});

// Prevent form submission on Enter key in exam (except on submit button)
document.getElementById('examForm').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.target.type !== 'submit') {
        e.preventDefault();
    }
});

// Initialize
window.addEventListener('load', function() {
    // Show registration section by default
    document.getElementById('registration').classList.remove('hidden');
});
