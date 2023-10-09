<template>
    <div class="container">
        <div class="form">
            <div class="title">Change Password</div>
            <Form ref="form" @submit="changePassword" :validation-schema="schema" v-slot="{ errors }">

                <div class="input-container ic1" :class="{ 'has-error': errors['password'] }">

                    <Field name="password" type="password" class="input" id="password" v-model="password" />
                    <div class="error-message" v-if="errors['password']">
                        {{ errors["password"] }}
                    </div>
                    <div class="cut"></div>
                    <label class="iLabel" for="password">Password:</label>
                </div>

                <div class="input-container ic2" :class="{ 'has-error': errors['confirmPassword'] }">
                    <Field name="new_password" type="password" class="input" id="new_password" v-model="new_password" />

                    <div class="error-message" v-if="errors['password']">
                        {{ errors["password"] }}
                    </div>
                    <div class="cut"></div>
                    <label class="iLabel" for="new_pasword">New Password:</label>
                </div>


                <div class="input-container ic2" :class="{ 'has-error': errors['confirmPassword'] }">
                    <Field name="confirmPassword" type="password" class="input" id="confirmPassword"
                        v-model="confirmPassword" />

                    <div class="error-message" v-if="errors['confirmPassword']">
                        {{ errors["confirmPassword"] }}
                    </div>
                    <div class="cut cut-short"></div>

                    <label class="iLabel" for="confirmPassword">Confirm Password:</label>
                </div>


                <button type="submit" class="submit mt-3 cen">Submit</button>
            </Form>
        </div>
    </div>
</template>
  
<script>
import ApiService from "@/api/api.ts";
import * as yup from "yup";
import { Field, Form } from "vee-validate";
import { successToast, errorToast } from "@/utils/toast.js";

export default {
    mounted() {
        this.checkLogin();
    },
    components: {
        Field,
        Form,
    },
    data() {
        const schema = yup.object({
            password: yup
                .string()
                .required()
                .min(6, "Password must be at least 6 characters"),
            confirmPassword: yup
                .string()
                .required("This field is required.")
                .oneOf([yup.ref("new_password")], "Must match with new password"),
        });

        const errorMessages = {
            confirmPassword: "Must match with new password",
        };
        return {
            schema,
            errorMessages,
            password: "",
            new_password: "",
            confirmPassword: "",
        };
    },
    methods: {
        checkLogin() {
            const isLoggedIn = sessionStorage.getItem("isLoggedIn");
            if (isLoggedIn === null || isLoggedIn === "false") {
                window.location.href = "/login";
            }
        },
        changePassword() {
            this.$refs.form.validate().then((valid) => {
                if (valid) {
                    // Tiến hành xử lý khi form hợp lệ
                    const userData = {
                        password: this.password,
                        new_password: this.new_password,
                    };
                    ApiService.changePasswordUser(userData)
                        .then(() => {
                            successToast(
                                "Change password successfully, you will be redirected to login page"
                            );
                            ApiService.logout();
                            sessionStorage.clear();
                            sessionStorage.clear();
                        })
                        .then(() => {
                            setTimeout(() => {
                                this.$router.push("/login");
                            }, 1500);
                        })
                        .catch((error) => {
                            console.error(error);
                            errorToast(error.response.data.message);
                        });
                }
            });
        },
    },
};
</script>
  
<style scoped>
.form {
    background-color: #15172b;
    border-radius: 20px;
    box-sizing: border-box;
    height: 500px;
    padding: 20px;
    width: 320px;
    margin: auto;
}

.title {
    color: #eee;
    font-family: sans-serif;
    font-size: 36px;
    font-weight: 600;
    margin-top: 30px;
}

.input-container {
    height: 50px;
    position: relative;
    width: 100%;
}

.ic1 {
    margin-top: 30px;
}

.ic2 {
    margin-top: 40px;
}

.has-error {
    margin-top: 35px;
}

.input {
    background-color: #303245;
    border-radius: 12px;
    border: 0;
    box-sizing: border-box;
    color: #eee;
    font-size: 18px;
    height: 100%;
    outline: 0;
    padding: 4px 20px 0;
    width: 100%;
}

.cut {
    background-color: #15172b;
    border-radius: 10px;
    height: 20px;
    left: 20px;
    position: absolute;
    top: -20px;
    transform: translateY(0);
    transition: transform 200ms;
    width: 76px;
}

.cut-short {
    width: 50px;
}

.iLabel {
    color: #65657b;
    font-family: sans-serif;
    left: 20px;
    line-height: 14px;
    pointer-events: none;
    position: absolute;
    transform-origin: 0 50%;
    transition: transform 200ms, color 200ms;
    top: 20px;
}

.error-message {
    position: absolute;
    top: 50;
    left: 20px;
    font-size: 12px;
    color: red;
}

.input:focus~.cut {
    transform: translateY(8px);
}

.input:focus~.iLabel {
    transform: translateY(-30px) translateX(10px) scale(0.75);
}

.input:not(:focus)~.iLabel {
    transform: translateY(-30px) translateX(10px) scale(0.75);
    color: #808097;
}

.input:focus~.iLabel {
    color: #dc2f55;
}

.submit {
    background-color: #08d;
    border-radius: 12px;
    border: 0;
    box-sizing: border-box;
    color: #eee;
    cursor: pointer;
    font-size: 18px;
    height: 50px;
    margin-top: 38px;
    text-align: center;
    width: 100%;
}

.submit:active {
    background-color: #06b;
}
</style>
  