/**
 * One-time (safe to re-run) seed of demo data into Supabase. Only touches
 * Postgres — never used when the app is running against the in-memory
 * store. Run with: npm run db:seed
 */
import { createClient } from '@supabase/supabase-js';
import { SEED_REVIEWS, SEED_SERVICES, SEED_TASKS, SEED_USERS } from '../src/data/seed';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!url || !serviceKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY (in .env or your shell) before seeding.');
  process.exit(1);
}

const sb = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function upsert(table: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const { error } = await sb.from(table).upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`seeding ${table}: ${error.message}`);
  console.log(`  ${table}: ${rows.length} rows`);
}

async function main() {
  console.log(`Seeding ${url} …`);

  await upsert(
    'users',
    SEED_USERS.map((u) => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      area: u.area,
      city: u.city,
      avatar_url: u.avatarUrl ?? null,
      profile_video_url: u.profileVideoUrl ?? null,
      has_video_bio: Boolean(u.hasVideoBio),
      specialty: u.specialty,
      services_offered: u.servicesOffered ?? [],
      service_subcategories: u.serviceSubcategories ?? [],
      custom_profession: u.customProfession ?? null,
      role_type: u.roleType ?? 'both',
      work_photos: u.workPhotos ?? [],
      rating_avg: u.ratingAvg ?? 0,
      rating_count: u.ratingCount ?? 0,
      bio: u.bio ?? null,
      created_at: u.createdAt,
    })),
  );

  await upsert(
    'tasks',
    SEED_TASKS.map((t) => ({
      id: t.id,
      posted_by: t.postedBy,
      posted_by_name: t.postedByName ?? null,
      posted_by_area: t.postedByArea ?? null,
      title: t.title,
      category: t.category ?? '',
      sub_category: t.subCategory ?? '',
      description: t.description ?? '',
      area: t.area,
      city: t.city,
      lat: t.lat,
      lng: t.lng,
      urgency: t.urgency,
      status: t.status,
      created_at: t.createdAt,
      interested_count: t.interestedCount ?? 0,
      image_url: t.imageUrl ?? null,
    })),
  );

  await upsert(
    'services',
    SEED_SERVICES.map((s) => ({
      id: s.id,
      posted_by: s.postedBy,
      posted_by_name: s.postedByName ?? null,
      posted_by_phone: s.postedByPhone ?? null,
      posted_by_rating: s.postedByRating ?? null,
      title: s.title,
      category: s.category ?? '',
      sub_category: s.subCategory ?? '',
      specialty: s.specialty ?? null,
      description: s.description ?? '',
      area: s.area,
      city: s.city,
      lat: s.lat,
      lng: s.lng,
      pricing_rate: s.pricingRate ?? null,
      work_photos: s.workPhotos ?? [],
      status: s.status,
      created_at: s.createdAt,
      interested_count: s.interestedCount ?? 0,
    })),
  );

  await upsert(
    'reviews',
    SEED_REVIEWS.map((r) => ({
      id: r.id,
      reviewer_id: r.reviewerId,
      reviewer_name: r.reviewerName,
      reviewed_user_id: r.reviewedUserId,
      task_id: r.taskId ?? null,
      rating: r.rating,
      comment: r.comment,
      created_at: r.createdAt,
    })),
  );

  // A handful of interest signals so counts don't start at a flat zero —
  // mirrors the pairs the in-memory store seeds on every boot.
  const interestPairs: [string, string, 'task' | 'service_offer'][] = [
    ['u-2', 't-1', 'task'],
    ['u-8', 't-2', 'task'],
    ['u-9', 't-2', 'task'],
    ['u-4', 't-3', 'task'],
    ['u-5', 't-4', 'task'],
    ['u-2', 't-4', 'task'],
    ['u-3', 't-7', 'task'],
    ['u-1', 's-1', 'service_offer'],
    ['u-6', 's-1', 'service_offer'],
    ['u-1', 's-11', 'service_offer'],
    ['u-10', 's-7', 'service_offer'],
  ];
  const byUser = new Map(SEED_USERS.map((u) => [u.id, u]));
  const now = new Date().toISOString();
  await upsert(
    'interests',
    interestPairs.map(([userId, postId, postType], i) => {
      const user = byUser.get(userId);
      return {
        id: `seed-int-${i}`,
        user_id: userId,
        post_id: postId,
        post_type: postType,
        created_at: now,
        preview_service_type: user?.specialty ?? 'Client',
        preview_rating_avg: user?.ratingAvg ?? 0,
        preview_rating_count: user?.ratingCount ?? 0,
        preview_area: user ? `${user.area}, ${user.city}` : '',
        preview_has_video: Boolean(user?.hasVideoBio),
      };
    }),
  );

  // Recompute interested_count on the affected posts from the actual rows,
  // same as the in-memory store does when it seeds.
  const counts = new Map<string, number>();
  for (const [, postId] of interestPairs) counts.set(postId, (counts.get(postId) ?? 0) + 1);
  for (const [postId, count] of counts) {
    const table = postId.startsWith('t-') ? 'tasks' : 'services';
    const { error } = await sb.from(table).update({ interested_count: count }).eq('id', postId);
    if (error) throw new Error(`updating interested_count on ${table}.${postId}: ${error.message}`);
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
