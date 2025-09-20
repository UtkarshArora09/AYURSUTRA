const express = require('express');
const router = express.Router();

// Serve sitemap.xml at root level
router.get('/sitemap.xml', (req, res) => {
  res.set('Content-Type', 'text/xml');
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

<url>
  <loc>https://ayursutra-3-hrwm.onrender.com/</loc>
  <lastmod>2025-09-20</lastmod>
  <priority>1.0</priority>
  <changefreq>daily</changefreq>
</url>

<url>
  <loc>https://ayursutra-3-hrwm.onrender.com/patient-dashboard</loc>
  <lastmod>2025-09-20</lastmod>
  <priority>0.9</priority>
  <changefreq>daily</changefreq>
</url>

<url>
  <loc>https://ayursutra-3-hrwm.onrender.com/doctor-dashboard</loc>
  <lastmod>2025-09-20</lastmod>
  <priority>0.8</priority>
  <changefreq>daily</changefreq>
</url>

<url>
  <loc>https://ayursutra-3-hrwm.onrender.com/appointments</loc>
  <lastmod>2025-09-20</lastmod>
  <priority>0.9</priority>
  <changefreq>daily</changefreq>
</url>

<url>
  <loc>https://ayursutra-3-hrwm.onrender.com/panchakarma-booking</loc>
  <lastmod>2025-09-20</lastmod>
  <priority>0.8</priority>
  <changefreq>daily</changefreq>
</url>

<url>
  <loc>https://ayursutra-3-hrwm.onrender.com/panchakarma-reschedule</loc>
  <lastmod>2025-09-20</lastmod>
  <priority>0.7</priority>
  <changefreq>daily</changefreq>
</url>

<url>
  <loc>https://ayursutra-3-hrwm.onrender.com/queue-join</loc>
  <lastmod>2025-09-20</lastmod>
  <priority>0.8</priority>
  <changefreq>hourly</changefreq>
</url>

<url>
  <loc>https://ayursutra-3-hrwm.onrender.com/queue-reschedule-cancel</loc>
  <lastmod>2025-09-20</lastmod>
  <priority>0.7</priority>
  <changefreq>daily</changefreq>
</url>

<url>
  <loc>https://ayursutra-3-hrwm.onrender.com/patient-registration</loc>
  <lastmod>2025-09-20</lastmod>
  <priority>0.8</priority>
  <changefreq>weekly</changefreq>
</url>

<url>
  <loc>https://ayursutra-3-hrwm.onrender.com/appointment-receipt</loc>
  <lastmod>2025-09-20</lastmod>
  <priority>0.6</priority>
  <changefreq>daily</changefreq>
</url>

<!-- API Endpoints for Retell AI -->
<url>
  <loc>https://ayursutra-3-hrwm.onrender.com/api/retell/appointments/book</loc>
  <lastmod>2025-09-20</lastmod>
  <priority>0.6</priority>
  <changefreq>daily</changefreq>
</url>

<url>
  <loc>https://ayursutra-3-hrwm.onrender.com/api/retell/queue/status</loc>
  <lastmod>2025-09-20</lastmod>
  <priority>0.6</priority>
  <changefreq>hourly</changefreq>
</url>

<url>
  <loc>https://ayursutra-3-hrwm.onrender.com/api/retell/emergency/book</loc>
  <lastmod>2025-09-20</lastmod>
  <priority>0.7</priority>
  <changefreq>daily</changefreq>
</url>

</urlset>`;

  res.send(sitemap);
});

module.exports = router;
