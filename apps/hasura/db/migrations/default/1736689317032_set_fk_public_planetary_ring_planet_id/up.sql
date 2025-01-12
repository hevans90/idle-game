alter table "public"."planetary_ring"
  add constraint "planetary_ring_planet_id_fkey"
  foreign key ("planet_id")
  references "public"."planet"
  ("id") on update restrict on delete cascade;
