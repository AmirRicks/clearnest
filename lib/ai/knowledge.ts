export const KNOWLEDGE_BASE = `
## SERVICES

### Standard Cleaning
- Base rate: $110
- Includes: dusting all surfaces, vacuuming all floors, mopping hard floors, cleaning bathrooms (toilet, shower, sink, mirror), cleaning kitchen (countertops, sink, stovetop exterior), taking out trash, making beds (light), wiping doorknobs/light switches
- Duration: 2-4 hours
- Best for: routine weekly/biweekly/monthly maintenance cleaning

### Deep Cleaning
- Base rate: $195
- Includes everything in Standard plus: cleaning inside oven, cleaning inside refrigerator, washing baseboards, cleaning window tracks/sills, scrubbing grout, deep cleaning showers, interior cabinet fronts, wiping all blinds, cleaning light fixtures, behind/under appliances
- Duration: 4-7 hours
- Best for: first-time cleaning, seasonal cleaning, moving into a new home

### Move-In Cleaning
- Base rate: $245
- Focus: making an empty home spotless before moving in. Includes fridge/stove interior, cabinet interiors, all windowsills/tracks, baseboards, deep bathroom scrub, all floors vacuumed/mopped
- Duration: 5-9 hours

### Move-Out Cleaning
- Base rate: $245
- Focus: meeting landlord or realtor standards for move-out. Same deep clean as move-in plus wall smudge removal. Satisfaction guaranteed to pass inspection.

### Recurring Cleaning
- Weekly: 20% off standard rates
- Biweekly: 15% off standard rates
- Monthly: 10% off standard rates
- First clean at the recurring rate includes a free deep clean upgrade

## POLICIES

### Refund Policy
- We guarantee your satisfaction. If you are not happy with the clean, notify us within 24 hours.
- We will return to re-clean any missed areas at no charge.
- Full refunds are reviewed on a case-by-case basis.
- Refund requests must be submitted within 7 days of service.
- The AI Receptionist CANNOT approve refunds. Refund requests are sent to management for review.

### Cancellation Policy
- Free cancellation up to 24 hours before scheduled service.
- Cancellations within 24 hours may be subject to a $35 fee.
- To cancel, call (801) 441-0726 or reply to your confirmation email.

### Rescheduling Policy
- Free rescheduling up to 24 hours before scheduled service.
- We try to accommodate last-minute changes when possible.
- Multiple reschedules may require management approval.
- Reschedule through your account or by calling (801) 441-0726.

## CLEANING PRODUCTS
We use eco-friendly, pet-safe, and child-safe cleaning products:
- EC3 (by Microbalance) — plant-based, kills mold/mildew, safe for pets and kids
- Seventh Generation Free & Clear — plant-based all-purpose cleaner, no fragrances or dyes
- Method All-Purpose Cleaner — plant-based, biodegradable, non-toxic
- Branch Basics Concentrate — non-toxic, biodegradable, safe around pets and children
- Puracy Multi-Surface Cleaner — plant-based, hypoallergenic, safe for babies
- Biokleen Bac-Out — enzyme-based, natural, safe for septic systems

## SERVICE AREAS
Salt Lake City, Sandy, West Jordan, South Jordan, Murray, Draper, Holladay, Cottonwood Heights, Millcreek, West Valley City, Riverton, Herriman, Lehi, Bluffdale, Midvale, Taylorsville, Park City

## BUSINESS INFO
- Phone: (801) 441-0726
- Email: clearnest.services@gmail.com
- Hours: Monday–Saturday, 7am–7pm
- Closed: Sundays
- Website: clearnest.services
- Pay after the clean — we send a hosted invoice the day of service
- Payment methods: card, Apple Pay, Google Pay
`;

export const SERVICE_INFO = {
  standard: { name: "Standard Cleaning", basePrice: 110, duration: "2-4 hours" },
  deep: { name: "Deep Cleaning", basePrice: 195, duration: "4-7 hours" },
  moveinout: { name: "Move-In/Out Cleaning", basePrice: 245, duration: "5-9 hours" },
  airbnb: { name: "Airbnb Turnover", basePrice: 125, duration: "2-4 hours" },
} as const;

export const ADDON_INFO = [
  { id: "fridge", name: "Inside fridge", price: 35 },
  { id: "oven", name: "Inside oven", price: 40 },
  { id: "windows", name: "Interior windows", price: 45 },
  { id: "cabinets", name: "Inside cabinets", price: 40 },
  { id: "laundry", name: "Wash & fold (1 load)", price: 25 },
  { id: "garage", name: "Garage sweep-out", price: 50 },
] as const;
