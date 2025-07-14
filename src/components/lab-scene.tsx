'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { type ExperimentState } from '@/lib/types';
import { useLabSounds } from '@/hooks/use-lab-sounds';

interface LabSceneProps {
  experimentState: ExperimentState;
  setExperimentState: (state: ExperimentState) => void;
}

export const LabScene: React.FC<LabSceneProps> = ({ experimentState, setExperimentState }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { startReactionSound, stopReactionSound, playPop } = useLabSounds();

  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const sodiumRef = useRef<THREE.Mesh>();
  const particlesRef = useRef<{
    bubbles: THREE.Points | null;
    smoke: THREE.Points | null;
    flame: THREE.Points | null;
  }>({ bubbles: null, smoke: null, flame: null });
  const reactionState = useRef({
    isActive: false,
    startTime: 0,
    duration: 10000, // 10 seconds
  });

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 8);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Lab Bench
    const benchGeometry = new THREE.BoxGeometry(20, 0.5, 10);
    const benchMaterial = new THREE.MeshStandardMaterial({ color: 0x3d3d3d, roughness: 0.8 });
    const labBench = new THREE.Mesh(benchGeometry, benchMaterial);
    labBench.position.y = -0.25;
    scene.add(labBench);

    // Beaker
    const beakerMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 1.0,
        roughness: 0,
        thickness: 0.1,
        ior: 1.5,
        transparent: true,
        side: THREE.DoubleSide
    });
    const beakerGeometry = new THREE.CylinderGeometry(2, 2, 4, 32, 1, true);
    const beaker = new THREE.Mesh(beakerGeometry, beakerMaterial);
    beaker.position.y = 2;
    scene.add(beaker);
    
    // Water
    const waterGeometry = new THREE.CylinderGeometry(1.95, 1.95, 2.5, 32);
    const waterMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x87ceeb,
        transmission: 0.9,
        roughness: 0.1,
        ior: 1.33,
        transparent: true,
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.position.y = 1.25;
    scene.add(water);

    // Sodium
    const sodiumGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const sodiumMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.6 });
    const sodium = new THREE.Mesh(sodiumGeometry, sodiumMaterial);
    sodiumRef.current = sodium;
    scene.add(sodium);

    const createParticleSystem = (count: number, color: THREE.Color, size: number) => {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color,
            size,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        const points = new THREE.Points(geometry, material);
        points.userData.velocities = new Float32Array(count * 3);
        points.userData.lifetimes = new Float32Array(count);
        points.userData.spawnIndex = 0;
        return points;
    };
    
    particlesRef.current.bubbles = createParticleSystem(500, new THREE.Color(0xffffff), 0.05);
    particlesRef.current.smoke = createParticleSystem(300, new THREE.Color(0xaaaaaa), 0.2);
    particlesRef.current.flame = createParticleSystem(200, new THREE.Color(0xffaa33), 0.3);
    scene.add(particlesRef.current.bubbles, particlesRef.current.smoke, particlesRef.current.flame);
    
    const resetExperiment = () => {
        if (sodiumRef.current) {
            sodiumRef.current.position.set(0, 6, 0);
            sodiumRef.current.visible = true;
        }
        reactionState.current.isActive = false;
        // Clear particles
        Object.values(particlesRef.current).forEach(system => {
            if (system) {
                const posAttr = system.geometry.getAttribute('position') as THREE.BufferAttribute;
                posAttr.array.fill(0);
                posAttr.needsUpdate = true;
                system.userData.spawnIndex = 0;
            }
        });
    };
    resetExperiment();

    const animate = (time: number) => {
      requestAnimationFrame(animate);
      
      // Camera rotation
      camera.position.x = Math.sin(time * 0.0001) * 10;
      camera.position.z = Math.cos(time * 0.0001) * 10;
      camera.lookAt(scene.position);

      const updateParticles = (system: THREE.Points, type: 'bubble' | 'smoke' | 'flame') => {
        const posAttr = system.geometry.getAttribute('position') as THREE.BufferAttribute;
        const positions = posAttr.array as Float32Array;
        const velocities = system.userData.velocities as Float32Array;
        const lifetimes = system.userData.lifetimes as Float32Array;
        
        for (let i = 0; i < positions.length / 3; i++) {
            if (lifetimes[i] > 0) {
                lifetimes[i] -= 16; // ms per frame
                positions[i*3] += velocities[i*3];
                positions[i*3+1] += velocities[i*3+1];
                positions[i*3+2] += velocities[i*3+2];
                if(type === 'smoke') velocities[i*3+1] *= 0.98; // slow down smoke rise
            }
        }
        posAttr.needsUpdate = true;
      };

      const spawnParticle = (system: THREE.Points, type: 'bubble' | 'smoke' | 'flame') => {
        if (!sodiumRef.current) return;
        let { spawnIndex } = system.userData;
        const basePos = sodiumRef.current.position;
        const positions = (system.geometry.getAttribute('position') as THREE.BufferAttribute).array as Float32Array;
        const velocities = system.userData.velocities as Float32Array;
        const lifetimes = system.userData.lifetimes as Float32Array;
        
        positions[spawnIndex*3] = basePos.x + (Math.random() - 0.5) * 0.2;
        positions[spawnIndex*3+1] = basePos.y;
        positions[spawnIndex*3+2] = basePos.z + (Math.random() - 0.5) * 0.2;
        
        if (type === 'bubble') {
            velocities[spawnIndex*3] = (Math.random() - 0.5) * 0.01;
            velocities[spawnIndex*3+1] = Math.random() * 0.05 + 0.02;
            velocities[spawnIndex*3+2] = (Math.random() - 0.5) * 0.01;
            lifetimes[spawnIndex] = 1000 + Math.random() * 1000;
        } else if (type === 'smoke') {
            velocities[spawnIndex*3] = (Math.random() - 0.5) * 0.03;
            velocities[spawnIndex*3+1] = Math.random() * 0.03 + 0.03;
            velocities[spawnIndex*3+2] = (Math.random() - 0.5) * 0.03;
            lifetimes[spawnIndex] = 2000 + Math.random() * 2000;
        } else { // flame
            velocities[spawnIndex*3] = (Math.random() - 0.5) * 0.05;
            velocities[spawnIndex*3+1] = Math.random() * 0.08;
            velocities[spawnIndex*3+2] = (Math.random() - 0.5) * 0.05;
            lifetimes[spawnIndex] = 300 + Math.random() * 200;
        }
        
        system.userData.spawnIndex = (spawnIndex + 1) % (positions.length / 3);
      };

      if (reactionState.current.isActive && sodiumRef.current) {
        const elapsedTime = time - reactionState.current.startTime;
        if (elapsedTime > reactionState.current.duration) {
            reactionState.current.isActive = false;
            stopReactionSound();
            sodiumRef.current.visible = false;
            setExperimentState('Complete');
        } else {
            // Skitter sodium
            sodiumRef.current.position.x += (Math.random() - 0.5) * 0.1;
            sodiumRef.current.position.z += (Math.random() - 0.5) * 0.1;
            sodiumRef.current.position.x = THREE.MathUtils.clamp(sodiumRef.current.position.x, -1.5, 1.5);
            sodiumRef.current.position.z = THREE.MathUtils.clamp(sodiumRef.current.position.z, -1.5, 1.5);

            // Spawn particles
            for(let i = 0; i < 5; i++) spawnParticle(particlesRef.current.bubbles!, 'bubble');
            for(let i = 0; i < 2; i++) spawnParticle(particlesRef.current.smoke!, 'smoke');
            for(let i = 0; i < 3; i++) spawnParticle(particlesRef.current.flame!, 'flame');
            
            if (Math.random() < 0.05) playPop();
        }
      }

      Object.values(particlesRef.current).forEach(system => system && updateParticles(system, 'bubble'));

      renderer.render(scene, camera);
    };
    animate(0);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      scene.clear();
      renderer.dispose();
    };
  }, [playPop, setExperimentState, startReactionSound, stopReactionSound]);

  useEffect(() => {
    if (experimentState === 'Dropping' && sodiumRef.current) {
        const dropStart = { y: 6 };
        const dropEnd = { y: 2.5 }; // Water surface
        const dropDuration = 1000;
        let startTime = -1;

        const animateDrop = (time: number) => {
            if (startTime === -1) startTime = time;
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / dropDuration, 1);
            if(sodiumRef.current) {
                sodiumRef.current.position.y = THREE.MathUtils.lerp(dropStart.y, dropEnd.y, progress);
            }
            if (progress < 1) {
                requestAnimationFrame(animateDrop);
            } else {
                setExperimentState('Reacting');
            }
        };
        requestAnimationFrame(animateDrop);
    } else if (experimentState === 'Reacting') {
        reactionState.current.isActive = true;
        reactionState.current.startTime = performance.now();
        startReactionSound();
    } else if (experimentState === 'Resetting') {
        if (sodiumRef.current) {
            sodiumRef.current.position.set(0, 6, 0);
            sodiumRef.current.visible = true;
        }
        reactionState.current.isActive = false;
        Object.values(particlesRef.current).forEach(system => {
            if (system) {
                const posAttr = system.geometry.getAttribute('position') as THREE.BufferAttribute;
                posAttr.array.fill(0);
                posAttr.needsUpdate = true;
                system.userData.spawnIndex = 0;
            }
        });
        setTimeout(() => setExperimentState('Ready'), 500);
    }
  }, [experimentState, setExperimentState, startReactionSound]);

  return <div ref={mountRef} className="absolute top-0 left-0 w-full h-full" />;
};
