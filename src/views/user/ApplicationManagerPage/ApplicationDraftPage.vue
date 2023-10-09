<template>
  <div class="container">
    <h3 class="p-3 text-center">Document Draft</h3>

    <table class="table table-striped table-bordered">
      <thead>
        <tr>
          <th>Document name</th>
          <th>Date</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="application in paginatedItems" :key="application.id">
          <td>{{ application.title }}</td>
          <td>{{ formatTime(application.created_at) }}</td>
          <td>
            <button class="btn btn-primary m-1" @click="showModalApplication(application.id)">
              <i class="fas fa-eye"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="loading" class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i> Loading...
    </div>

    <div v-if="paginatedItems.length === 0" class="text-center">
      <h3 class="text-alert-noapplication">There is no document</h3>
    </div>
    <div class="pagination">
      <button class="btn prevPage" @click="prevPage" :disabled="currentPage === 1">
        <i class="fas fa-angle-double-left"></i>
      </button>
      <span class="currentPage">{{ currentPage }}</span>
      <button class="btn nextPage" @click="nextPage" :disabled="currentPage >= totalPages">
        <i class="fas fa-angle-double-right"></i>
      </button>
    </div>


  </div>
  <!-- Modal Application -->
  <div class="modal" tabindex="-1" role="dialog" :class="['overlay', { 'show': showModal }]"
    v-for="application in filteredApplication" :key="application.id">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <!-- Nội dung của modal -->
        <div class="modal-header">
          <div class="modal-title">
            <h5>Title: <span class="inline-title" id="titleApplication">{{ application.title }}</span>
            </h5>
            <p class="text-header sender">From: {{ application.sender_name }}</p>
            <p class="text-header receiver">To:
              <span v-for="receiver in application.user_receiver" :key="receiver.id">{{ receiver.user_receiver_name }},
              </span>
            </p>
          </div>
          <button type="button" class="btn close" @click="closeModal">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div id="content-application">
            <div v-html="application.content">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div>
            <button type="button" class="btn btn-success" @click="deleteApplication(application.id)">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
          <div>
            <button type="button" class="btn btn-warning" @click="editContent(application)">
              <i class="fas fa-edit"></i>
            </button>
          </div>
          <div>
            <button type="button" class="btn btn-secondary" @click="closeModal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import ApiService from "@/api/api.ts";
import moment from 'moment';
import {
  errorToast,
  successToast
} from "@/utils/toast.js";
export default {
  //hàm check login
  mounted() {
    this.checkLogin();
  },
  methods: {
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    closeModal() {
      this.showModal = false;
    },
    async deleteApplication(id) {
      try {
        await ApiService.deleteApplication(id);
        this.applications = this.applications.filter((application) => {
          return application.id !== id;
        });
        successToast("Delete document successfully");
        this.closeModal();
      } catch (err) {
        errorToast(err.response.data.message);
      }

    },
    showModalApplication(id) {
      ApiService.getApplicationById(id)
        .then(() => {
          this.selectedApplicationId = id;
          this.showModal = true;
        })
        .catch((err) => {
          console.log(err);
        });

    },
    checkLogin() {
      const isLoggedIn = sessionStorage.getItem("isLoggedIn");
      if (isLoggedIn === null || isLoggedIn === "false") {
        this.$router.push("/login");
      }
    },
    formatTime(timeString) {
      const formattedTime = moment(timeString).format(' DD/MM/YYYY');
      return formattedTime;
    },
    async editContent(data) {
      try {
        sessionStorage.setItem('applicationDataEdit', JSON.stringify(data));
        await this.$router.push('/draft-application');
      } catch (err) {
        errorToast(err.response.data.message);
      }
    }
  },
  computed: {
    userId() {
      const user = JSON.parse(sessionStorage.getItem('user'));
      return user ? user.id : '';
    },
    filteredApplication() {
      let filteredArray = [];
      for (let i = 0; i < this.applications.length; i++) {
        if (this.applications[i].id === this.selectedApplicationId) {
          filteredArray.push(this.applications[i]);
        }
      }
      return filteredArray;
    },
    totalPages() {
      return Math.ceil(this.applications.length / this.pageSize);
    },
    paginatedItems() {
      const keys = Object.keys(this.applications); // Get the keys of the object
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      const paginatedKeys = keys.slice(startIndex, endIndex); // Get the keys for the current page
      return paginatedKeys.map(key => this.applications[key]); // Retrieve the corresponding items using the keys
    },
  },
  data() {
    return {
      applications: [],
      showModal: false,
      selectedApplicationId: null,
      currentPage: 1,     // Trang hiện tại
      pageSize: 10,
      loading: true,
    };
  },
  created() {
    ApiService.getApplication()
      .then((res) => {
        this.applications = res.data;
        // get application which sender is current user
        this.applications = this.applications.filter((application) => {
          return application.sender_id === this.userId && application.delete_by_sender === false && application.process_id === null;
        });
      })
      .catch((err) => {
        console.log(err);
      }).finally(() => {
        this.loading = false;
      });
  },
};
</script>
<style>
.center {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 50%;
}

.date-sign {
  margin-top: 20px;
  font-style: italic;
}

.full-name {
  margin-top: 20px;
  font-weight: bold;
}

.highlighted-text {
  color: red;
  font-weight: bold;
}

/*css loading api*/
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  color: white;
}
</style>
    