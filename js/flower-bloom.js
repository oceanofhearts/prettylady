// --- Interactive SVG Flower Blooming Animation ---

(function() {
    window.initFlowerBloom = function(sectionSelector) {
        const flowerSvg = document.querySelector('#flower-svg');
        if (!flowerSvg) return;

        // Reset SVG elements before animation starts
        gsap.set('#petals-group', { transformOrigin: 'center center', scale: 0.05, rotation: -90 });
        gsap.set('.leaf-left', { transformOrigin: 'right bottom', scale: 0, rotation: 15 });
        gsap.set('.leaf-right', { transformOrigin: 'left bottom', scale: 0, rotation: -15 });
        
        // Dash array setup for stem drawing effect
        const stemPath = document.querySelector('.flower-stem');
        const stemLength = stemPath.getTotalLength();
        gsap.set(stemPath, {
            strokeDasharray: stemLength,
            strokeDashoffset: stemLength
        });

        // Individual petal rotations / offsets for stagger blooming
        const petals = document.querySelectorAll('.petal');
        petals.forEach((petal, index) => {
            gsap.set(petal, { 
                transformOrigin: 'bottom center', 
                scale: 0.1, 
                opacity: 0 
            });
        });

        // Create the GSAP scroll-triggered timeline
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: sectionSelector,
                start: "top center+=100",  // Start when section top reaches middle of screen
                end: "bottom center",      // End when section bottom reaches middle of screen
                scrub: 1.5,                // Smooth scrubbing linking scroll progress
                markers: false
            }
        });

        tl.to(stemPath, {
            strokeDashoffset: 0,
            duration: 1.5,
            ease: "power1.inOut"
        })
        .to(['.leaf-left', '.leaf-right'], {
            scale: 1,
            rotation: 0,
            duration: 1,
            stagger: 0.3,
            ease: "back.out(1.7)"
        }, "-=0.8")
        .to('#petals-group', {
            scale: 1.2,
            rotation: 0,
            duration: 2.5,
            ease: "power2.out"
        }, "-=0.5")
        .to(petals, {
            scale: 1,
            opacity: 1,
            stagger: 0.1,
            duration: 2,
            ease: "back.out(2)"
        }, "-=2.2")
        .to('#petals-group', {
            scale: 1,
            duration: 1,
            ease: "power1.inOut"
        }, "-=0.5")
        .to('.bloom-text', {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: "power2.out"
        }, "-=1");

        return tl;
    };
})();
