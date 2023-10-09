import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

export const successToast = (message) => {
  toast.success(message, {
    position: "top-center",
    duration: 1500,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// errortoast với position là top
export const errorToast = (message) => {
  toast.error(message, {
    position: "top-center",
    duration: 2000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};
