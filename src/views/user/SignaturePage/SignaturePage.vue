<template>
    <div class="container">
        <h3 class="p-3 text-center">Signature Management</h3>
        <button class="btn btn-success mb-3" @click="showModalAddSign">
            Add Signature
        </button>
        <table class="table table-striped table-bordered">
            <thead>
                <tr>
                    <th>My Signature</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="signature in signatures" :key="signature.id">
                    <td>
                        <img :src="signature.signature" alt="Signature" class="center" />
                    </td>
                    <td>
                        <button class="btn btn-danger m-1" @click="showModalDeleteSign(signature.id)">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <div v-if="loading" class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i> Loading...
        </div>

        <!-- Modal Add Signature -->
        <div class="modal" tabindex="-1" role="dialog" :class="['overlay', { 'show': showAddSignature }]">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <!-- Nội dung của modal -->
                    <div class="modal-header">
                        <h5 class="modal-title">Create Signature</h5>
                        <button type="button" class="btn close" @click="closeModalAddSignature">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="pad-sign">
                            <div class="title">
                                <h3>Signature</h3>
                            </div>
                            <div class="signaturePad">
                                <VueSignaturePad width="100%" height="100%" ref="signaturePad"
                                    :options="signaturePadOptions" />
                            </div>
                            <div>
                                <button class="btn" @click="undo">Undo</button>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="closeModalAddSignature">
                                Close
                            </button>
                            <button type="button" class="btn btn-primary" @click="save">
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Modal Delete Signature -->
        <div class="modal" tabindex="-1" role="dialog" :class="['overlay', { 'show': showDeleteSignature }]">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <!-- Nội dung của modal -->
                    <div class="modal-header">
                        <h5 class="modal-title">Delete Signature</h5>
                        <button type="button" class="btn close" @click="closeModalDeleteSignature">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure to delete this Signature ?</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeModalDeleteSignature">
                            Close
                        </button>
                        <button type="button" class="btn btn-danger" @click="deleteSignature(selectedSignatureId)">
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
import { errorToast, successToast } from "@/utils/toast.js";

export default {
    mounted() {
        this.checkLogin();
    },
    created() {
        ApiService.getAllSign().then((res) => {
            this.signatures = res.data;
            console.log(this.signatures);
        }).catch((err) => {
            console.log(err);
        }).finally(() => {
            this.loading = false;
        });
        this.fetchSignatures();
    },
    data() {
        return {
            signatures: [],
            signature: "",
            selectedSignatureId: null,
            showAddSignature: false,
            showDeleteSignature: false,
            loading: true,
            signaturePadOptions: {
                onBegin: () => {
                    this.$refs.signaturePad.resizeCanvas();
                },
                penColor: "blue", // Set the pen color 
                minWidth: 10, // Set the minimum width of the stroke
            },
        };
    },
    methods: {
        checkLogin() {
            const isLoggedIn = sessionStorage.getItem("isLoggedIn");
            if (isLoggedIn === null || isLoggedIn === "false") {
                this.$router.push("/login");
            }
        },
        showModalAddSign() {
            this.showAddSignature = true;
        },
        closeModalAddSignature() {
            this.showAddSignature = false;
            this.$refs.signaturePad.clearSignature();
        },
        showModalDeleteSign(id) {
            this.selectedSignatureId = id;
            this.showDeleteSignature = true;
        },
        closeModalDeleteSignature() {
            this.showDeleteSignature = false;
        },
        undo() {
            this.$refs.signaturePad.undoSignature();
        },
        save() {
            const { isEmpty, data } = this.$refs.signaturePad.saveSignature();
            if (isEmpty) {
                alert("Please provide a signature first.");
            } else {
                ApiService.addSignature({ signature: data })
                    .then(() => {
                        successToast("Add signature successfully");
                        this.closeModalAddSignature();
                        this.fetchSignatures();
                        this.$refs.signaturePad.clearSignature();
                    }).catch((err) => {
                        errorToast(err.response.data.message);
                    })
            }
        }, fetchSignatures() {
            ApiService.getAllSign()
                .then((res) => {
                    this.signatures = res.data;
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        deleteSignature(id) {
            const signature = this.signatures.find((signature) => signature.id === id);
            ApiService.deleteSignature(signature.id)
                .then(() => {
                    this.signatures = this.signatures.filter((signature) => signature.id !== id);
                    this.showModal = false;
                    this.showDeleteSignature = false;
                    successToast("Delete signature successfully");
                })
                .catch((err) => {
                    errorToast(err.response.data.message);
                });
        },
    },
};
</script>
<style>
td>img {
    transform: scale(0.5);
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
}
</style>