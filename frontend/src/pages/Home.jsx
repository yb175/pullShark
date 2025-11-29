import React from 'react'
import Hero from '../components/Hero.jsx'
import ProfuctFeatures from '../components/ProfuctFeatures.jsx';
import Features from '../components/Features.jsx';
import HowItWorks from '../components/HowItWork.jsx';
import Security from '../components/Security.jsx';

export default function Home() {
  return (
<div>
  <section id="hero">
    <Hero className="bg-gradient-to-b from-black via-black to-gray-950 text-white"/>
    </section>
    <section id="features">
      <ProfuctFeatures />
    </section>
    <section id="pricing">
      <HowItWorks />
    </section>
    <section id="security">
      <Security />
    </section>
    
    <Features />
</div>
  );
}