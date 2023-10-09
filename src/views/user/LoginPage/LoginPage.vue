<template>
  <div class="login-container">
    <h3 class="login-header">Log in</h3>
    <Form ref="form" @submit="login" class="login-form" :validation-schema="schema" v-slot="{ errors }">
      <p class="signup-link">
        Need an account? <a href="/register">Sign up</a>
      </p>
      <div class="form-group">
        <label for="username" class="form-label">Username</label>
        <Field name="username" type="username" class="form-control form-input"
          :class="{ 'p-invalid': errors['username'] }" id="username" v-model="username" />
        <p v-if="errors['username']" class="p-error">
          {{ errorMessages.username }}
        </p>
      </div>
      <div class="form-group">
        <label for="password" class="form-label">Password</label>
        <div class="password-input">
          <Field name="password" type="password" class="form-control form-input" id="password" v-model="password" />
          <p v-if="errors['password']" class="p-error">
            {{ errorMessages.password }}
          </p>
        </div>
      </div>
      <button type="submit" class="btn btn-primary rounded-pill">Login</button>
      <div class="or-container">
        <div class="line-separator"></div>
        <div class="line-separator"></div>
      </div>
      <p class="forgot-password-link">
        Forgot your password? <a href="/forgot-password">Click here</a>
      </p>
    </Form>
  </div>
</template>

<script type="module">
import { Field, Form } from "vee-validate";
import * as yup from "yup";
import "vue3-toastify/dist/index.css";
import ApiService from "@/api/api.ts";
import { errorToast } from "@/utils/toast.js";

export default {
  components: {
    Field,
    Form,
  },
  data() {
    const schema = yup.object({
      username: yup.string().required("This field is required."),

      password: yup.string().required("This field is required."),
    });
    const errorMessages = {
      username: "This field is required.",
      password: "This field is required.",
    };

    return {
      schema,
      errorMessages,
      username: "",
      password: "",
    };
  },
  methods: {
    login() {
      this.$refs.form.validate().then((valid) => {
        if (valid) {
          // Tiến hành xử lý khi form hợp lệ
          const loginData = {
            username: this.username,
            password: this.password,
          };
          console.log(loginData);

          ApiService.login(loginData)
            .then((res) => {
              sessionStorage.setItem("isLoggedIn", "true");
              sessionStorage.setItem("user", JSON.stringify(res.data));
              sessionStorage.setItem("jwt", res.data.jwt);

              if (res.data.is_active === false) {
                this.$router.push("/first-login");
              }
              if (res.data.is_active === true) {
                window.location.href = "/public-application";
              }
            })
            .catch((err) => {
              console.log(err);
              errorToast(err.response.data.message);
            });
        }
      });
    },
  },
};
</script>
<style>
/* Define colors */
:root {
  --primary-color: #2e86c1;
  --danger-color: #dc3545;
  --gray-color: #f2f2f2;
}

/* Set base styles */
* {
  box-sizing: border-box;
  font-family: "Roboto", sans-serif;
}

body {
  margin: 0;
}

/* Style the container */
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: var(--gray-color);
}

/* Style the form */
.login-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Style the form header */
.login-header {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: bold;
}

/* Style the form input */
.form-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 1rem;
}

.form-label {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.signup-link {
  font-size: 0.8rem;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
  text-align: right;
  color: var(--primary-color);
  text-decoration: none;
}

.signup-link:hover {
  text-decoration: underline;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 3px;
  border: 1px solid #ccc;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  font-size: 0.8rem;
  padding: 0.2rem;
  background-color: transparent;
  border: none;
  cursor: pointer;
  outline: none;
  color: #333;
}

.password-toggle:hover {
  text-decoration: underline;
}

/* Style the error message */
.is-invalid {
  border-color: var(--danger-color) !important;
}

.invalid-feedback {
  font-size: 0.8rem;
  color: var(--danger-color);
}

.forgot-password-link {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
}

.forgot-password-link a {
  color: #333;
  text-decoration: underline;
}

.forgot-password-link a:hover {
  text-decoration: none;
}

.p-error {
  color: red;
}
</style>
