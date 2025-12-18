document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. CONFIGURACIÓN
    // ==========================================
    const timeoutInSeconds = 30; 
    const demoSlideDuration = 8000; 
    const imageFolderPath = 'images/';
    
    // Nombres de archivo
    const introFilename = 'intro.png';
    const redAliviaFilename = 'red_alivia.png';
    const ubicanosFilename = 'ubicanos.png'; 
    const nivelesFilename = 'niveles_atencion.png';
    const cetproFilename = 'cetpro_asz.png';
    const ejesFilename = 'ejes_tematicos.png';
    
    // Secuencias
    const incluyeme1Filename = 'incluyeme_1.png';
    const incluyeme2Filename = 'incluyeme_2.png';
    
    const registro1Filename = 'registro_1.png';
    const registro2Filename = 'registro_2.png';
    const registro3Filename = 'registro_3.png';
    
    const bgMusicVolume = 0.2; 
    const bgMusicDucking = 0.1; 
    
    const voiceScripts = {
        'intro.png': "Bienvenido al Módulo Digital del CONADIS. Por favor, seleccione una opción.",
        'red_alivia.png': "Estás en Red Alivia Perú. Selecciona: Ubícanos, Niveles de Atención, Ejes Temáticos o Canales de Atención.",
        'niveles_atencion.png': "Niveles de Atención. Contamos con atención primaria y especializada.",
        'ubicanos.png': "La ubicación de nuestra sede central en Lima Metropolitana es Av Arequipa 375 Cercado de Lima, y comunícate con nosotros al número 016305170 - Opción 1.",
        'cetpro_asz.png': "En el área de Educación, el CONADIS a través de su CETPRO Alcides Salomón Zorrilla realiza cursos de capacitación gratuita a personas con discapacidad en las modalidades virtual y presencial.",
        'ejes_tematicos.png': "Ejes Temáticos. Selecciona: Salud, Educación, Empleo, Protección Social o Acceso a la Justicia.",
        'incluyeme_1.png': "Estrategia Inclúyeme Soy Capaz. Promoviendo la inclusión social y productiva.",
        'incluyeme_2.png': "Continuación de la estrategia Inclúyeme Soy Capaz.",
        'registro_1.png': "Registro Nacional de la Persona con Discapacidad. Pasos para la inscripción.",
        'registro_2.png': "Requisitos y documentación necesaria para el registro.",
        'registro_3.png': "Beneficios de estar inscrito en el Registro Nacional del CONADIS.",
        'image_1.png': "Salud Accesible.",
        'image_3.png': "Empleo y Oportunidades.",
        'image_4.png': "Protección Social.",
        'image_5.png': "Acceso a la Justicia.",
        'image_6.png': "Canales de Atención."
    };

    // Secuencia Demo
    const demoSequence = [
        'intro.png', 
        'red_alivia.png',
        'ubicanos.png',     
        'cetpro_asz.png', 
        'incluyeme_1.png', 'incluyeme_2.png',
        'registro_1.png', 'registro_2.png', 'registro_3.png',
        'ejes_tematicos.png', 
        'image_1.png', 'image_3.png'
    ];

    // Variables de estado
    let inactivityTimeout;
    let demoInterval = null; 
    let currentDemoIndex = 0;
    let isUserInteracting = false; 
    let isVoiceEnabled = true;

    // Referencias DOM
    const mainImage = document.getElementById('main-image');
    const backButton = document.getElementById('back-button');
    const audio = document.getElementById('bg-music');
    const soundBtn = document.getElementById('sound-toggle');
    const voiceBtn = document.getElementById('voice-toggle');
    const carouselBtn = document.getElementById('carousel-toggle');
    
    // Overlays
    const introOverlay = document.getElementById('intro-overlay');
    const redAliviaOverlay = document.getElementById('red-alivia-overlay');
    const ejesOverlay = document.getElementById('ejes-overlay');
    const saludOverlay = document.getElementById('salud-overlay');
    // const educacionOverlay = document.getElementById('educacion-overlay'); // Ya no se usa
    
    const incluyeme1Overlay = document.getElementById('incluyeme1-overlay');
    const incluyeme2Overlay = document.getElementById('incluyeme2-overlay');
    
    const registro1Overlay = document.getElementById('registro1-overlay');
    const registro2Overlay = document.getElementById('registro2-overlay');
    const registro3Overlay = document.getElementById('registro3-overlay');
    
    const modal = document.getElementById('info-modal');
    const modalText = document.getElementById('modal-text');
    const closeModalBtn = document.getElementById('close-modal');

    // --- AUDIO & VOZ ---
    audio.volume = bgMusicVolume; 
    function toggleMusic() {
        if (audio.paused) { audio.play().then(()=>{soundBtn.textContent='🔊';soundBtn.classList.remove('muted');}).catch(console.log); } 
        else { audio.pause(); soundBtn.textContent='🔇'; soundBtn.classList.add('muted'); }
    }
    function attemptAudioPlay() { if(audio.paused && !soundBtn.classList.contains('muted')) audio.play().catch(()=>{}); }
    function stripHtml(html) { let t=document.createElement("div"); t.innerHTML=html.replace(/<br\s*\/?>/gi, '. '); return t.textContent||""; }
    function speak(text) {
        if (!isVoiceEnabled || !text) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-US'; 
        utterance.onstart = () => { if (!audio.paused) audio.volume = bgMusicDucking; };
        utterance.onend = () => { if (!audio.paused) audio.volume = bgMusicVolume; };
        window.speechSynthesis.speak(utterance);
    }
    function stopSpeaking() { window.speechSynthesis.cancel(); if (!audio.paused) audio.volume = bgMusicVolume; }
    function toggleVoice() {
        isVoiceEnabled = !isVoiceEnabled;
        voiceBtn.textContent = isVoiceEnabled ? '🗣️' : '😶';
        voiceBtn.classList.toggle('muted', !isVoiceEnabled);
        if(!isVoiceEnabled) stopSpeaking();
        else {
             if(!modal.classList.contains('hidden')) speak(stripHtml(modalText.innerHTML));
             else { let cur = mainImage.src.split('/').pop(); if(voiceScripts[cur]) speak(voiceScripts[cur]); }
        }
    }

    // ==========================================
    // 2. LÓGICA DEL CARRUSEL
    // ==========================================
    
    function updateCarouselButtonState(isRunning) {
        if (isRunning) { 
            carouselBtn.textContent = '⏸️'; // Icono Pausa
            carouselBtn.classList.remove('paused'); 
        } else { 
            carouselBtn.textContent = '▶️'; // Icono Play
            carouselBtn.classList.add('paused'); 
        }
    }

    function startDemoMode() {
        if (demoInterval || isUserInteracting) return;
        
        console.log("Iniciando Carrusel...");
        updateCarouselButtonState(true);
        
        const nextSlide = () => {
            const target = demoSequence[currentDemoIndex];
            performVisualNavigation(target);
            currentDemoIndex = (currentDemoIndex + 1) % demoSequence.length;
        };
        nextSlide(); 
        demoInterval = setInterval(nextSlide, demoSlideDuration);
    }

    function stopDemoMode() {
        if (demoInterval) { 
            clearInterval(demoInterval); 
            demoInterval = null; 
            updateCarouselButtonState(false); 
            console.log("Carrusel Detenido.");
        }
    }

    function toggleCarousel() {
        if (demoInterval) { 
            stopDemoMode(); 
            isUserInteracting = true; 
            resetInactivityTimer(); 
        } else { 
            isUserInteracting = false; 
            startDemoMode(); 
        }
    }

    function userInteractionDetected() { 
        stopDemoMode(); 
        isUserInteracting = true; 
        resetInactivityTimer(); 
        attemptAudioPlay(); 
    }

    function resetSystemToIdle() { 
        console.log("Tiempo de espera agotado. Volviendo a inicio...");
        backToIntro(true); 
        isUserInteracting = false; 
        currentDemoIndex = 0; 
        stopDemoMode(); 
    }

    // Temporizador
    function startInactivityTimer() { 
        clearTimeout(inactivityTimeout); 
        inactivityTimeout = setTimeout(() => { resetSystemToIdle(); }, timeoutInSeconds * 1000); 
    }
    function resetInactivityTimer() { clearTimeout(inactivityTimeout); startInactivityTimer(); }

    // Event Listeners Control
    soundBtn.addEventListener('click', (e) => { e.stopPropagation(); userInteractionDetected(); toggleMusic(); });
    voiceBtn.addEventListener('click', (e) => { e.stopPropagation(); userInteractionDetected(); toggleVoice(); });
    
    carouselBtn.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        toggleCarousel(); 
        attemptAudioPlay(); 
    });

    document.addEventListener('click', (e) => { if (!e.target.closest('.controls') && !e.target.closest('.sound-btn')) userInteractionDetected(); });
    document.addEventListener('touchstart', userInteractionDetected);

    // --- NAVEGACIÓN ---
    function performVisualNavigation(targetFilename) {
        mainImage.style.opacity = '0.5';
        setTimeout(() => {
            mainImage.src = imageFolderPath + targetFilename;
            updateOverlays(targetFilename);
            if (modal.classList.contains('hidden') && voiceScripts[targetFilename]) speak(voiceScripts[targetFilename]);
            
            if (targetFilename !== introFilename) backButton.classList.remove('hidden');
            else backButton.classList.add('hidden');
            mainImage.style.opacity = '1';
        }, 200);
    }
    function navigateToSection(f) { userInteractionDetected(); performVisualNavigation(f); window.scrollTo({top:0,behavior:'smooth'}); }
    function backToIntro(auto) { if(!auto) userInteractionDetected(); modal.classList.add('hidden'); stopSpeaking(); performVisualNavigation(introFilename); }

    // --- GESTIÓN DE CAPAS (OVERLAYS) ---
    function updateOverlays(currentImage) {
        document.querySelectorAll('.overlay-layer').forEach(el => el.classList.add('hidden'));

        if (currentImage === introFilename) { introOverlay.classList.remove('hidden'); }
        else if (currentImage === redAliviaFilename) { if(redAliviaOverlay) redAliviaOverlay.classList.remove('hidden'); }
        else if (currentImage === ejesFilename) { if(ejesOverlay) ejesOverlay.classList.remove('hidden'); }
        else if (currentImage === incluyeme1Filename) { if(incluyeme1Overlay) incluyeme1Overlay.classList.remove('hidden'); }
        else if (currentImage === incluyeme2Filename) { if(incluyeme2Overlay) incluyeme2Overlay.classList.remove('hidden'); }
        else if (currentImage === registro1Filename) { if(registro1Overlay) registro1Overlay.classList.remove('hidden'); }
        else if (currentImage === registro2Filename) { if(registro2Overlay) registro2Overlay.classList.remove('hidden'); }
        else if (currentImage === registro3Filename) { if(registro3Overlay) registro3Overlay.classList.remove('hidden'); }
        else if (currentImage === 'image_1.png') { if(saludOverlay) saludOverlay.classList.remove('hidden'); }
    }

    // Hotspots
    document.querySelectorAll('.hotspot').forEach(spot => {
        spot.addEventListener('click', (e) => {
            e.preventDefault();
            if (spot.getAttribute('data-target')) navigateToSection(spot.getAttribute('data-target'));
            else if (spot.getAttribute('data-info')) openModal(spot.getAttribute('data-info'));
        });
    });

    // Modal
    function openModal(h) { userInteractionDetected(); modalText.innerHTML=h; modal.classList.remove('hidden'); speak(stripHtml(h)); }
    closeModalBtn.addEventListener('click', ()=>{modal.classList.add('hidden'); stopSpeaking();});
    modal.addEventListener('click', (e)=>{if(e.target===modal){modal.classList.add('hidden'); stopSpeaking();}});

    // --- BOTÓN VOLVER ---
    backButton.addEventListener('click', () => {
        const currentSrc = mainImage.src.split('/').pop();
        if (currentSrc === ubicanosFilename || currentSrc === nivelesFilename) { navigateToSection(redAliviaFilename); }
        else if (currentSrc === 'image_6.png') { navigateToSection(redAliviaFilename); }
        else if (currentSrc === redAliviaFilename || currentSrc === cetproFilename || currentSrc === incluyeme1Filename || currentSrc === registro1Filename) { backToIntro(); }
        else if (currentSrc === incluyeme2Filename) navigateToSection(incluyeme1Filename);
        else if (currentSrc === registro2Filename) navigateToSection(registro1Filename);
        else if (currentSrc === registro3Filename) navigateToSection(registro2Filename);
        else if (currentSrc === ejesFilename) { navigateToSection(redAliviaFilename); }
        else { navigateToSection(ejesFilename); }
    });

    // --- INICIALIZACIÓN ---
    updateOverlays(introFilename);
    attemptAudioPlay();
    
    // Configuramos el botón visualmente como "Play" (Pausado)
    updateCarouselButtonState(false); 
});