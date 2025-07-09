import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';

self.skipWaiting();
clientsClaim();

// self.__WB_MANIFEST is injected by VitePWA during the build
precacheAndRoute(self.__WB_MANIFEST || []);
