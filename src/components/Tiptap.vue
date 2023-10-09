<template>
  <div v-if="editor">
    <button @click="editor.chain().focus().toggleBold().run()"
      :disabled="!editor.can().chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }">
      <i class="fas fa-bold"></i>
    </button>
    <button @click="editor.chain().focus().toggleItalic().run()"
      :disabled="!editor.can().chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }">
      <i class="fas fa-italic"></i>
    </button>
    <button @click="editor.chain().focus().toggleStrike().run()"
      :disabled="!editor.can().chain().focus().toggleStrike().run()" :class="{ 'is-active': editor.isActive('strike') }">
      <i class="fas fa-strikethrough"></i>
    </button>
    <button @click="editor.chain().focus().toggleCode().run()"
      :disabled="!editor.can().chain().focus().toggleCode().run()" :class="{ 'is-active': editor.isActive('code') }">
      <i class="fas fa-code"></i>
    </button>
    <button @click="editor.chain().focus().unsetAllMarks().run()">
      clear marks
    </button>
    <button @click="editor.chain().focus().clearNodes().run()">
      <i class="fas fa-eraser"></i>
    </button>
    <button @click="editor.chain().focus().setTextAlign('left').run()"
      :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }">
      <i class="fas fa-align-left"></i>
    </button>
    <button @click="editor.chain().focus().setTextAlign('center').run()"
      :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }">
      <i class="fas fa-align-center"></i>
    </button>
    <button @click="editor.chain().focus().setTextAlign('right').run()"
      :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }">
      <i class="fas fa-align-right"></i>
    </button>
    <button @click="editor.chain().focus().setTextAlign('justify').run()"
      :class="{ 'is-active': editor.isActive({ textAlign: 'justify' }) }">
      <i class="fas fa-align-justify"></i>
    </button>
    <button @click="editor.chain().focus().unsetTextAlign().run()">
      <i class="fas fa-align-left"></i>
    </button>
    <button @click="editor.chain().focus().setParagraph().run()" :class="{ 'is-active': editor.isActive('paragraph') }">
      <i class="fas fa-paragraph"></i>
    </button>
    <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
      h1
    </button>
    <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
      h2
    </button>
    <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }">
      h3
    </button>
    <button @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
      :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }">
      h4
    </button>
    <button @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
      :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }">
      h5
    </button>
    <button @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
      :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }">
      h6
    </button>
    <button @click="editor.chain().focus().toggleBulletList().run()"
      :class="{ 'is-active': editor.isActive('bulletList') }">
      <i class="fas fa-list-ul"></i>
    </button>
    <button @click="editor.chain().focus().toggleOrderedList().run()"
      :class="{ 'is-active': editor.isActive('orderedList') }">
      <i class="fas fa-list-ol"></i>
    </button>
    <button @click="editor.chain().focus().toggleCodeBlock().run()"
      :class="{ 'is-active': editor.isActive('codeBlock') }">
      <i class="fas fa-code"></i>
    </button>
    <button @click="editor.chain().focus().toggleBlockquote().run()"
      :class="{ 'is-active': editor.isActive('blockquote') }">
      <i class="fas fa-quote-right"></i>
    </button>
    <button @click="editor.chain().focus().setHorizontalRule().run()">
      <i class="fas fa-minus"></i>
    </button>
    <button @click="editor.chain().focus().setHardBreak().run()">
      <i class="fas fa-level-down-alt"></i>
    </button>
    <button @click="editor.chain().focus().undo().run()" :disabled="!editor.can().chain().focus().undo().run()">
      <i class="fas fa-undo"></i>
    </button>
    <button @click="editor.chain().focus().redo().run()" :disabled="!editor.can().chain().focus().redo().run()">
      <i class="fas fa-redo"></i>
    </button>
    <!-- insert images -->
    <button @click="showModalMethod('image')">
      <i class="fas fa-image"></i>
    </button>
    <!-- convert file to text -->
    <button @click="showModalMethod('file')">
      <i class="fas fa-file"></i>
    </button>
    <!-- table -->
    <button @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()">
      <i class="fas fa-table"></i>
    </button>
  </div>
  <div class="border border-dark rounded">
    <editor-content id="content-application-editor" :editor="editor" :style="{
    padding: '4px',
    minHeight: '500px',
  }" />
  </div>
  <div class="character-count" v-if="editor">
    {{ editor.storage.characterCount.words() }} words
  </div>
  <!-- Modal Picture -->
  <div class="modal" tabindex="-1" role="dialog" :class="['overlay', { 'show': showModal }]">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <!-- Nội dung của modal -->
        <div class="modal-header">
          <h5 class="modal-title" v-if="modalAction === 'image'" >Select your images</h5>
          <h5 class="modal-title" v-if="modalAction === 'file'" >Select your file</h5>
          <button type="button" class="btn close" @click="closeModal">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body" v-if="modalAction === 'image'">
          <div class="imageUpload">
            <img v-if="selectedImage" :src="selectedImage" alt="Selected Image" />
          </div>
        </div>
        <div class="modal-body" v-if="modalAction === 'file'">
          <div class="imageUpload">
            <img v-if="selectedFile" :src="selectedFile" alt="Selected File" />
          </div>
        </div>
        <div class="modal-footer">
          <form v-if="modalAction === 'image'">
            <label for="arquivo">Choose an image:</label>
            <input accept=".png, .jpg, .jpeg" class="inpdddut" name="arquivo" id="arquivo" type="file" ref="fileInput"
              :v-model="image" @change="handleImageChange" />
          </form>
          <form v-else-if="modalAction === 'file'">
            <label for="arquivo">Choose a file:</label>
            <input class="inpdddut" type="file" id="myFile" name="filename" accept=".pdf, .doc, .docx">
          </form>
          <button v-if="modalAction === 'image'" type="submit" class="btn btn-primary" @click="uploadImage">Upload</button>
          <button v-if="modalAction === 'file'" type="submit" class="btn btn-primary" @click="insertFile">Upload</button>
          <button type="button" class="btn btn-secondary" @click="closeModal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Gapcursor from '@tiptap/extension-gapcursor'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import { Editor, EditorContent } from '@tiptap/vue-3'
import CharacterCount from '@tiptap/extension-character-count'
import { errorToast, successToast } from "@/utils/toast.js";
import ApiService from "@/api/api.ts";

export default {
  name: 'TiptapEditor',
  components: {
    EditorContent,
  },
  data() {
    return {
      editor: null,
      selectedHeadingLevel: '1',
      showModal: false,
      images: '',
      selectedImage: null,
      selectedFile: null,
      modalAction: null,
      content: this.getDefaultContent(),
    }
  },
  methods: {
    showModalMethod(modalAction) {
      this.modalAction = modalAction;
      this.showModal = true;
      if(modalAction === 'image') {
        this.selectedImage = null;
      } else {
        this.selectedFile = null;
      }
    },
    closeModal() {
      this.showModal = false;
      this.selectedImage = null;
      this.selectedFile = null;
      this.modalAction = null;
    },
    async uploadImage() {
      const image = this.$refs.fileInput.files[0];
      // convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = () => {
        this.editor.chain().focus().setImage({ src: reader.result }).run();
      };
      reader.onerror = (error) => {
        console.log('Error: ', error);
      };
      try {
        this.$refs.fileInput.value = null;
        this.selectedImage = null;
        successToast("Upload image successfully");
        this.showModal = false;
      } catch (error) {
        errorToast("Upload image failed");
      }
    },
    async insertFile(){
      const file = document.getElementById("myFile").files[0];
      const formData = new FormData();
      formData.append("file", file);
      try {
        const responseHTML = await ApiService.convertFile(formData);
        this.editor.chain().focus().insertContent(responseHTML.data).run();
        successToast("Upload file successfully");
        this.closeModal();
      } catch (error) {
        errorToast("Upload file failed");
      }
    },
    handleImageChange(event) {
      const file = event.target.files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
          this.selectedImage = e.target.result;
        };

        reader.readAsDataURL(file);
      }
    },
    getDefaultContent() {
      if(JSON.parse(sessionStorage.getItem('applicationDataEdit'))) {
        return JSON.parse(sessionStorage.getItem('applicationDataEdit')).content;
      }
      return '';
    },
  },
  mounted() {
    this.editor = new Editor({
      content: this.content,
      extensions: [
        StarterKit,
        Document,
        Paragraph,
        Text,
        Heading,
        Image.configure({
          HTMLAttributes: {
            style: 'width: 400px;',
            class: 'center',
          },
        }),
        Gapcursor,
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        Placeholder.configure({
          placeholder: 'Write something …',
        }),
        CharacterCount.configure({
          limit: null,
        }),
      ],
    })
  },
  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>
  
<style>
button,
select {
  margin: 4px;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.ProseMirror-focused {
  outline: 0;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}

.ProseMirror img {
  max-width: 100%;
}

.tableWrapper table {
  table-layout: fixed !important;
  width: 100% !important;
  margin: 0 !important;
  overflow: hidden !important;
}

.tableWrapper td,
.tableWrapper th {
  min-width: 1em !important;
  border: 2px solid black !important;
  padding: 3px 5px !important;
  vertical-align: top !important;
  box-sizing: border-box !important;
  position: relative !important;
}


.selectedCell:after {
  z-index: 2 !important;
  position: absolute !important;
  content: "" !important;
  left: 0 !important;
  right: 0 !important;
  top: 0 !important;
  bottom: 0 !important;
  background: rgba(200, 200, 255, 0.4) !important;
  border: 2px solid black !important;
  pointer-events: none !important;
}

.column-resize-handle {
  position: absolute !important;
  right: -2px !important;
  top: 0 !important;
  bottom: -2px !important;
  width: 4px !important;
  background-color: #adf !important;
  pointer-events: none !important;
}

p {
  margin: 0 !important;
}


.resize-cursor {
  cursor: ew-resize;
  cursor: col-resize;
}

.is-active {
  background-color: #adf;
}

.character-count {
  margin-top: 8px;
  color: #ccc;
}

/* Modal */
.images {
  display: flex;
  flex-wrap: wrap;
  margin: -8px;
}

.images>img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin: 8px;
  border-radius: 4px;
  cursor: pointer;
}

.inpdddut[type="file"] {
  padding: 10px;
  margin-bottom: 20px;
  border: none;
  background-color: #79daeb;
  border-radius: 5px;
  width: 100%;
  cursor: pointer;
}

.inpdddut[type="submit"] {
  padding: 10px 20px;
  background-color: #008cba;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.inpdddut[type="submit"]:hover {
  background-color: #006f8f;
}

.imageUpload {
  display: flex;
  flex-wrap: wrap;
  margin: -8px;
  justify-content: center;
}

.imageUpload>img {
  width: 500px;
  object-fit: cover;
  margin: 8px;
  border-radius: 4px;
  cursor: pointer;
}
</style>