<template>
    <div class="container">
        <div class="card p-4 mt-5">
            <h3 class="text-center mb-4">Validate Document</h3>
            <div class="form-group">
                <label for="pdfFileInput" class="btn btn-primary btn-block">
                    Select PDF File
                </label>
                <input id="pdfFileInput" type="file" ref="pdfFileInput" class="d-none" @change="onFileSelected" />
            </div>
        </div>
        <div v-if="signatureData.length > 0" class="mt-4">
            <h4>Signature Information:</h4>
            <div v-for="(signature, index) in signatureData" :key="index" class="card p-4 mt-3">
                <h5>Signature {{ index + 1 }}</h5>
                <div>
                    <strong>Signed By:</strong> {{ signature.common_name }}
                </div>
                <div>
                    <strong>Signature:</strong> {{ signature.valid_signature ? `Signature is valid` : `Signature is
                    not valid` }}
                </div>
                <div>
                    <strong>PDF Integrity:</strong> {{ signature.pdf ? `PDF has not been modified this signature was
                    applied` : `ERROR!! PDF has been modified since this signature was applied` }}
                </div>
                <div>
                    <strong>Certificate:</strong> {{ signature.certificate ? `Certificate trusted` : `Certificate
                    untrusted`}}
                </div>

                <div>
                    <strong>Organization:</strong> {{ signature.organization }}
                </div>
                <div>
                    <strong>Country:</strong> {{ signature.country }}
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
            signatureData: [],
        };
    },
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
        async onFileSelected(event) {
            const pdf_file = event.target.files[0];
            const formData = new FormData();
            formData.append("pdf_file", pdf_file);

            if (pdf_file) {
                try {
                    const response = await ApiService.validateDocument(formData);
                    const allValid = response.data.every(item => item.pdf === true && item.valid_signature === true);
                    const hasInvalidSignature = response.data.some(item => item.valid_signature === false);
                    const hasCompromisedDocument = response.data.some(item => item.pdf === false);

                    if (allValid) {
                        successToast("Document validated successfully! All information is valid.");
                        this.resetFileInput();
                    } else if (hasInvalidSignature && hasCompromisedDocument) {
                        errorToast("Document and signature are compromised!");
                        this.resetFileInput();
                    }
                    else if (hasInvalidSignature) {
                        errorToast("Signature is compromised!");
                    } else if (hasCompromisedDocument) {
                        errorToast("Document is compromised!");
                        this.resetFileInput();
                    } else {
                        errorToast("Digital signature not found!");
                        this.resetFileInput();
                    }
                    this.signatureData = response.data;
                } catch (error) {
                    console.log(error.response);
                    errorToast("Validation failed! Digital signature not found!");
                    this.resetFileInput();
                }
            }
        },
        resetFileInput() {
            this.$refs.pdfFileInput.value = "";
        },
    },
};
</script>
  
<style scoped>
.card {
    max-width: 400px;
    margin: 0 auto;
}
</style>
  