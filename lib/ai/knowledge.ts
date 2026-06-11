export const KNOWLEDGE_BASE = `
## PRICING — how every quote is calculated
A quote is NOT just the base rate. The total scales with the home:
**total = base + (bedrooms × per-bedroom) + (bathrooms × per-bathroom) + (sqft × per-sqft rate).**
The booking estimator then shows a range of about −8% to +18% around that total; the exact price is confirmed at booking from the home's real size. The base rate alone is only the starting point for a tiny home — never quote the base rate as the price for a multi-bedroom house.
ALWAYS use the estimate_quote tool to get a real number — do not add these up yourself. If the customer hasn't given bedrooms/bathrooms/square footage, the tool fills in typical values for their bedroom count and you should say the quote is approximate until you confirm size.

### Standard Cleaning — routine maintenance
- Rate: $110 base + $18 per bedroom + $22 per bathroom + $0.04 per sqft
- Typical totals: 2 bed/1 bath ≈ $190–245 · 3 bed/2 bath ≈ $258–330 · 4 bed/3 bath ≈ $320–410
- Includes: dusting all surfaces, vacuuming all floors, mopping hard floors, cleaning bathrooms (toilet, shower, sink, mirror), cleaning kitchen (countertops, sink, stovetop exterior), taking out trash, making beds (light), wiping doorknobs/light switches
- Duration: 2-4 hours
- Best for: routine weekly/biweekly/monthly maintenance cleaning

### Deep Cleaning — top-to-bottom reset
- Rate: $195 base + $35 per bedroom + $45 per bathroom + $0.07 per sqft
- Typical totals: 2 bed/1 bath ≈ $350–450 · 3 bed/2 bath ≈ $475–610 · 4 bed/3 bath ≈ $590–760
- Includes everything in Standard plus: cleaning inside oven, cleaning inside refrigerator, washing baseboards, cleaning window tracks/sills, scrubbing grout, deep cleaning showers, interior cabinet fronts, wiping all blinds, cleaning light fixtures, behind/under appliances
- Duration: 4-7 hours
- Best for: first-time cleaning, seasonal cleaning, moving into a new home

### Move-In Cleaning
- Rate: $245 base + $40 per bedroom + $55 per bathroom + $0.09 per sqft
- Typical totals: 2 bed/1 bath ≈ $430–555 · 3 bed/2 bath ≈ $585–750 · 4 bed/3 bath ≈ $730–940
- Focus: making an empty home spotless before moving in. Includes fridge/stove interior, cabinet interiors, all windowsills/tracks, baseboards, deep bathroom scrub, all floors vacuumed/mopped
- Duration: 5-9 hours

### Move-Out Cleaning
- Rate: same as Move-In — $245 base + $40 per bedroom + $55 per bathroom + $0.09 per sqft
- Focus: meeting landlord or realtor standards for move-out. Same deep clean as move-in plus wall smudge removal. Satisfaction guaranteed to pass inspection.

### Airbnb Turnover
- Rate: $125 base + $22 per bedroom + $28 per bathroom + $0.05 per sqft
- Typical totals: 1-2 bed ≈ $225–290 · 3 bed ≈ $310–400
- Includes: linens stripped/washed/remade, restock essentials checklist, trash/recycling/dishes reset, stage + inspect for next guest, damage and inventory report
- Duration: 2-4 hours
- Best for: short-term rental hosts who need a guest-ready turnover between stays

### Recurring Cleaning (discount on any service above)
- Weekly: 20% off · Biweekly: 15% off · Monthly: 10% off
- First clean at the recurring rate includes a free deep clean upgrade
- The estimate_quote tool applies these automatically when you pass a frequency

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
- Hours: Tuesday–Saturday, 7am–7pm
- Closed: Sunday and Monday
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
