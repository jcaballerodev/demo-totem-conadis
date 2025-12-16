document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN ---
    const timeoutInSeconds = 30; // Tiempo para volver al menú
    const demoSlideDuration = 8000; // 8 Segundos por pantalla
    const imageFolderPath = 'images/';
    const menuImageFilename = 'image_0.png'; 
    const bgMusicVolume = 0.3; 
    const bgMusicDucking = 0.1; // Volumen bajo cuando habla la voz
    
    // Guiones de voz para las diapositivas principales
    const voiceScripts = {
        'image_0.png': "Bienvenido a la Red Alivia. Toque la pantalla para interactuar.",
        'image_1.png': "Salud Accesible.",
        'image_2.png': "Educación Inclusiva.",
        'image_3.png': "Empleo y Oportunidades.",
        'image_4.png': "Protección Social.",
        'image_5.png': "Acceso a la Justicia.",
        'image_6.png': "Canales de Atención."
    };

    // Secuencia del carrusel
    const demoSequence = [
        'image_0.png', 'image_1.png', 'image_2.png', 
        'image_3.png', 'image_4.png', 'image_5.png', 'image_6.png'
    ];

    // --- VARIABLES DE ESTADO ---
    let inactivityTimeout;
    let demoInterval;
    let currentDemoIndex = 0;
    let isUserInteracting = false; 
    let isVoiceEnabled = true; // Voz activada por defecto

    // --- REFERENCIAS DOM ---
    const mainImage = document.getElementById('main-image');
    const backButton = document.getElementById('back-button');
    const audio = document.getElementById('bg-music');
    const soundBtn = document.getElementById('sound-toggle');
    const voiceBtn = document.getElementById('voice-toggle');
    
    // Capas y Modales
    const menuOverlay = document.getElementById('menu-overlay');
    const saludOverlay = document.getElementById('salud-overlay');
    const educacionOverlay = document.getElementById('educacion-overlay');
    const empleoOverlay = document.getElementById('empleo-overlay');
    const proteccionOverlay = document.getElementById('proteccion-overlay');
    const justiciaOverlay = document.getElementById('justicia-overlay');
    const modal = document.getElementById('info-modal');
    const modalText = document.getElementById('modal-text');
    const closeModalBtn = document.getElementById('close-modal');

    // --- LÓGICA DE AUDIO (Música) ---
    audio.volume = bgMusicVolume; 

    function toggleMusic() {
        if (audio.paused) {
            audio.play().then(() => {
                soundBtn.textContent = '🔊';
                soundBtn.classList.remove('muted');
            }).catch(e => console.log(e));
        } else {
            audio.pause();
            soundBtn.textContent = '🔇';
            soundBtn.classList.add('muted');
        }
    }

    function attemptAudioPlay() {
        if (audio.paused && !soundBtn.classList.contains('muted')) {
            audio.play().then(() => {
                soundBtn.textContent = '🔊';
                soundBtn.classList.remove('muted');
            }).catch(() => console.log("Autoplay bloqueado."));
        }
    }

    // --- LÓGICA DE VOZ (Universal) ---
    
    // Función auxiliar para limpiar HTML (quitar <b>, <br>, etc. para que lea bien)
    function stripHtml(html) {
        let tempDiv = document.createElement("div");
        // Reemplazar <br> con puntos para que haga pausas
        let processedHtml = html.replace(/<br\s*\/?>/gi, '. '); 
        tempDiv.innerHTML = processedHtml;
        return tempDiv.textContent || tempDiv.innerText || "";
    }

    function speak(text) {
        // 1. Validaciones
        if (!isVoiceEnabled || !text) return;

        // 2. Detener cualquier habla anterior
        window.speechSynthesis.cancel();

        // 3. Configurar la frase
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-US'; 
        utterance.rate = 1.0; 

        // 4. Manejar el volumen de la música (Ducking)
        utterance.onstart = () => {
            if (!audio.paused) {
                // Transición suave manual (opcional) o cambio directo
                audio.volume = bgMusicDucking; 
            }
        };

        utterance.onend = () => {
            if (!audio.paused) {
                audio.volume = bgMusicVolume;
            }
        };

        // 5. Hablar
        window.speechSynthesis.speak(utterance);
    }

    // Detener la voz (para botón y cerrar modal)
    function stopSpeaking() {
        window.speechSynthesis.cancel();
        if (!audio.paused) audio.volume = bgMusicVolume;
    }

    function toggleVoice() {
        isVoiceEnabled = !isVoiceEnabled;
        
        if (isVoiceEnabled) {
            voiceBtn.textContent = '🗣️';
            voiceBtn.classList.remove('muted');
            // Confirmación auditiva leve o leer lo actual
            if(!modal.classList.contains('hidden')) {
                speak(stripHtml(modalText.innerHTML));
            } else {
                // Leer título de la imagen actual
                let currentImg = mainImage.src.split('/').pop();
                if(voiceScripts[currentImg]) speak(voiceScripts[currentImg]);
            }
        } else {
            voiceBtn.textContent = '😶';
            voiceBtn.classList.add('muted');
            stopSpeaking();
        }
    }

    // --- LISTENERS DE BOTONES ---
    soundBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        userInteractionDetected(); 
        toggleMusic();
    });

    voiceBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userInteractionDetected();
        toggleVoice();
    });

    // --- MODO DEMO ---
    function startDemoMode() {
        if (demoInterval || isUserInteracting) return;
        console.log("Iniciando Modo Demo (8s)...");
        
        const nextSlide = () => {
            const targetImage = demoSequence[currentDemoIndex];
            performVisualNavigation(targetImage);
            currentDemoIndex++;
            if (currentDemoIndex >= demoSequence.length) currentDemoIndex = 0; 
        };

        nextSlide(); 
        demoInterval = setInterval(nextSlide, demoSlideDuration);
    }

    function stopDemoMode() {
        if (demoInterval) {
            clearInterval(demoInterval);
            demoInterval = null;
        }
    }

    // --- DETECCIÓN INTERACCIÓN ---
    function userInteractionDetected() {
        stopDemoMode();
        isUserInteracting = true;
        resetInactivityTimer();
        attemptAudioPlay();
    }

    document.addEventListener('click', userInteractionDetected);
    document.addEventListener('touchstart', userInteractionDetected);

    // --- TEMPORIZADORES ---
    function startInactivityTimer() {
        clearTimeout(inactivityTimeout);
        inactivityTimeout = setTimeout(() => {
            resetSystemToIdle();
        }, timeoutInSeconds * 1000);
    }

    function resetInactivityTimer() {
        clearTimeout(inactivityTimeout);
        startInactivityTimer();
    }

    function resetSystemToIdle() {
        console.log("Reiniciando sistema...");
        backToMenu(true); 
        isUserInteracting = false; 
        currentDemoIndex = 0;      
        setTimeout(() => startDemoMode(), 2000); 
    }

    // --- NAVEGACIÓN ---
    function performVisualNavigation(targetFilename) {
        mainImage.style.opacity = '0.5';
        setTimeout(() => {
            mainImage.src = imageFolderPath + targetFilename;
            updateOverlays(targetFilename);
            
            // Hablar título de la sección (si el modal no está abierto)
            if (modal.classList.contains('hidden') && voiceScripts[targetFilename]) {
                speak(voiceScripts[targetFilename]);
            }

            if (targetFilename !== menuImageFilename) {
                backButton.classList.remove('hidden');
            } else {
                backButton.classList.add('hidden');
            }
            mainImage.style.opacity = '1';
        }, 200);
    }

    function navigateToSection(targetFilename) {
        userInteractionDetected(); 
        performVisualNavigation(targetFilename);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function backToMenu(isAutomatic = false) { 
        if (!isAutomatic) userInteractionDetected();
        
        // Al volver al menú, cerramos modal y callamos voz
        modal.classList.add('hidden'); 
        stopSpeaking(); 
        
        performVisualNavigation(menuImageFilename);
    }

    // --- CAPAS Y MODALES ---
    function updateOverlays(currentImage) {
        menuOverlay.classList.add('hidden');
        saludOverlay.classList.add('hidden');
        if (educacionOverlay) educacionOverlay.classList.add('hidden');
        if (empleoOverlay) empleoOverlay.classList.add('hidden');
        if (proteccionOverlay) proteccionOverlay.classList.add('hidden');
        if (justiciaOverlay) justiciaOverlay.classList.add('hidden');

        if (currentImage === menuImageFilename) { menuOverlay.classList.remove('hidden'); } 
        else if (currentImage === 'image_1.png') { saludOverlay.classList.remove('hidden'); }
        else if (currentImage === 'image_2.png') { if (educacionOverlay) educacionOverlay.classList.remove('hidden'); }
        else if (currentImage === 'image_3.png') { if (empleoOverlay) empleoOverlay.classList.remove('hidden'); }
        else if (currentImage === 'image_4.png') { if (proteccionOverlay) proteccionOverlay.classList.remove('hidden'); }
        else if (currentImage === 'image_5.png') { if (justiciaOverlay) justiciaOverlay.classList.remove('hidden'); }
    }

    document.querySelectorAll('#menu-overlay .hotspot').forEach(spot => {
        spot.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToSection(spot.getAttribute('data-target'));
        });
    });

    const setupModalListeners = (overlay) => {
        if (overlay) {
            overlay.querySelectorAll('.hotspot').forEach(spot => {
                spot.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Obtener texto HTML del atributo
                    const infoHtml = spot.getAttribute('data-info');
                    openModal(infoHtml);
                });
            });
        }
    };
    setupModalListeners(saludOverlay);
    setupModalListeners(educacionOverlay);
    setupModalListeners(empleoOverlay);
    setupModalListeners(proteccionOverlay);
    setupModalListeners(justiciaOverlay);

    // --- FUNCIÓN ABRIR MODAL ACTUALIZADA ---
    function openModal(htmlText) {
        userInteractionDetected();
        modalText.innerHTML = htmlText; // Mostrar texto visualmente (con negritas, etc)
        modal.classList.remove('hidden');
        
        // Limpiar HTML y leer en voz alta
        const cleanText = stripHtml(htmlText);
        speak(cleanText);
    }

    closeModalBtn.addEventListener('click', () => { 
        modal.classList.add('hidden');
        stopSpeaking(); // Callar voz al cerrar
    });

    modal.addEventListener('click', (e) => { 
        if (e.target === modal) {
            modal.classList.add('hidden');
            stopSpeaking(); // Callar voz al cerrar
        }
    });

    backButton.addEventListener('click', () => backToMenu());

    // --- INICIO ---
    updateOverlays(menuImageFilename);
    attemptAudioPlay();
    startDemoMode();
});