# 🧠 memory.md — truegrynd (scratch, à supprimer)

> Récap pour switcher entre mes 3 autres Claudes. Session du 18 juin 2026.

## ✅ Fait aujourd'hui (tout mergé sur `main`)

- QA V2 close (#100)
- Refontes design : Overview · Arena (+ page leaderboard dédiée) · Faction · Profil en onglets
- Clean code : split gros composants + dédupe hooks (`useAsyncResource`)
- PostHog **réparé en prod** (events + identify/email vérifiés en live)
- PRs #101 → #108 mergées

## 🔴 EN COURS — V3 (B2B2C, gyms 100 $/mo)

- Roadmap = issues **#109–#119** (phasée, dans `docs/issues/issues.md`)
- **V3-00 RBAC codé → PR #120 OUVERTE, PAS mergée**
- Branche : `feature/issue-109-v3-rbac`

## 👉 LA SEULE ACTION QUI M'ATTEND

1. Lancer **`supabase/migrations/028_user_roles.sql`** dans le **Supabase SQL Editor** (additive, safe : enum `user_role` + `profiles.role` + backfill + helper)
2. Dire à Claude **« 028 appliquée »**
3. → il smoke + merge #120 + enchaîne **V3-01 (table gyms + RLS)**

⚠️ Ne PAS merger #120 avant la migration (les profils casseraient — `PROFILE_COLUMNS` lit `role`).

## ℹ️ Infos utiles

- Migrations = manuelles dans Supabase SQL Editor (pas de CI auto)
- Reprendre la conversation complète : `claude --resume`
- État aussi sauvé dans la mémoire persistante Claude (rappel auto)
