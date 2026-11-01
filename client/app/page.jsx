"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Aperture, Camera, Clapperboard, Mic2, Music2, Palette, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import { api } from "../lib/api";
import { StudioCard, StudioCardSkeleton } from "../components/StudioCard";

const slides = [
  {
    eyebrow: "A space for every spark",
    title: <>Make room for<br />your <em>next big idea.</em></>,
    copy: "The right space changes everything. Find a creative home base for the work you can’t wait to make.",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2200&q=90",
    tag: "Spaces made for making",
  },
  {
    eyebrow: "Turn up the good stuff",
    title: <>Your next session<br />starts <em>right here.</em></>,
    copy: "From first takes to final mixes, meet the rooms built for your best sound.",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=2200&q=90",
    tag: "Sound you can feel",
  },
  {
    eyebrow: "A little more perspective",
    title: <>Find your light.<br />Find your <em>place.</em></>,
    copy: "Beautiful studios, thoughtful hosts, and a little breathing room for your next creative leap.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=90",
    tag: "Make the moment",
  },
];

// These links preselect the matching category on the studio directory page.
const categories = [
  { title: "Photo Studios", query: "Photo Studio", icon: Camera, image: "photo-1531058020387-3be344556be6", note: "Find your light" },
  { title: "Sound Stages", query: "Film Stage", icon: Clapperboard, image: "photo-1485846234645-a62644f84728", note: "Big ideas, big screens" },
  { title: "Podcast Rooms", query: "Podcast Lounge", icon: Mic2, image: "photo-1590602847861-f357a9332bbc", note: "Give your voice a home" },
  { title: "Music Suites", query: "Music Suite", icon: Music2, image: "photo-1516280440614-37939bbacd81", note: "Make some noise" },
  { title: "Art Workshops", query: "Art Workshop", icon: Palette, image: "photo-1452860606245-08befc0ff44b", note: "Room to get messy" },
];

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [heroSwiper, setHeroSwiper] = useState(null);
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    // Keep the home page's featured cards connected to the live studio collection.
    api("/studios/featured")
      .then(({ studios: data }) => setStudios(data))
      .catch((error) => setLoadError(error.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero">
        {/* Swiper provides the requested autoplaying, clickable home-page slides. */}
        <Swiper
          className="hero-swiper"
          modules={[A11y, Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{ delay: 6500, disableOnInteraction: false, pauseOnMouseEnter: true }}
          loop
          speed={800}
          onSwiper={setHeroSwiper}
          onSlideChange={(swiper) => setActiveSlide(swiper.realIndex)}
          aria-label="Featured StudioSpace highlights"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.eyebrow}>
              <div
                className="hero-slide"
                style={{ backgroundImage: `linear-gradient(90deg, rgba(20,25,20,.75), rgba(20,25,20,.20) 70%), url("${slide.image}")` }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="hero-content page-container">
          <span className="eyebrow hero-eyebrow"><span className="eyebrow-dot" /> {slides[activeSlide].eyebrow}</span>
          <h1>{slides[activeSlide].title}</h1>
          <p>{slides[activeSlide].copy}</p>
          <div className="hero-actions">
            <Link href="/studios" className="button button-lime">Explore studios <ArrowRight size={17} /></Link>
            <Link href="/add-studio" className="button button-glass">Host your space <ArrowUpRight size={16} /></Link>
          </div>
          <div className="hero-foot">
            <div className="slide-controls" aria-label="Choose hero slide">
              {slides.map((slide, index) => (
                <button key={slide.eyebrow} className={index === activeSlide ? "active" : ""} onClick={() => heroSwiper?.slideToLoop(index)} aria-label={`Show slide ${index + 1}`} />
              ))}
            </div>
            <span>{slides[activeSlide].tag}</span>
            <a href="#featured" className="hero-scroll">Scroll to explore <ArrowDown size={15} /></a>
          </div>
        </div>
        <div className="hero-count"><span>0{activeSlide + 1}</span> / 0{slides.length}</div>
      </section>

      <section className="trust-strip">
        <div className="page-container trust-inner">
          <span>Independent spaces, extraordinary work.</span>
          <div><span>PHOTO</span><span>FILM</span><span>SOUND</span><span>ART</span><span>AND EVERYTHING BETWEEN</span></div>
        </div>
      </section>

      <section className="section section-featured page-container" id="featured">
        <div className="section-heading">
          <div><span className="eyebrow">Good places, good energy</span><h2>Spaces worth <em>showing up for.</em></h2></div>
          <Link href="/studios" className="text-link">Explore all spaces <ArrowUpRight size={17} /></Link>
        </div>
        {loadError ? (
          <div className="inline-error">Studios could not load: {loadError}. <Link href="/studios">Try the full studio directory</Link></div>
        ) : loading ? (
          <div className="studio-grid">{Array.from({ length: 3 }).map((_, i) => <StudioCardSkeleton key={i} />)}</div>
        ) : studios.length ? (
          <div className="studio-grid">{studios.slice(0, 6).map((studio) => <StudioCard key={studio._id} studio={studio} />)}</div>
        ) : (
          <div className="home-empty">
            <Aperture size={28} />
            <div><strong>The first great space is waiting to be listed.</strong><p>Know a studio? Make this the place where someone’s next idea comes to life.</p></div>
            <Link href="/add-studio" className="button button-dark">List a studio <ArrowRight size={16} /></Link>
          </div>
        )}
      </section>

      <section className="section section-categories">
        <div className="page-container">
          <div className="section-heading category-heading">
            <div><span className="eyebrow">A place for your kind of making</span><h2>What are you <em>making today?</em></h2></div>
            <p>Every craft has its own rhythm. Find a room that gets yours.</p>
          </div>
          <div className="category-grid">
            {categories.map(({ title, query, icon: Icon, image, note }, index) => (
              <Link className={`category-card category-card-${index + 1}`} key={title} href={`/studios?category=${encodeURIComponent(query)}`}>
                <img src={`https://images.unsplash.com/${image}?auto=format&fit=crop&w=900&q=85`} alt="" loading="lazy" />
                <span className="category-card-shade" />
                <span className="category-icon"><Icon size={18} /></span>
                <span className="category-copy"><small>{note}</small><strong>{title}</strong></span>
                <span className="category-arrow"><ArrowUpRight size={17} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section editorial-section page-container" id="how-it-works">
        <div className="editorial-image">
          <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1300&q=90" alt="Sunlit creative workspace with room to make" loading="lazy" />
          <span className="image-note"><Sparkles size={16} /> Good work starts somewhere.</span>
        </div>
        <div className="editorial-copy">
          <span className="eyebrow">Make space for the good stuff</span>
          <h2>Find the room.<br />Find your <em>flow.</em></h2>
          <p>Forget the borrowed corner and the makeshift setup. Discover independently owned creative spaces where the details are thoughtful and the possibilities are wide open.</p>
          <div className="editorial-points">
            <div><span>01</span><p><strong>Find your fit</strong>Explore spaces with the tools, feel, and light your project needs.</p></div>
            <div><span>02</span><p><strong>Meet your host</strong>Real people, well-loved spaces, and a warm welcome when you arrive.</p></div>
            <div><span>03</span><p><strong>Make the thing</strong>Book your time, bring your idea, and see where it takes you.</p></div>
          </div>
          <Link href="/studios" className="button button-dark">Find your next space <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="host-cta">
        <div className="host-cta-image" />
        <div className="host-cta-content page-container">
          <div><span className="eyebrow"><span className="eyebrow-dot" /> For the space makers</span><h2>That space of yours?<br /><em>Someone needs it.</em></h2></div>
          <div className="host-cta-side"><p>Share your studio with people who care about the work as much as you do. A few clicks, a good introduction, and your space is out in the world.</p><Link href="/add-studio" className="button button-lime">Become a host <ArrowRight size={17} /></Link></div>
        </div>
      </section>
    </>
  );
}
