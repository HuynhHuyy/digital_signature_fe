<template>
  <div class="container">
    <h3 class="p-3 text-center">Process Management</h3>
    <button class="btn btn-success mb-3" @click="showModalAddProcess">
      Add Process
    </button>
    <table class="table table-striped table-bordered">
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="process in processes" :key="process.id">
          <tr>
            <td>{{ process.name }}</td>
            <td>{{ process.description }}</td>
            <td>
              <button class="btn btn-primary m-1" @click="showModalUpdateProcess(process.id)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-success m-1" @click="showModalAddStep(process.id)">
                <i class="bi bi-plus-square"></i>
              </button>
              <button class="btn btn-info" type="button" @click="toggleCollapse(process.id)"
                :aria-expanded="isExpanded(process.id)" :aria-controls="collapseId(process.id)">
                <i class="bi bi-arrow-down-circle"></i>
              </button>
              <button class="btn btn-danger m-1" @click="showModalProcessDelete(process.id)">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
          <tr v-if="isExpanded(process.id)">
            <td colspan="2">
              <div :id="collapseId(process.id)">
                <div class="card card-body">
                  <div class="row">
                    <div class="col-md-2">
                      <h6>Step Name</h6>
                    </div>
                    <div class="col-md-3">
                      <h6>Approved By</h6>
                    </div>
                    <div class="col-md-2">
                      <h6>Role</h6>
                    </div>
                    <div class="col-md-2">
                      <h6>Department</h6>
                    </div>
                  </div>
                  <div class="row" v-for="step in getStepsByProcessId(process.id)" :key="step.process_id">
                    <div class="col-md-2">
                      {{ step.name }}
                    </div>
                    <div class="col-md-3">{{ step.user.full_name }}</div>

                    <div class="col-md-2">{{ step.role.name }}</div>

                    <div class="col-md-2">{{ step.user.department_name }}</div>
                    <div class="col-md-2">
                      <button class="btn btn-primary m-1" @click="showModalUpdateStep(step.id)">
                        <i class="fas fa-edit"> </i>
                      </button>
                      <button class="btn btn-danger m-1" @click="showModalDeleteStep(step.id)">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <!-- Modal Create Process -->
    <div class="modal" tabindex="-1" role="dialog" :class="['overlay', { 'show': showAddProcess }]">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <!-- Nội dung của modal -->
          <div class="modal-header">
            <h5 class="modal-title">Create Process</h5>
            <button type="button" class="btn close" @click="closeModalAddProcess">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="name">Name</label>
              <input type="text" class="form-control" id="name" v-model="name" required />

              <label for="usedescriptionrname">Description</label>
              <input type="text" class="form-control" id="description" v-model="description" required />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModalAddProcess">
                Close
              </button>
              <button type="button" class="btn btn-primary" @click="addProcess()">
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal Update Process -->
    <div class="modal" tabindex="-1" role="dialog" :class="['overlay', { 'show': showEditProcess }]"
      v-for="process in filteredProcesses" :key="process.id">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <!-- Nội dung của modal -->
          <div class="modal-header">
            <h5 class="modal-title">Update Process</h5>
            <button type="button" class="btn close" @click="closeModalUpdateProcess">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="name">Name</label>
              <input type="text" class="form-control" id="name" v-model="process.name" required />

              <label for="description">Description</label>
              <input type="text" class="form-control" id="description" v-model="process.description" required />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModalUpdateProcess">
                Close
              </button>
              <button type="button" class="btn btn-primary" @click="editProcess(selectedProcessId)">
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal Delete Process -->
    <div class="modal" tabindex="-1" role="dialog" :class="['overlay', { 'show': showModalProcess }]">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <!-- Nội dung của modal -->
          <div class="modal-header">
            <h5 class="modal-title">Delete Process</h5>
            <button type="button" class="btn close" @click="closeModalProcess">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>Are you sure to delete this Process ?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModalProcess">
              Close
            </button>
            <button type="button" class="btn btn-danger" @click="deleteProcessModal(selectedProcessId)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal Create Step -->
    <div class="modal" tabindex="-1" role="dialog" :class="['overlay', { 'show': showAddStep }]"
      v-for="process in filteredProcesses" :key="process.id">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <!-- Nội dung của modal -->
          <div class="modal-header">
            <h5 class="modal-title">Create Step</h5>
            <button type="button" class="btn close" @click="closeModalAddStep">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">


              <label for="process">Process</label>
              <input type="text" class="form-control" id="process" v-model="process.name" readonly />

              <label for="name">Step Name</label>
              <input type="text" class="form-control" id="name" v-model="step_name" required />

              <label for="department">Department</label>
              <select class="form-control" id="department_id" v-model="department_id">
                <option v-for="department in departments" :key="department.id" :value="department.id">
                  {{ department.name }}
                </option>
              </select>

              <label for="role">Role</label>
              <select class="form-control" id="role_id" v-model="role_id" required>
                <option v-for="role in departmentRoles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </option>
              </select>

              <label for="username">Full name</label>
              <select class="form-control" id="user_id" v-model="user_id">
                <option v-for="user in roleUsers" :key="user.id" :value="user.id">
                  {{ user.full_name }}
                </option>
              </select>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModalAddStep">
                Close
              </button>
              <button type="button" class="btn btn-primary" @click="addStep()">
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal Update Step -->
    <div class="modal" tabindex="-1" role="dialog" :class="['overlay', { 'show': showEditStep }]"
      v-for="step in filteredSteps" :key="step.id">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <!-- Nội dung của modal -->
          <div class="modal-header">
            <h5 class="modal-title">Update Step</h5>
            <button type="button" class="btn close" @click="closeModalUpdateStep">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="process">Process</label>
              <input type="text" class="form-control" id="process" v-model="step.process.name" readonly />
              <label for="name">Step Name</label>
              <input type="text" class="form-control" id="name" v-model="step.name" required />

              <label for="department">Department</label>
              <select class="form-control" id="department_id" v-model="step.department_id">
                <option v-for="department in departments" :key="department.id" :value="department.id">
                  {{ department.name }}
                </option>
              </select>

              <label for="role">Role</label>
              <select class="form-control" id="role_id" v-model="step.role_id" required>
                <option v-for="role in filteredRolesByDepartment(step.department_id)" :key="role.id" :value="role.id">
                  {{ role.name }}
                </option>
              </select>

              <label for="username">Approved By</label>
              <select class="form-control" id="user_id" v-model="step.user_id">
                <option v-for="user in filteredUsersByRole(step.role_id)" :key="user.id" :value="user.id">
                  {{ user.full_name }}
                </option>
              </select>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModalUpdateStep">
                Close
              </button>
              <button type="button" class="btn btn-primary" @click="editStep(selectedStepId)">
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal Delete Step-->
    <div class="modal" tabindex="-1" role="dialog" :class="['overlay', { 'show': showModalStep }]">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <!-- Nội dung của modal -->
          <div class="modal-header">
            <h5 class="modal-title">Delete Step</h5>
            <button type="button" class="btn close" @click="closeModalStep">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>Are you sure to delete this Step ?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModalStep">
              Close
            </button>
            <button type="button" class="btn btn-danger" @click="deleteStepModal(selectedStepId)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ApiService from "@/api/api.ts";
import { successToast, errorToast } from "@/utils/toast.js";

export default {
  created() {
    this.processes = ApiService.getProcess()
      .then((res) => {
        this.processes = res.data;
      })
      .catch((err) => {
        console.log(err);
      });
    this.steps = ApiService.getAllStep()
      .then((res) => {
        this.steps = res.data;
      })
      .catch((err) => {
        console.log(err);
      });
    this.departments = ApiService.getDepartment()
      .then((res) => {
        this.departments = res.data;
      })
      .catch((err) => {
        console.log(err);
      });
    this.roles = ApiService.getRole()
      .then((res) => {
        this.roles = res.data;
      })
      .catch((err) => {
        console.log(err);
      });
    this.users = ApiService.getUser()
      .then((res) => {
        this.users = res.data;
      })
      .catch((err) => {
        console.log(err);
      });
  },

  data() {
    return {
      expandedIds: [],
      processes: [],
      steps: [],
      users: [],
      roles: [],
      departments: [],
      showEditProcess: false,
      showEditStep: false,
      showAddProcess: false,
      showModalProcess: false,
      showAddStep: false,
      showModalStep: false,
      selectedProcessId: null,
      selectedStepId: null,
      department_id: null,
      role_id: null,
      user_id: null,
      name: null,
      description: null,
      step_name: null,
    };
  },

  methods: {
    showModalAddProcess() {
      this.showAddProcess = true;
    },
    closeModalAddProcess() {
      this.showAddProcess = false;
    },
    showModalUpdateProcess(id) {
      this.showEditProcess = true;
      this.selectedProcessId = id;
    },
    closeModalUpdateProcess() {
      this.showEditProcess = false;
    },

    showModalProcessDelete(id) {
      this.showModalProcess = true;
      this.selectedProcessId = id;
    },
    closeModalProcess() {
      this.showModalProcess = false;
    },

    showModalAddStep(id) {
      this.showAddStep = true;
      this.selectedProcessId = id;
    },
    closeModalAddStep() {
      this.showAddStep = false;
    },

    showModalUpdateStep(id) {
      this.showEditStep = true;
      this.selectedStepId = id;
      const selectStep = this.steps.find((step) => step.id === id);
      this.department_id = selectStep.department_id;
    },
    closeModalUpdateStep() {
      this.showEditStep = false;
    },
    showModalDeleteStep(id) {
      this.showModalStep = true;
      this.selectedStepId = id;
    },
    closeModalStep() {
      this.showModalStep = false;
    },
    getStepsByProcessId(processId) {
      return this.steps.filter((step) => step.process_id === processId);
    },

    filteredRolesByDepartment(departmentId) {
      let filteredArray = [];
      for (let i = 0; i < this.roles.length; i++) {
        if (this.roles[i].department_id === departmentId) {
          filteredArray.push(this.roles[i]);
        }
      }
      return filteredArray;
    },
    filteredUsersByRole(roleId) {
      let filteredArray = [];
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].role_id === roleId && this.users[i].department_id === this.department_id) {
          filteredArray.push(this.users[i]);
        }
      }
      return filteredArray;
    },
    addProcess() {
      const processData = {
        name: this.name,
        description: this.description,
      };
      ApiService.createProcess(processData)
        .then(() => {
          ApiService.getProcess()
            .then((res) => {
              this.processes = res.data;
            })
            .catch((err) => {
              console.log(err);
            });

          this.showAddProcess = false;
          successToast("Create process successfully");
          this.name = "";
          this.description = "";

        })
        .catch(() => {
          errorToast("Create process failed");
        });
    },
    editProcess(id) {
      const get_process = this.processes.find((process) => process.id === id);
      const processUpdateData = {
        name: get_process.name,
        description: get_process.description,
      };
      ApiService.updateProcess(get_process.id, processUpdateData)
        .then(() => {
          ApiService.getProcess()
            .then((res) => {
              this.processes = res.data;
            })
            .catch((err) => {
              console.log(err);
            });

          this.showEditProcess = false;
          successToast("Update process successfully");
        })
        .catch(() => {
          errorToast("Update process failed");
        });
    },
    deleteProcessModal(id) {
      ApiService.deleteProcess(id)
        .then(() => {
          ApiService.getProcess()
            .then((res) => {
              this.processes = res.data;
            })
            .catch((err) => {
              console.log(err);
            });

          this.showModalProcess = false;
          successToast("Delete process successfully");
        })
        .catch(() => {
          errorToast("Delete process failed");
        });
    },

    editStep(id) {
      const get_step = this.steps.find((step) => step.id === id);
      const stepUpdateData = {
        name: get_step.name,
        process_id: get_step.process_id,
        department_id: get_step.department_id,
        role_id: get_step.role_id,
        user_id: get_step.user_id,
      };
      ApiService.updateStep(get_step.id, stepUpdateData)
        .then(() => {
          ApiService.getAllStep()
            .then((res) => {
              this.steps = res.data;
            })
            .catch((err) => {
              console.log(err);
            });

          this.showEditStep = false;
          successToast("Update step successfully");
        })
        .catch(() => {
          errorToast("Update step failed");
        });
    },
    deleteStepModal(id) {
      ApiService.deleteStep(id)
        .then(() => {
          ApiService.getAllStep()
            .then((res) => {
              this.steps = res.data;
            })
            .catch((err) => {
              console.log(err);
            });

          this.showModalStep = false;
          successToast("Delete step successfully");
        })
        .catch(() => {
          errorToast("Delete step failed");
        });
    },
    toggleCollapse(id) {
      if (this.isExpanded(id)) {
        this.expandedIds = this.expandedIds.filter(
          (expandedId) => expandedId !== id
        );
      } else {
        this.expandedIds.push(id);
      }
    },
    isExpanded(id) {
      return this.expandedIds.includes(id);
    },
    collapseId(id) {
      return `collapseExample${id}`;
    },
    addStep() {
      const stepData = {
        name: this.step_name,
        process_id: this.selectedProcessId,
        department_id: this.department_id,
        role_id: this.role_id,
        user_id: this.user_id,
      };

      ApiService.createStep(stepData)
        .then(() => {
          ApiService.getAllStep()
            .then((res) => {
              this.steps = res.data;
            })
            .catch((err) => {
              console.log(err);
            });

          this.showAddStep = false;
          successToast("Create step successfully");
          this.step_name = "";
          this.department_id = null;
          this.role_id = null;
          this.user_id = null;
        })
        .catch(() => {
          errorToast("Create step failed");
        });
    },
  },
  computed: {
    filteredProcesses() {
      let filteredArray = [];
      for (let i = 0; i < this.processes.length; i++) {
        if (this.processes[i].id === this.selectedProcessId) {
          filteredArray.push(this.processes[i]);
        }
      }

      return filteredArray;
    },
    filteredSteps() {
      let filteredArray = [];
      for (let i = 0; i < this.steps.length; i++) {
        if (this.steps[i].id === this.selectedStepId) {
          filteredArray.push(this.steps[i]);
        }
      }
      return filteredArray;
    },
    departmentRoles() {
      return this.filteredRolesByDepartment(this.department_id);
    },
    roleUsers() {
      return this.filteredUsersByRole(this.role_id);
    },

    collapseClasses() {
      return {
        collapse: true,
        show: this.isExpanded,
      };
    },
  },
};
</script>

