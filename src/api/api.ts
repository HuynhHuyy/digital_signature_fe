import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `${sessionStorage.getItem('jwt')}`,
    },
    withCredentials: true,
});
axiosClient.interceptors.request.use(
    (config) => {
        const jwt = sessionStorage.getItem('jwt');
        if (jwt) {
            config.headers['Authorization'] = jwt;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
class ApiService {
    static instance;

    static getInstance() {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }

    async addUser(data) {
        return await axiosClient.post('/add-user/', data);
    }

    async getUser() {
        return await axiosClient.get('/get-user/');
    }

    async deleteUser(id) {
        return await axiosClient.delete(`/delete-user/${id}/`);
    }

    async updateUser(id, data) {
        return await axiosClient.put(`/update-user/${id}/`, data);
    }

    async getUserById(id) {
        return await axiosClient.get(`/get-user/${id}`);
    }

    async login(data) {
        return await axiosClient.post('/login/', data);
    }

    async changePasswordFirstLogin(data) {
        return await axiosClient.post('/first-login/', data);
    }

    async resetPassword(id) {
        return await axiosClient.put(`/users/${id}/reset-password/`);
    }
    async changePasswordUser(data) {
        return await axiosClient.post('/change-password/', data);
    }

    async addReceiver(data) {
        return await axiosClient.post('/add-receiver/', data);
    }
    // search trong db
    async searchApplication(data) {
        return await axiosClient.get(`/search/?search=${data}`);
    }

    // role management
    async addRole(data) {
        return await axiosClient.post('/add-role/', data);
    }

    async getRole() {
        return await axiosClient.get('/get-role/');
    }

    async deleteRole(id) {
        return await axiosClient.delete(`/delete-role/${id}/`);
    }

    async updateRole(id, data) {
        return await axiosClient.put(`/update-role/${id}/`, data);
    }
    //department management
    async addDepartment(data) {
        return await axiosClient.post('/add-department/', data);
    }

    async getDepartment() {
        return await axiosClient.get('/get-department/');
    }

    async deleteDepartment(id) {
        return await axiosClient.delete(`/delete-department/${id}/`);
    }

    async updateDepartment(id, data) {
        return await axiosClient.put(`/update-department/${id}/`, data);
    }
    // admin management
    async logout() {
        return await axiosClient.post('/logout/');
    }
    async adminLogin(data) {
        return await axiosClient.post('/admin-login/', data);
    }
    async getProcess() {
        return await axiosClient.get('/processes/');
    }
    async createProcess(data) {
        return await axiosClient.post('/process/create/', data);
    }
    async updateProcess(id, data) {
        return await axiosClient.put(`/processes/${id}/`, data);
    }
    async deleteProcess(id) {
        return await axiosClient.delete(`/delete-process/${id}/`);
    }
    async getProcessDetailById(id) {
        return await axiosClient.get(`/process/${id}/`);
    }
    async updateStep(id, data) {
        return await axiosClient.put(`/steps/${id}/`, data);
    }
    async deleteStep(id) {
        return await axiosClient.delete(`/delete-step/${id}/`);
    }
    async getStep(id) {
        return await axiosClient.get(`/step-info/${id}/`);
    }
    async getAllStep() {
        return await axiosClient.get('/steps-list/');
    }
    async createStep(data) {
        return await axiosClient.post('/step/create/', data);
    }
    async changePasswordAdmin(data) {
        return await axiosClient.post('/admin-change-password/', data);
    }
    // application management
    async addApplication(data) {
        return await axiosClient.post(`/add-application/`, data);
    }
    async deleteApplication(id) {
        return await axiosClient.put(`/delete-application/${id}/`);
    }
    async getApplication() {
        return await axiosClient.get(`/get-application/`);
    }
    async getPublicApplication() {
        return await axiosClient.get(`/get-public-application/`);
    }
    async publicApplication(id) {
        return await axiosClient.put(`/public-application/${id}/`);
    }
    async unpublicApplication(id) {
        return await axiosClient.put(`/unpublic-application/${id}/`);
    }
    async getAllReceiveApplication() {
        return await axiosClient.get('/get-application-receiver/');
    }
    async getSenderApplication() {
        return await axiosClient.get('/get-application-sender/');
    }
    async updateApplication(id, data) {
        return await axiosClient.put(`/update-receiver/${id}/`, data);
    }
    async updateApplicationSender(id, data) {
        return await axiosClient.put(`/update-sender/${id}/`, data);
    }
    async updateStatusApplication(id, data) {
        return await axiosClient.put(`/update-status-receiver/${id}/`, data);
    }
    async countApplicationReceiver() {
        return await axiosClient.get('/count-application-receiver/');
    }
    async getReceiveIdByAppicationId(id) {
        return await axiosClient.get(`/get-receiveid-by-applicationid/${id}/`);
    }
    async getReceiveByAppicationId(id) {
        return await axiosClient.get(`/get-receive-by-applicationid/${id}/`);
    }
    async getApplicationById(id) {
        return await axiosClient.get(`/get-application-by-id/${id}/`);
    }
    async getStatusByApplicationIdReceiveId(data) {
        return await axiosClient.post(`/get-status-by-application-receive/`, data);
    }
    //signature management
    async getAllSign() {
        return await axiosClient.get('/get-signature/');
    }
    async addSignature(data) {
        return await axiosClient.post('/add-signature/', data);
    }
    async deleteSignature(id) {
        return await axiosClient.delete(`/delete-signature/${id}/`);
    }
    // file
    async addFile(data) {
        return await axiosClient.post('/upload-file/', data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    }
    async convertFile(data) {
        return await axiosClient.post('/convert-to-text/', data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    }
    async validateDocument(data) {
        return await axiosClient.post('/validate-pdf-signature', data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    }
    async signDocument(id, data) {
        return await axiosClient.post(`/sign-pdf/${id}/`, data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
    }
}

export default ApiService.getInstance();
