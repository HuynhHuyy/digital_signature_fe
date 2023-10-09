const public_router = [
  {
    path: "/",

    component: () => import("../layouts/public_layout.vue"),

    children: [
      {
        path: "",

        name: "user-homepage",

        redirect: "/login",
        
      },
      {
        path: "/login",

        name: "user-login",

        component: () => import("../views/user/LoginPage/LoginPage.vue"),
      },
      {
        path: "/first-login",

        name: "user-fist-login",

        component: () => import("../views/user/FirstLogin/FirstLogin.vue"),
      },
      {
        path: "/forgot-password",

        name: "user-forgot-password",

        component: () =>
          import("../views/user/ForgotPasswordPage/ForgotPasswordPage.vue"),
      },
      {
        path: '/application-view',
        name: 'ApplicationView',
        component: () => import('../views/user/ApplicationFormPage/ApplicationViewPage.vue'),
        // props: true
      },
      // Manager Page
      {
        path: "/application-manager",

        name: "user-application-manager",

        component: () =>
        import("../views/user/ApplicationManagerPage/ApplicationAllPage.vue"),

      },
      {
        path: "/application-receiver-manager",

        name: "user-application-receiver-manager",

        component: () =>
        import("../views/user/ApplicationManagerPage/ApplicationReceiverPage.vue"),

      },
      {
        path: "/application-finished-manager",

        name: "user-application-finished-manager",

        component: () =>
        import("../views/user/ApplicationManagerPage/ApplicationFinishedPage.vue"),

      },
      {
        path: "/application-rejected-manager",

        name: "user-application-rejected-manager",

        component: () =>
        import("../views/user/ApplicationManagerPage/ApplicationRejectedPage.vue"),

      },
      {
        path: "/application-sent-manager",

        name: "user-application-sent-manager",

        component: () =>
        import("../views/user/ApplicationManagerPage/ApplicationSentPage.vue"),
      },
      {
        path: "/application-approval-manager",

        name: "user-application-approval-manager",

        component: () =>
        import("../views/user/ApplicationManagerPage/ApplicationApprovalPage.vue"),
      },
      {
        path: "/application-failed-manager",

        name: "user-application-failed-manager",

        component: () =>
        import("../views/user/ApplicationManagerPage/ApplicationFailedPage.vue"),
      },

      {
        path: "/change-password",

        name: "user-change-password",

        component: () =>
        import("../views/user/ChangePasswordPage/ChangePasswordPage.vue"),

      },
      {
        path: "/sign-manager",

        name: "user-sign-manager",

        component: () =>
        import("../views/user/SignaturePage/SignaturePage.vue"),

      },
      {
        path: "/public-application",

        name: "user-public-application",

        component: () =>
        import("../views/user/PublicPage/AllPublicApplication.vue"),

      },
      {
        path: "/create-application",

        name: "create-application",

        component: () =>
        import("../views/user/ApplicationFormPage/CreateApplication.vue"),

      },
      {
        path: "/validate-document",

        name: "validate-document",

        component: () =>
        import("../views/user/ValidateDocument/ValidateDocument.vue"),

      },
      {
        path: "/sign-manager",

        name: "sign-manager",

        component: () =>
        import("../views/user/SignaturePage/SignaturePage.vue"),

      },
      {
        path: "/application-draft-manager",

        name: "application-draft-manager",

        component: () =>
        import("../views/user/ApplicationManagerPage/ApplicationDraftPage.vue"),

      },
      {
        path: "/draft-application",

        name: "draft-application",

        component: () =>
        import("../views/user/ApplicationFormPage/ApplicationDraft.vue"),

      }
    ],
  },
];
export default public_router;
