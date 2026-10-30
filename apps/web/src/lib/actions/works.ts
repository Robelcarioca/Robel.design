"use server";

import { auth } from "@Batman/auth";
import prisma from "@Batman/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export interface WorkItem {
  id: string;
  title: string;
  category: string;
  type: "image" | "video";
  mediaUrl: string;
  posterUrl: string | null;
  images: string | null;
  description: string;
  sortOrder: number;
  published: boolean;
  createdAt: Date;
}

const SEED_WORKS: Omit<WorkItem, "createdAt">[] = [
  {
    "id": "video-recording-2",
    "title": "Fintech Analytics & Real-Time Trading Experience",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-13-231952.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-13-231952.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 1,
    "published": true
  },
  {
    "id": "video-recording-8",
    "title": "Modern E-Commerce Storefront — Tactile Filters",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-14-002915.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-14-002915.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 2,
    "published": true
  },
  {
    "id": "video-recording-9",
    "title": "Minimalist Architecture Web Experience Demo",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-14-004156.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-14-004156.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 3,
    "published": true
  },
  {
    "id": "video-recording-11",
    "title": "Interactive Chart & Data Visualizer Prototype",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-15-004222.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-15-004222.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 4,
    "published": true
  },
  {
    "id": "video-recording-12",
    "title": "Dark Mode Ambient Lighting & Glow Animations",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-15-010144.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-15-010144.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 5,
    "published": true
  },
  {
    "id": "video-recording-5",
    "title": "SaaS Dashboard — Metric Visualization & Flow",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-13-235040.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-13-235040.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 6,
    "published": true
  },
  {
    "id": "video-recording-14",
    "title": "Mobile App Onboarding & Dynamic Slide Animations",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-16-093103.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-16-093103.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 7,
    "published": true
  },
  {
    "id": "video-recording-15",
    "title": "Conversion-Driven Checkout & Cart Micro-Moments",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-16-095652.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-16-095652-clip-p8.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 8,
    "published": true
  },
  {
    "id": "video-recording-16",
    "title": "Audio-Visual Player & Fluid Waveform Feedback",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-16-134402.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-16-134402.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 9,
    "published": true
  },
  {
    "id": "video-recording-17",
    "title": "High-Performance Agency Editorial Experience",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-18-071206.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-18-071206.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 10,
    "published": true
  },
  {
    "id": "video-recording-18",
    "title": "Crypto & Web3 Asset Portfolio Dashboard",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-18-083645.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-18-083645.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 11,
    "published": true
  },
  {
    "id": "video-recording-19",
    "title": "Spatial Layout System & Dynamic Grid Motion",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-19-034835.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-19-034835.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 12,
    "published": true
  },
  {
    "id": "video-recording-21",
    "title": "Tactile Drag & Drop Kanban Workflow Demo",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-20-130856.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-20-130856-clip-p13.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 13,
    "published": true
  },
  {
    "id": "video-recording-22",
    "title": "Editorial Magazine Typography & Scroll Effects",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-20-131050.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-20-131050-clip-p14.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 14,
    "published": true
  },
  {
    "id": "video-recording-23",
    "title": "Smart Home IoT Companion App Prototype",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-20-131428.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-20-131428.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 15,
    "published": true
  },
  {
    "id": "video-recording-24",
    "title": "Interactive Pricing Calculator & Tier Selector",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-20-131608.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-20-131608.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 16,
    "published": true
  },
  {
    "id": "video-recording-3",
    "title": "Interactive 3D Product Configurator & Micro-Interactions",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-13-232207.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-13-232207.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 17,
    "published": true
  },
  {
    "id": "video-recording-6",
    "title": "Creative Portfolio Showcase — Kinetic Editorial",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-13-235239.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-13-235239.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 18,
    "published": true
  },
  {
    "id": "video-recording-7",
    "title": "Mobile Navigation & Smooth Spring Physics",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-14-001846.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-14-001846.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 19,
    "published": true
  },
  {
    "id": "video-recording-30",
    "title": "Minimalist E-Commerce Catalog & Quick View",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-24-071718.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-24-071718-clip-p20.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 20,
    "published": true
  },
  {
    "id": "video-recording-31",
    "title": "High-Impact Keynote Deck & Motion Presentation",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-24-072112.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-24-072112.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 21,
    "published": true
  },
  {
    "id": "video-recording-32",
    "title": "Executive Analytics & Performance Visualizer",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-24-074622.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-24-074622.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 22,
    "published": true
  },
  {
    "id": "video-recording-33",
    "title": "Dynamic Card Stacking & Haptic Feedback UI",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-24-075217.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-24-075217.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 23,
    "published": true
  },
  {
    "id": "video-recording-34",
    "title": "Modern Booking & Appointment Scheduling Flow",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-24-115745.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-24-115745.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 24,
    "published": true
  },
  {
    "id": "video-recording-35",
    "title": "Bespoke Digital Brand Experience Walkthrough",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-26-171948.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-26-171948.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 25,
    "published": true
  },
  {
    "id": "video-recording-36",
    "title": "Fluid Mobile Tab Switching & Bottom Sheet UI",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-26-174656.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-26-174656.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 26,
    "published": true
  },
  {
    "id": "video-recording-37",
    "title": "Interactive Prototype — State Transitions & Flow",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-26-174829.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-26-174829-clip-p27.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 27,
    "published": true
  },
  {
    "id": "video-recording-38",
    "title": "Tactile Slider & Color Palette Customizer",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-26-175040.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-26-175040.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 28,
    "published": true
  },
  {
    "id": "video-recording-4",
    "title": "Luxury Brand Lookbook — Dynamic Kinetic Scroll",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-13-232738.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-13-232738.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 29,
    "published": true
  },
  {
    "id": "video-recording-13",
    "title": "Precision Horology — Interactive Timepiece View",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-15-021704.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-15-021704.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 30,
    "published": true
  },
  {
    "id": "video-recording-20",
    "title": "Interactive Map & Geolocation Discovery UI",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-19-171910.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-19-171910-clip-p31.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 31,
    "published": true
  },
  {
    "id": "video-recording-25",
    "title": "SaaS Workspace Collaboration & Real-Time Sync",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-20-131910.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-20-131910-clip-p32.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 32,
    "published": true
  },
  {
    "id": "video-recording-26",
    "title": "Creative Agency Showreel & Kinetic Typography",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-20-144835.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-20-144835.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 33,
    "published": true
  },
  {
    "id": "video-recording-28",
    "title": "Interactive Media Gallery & Lightbox Transitions",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-23-171314.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-23-171314.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 34,
    "published": true
  },
  {
    "id": "video-recording-29",
    "title": "Frictionless Form Flow & In-line Validation",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-23-173927.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/posters/screen-recording-2026-10-23-173927.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 35,
    "published": true
  },
  {
    "id": "video-recording-27",
    "title": "Modern Health & Telemetry Tracking Interface",
    "category": "Videos",
    "type": "video",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-23-164057.mp4",
    "posterUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/web-videos/screen-recording-2026-10-23-164057-clip-p36.jpg",
    "images": null,
    "description": "High-definition recorded UI interaction prototype demonstrating dynamic layout animations, micro-interactions, and conversion-focused responsive flow.",
    "sortOrder": 36,
    "published": true
  },
  {
    "id": "nike-dunk-low-retro",
    "title": "Nike Dunk Low Retro — Interactive Colorway Experience",
    "category": "UI/UX",
    "type": "image",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Nike/nike_01_landscape.jpg",
    "posterUrl": null,
    "images": "[\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Nike/nike_01_landscape.jpg\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Nike/nike_02_landscape.jpg\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Nike/nike_03_landscape.jpg\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Nike/nike_04_landscape.jpg\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Nike/nike_05_landscape.jpg\"]",
    "description": "Nike Dunk Low Retro product page concept featuring dynamic colorway switching across Cosmic Clay, Pine Green, Plum, and Royal Blue — with annotated design details, size selector, and full-bleed brand theming.",
    "sortOrder": 37,
    "published": true
  },
  {
    "id": "perfume-case-study",
    "title": "Perfume Luxe — Digital Brand Experience",
    "category": "UI/UX",
    "type": "image",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Perfume/ambre_01.png",
    "posterUrl": null,
    "images": "[\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Perfume/ambre_01.png\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Perfume/ambre_02.png\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Perfume/ambre_03.png\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Perfume/ambre_04.png\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Perfume/ambre_05.png\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Perfume/ambre_06.png\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Perfume/ambre_07.png\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Perfume/ambre_08.png\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Perfume/ambre_09.png\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Perfume/ambre_10.png\"]",
    "description": "Complete 10-slide luxury fragrance digital experience, product showcase and conversion funnel.",
    "sortOrder": 38,
    "published": true
  },
  {
    "id": "perfume-campaign-landing",
    "title": "Perfume Launch Campaign & Landing Page",
    "category": "UI/UX",
    "type": "image",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/perfume-landing-post.png",
    "posterUrl": null,
    "images": null,
    "description": "Editorial fragrance launch campaign with immersive visual storytelling.",
    "sortOrder": 39,
    "published": true
  },
  {
    "id": "rolex-oyster-perpetual",
    "title": "Rolex Oyster Perpetual — Interactive UI",
    "category": "UI/UX",
    "type": "image",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Rolex/rolex_01.png",
    "posterUrl": null,
    "images": "[\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Rolex/rolex_01.png\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Rolex/rolex_02.png\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Rolex/rolex_03.png\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Rolex/rolex_04.png\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Rolex/rolex_05.png\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Rolex/rolex_06.png\"]",
    "description": "Precision horology concept with interactive model viewing, typography mastery and luxury aesthetics.",
    "sortOrder": 40,
    "published": true
  },
  {
    "id": "modern-chronograph-app",
    "title": "Modern Chronograph — Watch Companion App",
    "category": "UI/UX",
    "type": "image",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Watch/1.png",
    "posterUrl": null,
    "images": "[\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Watch/1.png\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Watch/2.png\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Watch/3.png\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Watch/4.png\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Watch/5.jpg\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Watch/6.jpg\",\"https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Watch/7.jpg\"]",
    "description": "Sleek timekeeping companion app UI with fluid data visualization and tactile micro-details.",
    "sortOrder": 41,
    "published": true
  },
  {
    "id": "kickoff-football-web",
    "title": "Kickoff — Premium Sports & Football Portal",
    "category": "Web",
    "type": "image",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/kickoff-football-web.jpg",
    "posterUrl": null,
    "images": null,
    "description": "High-energy athletic portal with live fixtures, dynamic player cards, and immersive dark-mode UI.",
    "sortOrder": 42,
    "published": true
  },
  {
    "id": "nexora-saas-platform",
    "title": "Nexora — Next-Gen B2B SaaS Platform Experience",
    "category": "Web",
    "type": "image",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/nexora-saas-platform.jpg",
    "posterUrl": null,
    "images": null,
    "description": "Enterprise SaaS landing page and product dashboard designed to communicate cutting-edge AI infrastructure.",
    "sortOrder": 43,
    "published": true
  },
  {
    "id": "hardware-product-showcase",
    "title": "Ergonomic Hardware — Launch & Social Kit",
    "category": "Branding",
    "type": "image",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/mouse-instagram-post.png",
    "posterUrl": null,
    "images": null,
    "description": "Geometric hardware rendering, clean promotional collateral and social graphics.",
    "sortOrder": 44,
    "published": true
  },
  {
    "id": "geometric-brand-graphics",
    "title": "Geometric Brand Art & Abstract Composition",
    "category": "Branding",
    "type": "image",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/714453928405006915.jpg",
    "posterUrl": null,
    "images": null,
    "description": "Abstract geometric artwork exploring structural balance, depth, and minimalist graphic design.",
    "sortOrder": 45,
    "published": true
  },
  {
    "id": "orla-furniture",
    "title": "ORLA — Quiet Luxury Furniture Web Concept",
    "category": "Web",
    "type": "image",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/orla-luxury-furniture.jpg",
    "posterUrl": null,
    "images": null,
    "description": "Minimalist Scandinavian furniture e-commerce experience crafted for seamless catalog navigation.",
    "sortOrder": 46,
    "published": true
  },
  {
    "id": "amazon-maven-lane",
    "title": "Maven Lane — Amazon Brand Storefront UX",
    "category": "Web",
    "type": "image",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/amazon-maven-lane.jpg",
    "posterUrl": null,
    "images": null,
    "description": "High-converting brand storefront architecture designed to maximize engagement and cart value.",
    "sortOrder": 47,
    "published": true
  },
  {
    "id": "minimalist-website-template",
    "title": "Minimalist Agency Template — Clean & Bold",
    "category": "Web",
    "type": "image",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/minimalist-website-template.jpg",
    "posterUrl": null,
    "images": null,
    "description": "Modern typography-driven editorial web template built for agencies and creators.",
    "sortOrder": 48,
    "published": true
  },
  {
    "id": "brand-identity-system",
    "title": "Design System & Brand Identity Kit",
    "category": "Branding",
    "type": "image",
    "mediaUrl": "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/brand-identity-cover.png",
    "posterUrl": null,
    "images": null,
    "description": "Comprehensive brand identity guidelines, typography scales, color palettes and print collateral.",
    "sortOrder": 49,
    "published": true
  }
];

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  if (session.user.role !== "admin") throw new Error("Forbidden");
  return session;
}

export async function getPublicWorks(): Promise<WorkItem[]> {
  try {
    const works = await prisma.work.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    if (works && works.length > 0) {
      return works.map((w) => ({
        ...w,
        type: (w.type as "image" | "video") || "image",
      }));
    }

    return SEED_WORKS.map((w, index) => ({
      ...w,
      createdAt: new Date(Date.now() - index * 60000),
    }));
  } catch (err) {
    console.error("Error fetching public works from database, using seed fallback:", err);
    return SEED_WORKS.map((w, index) => ({
      ...w,
      createdAt: new Date(Date.now() - index * 60000),
    }));
  }
}

export async function getAdminWorks(): Promise<WorkItem[]> {
  await requireAdmin();
  const works = await prisma.work.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return works.map((w) => ({
    ...w,
    type: (w.type as "image" | "video") || "image",
  }));
}

export async function createWork(data: {
  title: string;
  category: string;
  type: "image" | "video";
  mediaUrl: string;
  posterUrl?: string | null;
  images?: string | null;
  description: string;
  sortOrder?: number;
  published?: boolean;
}) {
  await requireAdmin();

  let nextSortOrder = data.sortOrder;
  if (nextSortOrder === undefined) {
    const highest = await prisma.work.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    nextSortOrder = (highest?.sortOrder ?? 0) + 1;
  }

  const work = await prisma.work.create({
    data: {
      title: data.title,
      category: data.category,
      type: data.type,
      mediaUrl: data.mediaUrl,
      posterUrl: data.posterUrl || null,
      images: data.images || null,
      description: data.description,
      sortOrder: nextSortOrder,
      published: data.published ?? true,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return work;
}

export async function updateWork(
  id: string,
  data: {
    title?: string;
    category?: string;
    type?: "image" | "video";
    mediaUrl?: string;
    posterUrl?: string | null;
    images?: string | null;
    description?: string;
    sortOrder?: number;
    published?: boolean;
  }
) {
  await requireAdmin();

  const work = await prisma.work.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.mediaUrl !== undefined ? { mediaUrl: data.mediaUrl } : {}),
      ...(data.posterUrl !== undefined ? { posterUrl: data.posterUrl } : {}),
      ...(data.images !== undefined ? { images: data.images } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      ...(data.published !== undefined ? { published: data.published } : {}),
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return work;
}

export async function deleteWork(id: string) {
  await requireAdmin();

  await prisma.work.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

export async function toggleWorkPublished(id: string, published: boolean) {
  await requireAdmin();

  const work = await prisma.work.update({
    where: { id },
    data: { published },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return work;
}

export async function reorderWorks(items: { id: string; sortOrder: number }[]) {
  await requireAdmin();

  await Promise.all(
    items.map((item) =>
      prisma.work.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      })
    )
  );

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}
