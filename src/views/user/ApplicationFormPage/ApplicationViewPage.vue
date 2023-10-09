<template>
  <div class="container">
    <div class="header">{{ applicationData.title }}</div>
    <!-- nội dung của application -->
    <div class="content border rounded-1 p-3">
      <div class="pdf-view">
        <iframe :src="applicationData.content" width="100%" height="800px">
        </iframe>
      </div>
    </div>
    <div class="inputs">
      <div class="pad-sign col-6">
        <div v-if="selectedSignatureData" class="signaturePad">
          <img :src="selectedSignatureData" alt="Signature" class="center" />
        </div>
        <div class="buttons">
          <button class="btn btn-primary" @click="signDoc">Sign this document</button>
          <button class="btn btn-success" @click="showModalSign">Your Signature</button>
          <button class="btn btn-info" @click="toggleFileInput">
            <i class="fa fa-upload"></i> Choose your private key and certificate
          </button>
        </div>

        <div v-if="showInput" class="input-container-select">
          <div>
            <label for="privatePemFileInput">Upload private.pem file:</label>
            <input id="privatePemFileInput" type="file" @change="handlePrivatePem" />
          </div>
          <div>
            <label for="certificatePemFileInput">Upload certificate.pem file:</label>
            <input id="certificatePemFileInput" type="file" @change="handleCertificatePem" />
          </div>
          <div>
            <button class="btn btn-primary" @click="SignPrivate">Sign with your private key and certificate</button>
          </div>
        </div>


      </div>
    </div>
  </div>
  <!-- Modal Signature-->
  <div class="modal" tabindex="-1" role="dialog" :class="['overlay', { 'show': showModal }]">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <!-- Nội dung của modal -->
        <div class="modal-header">
          <h5 class="modal-title">Select your signature</h5>
          <button type="button" class="btn close" @click="closeModal">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="signature">
            <img v-for="signature in signatures" :key="signature.id" :value="signature.signature"
              :src="signature.signature" alt="Signature" class="center" @click="selectSignature(signature.signature)" />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ApiService from "@/api/api.ts";
import {
  errorToast,
  //  successToast
} from "@/utils/toast.js";

export default {
  name: 'ApplicationView',
  data() {
    return {
      applicationData: JSON.parse(sessionStorage.getItem('applicationData')),
      signatures: [],
      selectedSignatureData: null,
      showModal: false,
      showInput: false,
      privatePemFile: null,
      certificatePemFile: null,
    };
  },
  created() {
    this.signatures = ApiService.getAllSign().then((res) => {
      this.signatures = res.data;
    });
  },
  methods: {
    toggleFileInput() {
      this.showInput = !this.showInput;
    },
    handlePrivatePem(event) {
      const file = event.target.files[0];
      if (file) {
        this.privatePemFile = file;
      }
    },
    handleCertificatePem(event) {
      const file = event.target.files[0];
      if (file) {
        this.certificatePemFile = file;
      }
    },
    async signDoc() {
      if (!this.selectedSignatureData) {
        errorToast("Please select your signature");
        return;
      }
      const file = await this.convertBase64ToPNG(this.selectedSignatureData);
      const formData = new FormData();
      formData.append("signature_img", file);
      await ApiService.signDocument(this.applicationData.id, formData);
      ApiService.updateApplication(this.applicationData.user_receiver[0].id, { status: 1 })
        .then(() => {
          sessionStorage.removeItem('applicationData');
          this.$router.push("/application-receiver-manager");
        })
        .catch((error) => {
          console.log(error);
        });
    },
    showModalSign() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    selectSignature(signature) {
      this.selectedSignatureData = signature
      this.showModal = false;
    },
    async convertBase64ToPNG(data) {
      const base64Response = await fetch(data);
      const blob = await base64Response.blob();
      const file = new File([blob], "signature.png", { type: "image/png" });
      return file;
    },
    async SignPrivate() {
      if (!this.privatePemFile || !this.certificatePemFile) {
        errorToast("Please select your private key and certificate");
        return;
      }
      if (!this.selectedSignatureData) {
        errorToast("Please select your signature");
        return;
      }
      const file = await this.convertBase64ToPNG(this.selectedSignatureData);
      const formData = new FormData();
      formData.append("signature_img", file);
      if (this.privatePemFile) {
        formData.append("private_key_file", this.privatePemFile);
      }

      if (this.certificatePemFile) {
        formData.append("certificate_file", this.certificatePemFile);
      }
      try {
        await ApiService.signDocument(this.applicationData.id, formData);
        ApiService.updateApplication(this.applicationData.user_receiver[0].id, { status: 1 })
          .then(() => {
            sessionStorage.removeItem('applicationData');
            this.$router.push("/application-receiver-manager");
          })
          .catch((error) => {
            console.log(error);
          });
      } catch (error) {
        console.log(error);
        errorToast("Please check your private key - certificate. Try again!");
      }
    }
  },

};
</script>
<style scoped>
.modal {
  display: none;
}

.modal.show {
  display: block;
}

.pad-sign {
  padding: 1.5rem;
}

.header {
  position: relative;
  background-clip: border-box;
  background-color: #1e88e5;
  background-image: linear-gradient(to top right, #1e88e5, #42a5f5);
  margin: 10px;
  border-radius: 0.75rem;
  overflow: hidden;
  color: #fff;
  box-shadow: 0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000,
    rgba(33, 150, 243, 0.4);
  height: 7rem;
  letter-spacing: 0;
  line-height: 1.375;
  font-weight: 600;
  font-size: 1.9rem;
  font-family: Roboto, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inputs {
  padding: 1.5rem;
  gap: 1rem;
  display: flex;
  flex-direction: column;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 200px;
  width: 100%;
  height: 2.75rem;
  position: relative;
}

.input {
  border: 1px solid rgba(128, 128, 128, 0.61);
  outline: 0;
  color: rgb(69 90 100);
  font-weight: 400;
  font-size: 0.9rem;
  line-height: 1.25rem;
  padding: 0.75rem;
  background-color: transparent;
  border-radius: 0.375rem;
  width: 100%;
  height: 100%;
}

.signaturePad>img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.input:focus {
  border: 1px solid #1e88e5;
}

.checkbox input {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.checkbox-text {
  cursor: pointer;
}

.sigin-btn {
  text-transform: uppercase;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1rem;
  text-align: center;
  padding: 0.75rem 1.5rem;
  background-color: #1e88e5;
  background-image: linear-gradient(to top right, #1e88e5, #42a5f5);
  border-radius: 0.5rem;
  width: 100%;
  outline: 0;
  border: 0;
  color: #fff;
}

.buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.signature {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.signature>img {
  width: 200px;
  height: 100px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.pdf-view {
  width: 100%;
  height: 100%;
}

.content {
  height: auto;
  margin-left: 50px;
  margin-right: 50px;
  overflow-y: auto;
}

img .center {
  display: block !important;
  margin-left: auto !important;
  margin-right: auto !important;
  width: 50% !important;
}


.input-container-select {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 20px;
}

.input-container-select label {
  margin-bottom: 10px;
  font-weight: bold;
}

.input-container-select input {
  margin-bottom: 10px;
}

.input-container-select button {
  margin-top: 10px;
}
</style>
  