import Swal from "sweetalert2";

export async function showConfirm(
  title: string,
  text: string,
  confirmButtonText: string,
) {
  return Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: "Cancel",
    confirmButtonColor: "#5B5CEB",
    cancelButtonColor: "#9CA3AF",
  });
}
