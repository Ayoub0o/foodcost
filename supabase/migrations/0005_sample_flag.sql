-- FoodCost by PixPlat — sample-data flag (DIRECTIVE §5.2)
-- Every new workspace is seeded with a demo menu ("Burger Maison" + dishes)
-- badged "Example — delete anytime". A boolean marker lets the UI badge those
-- rows and lets the user bulk-delete the samples in one action.

alter table ingredients add column if not exists is_sample boolean not null default false;
alter table recipes add column if not exists is_sample boolean not null default false;
