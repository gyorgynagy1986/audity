// Audity.hu kapcsolatfelvételi űrlap kezelése
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('email-form');
    const submitButton = form.querySelector('.submintbutton');
    const successMessage = form.parentElement.querySelector('.success-message');
    const errorMessage = form.parentElement.querySelector('.error-message');

    const API_URL = 'https://email-api-wheat.vercel.app/send-email-audity';

    form.addEventListener('submit', async function(e) {
        e.preventDefault(); // Megakadályozzuk az alapértelmezett form küldést
        e.stopPropagation(); // Megakadályozzuk a buborékozást (Webflow handler számára)
        
        // Webflow form attributumok eltávolítása a dupla küldés elkerülése érdekében
        form.removeAttribute('data-wf-page-id');
        form.removeAttribute('data-wf-element-id');

        // Form adatok összegyűjtése
        const formData = {
            name: form.querySelector('#Full-name').value.trim(),
            email: form.querySelector('#E-mail').value.trim(),
            message: form.querySelector('#Message-2').value.trim()
        };

        // Alapvető validáció
        if (!formData.name || !formData.email || !formData.message) {
            showError('Kérjük, töltse ki az összes kötelező mezőt!');
            return;
        }

        // Email validáció
        if (!isValidEmail(formData.email)) {
            showError('Kérjük, adjon meg egy érvényes email címet!');
            return;
        }

        try {
            // Gomb letiltása és loading állapot
            setLoadingState(true);
            hideMessages();

            // API hívás - a meglévő /send-email-audity endpointhoz
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Sikeres küldés
                showSuccess();
                form.reset(); // Form mezők törlése
            } else {
                // Hiba esetén
                throw new Error(result.error || 'Ismeretlen hiba történt');
            }

        } catch (error) {
            console.error('Form submission error:', error);
            showError('Hiba történt az üzenet küldése során. Kérjük, próbálja újra később!');
        } finally {
            // Loading állapot megszüntetése
            setLoadingState(false);
        }
    });

    // Segédfüggvények
    function setLoadingState(isLoading) {
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.value = 'Küldés...';
            submitButton.style.opacity = '0.7';
        } else {
            submitButton.disabled = false;
            submitButton.value = 'felveszem a kapcsolatot';
            submitButton.style.opacity = '1';
        }
    }

    function showSuccess() {
        hideMessages();
        successMessage.style.display = 'block';
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // 5 másodperc után elrejtjük a sikeres üzenetet
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    }

    function showError(message) {
        hideMessages();
        const errorDiv = errorMessage.querySelector('.text-block-8');
        if (errorDiv) {
            errorDiv.textContent = message;
        }
        errorMessage.style.display = 'block';
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // 8 másodperc után elrejtjük a hiba üzenetet
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 8000);
    }

    function hideMessages() {
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Real-time email validáció (opcionális)
    const emailInput = form.querySelector('#E-mail');
    emailInput.addEventListener('blur', function() {
        if (this.value && !isValidEmail(this.value)) {
            this.style.borderColor = '#ef4444';
            this.style.boxShadow = '0 0 0 1px #ef4444';
        } else {
            this.style.borderColor = '';
            this.style.boxShadow = '';
        }
    });

    emailInput.addEventListener('focus', function() {
        this.style.borderColor = '';
        this.style.boxShadow = '';
    });
});