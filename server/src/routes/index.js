const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const bandRoute = require('./band.route');
const setlistRoute = require('./setlist.route');
const songRoute = require('./song.route');

const router = express.Router();

// Define route objects with path and router
const routes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/bands',
    route: bandRoute,
  },
  {
    path: '/setlists',
    route: setlistRoute,
  },
  {
    path: '/songs',
    route: songRoute,
  },
];

// Add all routes to the router
routes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;