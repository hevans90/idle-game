alter table "public"."planet" drop constraint "planet_celestial_id_fkey",
  add constraint "planet_celestial_id_fkey"
  foreign key ("celestial_id")
  references "public"."celestial"
  ("id") on update restrict on delete cascade;
