import Swal, { SweetAlertOptions } from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const useAlert = () => {
  const showAlert = async (options: SweetAlertOptions) => {
    return MySwal.fire({
      confirmButtonColor: "#4a90e2", // legacy-primary
      cancelButtonColor: "#c8d6f1", // legacy-secondary
      color: "#000000",
      background: "#e9f0fa", // legacy-container
      ...options,
    });
  };

  const showError = (message: string) => {
    return showAlert({
      icon: "error",
      title: "Error",
      text: message,
    });
  };

  const showSuccess = (title: string, text?: string) => {
    return showAlert({
      icon: "success",
      title,
      text,
    });
  };

  return { showAlert, showError, showSuccess };
};
