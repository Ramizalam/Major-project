import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Sphere, Cylinder, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, PlayCircle, Clock } from 'lucide-react';
import * as THREE from 'three';
import './LandingPage.css';

// 🤖 THE CUTE ROBOT & LAPTOP SCENE 🤖
const CuteRobotScene = () => {
    useFrame((state) => {
        const scrollY = window.scrollY;
        const vh = window.innerHeight;
        // Animation syncs perfectly with 1 screen of scrolling
        const progress = Math.min(scrollY / vh, 1);

        // Camera dives from Z=7 to Z=1.4 (stops exactly inside the glowing laptop screen)
        state.camera.position.z = THREE.MathUtils.lerp(7, 1.4, progress);
        state.camera.rotation.x = THREE.MathUtils.lerp(0, 0.05, progress);
    });

    return (
        <group>
            {/* 🤖 ROBOT BODY */}
            <group position={[0, -1, -1]}>
                <RoundedBox args={[1.5, 1.2, 1.2]} radius={0.3} position={[0, 2.5, 0]}>
                    <meshStandardMaterial color="#1e293b" roughness={0.4} />
                </RoundedBox>
                <RoundedBox args={[1.1, 0.5, 0.1]} radius={0.1} position={[0, 2.6, 0.6]}>
                    <meshBasicMaterial color="#06b6d4" />
                </RoundedBox>
                <Cylinder args={[0.05, 0.05, 0.6]} position={[0, 3.4, 0]}>
                    <meshStandardMaterial color="#475569" />
                </Cylinder>
                <Sphere args={[0.2, 16, 16]} position={[0, 3.7, 0]}>
                    <meshBasicMaterial color="#ec4899" />
                </Sphere>
                <RoundedBox args={[1.8, 1.5, 1.2]} radius={0.4} position={[0, 1, 0]}>
                    <meshStandardMaterial color="#334155" />
                </RoundedBox>
                <RoundedBox args={[0.4, 0.4, 0.4]} radius={0.1} position={[-1.2, 1.2, 0.8]}>
                    <meshStandardMaterial color="#06b6d4" />
                </RoundedBox>
                <RoundedBox args={[0.4, 0.4, 0.4]} radius={0.1} position={[1.2, 1.2, 0.8]}>
                    <meshStandardMaterial color="#06b6d4" />
                </RoundedBox>
            </group>

            {/* 💻 THE LAPTOP SCREEN */}
            <group position={[0, 0.5, 1.5]}>
                <RoundedBox args={[4.2, 2.7, 0.1]} radius={0.1} position={[0, 1.5, 0]}>
                    <meshStandardMaterial color="#0f172a" />
                </RoundedBox>
                <RoundedBox args={[4, 2.5, 0.11]} radius={0.05} position={[0, 1.5, 0]}>
                    <meshBasicMaterial color="#4f46e5" transparent opacity={0.6} />
                </RoundedBox>

                <Html transform position={[0, 1.5, 0.08]} distanceFactor={3}>
                    <div style={{
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        width: '350px',
                        pointerEvents: 'none',
                    }}>
                        <h2 style={{
                            color: '#ffffff',
                            fontSize: '1.4rem',
                            fontWeight: '900',
                            textShadow: '0 0 15px #06b6d4',
                            marginBottom: '0.5rem',
                            margin: 0
                        }}>INITIALIZING AI CORE...</h2>
                        <p style={{
                            color: '#94a3b8',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            margin: 0,
                            marginTop: '5px'
                        }}>Ready for input</p>
                    </div>
                </Html>

                <RoundedBox args={[4.2, 0.2, 2]} radius={0.05} position={[0, 0, 1]} rotation={[0.1, 0, 0]}>
                    <meshStandardMaterial color="#1e293b" />
                </RoundedBox>
            </group>
        </group>
    );
};

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="cinematic-container">

            {/* 3D CANVAS - Fixed in background */}
            <div className="fixed-canvas-bg">
                <Canvas camera={{ position: [0, 1, 7], fov: 60 }} dpr={[1, 1.5]}>
                    <Suspense fallback={null}>
                        <ambientLight intensity={0.8} />
                        <directionalLight position={[10, 10, 10]} intensity={2} />
                        <pointLight position={[0, 2, 3]} intensity={5} color="#4f46e5" />
                        <CuteRobotScene />
                    </Suspense>
                </Canvas>
            </div>

            {/* INVISIBLE SCROLL ZONE - Gives you space to scroll so the 3D camera moves */}
            <div className="scroll-trigger-zone"></div>

            {/* SOLID CONTENT - This scrolls up over the canvas like a normal website */}
            <div className="content-layer inside-screen">

                {/* --- 1. HERO SECTION --- */}
                <section className="hero-section">
                    <div className="hero-text text-center mx-auto">
                        <h1 className="hero-title">Stop Guessing.<br />Start <span className="highlight-text">Scoring.</span></h1>
                        <p className="hero-subtitle mx-auto">
                            You've entered the AI IELTS Core. We instantly grade your essays, analyze your speech, and prescribe targeted YouTube resources to guarantee your Band 8+.
                        </p>
                        <div className="hero-stats mx-auto justify-center">
                            <div className="stat-item"><span className="stat-number">10k+</span><span className="stat-label">Hours Saved</span></div>
                            <div className="stat-item"><span className="stat-number">Real-Time</span><span className="stat-label">AI Grading</span></div>
                            <div className="stat-item"><span className="stat-number">Custom</span><span className="stat-label">Study Path</span></div>
                        </div>
                        <button className="glowing-btn massive-btn mt-8" onClick={() => navigate('/selection')}>
                            Boot Up Your Mock Test
                        </button>
                    </div>
                </section>

                {/* --- 2. AI ADVANTAGE SECTION --- */}
                <section className="info-section">
                    <div className="section-header text-center mx-auto">
                        <h2>The <span className="highlight-text">AI Advantage</span></h2>
                        <p>Why relying on outdated PDFs is destroying your score.</p>
                    </div>
                    <div className="cards-grid">
                        <motion.div className="glass-card" whileHover={{ scale: 1.05 }}>
                            <Zap className="card-icon" style={{ color: '#ec4899' }} />
                            <h3>Instant Writing Feedback</h3>
                            <p>Don't wait a week for a tutor. Our AI instantly evaluates your Task 1 & 2 for Lexical Resource, Grammar, and Cohesion.</p>
                        </motion.div>
                        <motion.div className="glass-card" whileHover={{ scale: 1.05 }}>
                            <PlayCircle className="card-icon" style={{ color: '#06b6d4' }} />
                            <h3>Smart YouTube Recommender</h3>
                            <p>Struggling with specific question types? We instantly embed the exact top-rated YouTube tutorial you need to fix it.</p>
                        </motion.div>
                        <motion.div className="glass-card" whileHover={{ scale: 1.05 }}>
                            <TrendingUp className="card-icon" style={{ color: '#8b5cf6' }} />
                            <h3>Deep Progress Analytics</h3>
                            <p>Track your average band score over time, see section-wise performance, and predict your actual exam day score.</p>
                        </motion.div>
                    </div>
                </section>

                {/* --- 3. BRUTAL REALITY STATS --- */}
                <section className="stats-section">
                    <div className="stats-container">
                        <h2>The Reality of the <span className="highlight-text">IELTS Exam</span></h2>
                        <div className="stats-grid">
                            <div className="big-stat">
                                <h3>Only 15%</h3>
                                <p>Of test-takers achieve a Band 8 or higher on their first attempt without structured feedback.</p>
                            </div>
                            <div className="big-stat">
                                <h3>11,000+</h3>
                                <p>Universities, employers, and immigration bodies globally require this specific certification.</p>
                            </div>
                            <div className="big-stat">
                                <h3>#1 Reason</h3>
                                <p>For failing to get the desired score is lack of personalized error-correction in Writing and Speaking.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- 4. EXAM BREAKDOWN --- */}
                <section className="exam-details-section">
                    <div className="exam-box mx-auto">
                        <h2><Clock className="inline-icon" /> Master All 4 Modules</h2>
                        <p className="exam-box-sub">Simulate the real 2 Hour 45 Minute environment exactly as it happens on test day.</p>
                        <div className="modules-breakdown">
                            <div className="module-item">
                                <span className="mod-name">Listening</span>
                                <span className="mod-time">30 Mins</span>
                                <span className="mod-desc">Native accents, real-time audio controls.</span>
                            </div>
                            <div className="module-item">
                                <span className="mod-name">Reading</span>
                                <span className="mod-time">60 Mins</span>
                                <span className="mod-desc">Highlighting tools, split-screen UI exactly like the real computer test.</span>
                            </div>
                            <div className="module-item">
                                <span className="mod-name">Writing</span>
                                <span className="mod-time">60 Mins</span>
                                <span className="mod-desc">Word counters, auto-save, and instant AI grading against official rubrics.</span>
                            </div>
                            <div className="module-item">
                                <span className="mod-name">Speaking</span>
                                <span className="mod-time">14 Mins</span>
                                <span className="mod-desc">Record your voice, get filler-word analysis and pronunciation feedback.</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- 5. CTA SECTION --- */}
                <section className="cta-section text-center" style={{ paddingBottom: '150px' }}>
                    <h2 style={{ fontSize: '4.5rem', fontWeight: 900, marginBottom: '1rem' }}>Stop Wasting Time.</h2>
                    <p style={{ fontSize: '1.5rem', color: '#cbd5e1', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
                        Create your account, take a free diagnostic test, let our AI map out your exact weak spots, and start improving today.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.1, boxShadow: "0px 0px 50px #ec4899" }}
                        whileTap={{ scale: 0.9 }}
                        className="glowing-btn massive-btn"
                        // Change this line!
                        onClick={() => navigate('/auth')}
                        style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}
                    >
                        Enter The Platform
                    </motion.button>
                </section>

            </div>
        </div>
    );
};

export default LandingPage;