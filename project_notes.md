# Project Reflection

Here are some short notes on the architecture, future improvements, and my experience using AI for this task.

### What I chose and why

*   **The Tech Stack:** I went with **NestJS**, **Next.js**, and **PostgreSQL (Supabase)**. NestJS provides a beautifully structured, modular backend. For the frontend, Next.js combined with Tailwind CSS and Shadcn UI gave me the primitives needed to perfectly match the sleek, dark-themed UI reference.
*   **Raw SQL over an ORM:** I intentionally skipped using a bulky ORM like Prisma or TypeORM. Cursor-based pagination relies on tuple comparisons (`WHERE (created_at, id) < ($1, $2)`), which ORMs often struggle to optimize cleanly. Dropping down to the raw `pg` driver gave me total control over the query execution plan and composite index usage.
*   **Keyset (Cursor) Pagination:** I used a composite cursor of `(created_at, id)`. This perfectly solves the shifting data problem. Traditional `OFFSET` pagination skips or duplicates records when new items are inserted during a browsing session. By using an immutable reference point (the cursor), new items will safely land "above" the current page without affecting the user's view. 
*   **Database-level Seeding:** Instead of writing a Node loop to insert 200,000 products—which would have choked on network round-trips—I wrote a pure SQL script using PostgreSQL's `generate_series`. It executes entirely inside the database engine and finishes in ~3 seconds.

### What I'd improve with more time

*   **Caching the Counts:** Counting rows (`SELECT COUNT(*)`) is notoriously slow in PostgreSQL as the table scales into the millions. I'd introduce Redis or use trigger-based counter tables to cache the total product and category counts.
*   **TanStack Query:** The frontend currently fetches data via native `useEffect` blocks. I'd migrate this to TanStack React Query to get built-in request deduplication, caching, and smoother background refetching.
*   **End-to-End Testing:** I'd love to write a quick Playwright suite to programmatically click through pages while simulating background database inserts, mathematically proving that no duplicates occur in the UI.

### How I used AI (and what it got wrong)

I treated the AI like an incredibly fast junior pair-programmer.

*   **What it helped with:** It was fantastic for eliminating boilerplate. I used it to rapidly generate the exact Tailwind color tokens for the dark theme, scaffold the basic NestJS module structure, and draft the initial `generate_series` SQL string for the 200k mock products. It saved me hours of typing out `<div>` tags and DTO classes.
*   **What it got wrong:** 
    *   **Type Assumptions:** When building the backend, the AI assumed the `pg` driver would return the `created_at` field as a native JavaScript `Date` object. However, depending on timezone configurations, the driver sometimes returns it as a string. I caught the resulting crash and had to rewrite the cursor encoding logic to safely handle and serialize both types.
    *   **Over-engineering the UI:** While matching the reference design, the AI enthusiastically added extra "helpful" info cards, borders, and generic page headers that cluttered the screen. I had to rein it in and strip all of that out to achieve the strictly minimal, clean layout requested.
    *   **Environment Quirks:** It tried chaining terminal scripts with `&&` which completely failed in the local PowerShell environment, so I had to step in and correct the command execution syntax.
