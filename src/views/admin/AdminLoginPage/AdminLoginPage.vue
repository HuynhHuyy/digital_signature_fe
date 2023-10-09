<template>
  <div class="login-box">
    <p>Admin</p>
    <Form ref="form" class="login-form" :validation-schema="schema" v-slot="{ errors }">
      <div class="user-box">


        <Field name="username" type="username" class="form-control form-input"
          :class="{ 'p-invalid': errors['username'] }" id="username" v-model="username" @keyup.enter="admin_login" />
        <p v-if="errors['username']" class="p-error">
          {{ errorMessages.username }}
        </p>
        <label>Username</label>

      </div>
      <div class="user-box">
        <Field name="password" type="password" class="form-control form-input" id="password" v-model="password"
          @keyup.enter="admin_login" />
        <p v-if="errors['password']" class="p-error">
          {{ errorMessages.password }}
        </p>
        <label>Password</label>
      </div>
      <a href="#" @click="admin_login">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        Submit
      </a>
    </Form>
  </div>
</template>

<script type="module">
import { Field, Form } from "vee-validate";
import * as yup from "yup";
import "vue3-toastify/dist/index.css";
import ApiService from "@/api/api.ts";
import { errorToast } from "../../../utils/toast.js";

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
    admin_login() {
      const loginData = {
        username: this.username,
        password: this.password,
      };
      ApiService.adminLogin(loginData)
        .then((res) => {
          sessionStorage.setItem("adminIsLoggedIn", "true");
          sessionStorage.setItem("admin", JSON.stringify(res.data));

          sessionStorage.setItem("jwt", res.data.jwt);
          this.$router.push("/admin");
        })
        .catch((err) => {
          console.log(err);
          errorToast(err.response.data.message);
        });
    },
  },
};
</script>
<style>
.login-box {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 400px;
  padding: 40px;
  margin: 20px auto;
  transform: translate(-50%, -55%);
  background: linear-gradient(to right, #626467, #2c3e50);
  box-sizing: border-box;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.6);
  border-radius: 10px;
}

.login-box p:first-child {
  margin: 0 0 30px;
  padding: 0;
  color: #fff;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 1px;
}

.login-box .user-box {
  position: relative;
}

.login-box .user-box input {
  width: 100%;
  padding: 10px 0;
  font-size: 16px;
  color: #fff;
  margin-bottom: 30px;
  border: none;
  border-bottom: 1px solid #fff;
  outline: none;
  background: transparent;
}

.login-box .user-box label {
  position: absolute;
  top: 0;
  left: 0;
  padding: 10px 0;
  font-size: 16px;
  color: #fff;
  pointer-events: none;
  transition: 0.5s;
}

.login-box .user-box input:focus~label,
.login-box .user-box input:valid~label {
  top: -20px;
  left: 0;
  color: #fff;
  font-size: 12px;
  transform: translateY(-50%);
}

.login-box form a {
  position: relative;
  display: inline-block;
  padding: 10px 20px;
  font-weight: bold;
  color: #fff;
  font-size: 16px;
  text-decoration: none;
  text-transform: uppercase;
  overflow: hidden;
  transition: 0.5s;
  margin-top: 40px;
  letter-spacing: 3px;
}

.login-box .user-box .p-error {
  color: red;
  font-size: 12px;
  margin-bottom: 35px;
}

.login-box a:hover {
  background: #fff;
  color: #272727;
  border-radius: 5px;
}

.login-box a span {
  position: absolute;
  display: block;
}

.login-box a span:nth-child(1) {
  top: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #fff);
  animation: btn-anim1 1.5s linear infinite;
}

@keyframes btn-anim1 {
  0% {
    left: -100%;
  }

  50%,
  100% {
    left: 100%;
  }
}

.login-box a span:nth-child(2) {
  top: -100%;
  right: 0;
  width: 2px;
  height: 100%;
  background: linear-gradient(180deg, transparent, #fff);
  animation: btn-anim2 1.5s linear infinite;
  animation-delay: 0.375s;
}

@keyframes btn-anim2 {
  0% {
    top: -100%;
  }

  50%,
  100% {
    top: 100%;
  }
}

.login-box a span:nth-child(3) {
  bottom: 0;
  right: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(270deg, transparent, #fff);
  animation: btn-anim3 1.5s linear infinite;
  animation-delay: 0.75s;
}

@keyframes btn-anim3 {
  0% {
    right: -100%;
  }

  50%,
  100% {
    right: 100%;
  }
}

.login-box a span:nth-child(4) {
  bottom: -100%;
  left: 0;
  width: 2px;
  height: 100%;
  background: linear-gradient(360deg, transparent, #fff);
  animation: btn-anim4 1.5s linear infinite;
  animation-delay: 1.125s;
}

@keyframes btn-anim4 {
  0% {
    bottom: -100%;
  }

  50%,
  100% {
    bottom: 100%;
  }
}

.login-box p:last-child {
  color: #aaa;
  font-size: 14px;
}

.login-box a.a2 {
  color: #fff;
  text-decoration: none;
}

.login-box a.a2:hover {
  background: transparent;
  color: #aaa;
  border-radius: 5px;
}
</style>
