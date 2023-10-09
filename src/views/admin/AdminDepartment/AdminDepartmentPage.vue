<template>
  <div class="container">
    <h3 class="p-3 text-center">Department Management</h3>
    <button class="btn btn-success mb-3" @click="showModalMethod('add')">
      Add Department
    </button>
    <!-- Table and Department Data -->
    <table class="table table-bordered">
      <thead>
        <tr>
          <th scope="col">Department ID</th>
          <th scope="col">Department Name</th>
          <th scope="col">Description</th>
          <th scope="col">Total User</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="department in departments" :key="department.id">
          <td>{{ department.id }}</td>
          <td>{{ department.name }}</td>
          <td>{{ department.description }}</td>
          <td>{{ department.total_user }}</td>
          <td>
            <button class="btn btn-primary m-1" @click="showModalMethod('update', department.id)">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger m-1" @click="showModalMethod('delete', department.id)">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="paginatedItems.length === 0" class="text-center">
      <h3 class="text-alert-noapplication">There is no department</h3>
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

  <!-- Single Combined Modal -->
  <div class="modal" tabindex="-1" role="dialog" :class="['overlay', { 'show': showModal }]">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" v-if="modalAction === 'delete'">Delete Department</h5>
          <h5 class="modal-title" v-if="modalAction === 'update'">Update Department</h5>
          <h5 class="modal-title" v-if="modalAction === 'add'">Add Department</h5>
          <button type="button" class="btn close" @click="closeModal">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body" v-if="modalAction === 'delete'">
          <p>Are you sure to delete this department?</p>
        </div>
        <div class="modal-body" v-if="modalAction === 'update'">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" class="form-control" id="name" v-model="department.name" />
            <label for="description">Description</label>
            <input type="text" class="form-control" id="description" v-model="department.description" />
          </div>
        </div>
        <div class="modal-body" v-if="modalAction === 'add'">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" class="form-control" id="name" v-model="name" />

            <label for="desc">Description</label>
            <input type="text" class="form-control" id="desc" v-model="description" />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            Close
          </button>
          <button type="button" class="btn btn-danger" v-if="modalAction === 'delete'"
            @click="deleteDepartmentModal(selectedId)">
            Delete
          </button>
          <button type="button" class="btn btn-primary" v-if="modalAction === 'update'"
            @click="updateDepartmentModal(selectedId)">
            Update
          </button>
          <button type="button" class="btn btn-primary" v-if="modalAction === 'add'" @click="createDepartment()">
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ApiService from "@/api/api.ts";
import { errorToast, successToast } from "@/utils/toast.js";

export default {
  //hàm check login
  data() {
    return {
      departments: [], // Your department data
      showModal: false,
      modalAction: '', // 'delete', 'update', or 'add'
      selectedDepartmentId: null,
      department: {
        id: null,
        name: '',
        description: '',
        total_user: 0,
      },
      name: '',
      description: '',
      currentPage: 1,
      pageSize: 10,
    };
  },
  methods: {
    // Show the modal for a specific operation (delete, update, or add)
    showModalMethod(action, id = null) {
      this.modalAction = action;
      this.showModal = true;

      if (id) {
        this.selectedId = id;
        // If it's an update operation, find the department by ID and set its data to 'department'
        if (this.modalAction === 'update') {
          this.department = this.departments.find((department) => department.id === id);
        }
      } else {
        // Reset 'department' data for the add operation
        this.department = {
          id: null,
          name: '',
          description: '',
          total_user: 0,
        };
      }
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
      this.modalAction = '';
      this.selectedid = null;
      // Reset 'department' data when closing the modal
      this.department = {
        id: null,
        name: '',
        description: '',
        total_user: 0,
      };
      this.name = '';
      this.description = '';
    },
    // Your delete, update, and add department methods here
    async createDepartment() {
      const createDepartmentData = {
        name: this.name,
        description: this.description,
      };
      try {
        await ApiService.addDepartment(createDepartmentData);
        const res = await ApiService.getDepartment();
        this.departments = res.data;
        this.showModal = false;
        successToast("Add department successfully");
      } catch (err) {
        errorToast(err.response.data.message);
      }
    },
    async deleteDepartmentModal(id) {
      try {
        await ApiService.deleteDepartment(id);
        const res = await ApiService.getDepartment();
        this.departments = res.data;
        this.showModal = false;
        successToast("Delete department successfully");
      } catch (err) {
        errorToast('Delete department failed');
      }
    },
    async updateDepartmentModal(id) {
      let get_department;
      for (const department of this.departments) {
        if (department.id === id) {
          get_department = department;
          break;
        }
      }
      const updateDepartmentData = {
        name: this.department.name,
        description: this.department.description,
      };
      try {
        await ApiService.updateDepartment(get_department.id, updateDepartmentData);
        const res = await ApiService.getDepartment();
        this.departments = res.data;
        this.showModal = false;
        successToast("Update department successfully");
      } catch (err) {
        errorToast(err.response.data.message);
      }
    }
  },
  computed: {
    paginatedItems() {
      const keys = Object.keys(this.departments); // Get the keys of the object
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      const paginatedKeys = keys.slice(startIndex, endIndex); // Get the keys for the current page
      return paginatedKeys.map(key => this.departments[key]); // Retrieve the corresponding items using the keys
    },
    totalPages() {
      return Math.ceil(this.departments.length / this.pageSize);
    },
  },
  async created() {
    await ApiService.getDepartment()
      .then((res) => {
        this.departments = res.data;
      })
      .catch((err) => {
        console.log(err);
      });
  },
};
</script>

