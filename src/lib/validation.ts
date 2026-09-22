import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export const inquirySchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(255),
  phone: z.string().max(40).optional(),
  message: z.string().min(10).max(2000),
  budget: z.string().max(80).optional(),
  propertyId: z.string().max(120).optional(),
});

export const newsletterSchema = z.object({
  email: z.string().email().max(255),
});

export const consultationSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(255),
  phone: z.string().max(40).optional(),
  date: z.string().max(20).optional(),
  time: z.string().max(40).optional(),
  message: z.string().max(2000).optional(),
});

// Accepts a full http(s) URL or an app-relative path (e.g. an uploaded "/uploads/x.jpg").
const imageRef = z
  .string()
  .min(1)
  .max(600)
  .refine((s) => s.startsWith("/") || /^https?:\/\//.test(s), "Must be a URL or an uploaded path");

export const propertyUpsertSchema = z.object({
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/),
  title: z.string().min(2).max(200),
  tagline: z.string().max(240).optional().nullable(),
  description: z.string().min(20).max(8000),
  type: z.enum(["VILLA", "ESTATE", "PENTHOUSE", "RESIDENCE", "RIAD", "LAND"]),
  listingType: z.enum(["SALE", "RENT"]).default("SALE"),
  status: z.enum(["DRAFT", "AVAILABLE", "RESERVED", "SOLD"]).default("AVAILABLE"),
  location: z.string().max(200),
  city: z.string().max(120),
  country: z.string().max(120),
  priceEur: z.coerce.number().int().nonnegative(),
  bedrooms: z.coerce.number().int().min(0).max(50),
  bathrooms: z.coerce.number().int().min(0).max(50),
  areaSqm: z.coerce.number().int().nonnegative(),
  landSqm: z.coerce.number().int().nonnegative().optional().nullable(),
  yieldPercent: z.coerce.number().min(0).max(100).optional().nullable(),
  featured: z.boolean().default(false),
  heroImage: imageRef,
  images: z.array(imageRef).max(40),
  amenities: z.array(z.string().max(80)).max(40),
  highlights: z.array(z.string().max(160)).max(20),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type InquiryInput = z.infer<typeof inquirySchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type PropertyInput = z.infer<typeof propertyUpsertSchema>;
