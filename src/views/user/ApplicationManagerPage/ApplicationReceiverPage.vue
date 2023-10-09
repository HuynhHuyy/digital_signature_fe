<template>
  <div class="container">
    <h3 class="p-3 text-center">Document Receiver Management</h3>
    <table class="table table-striped table-bordered">
      <thead>
        <tr>
          <th>Process name</th>
          <th>Document name</th>
          <th>Date</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="application in filteredApplicationByStatus" :key="application.id">
          <td>{{ application.process_name }}</td>
          <td>{{ application.title }}</td>
          <td>{{ formatTime(application.user_receiver.created_at) }}</td>
          <td>
            <span v-if="application.user_receiver[0].status === 1" class="badge bg-success">Signed</span>
            <span v-else-if="application.user_receiver[0].status === 2" class="badge bg-danger">Rejected</span>
            <span v-else class="badge bg-warning">Not signed</span>
          </td>
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

    <div v-if="filteredApplicationByStatus.length === 0" class="text-center">
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
            <h5>Title: <span class="inline-title" id="titleApplication">{{ application.title }}</span></h5>
            <p class="text-header sender">From: {{ application.sender_name }}</p>
            <p class="text-header receiver">To:
              <span v-for="receiver in application.user_receiver" :key="receiver.id">{{ receiver.user_receiver_name }}
              </span>
            </p>
          </div>
          <button type="button" class="btn close" @click="closeModal">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div id="content-application">
            <div class="pdf-view">
              <iframe :src="application.content" width="100%" height="600px">
              </iframe>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <!-- reject button status = 2-->
          <div v-if="application.user_receiver[0].status != 1">
            <button type="button" class="btn btn-danger" @click="signApplication(application.user_receiver[0].id, 2)">
              Reject
            </button>
            <button class="btn btn-success m-1" @click="goToNextPage(application)">
              <i class="fas fa-signature"></i>
            </button>
          </div>
          <a v-if="application.file_id != null" :href="application.content" class="btn btn-primary m-1" target="_blank">
            <i class="fas fa-file-pdf"></i>
          </a>
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
import { mapMutations } from 'vuex';
import {
  // errorToast,
} from "@/utils/toast.js";
export default {
  //hàm check login
  mounted() {
    this.checkLogin();
  },
  methods: {
    ...mapMutations(['updateApplicationReceiverCount']),
    // hiển thị số lượng application receiver ngay khi bắt đầu
    fetchApplicationReceiverCount() {
      ApiService.countApplicationReceiver()
        .then((res) => {
          this.updateApplicationReceiverCount(res.data.count);
        })
        .catch((error) => {
          console.error(error);
        });
    },
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
    async goToNextPage(data) {
      this.$store.commit('setApplicationData', data);
      sessionStorage.setItem('applicationData', JSON.stringify(data));
      await this.$router.push('/application-view');
    },

    async signApplication(id, status) {
      try {
        const response = await ApiService.updateStatusApplication(id, { status: status });
        this.applications = this.applications.map((application) => {
          if (application.id === id) {
            application.status = response.data.status;
          }
          return application;
        });
        const res = await ApiService.getApplication();
        this.applications = res.data.filter((application) => {
          return application.user_receiver.some((receiver) => {
            return receiver.user_receiver_id === this.userId;
          });
        });
        this.applications = this.applications.map((application) => {
          application.user_receiver = application.user_receiver.filter(receiver => receiver.user_receiver_id === this.userId);
          return application;
        });
        const countRes = await ApiService.countApplicationReceiver();
        this.updateApplicationReceiverCount(countRes.data.count);
        this.closeModal();
      } catch (error) {
        console.error(error);
      }
    },
    showModalApplication(id) {
      this.selectedApplicationId = id;
      this.showModal = true;
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
    filteredApplicationByStatus() {
      let filteredArray = [];
      for (let i = 0; i < this.applications.length; i++) {
        if (this.applications[i].user_receiver[0].status === 0) {
          filteredArray.push(this.applications[i]);
        }
      }
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return filteredArray.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.filteredApplicationByStatus.length / this.pageSize);
    },
  },
  data() {
    return {
      applications: [],
      receivers: [],
      showModal: false,
      selectedApplicationId: null,
      showCollapse: false,
      currentPage: 1,
      pageSize: 10,
      loading: true,
    };
  },
  created() {
    this.fetchApplicationReceiverCount();

    ApiService.getApplication()
      .then((res) => {
        // Filter applications where receiver_id = user_id
        this.applications = res.data.filter((application) => {
          return application.user_receiver.some((receiver) => {
            return receiver.user_receiver_id === this.userId;
          });
        });
        // remove user_receiver which is not equal to user_id
        this.applications = this.applications.map((application) => {
          application.user_receiver = application.user_receiver.filter(receiver => receiver.user_receiver_id === this.userId);
          return application;
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
<style scoped>
.center {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 50%;
}

.full-name {
  margin-top: 20px;
  font-weight: bold;
}

.date-sign {
  margin-top: 20px;
  font-style: italic;
}

img .center {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 50%;
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