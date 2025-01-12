alter table "public"."celestial" drop constraint "system_galaxy_id_fkey",
  add constraint "celestial_galaxy_id_fkey"
  foreign key ("galaxy_id")
  references "public"."galaxy"
  ("id") on update restrict on delete cascade;
