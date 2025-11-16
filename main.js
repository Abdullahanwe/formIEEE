const API_BASE_URL = 'https://omarmuhammed.pythonanywhere.com';

// وظائف مساعدة
function setLoading(isLoading) {
    const submitBtn = document.getElementById('submitBtn');
    const loading = document.getElementById('loading');
    
    if (submitBtn && loading) {
        if (isLoading) {
            submitBtn.disabled = true;
            loading.style.display = 'block';
        } else {
            submitBtn.disabled = false;
            loading.style.display = 'none';
        }
    }
}

function showSuccess(message) {
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    if (successMessage && errorMessage) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
    }
}

function showError(message) {
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    if (successMessage && errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
    }
}

function hideMessages() {
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    if (successMessage && errorMessage) {
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// الكود الرئيسي بعد تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // عناصر DOM
    const form = document.getElementById('applicationForm');
    const fileName = document.getElementById('fileName');
    const cvFileInput = document.getElementById('cvFile');

    // التحقق من وجود العناصر الأساسية
    if (!form) {
        console.error('Form not found!');
        return;
    }

    if (!cvFileInput) {
        console.error('CV file input not found!');
        return;
    }

    // تحديث اسم الملف عند الاختيار
    cvFileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file && fileName) {
            // التحقق من نوع الملف
            const allowedTypes = [
                'application/pdf', 
                'application/msword', 
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            
            if (!allowedTypes.includes(file.type)) {
                showError('Please select a valid file type (PDF, DOC, or DOCX)');
                e.target.value = '';
                fileName.textContent = 'No file selected';
                return;
            }
            
            // التحقق من حجم الملف (16MB كحد أقصى)
            if (file.size > 16 * 1024 * 1024) {
                showError('File size must be less than 16MB');
                e.target.value = '';
                fileName.textContent = 'No file selected';
                return;
            }
            
            fileName.textContent = `Selected: ${file.name}`;
        } else if (fileName) {
            fileName.textContent = 'No file selected';
        }
    });

    // إرسال النموذج
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        
        // إخفاء الرسائل السابقة
        hideMessages();
        
        // إنشاء FormData جديد وإضافة الحقول بالاسماء الصحيحة
        const formData = new FormData();
        
        // إضافة الحقول بالاسماء التي يتوقعها الـ API
        formData.append('fullName', document.getElementById('name').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('phone', document.getElementById('phone').value);
        formData.append('faculty', document.getElementById('college').value);
        
        const cvFile = document.getElementById('cvFile').files[0];
        if (cvFile) {
            formData.append('cvFile', cvFile);
        }

        // التحقق من صحة البيانات
        const fullName = formData.get('fullName');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const faculty = formData.get('faculty');

        if (!fullName || !email || !phone || !faculty || !cvFile) {
            showError('Please fill all required fields');
            return;
        }

        // التحقق من صحة البريد الإلكتروني
        if (!isValidEmail(email)) {
            showError('Please enter a valid email address');
            return;
        }

        // إظهار حالة التحميل
        setLoading(true);

        try {
            console.log('Sending data to API...');
            
            // إرسال البيانات إلى API
            const response = await fetch(`${API_BASE_URL}/api/applications`, {
                method: 'POST',
                body: formData
            });

            console.log('Response status:', response.status);
            
            let result;
            try {
                result = await response.json();
                console.log('Response data:', result);
            } catch (parseError) {
                console.error('Error parsing response:', parseError);
                throw new Error('Invalid response from server');
            }
            
            if (response.ok) {
                showSuccess('Application submitted successfully! We will contact you soon.');
                form.reset();
                if (fileName) {
                    fileName.textContent = 'No file selected';
                }
            } else {
                showError(result.error || `Failed to submit application. Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    });

    // إظهار/إخفاء الرسائل عند البدء في الكتابة
    form.addEventListener('input', hideMessages);
});