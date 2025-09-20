const express = require('express');
const router = express.Router();

router.get('/sitemap.xml', (req, res) => {
  res.set('Content-Type', 'text/xml');
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

    <!-- Your sitemap URLs here -->

  </urlset>`;

  res.send(sitemap);
});

module.exports = router;
