
        const API_BASE_URL = 'https://omarmuhammed.pythonanywhere.com';
        
        // عناصر DOM
        const form = document.getElementById('applicationForm');
        const submitBtn = document.getElementById('submitBtn');
        const loading = document.getElementById('loading');
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');
        const fileName = document.getElementById('fileName');

        // تحديث اسم الملف عند الاختيار
        document.getElementById('cvFile').addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                // التحقق من نوع الملف
                const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
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
            } else {
                fileName.textContent = 'No file selected';
            }
        });

        // إرسال النموذج
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            
            // إخفاء الرسائل السابقة
            hideMessages();
            
            // التحقق من صحة البيانات
            const formData = new FormData(this);
            const fullName = formData.get('fullName');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const faculty = formData.get('faculty');
            const cvFile = formData.get('cvFile');

            if (!fullName || !email || !phone || !faculty || !cvFile || cvFile.size === 0) {
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
                // إرسال البيانات إلى API
                const response = await fetch(`${API_BASE_URL}/api/applications`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                console.log(result);
                
                if (response.ok) {
                    showSuccess('Application submitted successfully! We will contact you soon.');
                    form.reset();
                    fileName.textContent = 'No file selected';
                } else {
                    showError(result.error || 'Failed to submit application. Please try again.');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                showError('Network error. Please check your connection and try again.');
            } finally {
                setLoading(false);
            }
        });

        // وظائف مساعدة
        function setLoading(isLoading) {
            if (isLoading) {
                submitBtn.disabled = true;
                loading.style.display = 'block';
                submitBtn.style.display = 'none';
            } else {
                submitBtn.disabled = false;
                loading.style.display = 'none';
                submitBtn.style.display = 'block';
            }
        }

        function showSuccess(message) {
            successMessage.textContent = message;
            successMessage.style.display = 'block';
            errorMessage.style.display = 'none';
        }

        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            successMessage.style.display = 'none';
        }

        function hideMessages() {
            successMessage.style.display = 'none';
            errorMessage.style.display = 'none';
        }

        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        // إظهار/إخفاء الرسائل عند البدء في الكتابة
        form.addEventListener('input', hideMessages);
