-- Seed: a few starter testimonials so the Reviews page never looks empty.
-- Replace these with real ones via /admin/reviews once live.

insert into public.reviews (customer_name, location, rating, body, source, featured, reviewed_at)
values
  ('Megan R.', 'Sandy, UT', 5,
   'ClearNest turned our move-out into a stress-free afternoon. We got our full deposit back and the property manager actually said the kitchen looked brand new.',
   'yelp', true, now() - interval '14 days'),
  ('Tyler K.', 'Salt Lake City, UT', 5,
   'I manage three Airbnb units and ClearNest is the only turnover crew I trust between same-day check-ins. Linens are immaculate, restock is on point, and they catch damage I would have missed.',
   'google', true, now() - interval '32 days'),
  ('Priya S.', 'Holladay, UT', 5,
   'Booked a deep clean before hosting Diwali. They scrubbed grout I had given up on. Easy online booking, professional team, fair price.',
   'yelp', true, now() - interval '60 days')
on conflict do nothing;
