require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectToDatabase = require("../config/db");
const Studio = require("../models/Studio");
const User = require("../models/User");

const demoEmail = "examiner@studiospace.local";
const demoPassword = "StudioSpace2026!";
const sampleStudios = [
  {
    title: "The Sunroom — Natural Light Studio",
    category: "Photo Studio",
    hourlyRate: 78,
    securityDeposit: 100,
    maxCapacity: 8,
    location: "East Austin, Austin",
    imageURL: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85",
    amenities: ["Natural light", "Wi-Fi", "Makeup area", "Parking"],
    overview: "A bright, plant-filled studio with big south-facing windows, easy load-in, and plenty of room to make portraits, products, or something entirely your own.",
    rating: 4.9,
  },
  {
    title: "Blackbird Soundstage",
    category: "Film Stage",
    hourlyRate: 145,
    securityDeposit: 250,
    maxCapacity: 24,
    location: "Echo Park, Los Angeles",
    imageURL: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1400&q=85",
    amenities: ["Lighting equipment", "Green room", "Wi-Fi", "Parking"],
    overview: "A versatile production stage with generous ceiling height, flexible lighting, and a quiet green room for the moments between takes.",
    rating: 4.8,
  },
  {
    title: "Good Company Podcast Room",
    category: "Podcast Lounge",
    hourlyRate: 62,
    securityDeposit: 50,
    maxCapacity: 6,
    location: "Brooklyn, New York",
    imageURL: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1400&q=85",
    amenities: ["Soundproofing", "Wi-Fi", "Air conditioning", "Furniture included"],
    overview: "A comfortable, acoustically treated room set up for thoughtful conversations, remote interviews, and the kind of ideas that sound even better out loud.",
    rating: 4.9,
  },
  {
    title: "Little Mountain Recording Suite",
    category: "Music Suite",
    hourlyRate: 95,
    securityDeposit: 150,
    maxCapacity: 5,
    location: "Mount Pleasant, Vancouver",
    imageURL: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1400&q=85",
    amenities: ["Soundproofing", "Air conditioning", "Kitchen", "Wi-Fi"],
    overview: "A warm, well-loved recording room with a focused control space and a comfortable live room for tracking, writing, or finding the sound of your next song.",
    rating: 4.7,
  },
  {
    title: "The Open Table Workshop",
    category: "Workshop",
    hourlyRate: 54,
    securityDeposit: 50,
    maxCapacity: 12,
    location: "Mission District, San Francisco",
    imageURL: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1400&q=85",
    amenities: ["Natural light", "Kitchen", "Accessible entrance", "Furniture included"],
    overview: "A welcoming workroom with big tables, good light, and space to teach, prototype, gather, and leave the room a little more interesting than you found it.",
    rating: 4.8,
  },
  {
    title: "Clay & Light Art Room",
    category: "Art Workshop",
    hourlyRate: 48,
    securityDeposit: 50,
    maxCapacity: 10,
    location: "River North, Chicago",
    imageURL: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1400&q=85",
    amenities: ["Natural light", "Kitchen", "Parking", "Accessible entrance"],
    overview: "A hands-on art room with generous work surfaces and shelves for the tools of the trade. Come paint, sketch, build, and make a happy mess.",
    rating: 4.6,
  },
];

async function seedDemo() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Demo seeding is only allowed when NODE_ENV=development.");
  }

  await connectToDatabase();
  const passwordHash = await bcrypt.hash(demoPassword, 12);
  const user = await User.findOneAndUpdate(
    { email: demoEmail },
    {
      name: "StudioSpace Examiner",
      email: demoEmail,
      photoURL: "",
      passwordHash,
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  for (const studio of sampleStudios) {
    await Studio.findOneAndUpdate(
      { owner: user._id, title: studio.title },
      {
        ...studio,
        owner: user._id,
        ownerEmail: user.email,
        ownerName: user.name,
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
  }

  console.log(`Created the local demo account and ${sampleStudios.length} sample studios.`);
  console.log(`Demo email: ${demoEmail}`);
  console.log(`Demo password: ${demoPassword}`);
}

seedDemo()
  .catch((error) => {
    console.error("Could not seed the local demo data:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
