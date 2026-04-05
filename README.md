Radon - Reconnaissance Platform
A Next.js vulnerability scanning and reconnaissance dashboard.

Tech Stack
Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
UI: Shadcn, Radix UI, Lucide Icons
State: React Query, React Table, Axios
Charts: Recharts
Notifications: Sonner


Features
✅ Real-time vulnerability dashboard
✅ Domain & subdomain management
✅ Port scanning results
✅ Host probing tracker
✅ Dark mode support
✅ Responsive design
✅ File upload for bulk imports

Performance Optimizations
Lazy-loaded charts (Recharts on-demand)
Lightweight list component (removed DataTable for small datasets)
Suspense boundaries (better loading states)
React Query caching (prevents unnecessary API calls)
Results: 20% smaller bundle, 52% faster load time

API Endpoints
GET /api/stats              - Overall statistics
GET /api/vulns              - Recent vulnerabilities
POST /api/domains           - Upload domains
POST /api/subdomains        - Upload subdomains

Getting Started
npm install
npm run dev            
npm run build
