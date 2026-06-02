import type { ServiceId } from "@/lib/pricing";

/**
 * Per-city local SEO landing-page data.
 *
 * Each entry has genuinely unique, factual copy (real neighborhoods, ZIP codes,
 * local context) so the pages rank as local landing pages — NOT thin/duplicate
 * "doorway" pages, which Google penalizes. Nothing here is a fabricated claim;
 * it's publicly known geography about the Salt Lake area.
 */
export interface Location {
  slug: string;
  city: string;
  /** "City, UT" */
  label: string;
  metaTitle: string;
  metaDescription: string;
  /** Unique 2–3 sentence intro for the page hero/body. */
  intro: string;
  /** One-line local angle (chips / subheads). */
  angle: string;
  neighborhoods: string[];
  zips: string[];
  /** Which ClearNest service to spotlight for this city. */
  featured: ServiceId;
  /** Slugs of nearby cities for internal linking. */
  nearby: string[];
}

export const LOCATIONS: Location[] = [
  {
    slug: "salt-lake-city-ut",
    city: "Salt Lake City",
    label: "Salt Lake City, UT",
    metaTitle: "House Cleaning in Salt Lake City, UT",
    metaDescription:
      "Professional house, deep, move-out & Airbnb cleaning in Salt Lake City — The Avenues, Sugar House, Capitol Hill & more. Book online in 60 seconds, pay after the clean.",
    intro:
      "From the historic bungalows of The Avenues to the lofts downtown and the cottages of Sugar House, Salt Lake City homes have real character worth protecting. ClearNest gives every SLC home a detail-first clean built around older floors, vintage tile, and the canyon dust that comes with living this close to the mountains.",
    angle: "Historic and modern homes alike, cleaned with care.",
    neighborhoods: [
      "The Avenues",
      "Sugar House",
      "Capitol Hill",
      "Federal Heights",
      "9th & 9th",
      "Liberty Wells",
      "Yalecrest",
      "Downtown",
    ],
    zips: ["84101", "84102", "84103", "84105", "84106", "84108"],
    featured: "deep",
    nearby: ["holladay-ut", "millcreek-ut", "murray-ut"],
  },
  {
    slug: "sandy-ut",
    city: "Sandy",
    label: "Sandy, UT",
    metaTitle: "House Cleaning in Sandy, UT",
    metaDescription:
      "Trusted house cleaning in Sandy, UT — recurring, deep, move-out & Airbnb cleans near Little & Big Cottonwood Canyons. Insured, eco-friendly, pay after service.",
    intro:
      "Tucked against the Wasatch at the south end of the valley, Sandy is a city of family homes minutes from Little and Big Cottonwood Canyons. That mountain proximity means more trail dust, ski gear, and seasonal grit through the door — exactly the kind of buildup our recurring and deep cleans are built to handle.",
    angle: "Mountain-adjacent living means more dust — we keep up with it.",
    neighborhoods: [
      "Alta Canyon",
      "Granite",
      "White City",
      "Bell Canyon",
      "Quail Hollow",
      "Historic Sandy",
    ],
    zips: ["84070", "84092", "84093", "84094"],
    featured: "standard",
    nearby: ["draper-ut", "cottonwood-heights-ut", "midvale-ut"],
  },
  {
    slug: "west-jordan-ut",
    city: "West Jordan",
    label: "West Jordan, UT",
    metaTitle: "House Cleaning in West Jordan, UT",
    metaDescription:
      "Affordable, reliable house cleaning in West Jordan, UT — recurring maintenance, deep cleans & move-out turnovers near Jordan Landing. Pay after the clean.",
    intro:
      "West Jordan blends established neighborhoods with newer subdivisions around Jordan Landing and The District. Whether you're in a busy family home or a townhome near the shops, ClearNest keeps the spaces you actually live in — kitchens, baths, and high-traffic floors — consistently fresh without an upfront deposit.",
    angle: "Busy family homes, kept effortlessly fresh.",
    neighborhoods: ["Jordan Landing", "Westland", "Sunset Ridge", "Highlands", "Coppermint"],
    zips: ["84081", "84084", "84088"],
    featured: "standard",
    nearby: ["south-jordan-ut", "taylorsville-ut", "midvale-ut"],
  },
  {
    slug: "south-jordan-ut",
    city: "South Jordan",
    label: "South Jordan, UT",
    metaTitle: "House Cleaning in South Jordan, UT",
    metaDescription:
      "Premium house cleaning in South Jordan, UT — Daybreak & new-construction homes a specialty. Deep cleans, recurring service, move-out turnovers. Book online today.",
    intro:
      "Home to the master-planned Daybreak community and a wave of new construction, South Jordan is full of modern homes with open floor plans and big windows that show every smudge. ClearNest is dimensioned for these layouts — large kitchens, multiple baths, and the glass that makes new homes shine.",
    angle: "Built for open-plan, new-construction homes.",
    neighborhoods: ["Daybreak", "Kennecott", "South Jordan Ranches", "River's Edge"],
    zips: ["84009", "84095"],
    featured: "deep",
    nearby: ["west-jordan-ut", "riverton-ut", "herriman-ut"],
  },
  {
    slug: "murray-ut",
    city: "Murray",
    label: "Murray, UT",
    metaTitle: "House Cleaning in Murray, UT",
    metaDescription:
      "House cleaning in Murray, UT — central, easy to reach, covered constantly. Recurring cleans, deep cleans & move-out turnovers. Insured & bonded, pay after service.",
    intro:
      "Central to the whole valley, Murray mixes mid-century homes with newer builds near Fashion Place and Intermountain Medical Center. Its easy-access location is one we cover constantly — making it simple to fit recurring cleans, deep cleans, and move-out turnovers into your week.",
    angle: "Central, easy to reach, covered constantly.",
    neighborhoods: ["Murray Central", "East Murray", "Vine Street", "Little Cottonwood"],
    zips: ["84107", "84117", "84121", "84123"],
    featured: "standard",
    nearby: ["holladay-ut", "millcreek-ut", "midvale-ut"],
  },
  {
    slug: "draper-ut",
    city: "Draper",
    label: "Draper, UT",
    metaTitle: "House Cleaning in Draper, UT",
    metaDescription:
      "House cleaning in Draper, UT — larger foothill homes handled top to bottom. Deep cleans, recurring service & move-out turnovers near Corner Canyon. Pay after the clean.",
    intro:
      "Draper climbs from the valley floor into the foothills of SunCrest and Corner Canyon, with larger newer homes and plenty of Silicon Slopes professionals who'd rather spend evenings on the trails than scrubbing baseboards. ClearNest handles the square footage so you don't have to.",
    angle: "Bigger foothill homes, handled top to bottom.",
    neighborhoods: ["SunCrest", "Corner Canyon", "Steeplechase", "South Mountain", "Draper Heights"],
    zips: ["84020"],
    featured: "deep",
    nearby: ["sandy-ut", "riverton-ut", "bluffdale-ut"],
  },
  {
    slug: "holladay-ut",
    city: "Holladay",
    label: "Holladay, UT",
    metaTitle: "House Cleaning in Holladay, UT",
    metaDescription:
      "Detail-first house cleaning in Holladay, UT — established luxury homes near the Cottonwood canyons. Deep cleans & recurring service. Insured, eco-friendly, pay after.",
    intro:
      "Holladay is one of the valley's most established communities — leafy streets, mature trees, and timeless homes near the Cottonwood canyons. These houses reward a careful, detail-first approach, and ClearNest treats original wood, tile, and fixtures with the attention they deserve.",
    angle: "Established luxury homes, cleaned with care.",
    neighborhoods: ["Holladay Village", "Cottonwood", "Walker Lane", "Olympus Cove"],
    zips: ["84117", "84121", "84124"],
    featured: "deep",
    nearby: ["cottonwood-heights-ut", "millcreek-ut", "murray-ut"],
  },
  {
    slug: "cottonwood-heights-ut",
    city: "Cottonwood Heights",
    label: "Cottonwood Heights, UT",
    metaTitle: "House Cleaning in Cottonwood Heights, UT",
    metaDescription:
      "House cleaning in Cottonwood Heights, UT — ski-country homes kept guest-ready year-round. Deep cleans, recurring service & Airbnb turnovers near the canyons.",
    intro:
      "Sitting right at the mouths of Big and Little Cottonwood Canyons, Cottonwood Heights is ski country — which means more gear, grit, and guests in winter. From everyday upkeep to deep resets after the season, ClearNest keeps canyon-adjacent homes guest-ready all year.",
    angle: "Ski-country homes, kept guest-ready.",
    neighborhoods: ["Old Mill", "Canyon Cove", "Bywood", "Mountview"],
    zips: ["84093", "84121"],
    featured: "deep",
    nearby: ["holladay-ut", "sandy-ut", "millcreek-ut"],
  },
  {
    slug: "millcreek-ut",
    city: "Millcreek",
    label: "Millcreek, UT",
    metaTitle: "House Cleaning in Millcreek, UT",
    metaDescription:
      "House cleaning in Millcreek, UT — heart-of-the-valley homes kept in rhythm. Recurring maintenance & deep cleans for mid-century classics and remodels. Pay after service.",
    intro:
      "Millcreek's blend of mid-century classics and fresh remodels sits in the heart of the valley, minutes from the canyons. ClearNest fits the rhythm of these homes — recurring maintenance for busy households and deep cleans when a remodel or a change of season calls for a reset.",
    angle: "Heart-of-the-valley homes, kept in rhythm.",
    neighborhoods: ["Mount Olympus", "Canyon Rim", "East Millcreek", "Millcreek Common"],
    zips: ["84106", "84109", "84124"],
    featured: "standard",
    nearby: ["holladay-ut", "salt-lake-city-ut", "murray-ut"],
  },
  {
    slug: "west-valley-city-ut",
    city: "West Valley City",
    label: "West Valley City, UT",
    metaTitle: "House Cleaning in West Valley City, UT",
    metaDescription:
      "Reliable, affordable house cleaning in West Valley City, UT — recurring cleans & move-out turnovers that give your time back. Insured & bonded, pay after the clean.",
    intro:
      "Utah's second-largest city, West Valley is a community of hard-working households where time is the scarcest resource. ClearNest gives that time back with reliable, affordable recurring cleans and thorough move-out turnovers — and you only pay after the work is done.",
    angle: "Reliable, affordable, time-saving cleans.",
    neighborhoods: ["Granger", "Hunter", "Chesterfield", "Valley Crossing"],
    zips: ["84119", "84120", "84128"],
    featured: "standard",
    nearby: ["taylorsville-ut", "west-jordan-ut", "midvale-ut"],
  },
  {
    slug: "riverton-ut",
    city: "Riverton",
    label: "Riverton, UT",
    metaTitle: "House Cleaning in Riverton, UT",
    metaDescription:
      "House cleaning in Riverton, UT — family homes kept fresh. Recurring service, deep cleans & move-out turnovers across the southwest valley. Book online, pay after.",
    intro:
      "Riverton's quiet southwest streets are full of family homes with yards, garages, and the everyday traffic that comes with them. ClearNest keeps these spaces consistently fresh, and steps up to deep and move-out cleans when life changes pace.",
    angle: "Family homes with room to live — kept fresh.",
    neighborhoods: ["Riverton Ranches", "Western Springs", "Riverbend", "Rosecrest edge"],
    zips: ["84065", "84096"],
    featured: "standard",
    nearby: ["herriman-ut", "south-jordan-ut", "bluffdale-ut"],
  },
  {
    slug: "herriman-ut",
    city: "Herriman",
    label: "Herriman, UT",
    metaTitle: "House Cleaning in Herriman, UT",
    metaDescription:
      "House cleaning in Herriman, UT — new-construction homes kept looking just-built. Deep cleans & recurring service around Rosecrest. Insured, eco-friendly, pay after.",
    intro:
      "One of the fastest-growing cities in the state, Herriman is largely new construction climbing the southwest benches around Rosecrest. New homes show dust and finish residue fast — ClearNest's deep and recurring cleans keep that just-built look without the upfront cost.",
    angle: "Keep that just-built look, longer.",
    neighborhoods: ["Rosecrest", "Juniper Crest", "Anthem", "Herriman Towne Center"],
    zips: ["84096"],
    featured: "deep",
    nearby: ["riverton-ut", "south-jordan-ut", "bluffdale-ut"],
  },
  {
    slug: "lehi-ut",
    city: "Lehi",
    label: "Lehi, UT",
    metaTitle: "House Cleaning in Lehi, UT",
    metaDescription:
      "House cleaning in Lehi, UT — the easy button for Silicon Slopes households near Thanksgiving Point. Recurring & deep cleans, no deposit, pay after a spotless result.",
    intro:
      "At the center of Silicon Slopes, Lehi is booming with new homes near Thanksgiving Point and the tech corridor. For families and professionals stretched thin by long workdays, ClearNest is the easy button — book online, skip the deposit, and pay after a spotless result.",
    angle: "The easy button for Silicon Slopes households.",
    neighborhoods: ["Traverse Mountain", "Holbrook Farms", "Spring Creek", "Thanksgiving Point area"],
    zips: ["84043"],
    featured: "standard",
    nearby: ["bluffdale-ut", "draper-ut", "herriman-ut"],
  },
  {
    slug: "bluffdale-ut",
    city: "Bluffdale",
    label: "Bluffdale, UT",
    metaTitle: "House Cleaning in Bluffdale, UT",
    metaDescription:
      "House cleaning in Bluffdale, UT — south-valley homes on a quieter pace. Recurring cleans, deep resets & move-out turnovers with pay-after-service simplicity.",
    intro:
      "Straddling the south end of Salt Lake County, Bluffdale pairs newer subdivisions with larger lots and a quieter pace. ClearNest covers it as part of our south-valley route — recurring cleans, deep resets, and move-out turnovers, all with pay-after-service simplicity.",
    angle: "South-valley homes on a quieter pace.",
    neighborhoods: ["Independence", "Day Ranch", "Summersong", "Hidden Valley"],
    zips: ["84065"],
    featured: "standard",
    nearby: ["riverton-ut", "herriman-ut", "draper-ut"],
  },
  {
    slug: "midvale-ut",
    city: "Midvale",
    label: "Midvale, UT",
    metaTitle: "House Cleaning in Midvale, UT",
    metaDescription:
      "House cleaning in Midvale, UT — new builds and classic homes alike. Airbnb turnovers, recurring cleans & family deep cleans near Bingham Junction. Pay after the clean.",
    intro:
      "Compact and central, Midvale has transformed around Bingham Junction and View 72 while keeping its older Main Street neighborhoods. That mix of new apartments and established homes makes it a natural fit for everything from Airbnb turnovers to family deep cleans.",
    angle: "New builds and classic homes alike.",
    neighborhoods: ["Bingham Junction", "East Midvale", "Union Fort", "Main Street"],
    zips: ["84047"],
    featured: "airbnb",
    nearby: ["murray-ut", "sandy-ut", "west-jordan-ut"],
  },
  {
    slug: "taylorsville-ut",
    city: "Taylorsville",
    label: "Taylorsville, UT",
    metaTitle: "House Cleaning in Taylorsville, UT",
    metaDescription:
      "House cleaning in Taylorsville, UT — dependable consistency, week after week. Recurring maintenance & detailed deep cleans for long-time family homes. Pay after service.",
    intro:
      "Taylorsville is steady, west-central, and full of long-time family homes near Valley Regional Park. ClearNest serves it with dependable recurring cleans and detailed deep cleans — the kind of consistency that turns a clean house into a habit.",
    angle: "Dependable consistency, week after week.",
    neighborhoods: ["Plymouth", "Bennion", "Westbrook", "Valley Park"],
    zips: ["84118", "84123", "84129"],
    featured: "standard",
    nearby: ["west-valley-city-ut", "murray-ut", "west-jordan-ut"],
  },
  {
    slug: "park-city-ut",
    city: "Park City",
    label: "Park City, UT",
    metaTitle: "House Cleaning & Airbnb Turnovers in Park City, UT",
    metaDescription:
      "Airbnb turnover & house cleaning in Park City, UT — built for a relentless guest calendar. Linens, restock, staging & inspection between every check-out and check-in.",
    intro:
      "A world-class resort town just over the summit, Park City runs on short-term rentals, second homes, and a relentless guest calendar. ClearNest's Airbnb turnover service is built for exactly this — linens, restock, staging, and an inspection report between every check-out and check-in.",
    angle: "Turnovers built for a relentless guest calendar.",
    neighborhoods: ["Old Town", "Deer Valley", "Kimball Junction", "Canyons Village", "Prospector"],
    zips: ["84060", "84098"],
    featured: "airbnb",
    nearby: ["salt-lake-city-ut", "holladay-ut", "cottonwood-heights-ut"],
  },
];

export const LOCATION_SLUGS = LOCATIONS.map((l) => l.slug);

export function getLocation(slug: string): Location | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}
