<template>
  <div class="container">
    <h3 class="p-3 text-center">Document Management</h3>
    <div class="input-group rounded mb-2">
      <input type="search" class="form-control rounded " placeholder="Search" aria-label="Search"
        aria-describedby="search-addon" v-model="searchText" @input="search_application" />
      <span class="input-group-text border-0" id="search-addon">
        <i class="fas fa-search"></i>
      </span>
    </div>
    <table v-if="showResults" class="table table-striped table-bordered">
      <thead>
        <tr class="text-center">
          <th>Title</th>
          <th>Content</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="result in formattedSearchResults" :key="result.id">
          <template v-if="applicationIds.includes(result.id)">
            <template v-if="sender_ids.includes(result.sender_id)">
              <template v-if="senderApplication.find(item => item.id === result.id)">
                <tr>
                  <td>
                    <div v-html="result.title"></div>
                  </td>
                  <td>
                    <div v-html="getHighlightedContent(result.pdf_content)"></div>
                  </td>
                  <td style="text-align: center">
                    <button class="btn btn-primary" @click="showModalApplication(result.id)">View Details</button>
                  </td>
                </tr>
              </template>
              <template v-else>
                <tr>
                  <td>
                    <div v-html="result.title"></div>
                  </td>
                  <td>
                    <div v-html="getHighlightedContent(result.pdf_content)"></div>
                  </td>
                  <td style="text-align: center">
                    <button class="btn btn-primary" @click="showModalReceiveApplication(result.id)">View Details</button>
                  </td>
                </tr>
              </template>
            </template>
          </template>
        </template>
      </tbody>
    </table>

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
        <tr v-for="application in paginatedItems" :key="application.id">
          <template v-if="isDataLoaded && senderApplication.find(item => item.id === application.id)">
            <td>{{ application.process_name }}</td>
            <td>{{ application.title }}</td>
            <td>{{ formatTime(application.created_at) }}</td>
            <td>
              <!-- if else -->
              <!-- 
                0 is not signed
                1 is in progress
                2 is finished
                3 is failed
              -->
              <span v-if="application.status === 1" class="badge bg-primary">In progress</span>
              <span v-else-if="application.status === 2" class="badge bg-success">Finished</span>
              <span v-else-if="application.status === 3" class="badge bg-danger">Failed</span>
              <span v-else class="badge bg-secondary">Not signed</span>
            </td>
            <td>
              <button class="btn btn-primary m-1" @click="showModalApplication(application.id)">
                <i class="fas fa-eye"></i>
              </button>
              <!-- if status is 4 then show button sign -->
              <button v-if="application.status === 4" class="btn btn-success m-1">
                <i class="fas fa-signature"></i>
              </button>
            </td>
          </template>
          <template v-else>
            <td>{{ application.process_name }}</td>
            <td>{{ application.title }}</td>
            <td>{{ formatTime(application.created_at) }}</td>
            <td>
              <span v-if="application.user_receiver[0].status === 1" class="badge bg-success">Signed</span>
              <span v-else-if="application.user_receiver[0].status === 2" class="badge bg-danger">Rejected</span>
              <span v-else class="badge bg-warning">Waiting</span>
            </td>
            <td>
              <button class="btn btn-primary m-1" @click="showModalReceiveApplication(application.id)">
                <i class="fas fa-eye"></i>
              </button>
            </td>
          </template>
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
            <div class="pdf-view">
              <iframe :src="application.content" width="100%" height="600px">
              </iframe>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div v-if="application.status == 2">
            <div v-if="application.is_public === 0">
              <button type="button" class="btn btn-primary" @click="publicApplication(application.id)">
                <i class="bi bi-share"></i>
              </button>
            </div>
            <div v-if="application.is_public === 1">
              <button type="button" class="btn btn-warning" @click="unpublicApplication(application.id)">
                <i class="bi bi-file-lock2"></i>
              </button>
            </div>
          </div>
          <a v-if="application.file_id != null" :href="application.content" class="btn btn-success m-1" target="_blank">
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
  <!-- Modal Receive Application -->
  <div class="modal" tabindex="-1" role="dialog" :class="['overlay', { 'show': showModalReceive }]"
    v-for="application in filteredReceiveApplication" :key="application.id">
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
          <button type="button" class="btn close" @click="closeModalReceive">
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

          <div v-for="receiver in application.user_receiver" :key="receiver.id">
            <div v-if="receiver.status == 0 && receiver.user_receiver_id == userId">
              <button type="button" class="btn btn-danger" @click="signApplication(receiver.id, 2)">
                Reject
              </button>
              <button class="btn btn-success m-1" @click="goToNextPage(application)">
                <i class="fas fa-signature"></i>
              </button>
            </div>
          </div>

          <!-- pdf button -->
          <a v-if="application.file_id != null" :href="application.content" class="btn btn-primary m-1" target="_blank">
            <i class="fas fa-file-pdf"></i>
          </a>
          <div>
            <button type="button" class="btn btn-secondary" @click="closeModalReceive">
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
  data() {
    return {
      applications: [],
      showModal: false,
      showModalReceive: false,
      selectedApplicationId: null,
      selectedReceiveApplicationId: null,
      searchText: "",
      searchResults: [],
      showResults: false,
      sender_ids: [],
      searchRegex: null,
      receiveAllApplication: [],
      senderApplication: [],
      isDataLoaded: false,
      currentPage: 1,     // Trang hiện tại
      pageSize: 10,      // Số lượng bản ghi trên mỗi trang
      loading: true,
      applicationIds: [],
    };
  },
  //hàm check login
  mounted() {
    this.checkLogin();
  },
  methods: {

    checkLogin() {
      const isLoggedIn = sessionStorage.getItem("isLoggedIn");
      if (isLoggedIn === null || isLoggedIn === "false") {
        this.$router.push("/login");
      }
    },
    formatTime(timeString) {
      const formattedTime = moment(timeString).format('DD/MM/YYYY');
      return formattedTime;
    },
    async goToNextPage(data) {
      this.$store.commit('setApplicationData', data);
      sessionStorage.setItem('applicationData', JSON.stringify(data));
      await this.$router.push('/application-view');
    },
    async search_application() {
      if (this.searchText) {
        try {
          const response = await ApiService.searchApplication(this.searchText);
          this.searchResults = response.data;
          this.searchRegex = new RegExp(this.searchText, 'gi'); // Cập nhật giá trị cho biến searchRegex
          this.searchResults = this.searchResults.filter(result => this.applicationIds.includes(result.id));
          this.showResults = true;
        } catch (error) {
          console.log(error);
        }
      } else {
        this.searchResults = [];
        this.showResults = false;
      }
    },

    getHighlightedContent(pdf_content) {
      const maxLength = 100;
      const startIndex = pdf_content.search(this.searchRegex); // Sử dụng biến searchRegex
      const plainText = pdf_content.replace(/<[^>]+>/g, '');

      if (startIndex !== -1) {
        const endIndex = Math.min(startIndex + maxLength, pdf_content.length);
        const matchedText = pdf_content.slice(startIndex, endIndex);

        const highlightedText = matchedText.replace(this.searchRegex, '<span class="highlighted-text">$&</span>');
        const displayedText = plainText.slice(0, startIndex) + highlightedText + plainText.slice(endIndex);

        return displayedText
      } else if (pdf_content.length > maxLength) {
        return plainText.slice(0, maxLength) + '...';
      }

      return plainText;
    },


    showModalApplication(id) {
      this.selectedApplicationId = id;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    showModalReceiveApplication(id) {
      this.selectedReceiveApplicationId = id;
      this.showModalReceive = true;
    },
    closeModalReceive() {
      this.showModalReceive = false;
    },
    signApplication(id, status) {
      ApiService.updateApplication(id, { status: status })
        .then((response) => {
          this.applications = this.applications.map((application) => {
            if (application.id === id) {
              application.status = response.data.status;
            }
            return application;
          });
        }).then(() => {
          ApiService.getApplication(this.userId)
            .then((res) => {
              this.applications = res.data;
              for (let i = 0; i < this.applications.length; i++) {
                if (!this.sender_ids.includes(this.applications[i].sender_id)) {
                  this.sender_ids.push(this.applications[i].sender_id);
                }
              }
            })
            .catch((err) => {
              console.log(err);
            });
          this.showModalReceive = false;
        })
        .catch((error) => {
          console.log(error);
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

    publicApplication(id) {
      ApiService.publicApplication(id)
        .then(() => {
          successToast("Public document successfully");
          this.closeModal();
          // cập nhật lại trạng thái
          ApiService.getApplication()
            .then((res) => {
              this.applications = res.data.filter(item => item.delete_by_sender === false || item.sender_id !== this.userId);
              for (let i = 0; i < this.applications.length; i++) {
                if (!this.sender_ids.includes(this.applications[i].sender_id)) {
                  this.sender_ids.push(this.applications[i].sender_id);
                }
              }
              this.applicationIds = this.applications.map((item) => item.id);
            })
            .catch((err) => {
              console.log(err);
            }).finally(() => {
              this.loading = false;
            });
        })
        .catch(() => {
          errorToast("Public document fail");
        });
    },
    unpublicApplication(id) {
      ApiService.unpublicApplication(id)
        .then(() => {
          successToast("Unpublic document successfully");
          this.closeModal();
          // cập nhật lại trạng thái
          ApiService.getApplication()
            .then((res) => {
              this.applications = res.data.filter(item => item.delete_by_sender === false || item.sender_id !== this.userId);
              for (let i = 0; i < this.applications.length; i++) {
                if (!this.sender_ids.includes(this.applications[i].sender_id)) {
                  this.sender_ids.push(this.applications[i].sender_id);
                }
              }
              this.applicationIds = this.applications.map((item) => item.id);
            })
            .catch((err) => {
              console.log(err);
            }).finally(() => {
              this.loading = false;
            });
        })
        .catch(() => {
          errorToast("Unpublic document fail");
        });
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
    formattedSearchResults() {
      if (this.searchText === '') {
        return this.searchResults;
      }

      const keywordRegex = new RegExp(this.searchText, 'gi');

      return this.searchResults.map(result => {
        let highlightedTitle = result.title;
        let highlightedContent = result.pdf_content;
        const titleMatches = result.title ? result.title.match(keywordRegex) : null;
        const contentMatches = result.pdf_content ? result.pdf_content.match(keywordRegex) : null;

        if (titleMatches && contentMatches) {
          highlightedTitle = highlightedTitle.replace(keywordRegex, '<span class="highlighted-text">$&</span>');
          highlightedContent = this.getHighlightedContent(highlightedContent);
        } else if (contentMatches) {
          highlightedTitle = result.title;
          highlightedContent = highlightedContent.replace(keywordRegex, '<span class="highlighted-text">$&</span>');
        } else if (titleMatches) {
          highlightedTitle = highlightedTitle.replace(keywordRegex, '<span class="highlighted-text">$&</span>');
        }

        return {
          ...result,
          title: highlightedTitle,
          pdf_content: highlightedContent
        };
      });
    },
    filteredReceiveApplication() {
      let filteredArray = [];
      for (let i = 0; i < this.applications.length; i++) {
        if (this.applications[i].id === this.selectedReceiveApplicationId) {
          filteredArray.push(this.applications[i]);
        }
      }
      return filteredArray;
    },
    totalPages() {
      return Math.ceil(this.applications.length / this.pageSize);
    },
    paginatedItems() {
      const keys = Object.keys(this.applications);
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      const paginatedKeys = keys.slice(startIndex, endIndex);
      const temp = paginatedKeys.map(key => this.applications[key]);
      return temp;
    },
  },
  created() {
    ApiService.getApplication()
      .then((res) => {
        this.applications = res.data.filter(item => (item.delete_by_sender === false && item.file_id != null) || (item.sender_id !== this.userId && item.file_id != null));
        for (let i = 0; i < this.applications.length; i++) {
          if (!this.sender_ids.includes(this.applications[i].sender_id)) {
            this.sender_ids.push(this.applications[i].sender_id);
          }
        }
        this.applicationIds = this.applications.map((item) => item.id);
      })
      .catch((err) => {
        console.log(err);
      }).finally(() => {
        this.loading = false;
      });

    ApiService.getSenderApplication()
      .then((res) => {
        this.senderApplication = res.data.filter(item => item.delete_by_sender === false || item.sender_id !== this.userId);
        this.isDataLoaded = true;
      })
      .catch((err) => {
        console.log(err);
      });
  },


};
</script>
<style>
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
  