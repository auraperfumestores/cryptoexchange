# Restore the original site (undo simulator-only mode)

On **2026-08-19** the site was put into a temporary "simulator-only" mode:
`src/middleware.ts` was replaced with a version that rewrites every request to
`public/simulator.html`, making all other pages and API routes unreachable.

**Nothing else in the project was modified.** A full backup (everything except
`node_modules` and `.next`) exists at `E:\crypto-exchange-backup-2026-08-19`.

## To restore

1. Delete the temporary middleware and put the original back:

   ```bash
   rm "E:\crypto exchange\src\middleware.ts"
   mv "E:\crypto exchange\src\middleware.ts.bak" "E:\crypto exchange\src\middleware.ts"
   ```

2. Remove the simulator page and this guide:

   ```bash
   rm "E:\crypto exchange\public\simulator.html" "E:\crypto exchange\RESTORE_ORIGINAL.md"
   ```

3. Redeploy (push to Vercel).

That's it — the original `middleware.ts` (apex → www canonical redirect) is
byte-identical to what was there before, and no other file was touched.
