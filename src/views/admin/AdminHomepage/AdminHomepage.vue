<template>
  <div class="container">
    <h3 class="p-3 text-center">User Management</h3>
    <button class="btn btn-success mb-3" @click="showModalMethod('add')">
      Add User
    </button>
    <table class="table table-striped table-bordered">
      <!-- Table content here -->
      <thead>
        <tr>
          <th scope="col">User ID</th>
          <th scope="col">Full Name</th>
          <th scope="col">Username</th>
          <th scope="col">Password Status</th>
          <th scope="col">Department</th>
          <th scope="col">Role</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in paginatedItems" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.full_name }}</td>
          <td>{{ user.username }}</td>
          <td v-if="user.password === user.username">
            <span class="badge bg-danger">Default user not change</span>
          </td>
          <td v-else>
            <span class="badge bg-primary">Hashed</span>
          </td>
          <td v-if="user.department_name">{{ user.department_name }}</td>
          <td v-else><span class="badge bg-danger">Empty</span></td>
          <td v-if="user.role_name">{{ user.role_name }}</td>
          <td v-else><span class="badge bg-danger">Empty</span></td>
          <td>
            <button class="btn btn-primary m-1" @click="showModalMethod('update', user.id)">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger m-1" @click="showModalMethod('delete', user.id)">
              <i class="fas fa-trash-alt"></i>
            </button>
            <button class="btn btn-danger m-1" @click="showModalMethod('reset', user.id)">
              <i class="fas fa-redo-alt"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="paginatedItems.length === 0" class="text-center">
      <h3 class="text-alert-noapplication">There is no user</h3>
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
          <h5 class="modal-title" v-if="modalAction === 'delete'">Delete User</h5>
          <h5 class="modal-title" v-else-if="modalAction === 'update'">Update User</h5>
          <h5 class="modal-title" v-else-if="modalAction === 'reset'">Reset Password User</h5>
          <h5 class="modal-title" v-else-if="modalAction === 'add'">Add User</h5>
          <button type="button" class="btn close" @click="closeModal">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body" v-if="modalAction === 'delete'">
          <p>Are you sure to delete this User?</p>
        </div>
        <div class="modal-body" v-else-if="modalAction === 'update'">
          <div class="form-group">
            <label for="full_name">Full Name</label>
            <input type="text" class="form-control" id="full_name" v-model="user.full_name" />

            <label for="username">Username</label>
            <input type="text" class="form-control" id="username" v-model="user.username" />

            <label for="department">Department</label>
            <select class="form-control" id="department" v-model="user.department_id">
              <option v-for="department in departments" :key="department.id" :value="department.id">
                {{ department.name }}
              </option>
            </select>

            <label for="role">Role</label>
            <select class="form-control" id="role" v-model="user.role_id">
              <option v-for="role in filteredRolesByDepartment(user.department_id)" :key="role.id" :value="role.id">
                {{ role.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-body" v-else-if="modalAction === 'reset'">
          <p>Are you sure to reset this User?</p>
        </div>
        <div class="modal-body" v-else-if="modalAction === 'add'">
          <div class="form-group">
            <label for="full_name">Full name</label>
            <input type="text" class="form-control" id="full_name" v-model="full_name" required />

            <label for="username">Username</label>
            <input type="text" class="form-control" id="username" v-model="username" required />

            <label for="department">Department</label>
            <select class="form-control" id="department_id" v-model="selectedDepartmentId">
              <option v-for="department in departments" :key="department.id" :value="department.id">
                {{ department.name }}
              </option>
            </select>

            <label for="role">Role</label>
            <select class="form-control" id="role_id" v-model="role_id">
              <option v-for="role in filteredRolesByDepartment(selectedDepartmentId)" :key="role.id" :value="role.id">
                {{ role.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            Close
          </button>
          <button type="button" class="btn btn-danger" v-if="modalAction === 'delete'"
            @click="deleteUser(selectedUserId)">
            Delete
          </button>
          <button type="button" class="btn btn-danger" v-if="modalAction === 'reset'"
            @click="resetPasswordUser(selectedUserId)">
            Reset
          </button>
          <button type="button" class="btn btn-primary" v-if="modalAction === 'update'"
            @click="updateUser(selectedUserId)">
            Update
          </button>
          <button type="button" class="btn btn-primary" v-if="modalAction === 'add'" @click="createUser()">
            Add
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
  mounted() {
    this.checkLogin();
  },
  data() {
    return {
      users: [], // Your user data
      showModal: false,
      modalAction: '', // 'delete', 'update', 'reset', or 'add'
      selectedUserId: null,
      user: {
        id: null,
        full_name: '',
        username: '',
        department_id: null,
        role_id: null,
      },
      full_name: '',
      username: '',
      selectedDepartmentId: null,
      role_id: null,
      departments: [], // Your department data
      roles: [], // Your role data
      currentPage: 1,
      pageSize: 10,
    };
  },
  methods: {
    checkLogin() {
      const adminIsLoggedIn = sessionStorage.getItem("adminIsLoggedIn");
      if (adminIsLoggedIn === null || adminIsLoggedIn === "false") {
        window.location.href = "/admin/login";
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
    validateUsername(username) {
      // Sử dụng biểu thức chính quy để kiểm tra xem username có chứa dấu không
      const regex = /^[A-Za-z0-9]+$/;
      return regex.test(username);
    },
    showModalMethod(action, userId = null) {
      this.modalAction = action;
      this.showModal = true;

      if (userId) {
        this.selectedUserId = userId;
        if (this.modalAction === 'update') {
          // If it's an update operation, find the user by ID and set its data to 'user'
          this.user = this.users.find((user) => user.id === userId);
        }
      } else {
        // Reset 'user' data for the add operation
        this.user = {
          id: null,
          full_name: '',
          username: '',
          department_id: null,
          role_id: null,
        };
      }
    },
    closeModal() {
      this.showModal = false;
      this.modalAction = '';
      this.selectedUserId = null;
      // Reset 'user' data when closing the modal
      this.user = {
        id: null,
        full_name: '',
        username: '',
        department_id: null,
        role_id: null,
      };
      this.full_name = '';
      this.username = '';
      this.selectedDepartmentId = null;
      this.role_id = null;
    },
    // Your delete, update, reset, and add user methods here
    async deleteUser(userId) {
      try {
        await ApiService.deleteUser(userId);
        successToast("Delete user successfully!");
        this.closeModal();
        const usersResponse = await ApiService.getUser();
        this.users = usersResponse.data;
      } catch (err) {
        errorToast("Delete user failed!");
        console.log(err);
      }
    },
    async updateUser(userId) {
      if (!this.user.full_name || !this.user.username || !this.user.department_id || !this.user.role_id) {
        errorToast("Please fill in all fields!");
        return;
      }
      if (!this.validateUsername(this.user.username)) {
        errorToast("Username must not contain special characters!");
        return;
      }
      try {
        await ApiService.updateUser(userId, this.user)
          .then((res) => {
            // console.log(res);
            successToast(res.data.message);

          })
          .catch((err) => {
            // console.log(err);
            errorToast(err.response.data.message);
          })
        // successToast("Update user successfully!");
        this.closeModal();
        const usersResponse = await ApiService.getUser();
        this.users = usersResponse.data;
      } catch (err) {
        errorToast(err.response.data.message);

        console.log(err);
      }
    },
    async resetPasswordUser(userId) {
      try {
        await ApiService.resetPassword(userId);
        successToast("Reset password user successfully!");
        this.closeModal();
        const usersResponse = await ApiService.getUser();
        this.users = usersResponse.data;
      } catch (err) {
        errorToast("Reset password user failed!");
        console.log(err);
      }
    },
    async createUser() {
      if (!this.full_name || !this.username || !this.selectedDepartmentId || !this.role_id) {
        errorToast("Please fill in all fields!");
        return;
      }
      if (!this.validateUsername(this.username)) {
        errorToast("Username must not contain special characters!");
        return;
      }
      const user = {
        full_name: this.full_name,
        username: this.username,
        department_id: this.selectedDepartmentId,
        role_id: this.role_id,
      };
      try {
        await ApiService.addUser(user);
        successToast("Add user successfully!");
        this.closeModal();
        const usersResponse = await ApiService.getUser();
        this.users = usersResponse.data;
      } catch (err) {
        errorToast("Add user failed!");
        console.log(err);
      }
    },

    filteredRolesByDepartment(departmentId) {
      return this.roles.filter((role) => role.department_id === departmentId);
    },
  },
  async created() {
    try {
      const usersResponse = await ApiService.getUser();
      const rolesResponse = await ApiService.getRole();
      const departmentsResponse = await ApiService.getDepartment();

      this.users = usersResponse.data;
      this.roles = rolesResponse.data;
      this.departments = departmentsResponse.data;
    } catch (err) {
      console.log(err);
    }
  },
  computed: {
    paginatedItems() {
      const keys = Object.keys(this.users); // Get the keys of the object
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      const paginatedKeys = keys.slice(startIndex, endIndex); // Get the keys for the current page
      return paginatedKeys.map(key => this.users[key]); // Retrieve the corresponding items using the keys
    },
    totalPages() {
      return Math.ceil(this.users.length / this.pageSize);
    },
  },
};
</script>
