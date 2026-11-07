# UniProcur — Procurement ERP Dashboard

A responsive HTML, CSS and vanilla JavaScript starter based on the supplied dashboard screenshot.

## Run locally
1. Extract the ZIP (if downloaded).
2. Open `index.html` in a browser. No build tools or dependencies are required.
3. For a local development server, open the folder in VS Code and use the Live Server extension.

## Project structure
```text
index.html
app.js
style.css
README.md
modules/
  suppliers.html
  suppliers.js
  purchase-requests.html
  purchase-orders.html
  containers.html
  reports.html
  support.html
  audit-trail.html
  settings.html
```

`index.html` is the dashboard entry point. Keep the shared `app.js` and `style.css` beside it in the project root. Put module-specific pages and scripts in `modules/`, using clear filenames such as `purchase-orders.html`. The dashboard loads each unfinished module page into its blank red workspace; the shared sidebar and header stay in `index.html`. The Suppliers page and its behavior live in `modules/suppliers.html` and `modules/suppliers.js`.

## Included
- Screenshot-inspired red/white manager dashboard
- Responsive sidebar and mobile navigation
- KPI cards, spending bar chart and request-status donut
- Pending approval review modal
- Approve/reject interactions that update dashboard counts
- Blank red workspaces for non-dashboard navigation items; sidebar and top navigation remain available
- Toast feedback for demo actions

## Important
This is a front-end prototype. The sample records are static demo data. Authentication, database persistence, real supplier/request CRUD, permissions, audit logging, and real reporting still need a backend/API connection.
#
