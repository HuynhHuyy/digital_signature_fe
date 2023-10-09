<template>
  <div class="container">
    <div class="header">Draft Document</div>
    <div class="inputs">
      <label>Title</label>
      <input type="text" class="input" v-model="title" required />
      <div id="content-application">
        <TiptapEditor ref="editor" v-model="content" />
      </div>
      <button class="btn btn-success" @click="showModalProcess">Send</button>
    </div>
    <div v-if="isGeneratingPdf" class="loading-spinner-container">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i> Loading...
      </div>
    </div>
  </div>
  <!-- Modal Process-->
  <div class="modal" tabindex="-1" role="dialog" :class="['overlay', { 'show': showModal }]">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <!-- Nội dung của modal -->
        <div class="modal-header">
          <h5 class="modal-title">Select your process</h5>
          <button type="button" class="btn close" @click="closeModal">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <label for="name">Select process:</label>
          <select class="form-control" id="process" v-model="process_id" @change="updateApprovalBy">
            <option v-for="process in processes" :key="process.id" :value="process.id">
              {{ process.name }}
            </option>
          </select>
          <!-- Approval by -->
          <div class="form-group">
            <label for="process">Approval by</label>
            <input type="text" class="form-control" id="process" v-model="process_approved_by" disabled />

          </div>
        </div>
        <div class="modal-footer">
          <button class="sigin-btn" @click="addApplication">Submit</button>

          <button type="button" class="btn btn-secondary" @click="closeModal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import TiptapEditor from "@/components/Tiptap.vue";
import ApiService from "@/api/api.ts";
import { errorToast, successToast } from "@/utils/toast.js";
import html2pdf from 'html2pdf.js';
import { mapMutations } from 'vuex';
export default {
  name: "ApplicationFormPage",
  components: {
    TiptapEditor,
  },
  data() {
    return {
      application_id: JSON.parse(sessionStorage.getItem('applicationDataEdit')).id,
      process_id: "",
      process_name: '',
      process_description: '',
      process_approved_by: '',
      processDetails: {},
      tmp: [],
      idtemp: [],
      title: JSON.parse(sessionStorage.getItem('applicationDataEdit')).title,
      showModal: false,
      selectedProcess: null,
      fileId: null,

      processes: [],
      isGeneratingPdf: false,
      element: null,
      imgPromises: [],

      options: {
        margin: [10, 10, 10, 10], // Set the margins as needed
        filename: 'application', // Custom filename when downloaded
        image: {
          type: 'jpeg',
          quality: 1,
        }, // Optional: Specify image quality for better resolution
        html2canvas: { scale: 2 }, // Optional: Adjust scale for better resolution
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }, // Set the page format and orientation as needed
      },

    };
  },
  mounted() {
    this.element = document.getElementById('content-application-editor');
    const imgElements = this.element.getElementsByTagName('img');
    this.imgPromises = Array.from(imgElements).map(img => {
      if (img.src.startsWith('http://') || img.src.startsWith('https://')) {
        return new Promise((resolve, reject) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const imgObj = new Image();
          imgObj.crossOrigin = 'Anonymous';
          imgObj.onload = () => {
            canvas.width = imgObj.width;
            canvas.height = imgObj.height;
            ctx.drawImage(imgObj, 0, 0);
            img.src = canvas.toDataURL('image/jpeg');
            resolve();
          };
          imgObj.onerror = reject;
          imgObj.src = img.src;
        });
      } else {
        return Promise.resolve();
      }
    });

  },
  created() {
    this.fetchApplicationReceiverCount();
    ApiService.getProcess()
      .then((res) => {
        this.processes = res.data;
        if (this.processes.length > 0) {
          this.processes.forEach((process) => {
            this.loadProcessDetails(process.id);
          });
        }
      })
      .catch((err) => {
        console.log(err);
      }).finally(() => {
        this.loading = false;
      });
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

    loadProcessDetails(processId) {
      ApiService.getProcessDetailById(processId)
        .then((res) => {
          this.processDetails[processId] = res.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    updateApprovalBy() {
      if (this.process_id && this.processDetails[this.process_id]) {
        this.process_approved_by = this.processDetails[this.process_id].steps.map(step => step.user_full_name).join(', ');
      } else {
        this.approvalBy = '';
      }
    },
    showModalProcess() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.process_id = "";
      this.process_approved_by = "";
    },
    undo() {
      this.$refs.signaturePad.undoSignature();
    },
    async addApplication() {

      this.isGeneratingPdf = true;
      let contentData = this.$refs.editor.editor.getHTML();
      this.options.filename = this.title;
      this.showModal = false;

      // Sử dụng Promise để đảm bảo rằng tệp PDF đã được tạo trước khi thêm vào FormData
      const generatePdfPromise = new Promise((resolve) => {
        html2pdf()
          .set(this.options)
          .from(this.element)
          .toPdf()
          .outputPdf("blob")
          .then((pdf) => {
            const file = new File([pdf], "application.pdf", { type: "application/pdf" });
            const formData = new FormData();
            formData.append("file", file);
            resolve(formData);
          });
      });

      // Chờ tệp PDF được tạo xong
      const pdfAsString = await generatePdfPromise;

      await ApiService.addFile(pdfAsString)
        .then((response) => {
          contentData = response.data.urlFile;
          this.fileId = response.data.id;
        })
        .catch((error) => {
          console.log(error);
        });
      const applicationData = {
        title: this.title,
        content: contentData,
        process_id: this.process_id,
        file_id: this.fileId,
        pdf_content: this.$refs.editor.editor.getHTML().replace(/<img[^>]*>/g, ''),
      };
      if (applicationData.title == "" || applicationData.content == "<p></p>") {
        errorToast("Please enter title and content");
        return;
      }
      this.tmp = ApiService.getProcessDetailById(this.process_id)
        .then((res) => {
          this.tmp = res.data.steps;
          for (const element of this.tmp) {
            this.idtemp.push(element.user_id);
          }
        })
      ApiService.updateApplicationSender(this.application_id, applicationData)
        .then(() => {
          successToast("Add document successfully");
          this.idtemp.forEach(id => {
            const receiverData = {
              application_id: this.application_id,
              user_receiver_id: id,
            };
            console.log(receiverData);
            ApiService.addReceiver(receiverData)
              .then(() => {
                setTimeout(() => {
                  this.$router.replace({
                    name: "user-application-manager",
                  });
                  sessionStorage.removeItem('applicationDataEdit');
                }, 1000);
              })
              .catch(() => {
                errorToast("Error. Please try again");
              });
          });
        })
        .catch((error) => {
          console.log(error);
        });
      this.isGeneratingPdf = false;
    }

  },
  uploadFile(event) {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    ApiService.addFile(formData)
      .then((response) => {
        this.fileUrl = response.data.urlFile;
        this.file_id = response.data.id;
      })
      .catch((error) => {
        console.log(error);
      });
  },
};
</script>
<style scoped>
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

/* pdf */
.pdf-view {
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
}

.uploadFileBnt {
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
}

.modal {
  display: none;
}

.modal.show {
  display: block;
}

.signaturePad>img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.modal-body {
  max-height: 500px;
  overflow-y: auto;
  align-items: center;
}


/*css loading api*/
.loading-spinner-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  pointer-events: auto;
  /* Vô hiệu hóa các sự kiện chuột */
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  color: white;
}
</style>
  