<template>
    <div class="firstlogin-container">
        <div class="form">
            <Form ref="form" @submit="changePassword" :validation-schema="schema" v-slot="{ errors }">
                <p class="title">Change Password</p>

                <label for="password">Password:</label>
                <Field name="password" type="password" class="form-control" id="password" v-model="password" />
                <p v-if="errors['password']" class="p-error">
                    {{ errors["password"] }}
                </p>


                <label for="password">New Password:</label>
                <Field name="new_password" type="password" class="form-control" id="new_password" v-model="new_password" />
                <p v-if="errors['password']" class="p-error">
                    {{ errors["password"] }}
                </p>

                <label for="confirmPassword">Confirm Password:</label>
                <Field name="confirmPassword" type="password" class="form-control" id="confirmPassword"
                    v-model="confirmPassword" />
                <p v-if="errors['confirmPassword']" class="p-error">
                    {{ errors["confirmPassword"] }}
                </p>

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
            const adminIsLoggedIn = sessionStorage.getItem("adminIsLoggedIn");
            if (adminIsLoggedIn === null || adminIsLoggedIn === "false") {
                window.location.href = "/admin/login";
            }
        },
        changePassword() {
            this.$refs.form.validate().then((valid) => {
                if (valid) {
                    // Tiến hành xử lý khi form hợp lệ
                    const adminData = {
                        old_password: this.password,
                        new_password: this.new_password,
                    };
                    // console.log(adminData);
                    ApiService.changePasswordAdmin(adminData)
                        .then(() => {
                            successToast(
                                "Change password successfully, you will be redirected to login page"
                            );
                            ApiService.logout();
                            sessionStorage.clear();
                        })
                        .then(() => {
                            setTimeout(() => {
                                this.$router.push("/admin/login");
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
.firstlogin-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f5f5f5;
}

.p-error {
    color: red;
}

.form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 350px;
    background-color: #fff;
    padding: 20px;
    border-radius: 20px;
    position: relative;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.title {
    font-size: 28px;
    color: royalblue;
    font-weight: 600;
    letter-spacing: -1px;
    position: relative;
    display: flex;
    align-items: center;
    padding-left: 30px;
}

.title::before,
.title::after {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    border-radius: 50%;
    left: 0px;
    background-color: royalblue;
}

.title::before {
    width: 18px;
    height: 18px;
    background-color: royalblue;
}

.title::after {
    width: 18px;
    height: 18px;
    animation: pulse 1s linear infinite;
}

.message,
.signin {
    color: rgba(88, 87, 87, 0.822);
    font-size: 14px;
}

.signin {
    text-align: center;
}

.signin a {
    color: royalblue;
}

.signin a:hover {
    text-decoration: underline royalblue;
}

.flex {
    display: flex;
    width: 100%;
    gap: 6px;
}

.form label {
    position: relative;
}

.form label .input {
    width: 100%;
    padding: 10px 10px 20px 10px;
    outline: 0;
    border: 1px solid rgba(105, 105, 105, 0.397);
    border-radius: 10px;
}

.form label .input+span {
    position: absolute;
    left: 10px;
    top: 15px;
    color: grey;
    font-size: 0.9em;
    cursor: text;
    transition: 0.3s ease;
}

.form label .input:placeholder-shown+span {
    top: 15px;
    font-size: 0.9em;
}

.form label .input:focus+span,
.form label .input:valid+span {
    top: 30px;
    font-size: 0.7em;
    font-weight: 600;
}

.form label .input:valid+span {
    color: green;
}

.submit {
    border: none;
    outline: none;
    background-color: royalblue;
    padding: 10px;
    border-radius: 10px;
    color: #fff;
    font-size: 16px;
    transform: 0.3s ease;
}

.submit:hover {
    background-color: rgb(56, 90, 194);
}

@keyframes pulse {
    from {
        transform: scale(0.9);
        opacity: 1;
    }

    to {
        transform: scale(1.8);
        opacity: 0;
    }
}
</style>
  