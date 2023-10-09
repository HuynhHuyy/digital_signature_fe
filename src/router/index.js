import { createRouter, createWebHistory } from "vue-router";
import admin_router from "./admin_router.js";
import public_router from "./public_router.js";
import "@fortawesome/fontawesome-free/css/all.css";

const routes = [...admin_router, ...public_router];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
