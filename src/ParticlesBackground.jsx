import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ParticlesBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 8;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // Smooth Particles
    const particlesCount = 1500; // reduced for smoothness
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 26; // more spread out
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  function createCircleTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // draw circle
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

const material = new THREE.PointsMaterial({
  color: "#48aaff",
  size: 0.06,
  map: createCircleTexture(),
  transparent: true,
  opacity: 0.75,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});


    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Gentle parallax
    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener("mousemove", (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.00003;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.00003;
    });

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);

      // Smooth rotation
      particles.rotation.y += 0.0007;
      particles.rotation.x += 0.0003;

      // subtle follow effect
      particles.rotation.y += mouseX;
      particles.rotation.x += mouseY;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      mount.removeChild(renderer.domElement);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
    />
  );
}
