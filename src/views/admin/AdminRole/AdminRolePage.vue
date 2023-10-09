<template>
  <div class="container">
    <h3 class="p-3 text-center">Role Management</h3>
    <button class="btn btn-success mb-3" @click="showModalMethod('add')">
      Add Role
    </button>
    <table class="table table-striped table-bordered">
      <!-- Table content here -->
      <thead>
        <tr>
          <th scope="col">Role ID</th>
          <th scope="col">Role Name</th>
          <th scope="col">Department</th>
          <th scope="col">Description</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="role in paginatedItems" :key="role.id">
          <td>{{ role.id }}</td>
          <td>{{ role.name }}</td>
          <td>{{ role.department_name }}</td>
          <td>{{ role.description }}</td>
          <td>
            <button class="btn btn-primary m-1" @click="showModalMethod('update', role.id)">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger m-1" @click="showModalMethod('delete', role.id)">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="paginatedItems.length === 0" class="text-center">
      <h3 class="text-alert-noapplication">There is no role</h3>
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
          <h5 class="modal-title" v-if="modalAction === 'delete'">Delete Role</h5>
          <h5 class="modal-title" v-if="modalAction === 'update'">Update Role</h5>
          <h5 class="modal-title" v-if="modalAction === 'add'">Add Role</h5>
          <button type="button" class="btn close" @click="closeModal">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <!-- Delete -->
        <div class="modal-body" v-if="modalAction === 'delete'">
          <p>Are you sure to delete this role?</p>
        </div>
        <!-- Update -->
        <div class="modal-body" v-if="modalAction === 'update'">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" class="form-control" id="name" v-model="role.name" />
            <label for="description">Description</label>
            <input type="text" class="form-control" id="description" v-model="role.description" />
            <label for="department">Department</label>
            <select class="form-control" id="department" v-model="role.department_id">
              <option v-for="department in departments" :key="department.id" :value="department.id">
                {{ department.name }}
              </option>
            </select>
          </div>
        </div>
        <!-- Add -->
        <div class="modal-body" v-if="modalAction === 'add'">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" class="form-control" id="name" v-model="name" />
            <label for="description">Description</label>
            <input type="text" class="form-control" id="description" v-model="description" />
            <label for="department">Department</label>
            <select class="form-control" id="department" v-model="department_id">
              <option v-for="department in departments" :key="department.id" :value="department.id">
                {{ department.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            Close
          </button>
          <button type="button" class="btn btn-danger" v-if="modalAction === 'delete'"
            @click="deleteRoleModal(selectedRoleId)">
            Delete
          </button>
          <button type="button" class="btn btn-primary" v-if="modalAction === 'update'"
            @click="updateRoleModal(selectedRoleId)">
            Update
          </button>
          <button type="button" class="btn btn-primary" v-if="modalAction === 'add'" @click="createRole()">
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
  data() {
    return {
      roles: [], // Your role data
      showModal: false,
      modalAction: '', // 'delete', 'update', or 'add'
      selectedRoleId: null,
      departments: [], // Your department data
      role: {
        id: null,
        name: '',
        department_id: null,
        description: '',
      },
      name: '',
      department_id: null,
      description: '',
      currentPage: 1,
      pageSize: 10,
    };
  },
  methods: {
    //hàm show modal
    showModalMethod(action, roleId = null) {
      this.modalAction = action;
      this.showModal = true;

      if (roleId) {
        this.selectedRoleId = roleId;
        if (this.modalAction === 'update') {
          // If it's an update operation, find the role by ID and set its data to 'role'
          this.role = this.roles.find((role) => role.id === roleId);
        }
      } else {
        // Reset 'role' data for the add operation
        this.role = {
          id: null,
          name: '',
          department_id: null,
          description: '',
        };
      }
    },
    closeModal() {
      this.showModal = false;
      this.modalAction = '';
      this.selectedRoleId = null;
      // Reset 'role' data when closing the modal
      this.role = {
        id: null,
        name: '',
        department_id: null,
        description: '',
      };
      this.name = '';
      this.department_id = null;
      this.description = '';
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
    async createRole() {
      const newRoleData = {
        name: this.name,
        description: this.description,
        department_id: this.department_id,
      };

      try {
        await ApiService.addRole(newRoleData);

        const res = await ApiService.getRole();
        this.roles = res.data;

        this.showModal = false;
        successToast("Create role successfully");
      } catch (err) {
        console.log(err);
        errorToast(err.response.data.message);
      }
    },

    async deleteRoleModal(id) {
      try {
        await ApiService.deleteRole(id);

        const res = await ApiService.getRole();
        this.roles = res.data;

        this.showModal = false;
        successToast("Delete role successfully");
      } catch (err) {
        console.log(err);
        errorToast(err.response.data.message);
      }
    },

    async updateRoleModal(id) {
      const updateRoleData = {
        name: this.role.name,
        description: this.role.description,
        department_id: this.role.department_id,
      };

      try {
        await ApiService.updateRole(id, updateRoleData);

        const res = await ApiService.getRole();
        this.roles = res.data;

        this.showModal = false;
        successToast("Update role successfully");
      } catch (err) {
        console.log(err);
        errorToast(err.response.data.message);
      }
    }
  },
  computed: {
    paginatedItems() {
      const keys = Object.keys(this.roles); // Get the keys of the object
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      const paginatedKeys = keys.slice(startIndex, endIndex); // Get the keys for the current page
      return paginatedKeys.map(key => this.roles[key]); // Retrieve the corresponding items using the keys
    },
    totalPages() {
      return Math.ceil(this.roles.length / this.pageSize);
    },
  },
  async created() {
    try {
      const resRole = await ApiService.getRole();
      const resDepartment = await ApiService.getDepartment();
      
      this.roles = resRole.data;
      this.departments = resDepartment.data;
    } catch (err) {
      console.log(err);
    }
  },
};
</script>

