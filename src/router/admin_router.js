const admin_router = [
  {
    path: "/admin",
    component: () => import("../layouts/admin_layout.vue"),
    children: [
      {
        path: "",
        name: "admin-homepage",
        component: () =>
          import("../views/admin/AdminHomepage/AdminHomepage.vue"),
      },
      {
        path: "role",
        name: "admin-role",
        component: () => import("../views/admin/AdminRole/AdminRolePage.vue"),
      },
      {
        path: "department",
        name: "admin-department",
        component: () => import("../views/admin/AdminDepartment/AdminDepartmentPage.vue"),
      },
      {
        path: "procedure",
        name: "admin-procedure",
        component: () => import("../views/admin/AdminProcedure/AdminProcedurePage.vue"),
      },
      {
        path: "change-password",
        name: "admin-change-password",
        component: () => import("../views/admin/AdminChangePasswordPage/AdminChangePasswordPage.vue"),
      }
    ],
  },

  {
    path: "/admin/login",

    name: "admin-login",

    component: () => import("../views/admin/AdminLoginPage/AdminLoginPage.vue"),
  },
];

export default admin_router;
