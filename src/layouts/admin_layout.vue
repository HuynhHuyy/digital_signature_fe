<template>
  <div class="sidebar" :class="isOpened ? 'open' : ''" :style="cssVars">
    <div class="logo-details" style="margin: 6px 14px 0 14px">
      <img v-if="menuLogo" :src="menuLogo" alt="menu-logo" class="menu-logo icon" />
      <i v-else class="bx icon" :class="menuIcon" />
      <div class="logo_name">
        {{ menuTitle }}
      </div>
      <i class="bx" :class="isOpened ? 'bx-menu-alt-right' : 'bx-menu'" id="btn" @click="isOpened = !isOpened" />
    </div>

    <div style="
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        flex-grow: 1;
        max-height: calc(100% - 60px);
      ">
      <div id="my-scroll" style="margin: 6px 14px 0 14px">
        <ul class="nav-list nav-pad" style="overflow: visible">
          <li v-for="(menuItem, index) in menuItems" :key="index" :id="'links_' + index"
            :class="{ active: activeIndex === index }">
            <router-link v-if="isUsedVueRouter" :to="menuItem.link" @click="setActiveMenuItem(menuItem, index)">
              <i class="bx" :class="menuItem.icon || 'bx-square-rounded'" />
              <span class="links_name">{{ menuItem.name }}</span>
            </router-link>
            <a v-else @click.stop.prevent="$emit('menuItemClcked', menuItem.link)" :href="menuItem.link"
              @click="setActiveMenuItem(menuItem, index)">
              <i class="bx" :class="menuItem.icon || 'bx-square-rounded'" />
              <span class="links_name">{{ menuItem.name }}</span>
            </a>
            <span :data-target="'links_' + index" class="tooltip">{{
              menuItem.tooltip || menuItem.name
            }}</span>
          </li>
        </ul>
      </div>
      <div class="profile">
        <div class="profile-details">
          <img v-if="profileImg" :src="profileImg" alt="profileImg" />
          <i v-else class="bx bxs-user-rectangle" />
          <div class="name_job">
            <div class="name">
              {{ profileName }}
            </div>
          </div>
        </div>
        <button v-if="isExitButton" id="log_out" @click="handleLogout">
          <i class="bx bx-log-out" />
        </button>
      </div>
    </div>
  </div>
  <router-view></router-view>
</template>

<script>
import ApiService from "@/api/api.ts";
export default {
  name: "SidebarMenu",
  props: {
    //! Menu settings
    isMenuOpen: {
      type: Boolean,
      default: true,
    },
    isUsedVueRouter: {
      type: Boolean,
      default: true,
    },
    menuTitle: {
      type: String,
      default: "Admin",
    },
    menuLogo: {
      type: String,
      default: "",
    },
    menuIcon: {
      type: String,
      default: "bxl-c-plus-plus",
    },
    isPaddingLeft: {
      type: Boolean,
      default: true,
    },
    menuOpenedPaddingLeftBody: {
      type: String,
      default: "250px",
    },
    menuClosedPaddingLeftBody: {
      type: String,
      default: "78px",
    },

    //! Menu items
    menuItems: {
      type: Array,
      default: () => [
        {
          link: "/admin",
          name: "Account Management",
          tooltip: "User",
          icon: "bx-user",
        },
        {
          link: "/admin/role",
          name: "Role Management",
          tooltip: "Role",
          icon: "bx-user",
        },
        {
          link: "/admin/department",
          name: "Department Management",
          tooltip: "Department",
          icon: "bx-user",
        },
        {
          link: "/admin/procedure",
          name: "Procedure Management",
          tooltip: "Procedure",
          icon: "bx-user",
        },
        {
          link: "/admin/change-password",
          name: "Change Password",
          tooltip: "Change Password",
          icon: "bx-user"
        }
      ],
    },

    //! Profile detailes
    profileImg: {
      type: String,
      default: "",
    },
    profileName: {
      type: String,
      default: "Sign out",
    },
    profileRole: {
      type: String,
      default: "",
    },
    isExitButton: {
      type: Boolean,
      default: true,
    },
    isLoggedIn: {
      type: Boolean,
      default: true,
    },
    //! Styles
    bgColor: {
      type: String,
      default: "#820c2f",
    },
    secondaryColor: {
      type: String,
      default: "#820c2f",
    },
    homeSectionColor: {
      type: String,
      default: "#e4e9f7",
    },
    logoTitleColor: {
      type: String,
      default: "#fff",
    },
    iconsColor: {
      type: String,
      default: "#fff",
    },
    itemsTooltipColor: {
      type: String,
      default: "#e4e9f7",
    },
    searchInputTextColor: {
      type: String,
      default: "#fff",
    },
    menuItemsHoverColor: {
      type: String,
      default: "#fff",
    },
    menuItemsTextColor: {
      type: String,
      default: "#fff",
    },
    menuFooterTextColor: {
      type: String,
      default: "#fff",
    },
  },
  data() {
    return {
      isOpened: false,
      activeMenuItem: null,
      activeIndex: null,
    };
  },
  mounted() {
    this.isOpened = this.isMenuOpen;
    this.tooltipAttached();
    if (!sessionStorage.getItem('firstActiveIndexAdmin')) {
      this.activeIndex = 0;
      this.activeMenuItem = this.menuItems[0];
      sessionStorage.setItem('firstActiveIndexAdmin', 'true');
    }
  },
  computed: {
    cssVars() {

      return {
        "--bg-color": this.bgColor,
        "--secondary-color": this.secondaryColor,
        "--home-section-color": this.homeSectionColor,
        "--logo-title-color": this.logoTitleColor,
        "--icons-color": this.iconsColor,
        "--items-tooltip-color": this.itemsTooltipColor,
        "--serach-input-text-color": this.searchInputTextColor,
        "--menu-items-hover-color": this.menuItemsHoverColor,
        "--menu-items-text-color": this.menuItemsTextColor,
        "--menu-footer-text-color": this.menuFooterTextColor,

      };
    },

  },
  watch: {
    isOpened() {
      window.document.body.style.paddingLeft =
        this.isOpened && this.isPaddingLeft
          ? this.menuOpenedPaddingLeftBody
          : this.menuClosedPaddingLeftBody;
    },
  },
  methods: {
    tooltipAttached() {
      const tooltips = document.querySelectorAll(".tooltip");
      tooltips.forEach((tooltip) => {
        document.body.appendChild(tooltip);
      });
      document.querySelectorAll(".tooltip").forEach((tooltip) => {
        const targetID = tooltip.dataset.target;
        const target = document.querySelector(`#${targetID}`);
        if (!target) return;
        target.addEventListener("mouseenter", () => {
          const targetPosition = target.getBoundingClientRect();
          if (this.isOpened) return;
          tooltip.style.top = `${targetPosition.top + window.scrollY}px`;
          tooltip.style.left = `${targetPosition.left + targetPosition.width + 20
            }px`;
          tooltip.classList.add("active");
        });
        target.addEventListener("mouseleave", () => {
          tooltip.classList.remove("active");
        });
      });
    },
    setActiveMenuItem(menuItem, index) {
      this.activeMenuItem = menuItem;
      this.activeIndex = index;
    },
    handleLogout() {
      ApiService.logout()
        .then(() => {
          sessionStorage.clear();
          window.location.href = "/admin/login";
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
};
</script >
<style scoped>
.nav-pad {
  padding-left: 0;
}
</style>