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
        <ul v-if="isLogIn == 'true'" class="nav-list nav-pad" style="overflow: visible">
          <li v-for="(menuItem, index) in menuItemsIsLoggedIn" :key="index" :id="'links_' + index"
            :class="{ active: activeIndex === index }">

            <!-- Check if the current menu item is "Document Management" -->
            <div v-if="menuItem.name === 'Document Management'">
              <a href="#" @click.stop.prevent="toggleSubmenu(index)">
                <i class="bx" :class="menuItem.icon || 'bx-square-rounded'" />
                <span class="links_name">{{ menuItem.name }}</span>
                <i class="bx" :class="isSubmenuOpen(index) ? 'bx-chevron-up' : 'bx-chevron-down'"></i>
              </a>
              <span :data-target="'links_' + index" class="tooltip">{{ menuItem.tooltip || menuItem.name }}</span>
              <ul v-if="isSubmenuOpen(index)">
                <li v-for="(submenuItem, submenuIndex) in submenuItemsWithCount" :key="submenuIndex"
                  :class="{ active: activeSubIndex === submenuIndex }">
                  <router-link v-if="isUsedVueRouter" :to="submenuItem.link"
                    @click="setActiveSubMenuItem(submenuItem, submenuIndex)">
                    <i class="bx" :class="submenuItem.icon || 'bx-square-rounded'" />
                    <span class="links_name">{{ submenuItem.name }}</span>
                    <span class="count badge bg-danger" v-if="submenuItem.name === 'Receive'">{{
                      $store.state.applicationReceiverCount }}</span>
                  </router-link>
                  <a v-else @click.stop.prevent="$emit('menuItemClicked', submenuItem.link)" :href="submenuItem.link"
                    @click="setActiveSubMenuItem(submenuItem, submenuIndex)">
                    <i class="bx" :class="submenuItem.icon || 'bx-square-rounded'" />
                    <span class="links_name">{{ submenuItem.name }}</span>
                    <span class="count badge bg-danger" v-if="submenuItem.name === 'Receive'">{{ applicationReceiverCount
                    }}</span>
                  </a>
                  <span :data-target="'links_' + submenuIndex" class="tooltip" v-if="submenuItem.name !== 'Receive'">{{
                    submenuItem.tooltip || submenuItem.name
                  }}</span>
                  <span :data-target="'links_' + submenuIndex" class="tooltip" v-else>{{ submenuItem.tooltip ||
                    submenuItem.name }} ({{ applicationReceiverCount }})</span>
                </li>
              </ul>
            </div>
            <!-- Render regular menu items -->
            <div v-else>
              <router-link v-if="isUsedVueRouter" :to="menuItem.link" @click="setActiveMenuItem(menuItem, index)">
                <i class="bx" :class="menuItem.icon || 'bx-square-rounded'" />
                <span class="links_name">{{ menuItem.name }}</span>
              </router-link>
              <a v-else @click.stop.prevent="$emit('menuItemClicked', menuItem.link)" :href="menuItem.link">
                <i class="bx" :class="menuItem.icon || 'bx-square-rounded'" />
                <span class="links_name">{{ menuItem.name }}</span>
              </a>
              <span :data-target="'links_' + index" class="tooltip">{{ menuItem.tooltip || menuItem.name }}</span>
            </div>
          </li>
        </ul>
        <ul v-else class="nav-list" style="overflow: visible">
          <li v-for="(menuItem, index) in menuItemsNotLoggedIn" :key="index" :id="'links_' + index"
            :class="{ active: activeNotLoggedInIndex === index }">
            <router-link v-if="isUsedVueRouter" :to="menuItem.link" @click="setActiveNotLoggedInItem(menuItem, index)">
              <i class="bx" :class="menuItem.icon || 'bx-square-rounded'" />
              <span class="links_name">{{ menuItem.name }}</span>
            </router-link>
            <a v-else @click.stop.prevent="$emit('menuItemClcked', menuItem.link)" :href="menuItem.link">
              <i class="bx" :class="menuItem.icon || 'bx-square-rounded'" />
              <span class="links_name">{{ menuItem.name }}</span>
            </a>
            <span :data-target="'links_' + index" class="tooltip">{{
              menuItem.tooltip || menuItem.name
            }}</span>
          </li>
        </ul>
      </div>
      <div v-if="isLogIn == 'true'" class="profile">
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
          <i class="bx bx-log-out"></i>
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
      // get full_name from local storage "user"
      default: sessionStorage.getItem("user")
        ? JSON.parse(sessionStorage.getItem("user")).full_name
        : "",
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
    menuItemsIsLoggedIn: {
      type: Array,
      default: () => [
        {
          link: "/public-application",
          name: "Public Document",
          tooltip: "Public Application",
          icon: "bx-file",
        },
        {
          link: "/create-application",
          name: "Create Document",
          tooltip: "Create Application",
          icon: "bx-file",
        },
        {
          link: "/application-draft-manager",
          name: "Draft Document",
          tooltip: "Draft Application",
          icon: "bx-file",
        },
        {
          link: "/application-manager",
          name: "Document Management",
          tooltip: "Application",
          icon: "bx-file",
        },
        {
          link: "/sign-manager",
          name: "Signature Management",
          tooltip: "Application",
          icon: "bx-file",
        },
        {
          link: "/validate-document",
          name: "Validate Document",
          tooltip: "Application",
          icon: "bx-file",
        },
        {
          link: "/change-password",
          name: "Change Password",
          tooltip: "Change Password",
          icon: "bx-lock-alt",
        },
      ],
    },
    menuItemsNotLoggedIn: {
      type: Array,
      default: () => [
        {
          link: "/login",
          name: "Login",
          tooltip: "Login",
          icon: "bx-log-in-circle",
        },
        {
          link: "/forgot-password",
          name: "Forgot Password",
          tooltip: "Forgot Password",
          icon: "bx-lock-open-alt",
        },
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
      default: "#11101d",
    },
    secondaryColor: {
      type: String,
      default: "#1d1b31",
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
      isLogIn: sessionStorage.getItem("isLoggedIn"),
      applicationReceiverCount: 0,
      activeMenuItem: null,
      activeIndex: null,
      activeSubMenuItem: null,
      activeSubIndex: null,
      activeNotLoggedInItem: null,
      activeNotLoggedInIndex: null,
      firstActiveLoggedInItem: true,
      submenuItems: [
        {
          link: "/application-manager",
          name: "All",
          tooltip: "All",
          icon: "bx-file",
        },
        {
          link: "/application-sent-manager",
          name: "Sent",
          tooltip: "Sent",
          icon: "bx-file",
        },
        {
          link: "/application-receiver-manager",
          name: "Receive",
          tooltip: "Receive",
          icon: "bx-file",
          count: 0,
        },
        {
          link: "/application-finished-manager",
          name: "Finished",
          tooltip: "Finished",
          icon: "bx-file",
        },
        {
          link: "/application-rejected-manager",
          name: "Rejected",
          tooltip: "Rejected",
          icon: "bx-file",
        },
        {
          link: "/application-failed-manager",
          name: "Failed",
          tooltip: "Failed",
          icon: "bx-file",
        },
        {
          link: "/application-approval-manager",
          name: "Approval",
          tooltip: "Approval",
          icon: "bx-file",
        }

        // Add more submenu items if needed
      ],
      openedSubmenuIndex: -1,
    };
  },
  created() {
    // username login
  },
  mounted() {
    // this.fetchApplicationReceiverCount();
    this.isOpened = this.isMenuOpen;
    this.tooltipAttached();
    // giữ trạng thái active cho sidebar menu khi refresh chưa login
    if (sessionStorage.getItem('activeMenuItemIndexNotLoggedIn')) {
      const storedIndex = Number(sessionStorage.getItem('activeMenuItemIndexNotLoggedIn'));
      this.activeNotLoggedInIndex = storedIndex;
      this.activeNotLoggedInItem = this.menuItemsNotLoggedIn[storedIndex];

    } else {
      this.activeNotLoggedInIndex = 0;
      this.activeNotLoggedInItem = this.menuItemsNotLoggedIn[0];
    }
    // giữ trạng thái active cho sidebar menu khi refresh đã login
    if (sessionStorage.getItem('activeMenuItemIndexLoggedIn')) {
      const storedIndex = Number(sessionStorage.getItem('activeMenuItemIndexLoggedIn'));
      this.activeIndex = storedIndex;
      this.activeMenuItem = this.menuItemsIsLoggedIn[storedIndex];
    } else {
      this.activeIndex = 0;
      this.activeMenuItem = this.menuItemsIsLoggedIn[0];
    }
  },
  computed: {
    submenuItemsWithCount() {
      return this.submenuItems.map((submenuItem) => {
        if (submenuItem.name === "Receive") {
          return {
            ...submenuItem,
            count: this.applicationReceiverCount,
          };
        } else {
          return submenuItem;
        }
      });
    },
    cssVars() {

      return {
        "--bg-color": this.bgColor,
        "--secondary-color": this.secondaryColor,
        "--home-section-color": this.homeSectionColor,
        "--logo-title-color": this.logoTitleColor,
        "--icons-color": this.iconsColor,
        "--items-tooltip-color": this.itemsTooltipColor,
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
    setActiveMenuItem(menuItem, index) {
      this.activeMenuItem = menuItem;
      this.activeIndex = index;
      this.activeSubMenuItem = null;
      this.activeSubIndex = null;
      sessionStorage.setItem('activeMenuItemIndexLoggedIn', String(index));
    },
    setActiveSubMenuItem(submenuItem, submenuIndex) {
      this.activeSubMenuItem = submenuItem;
      this.activeSubIndex = submenuIndex;
      this.activeMenuItem = null;
      this.activeIndex = null;
    },
    setActiveNotLoggedInItem(menuItem, index) {
      this.activeNotLoggedInItem = menuItem;
      this.activeNotLoggedInIndex = index;
      sessionStorage.setItem('activeMenuItemIndexNotLoggedIn', String(index));
    },
    toggleSubmenu(index) {
      if (this.openedSubmenuIndex === index) {
        this.openedSubmenuIndex = -1; // Close the submenu if it's already open
        // đặt lại trạng thái active khi đóng submenu
        this.activeSubMenuItem = null;
        this.activeSubIndex = null;
      } else {
        this.openedSubmenuIndex = index; // Open the submenu
      }
    },
    isSubmenuOpen(index) {
      return this.openedSubmenuIndex === index;
    },
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
    handleLogout() {
      ApiService.logout()
        .then(() => {
          sessionStorage.clear();
          window.location.href = "/login";
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
};
</script>
<style scoped>
.nav-pad {
  padding-left: 0;
}

.count {
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--menu-items-hover-color);
  color: var(--menu-items-text-color);
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>