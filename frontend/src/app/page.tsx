'use client';

import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-[#F8FAFF] flex flex-col">
      <Navbar />
      <Hero />
      <Footer />
    </div>
  );
}
