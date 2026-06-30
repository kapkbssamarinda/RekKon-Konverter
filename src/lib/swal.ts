import Swal from 'sweetalert2';

export const swal = Swal.mixin({
  customClass: {
    popup: 'rounded-xl font-sans',
    title: '!text-[17px] !font-semibold !text-[#0F172A]',
    htmlContainer: '!text-[14px] !text-[#64748B]',
    confirmButton: '!rounded-lg !px-5 !py-2.5 !text-[14px] !font-semibold cursor-pointer',
    cancelButton: '!rounded-lg !px-5 !py-2.5 !text-[14px] !font-semibold cursor-pointer',
  },
});

export const swalConfirmLogout = () =>
  swal.fire({
    title: 'Keluar dari akun?',
    text: 'Anda akan dikembalikan ke halaman login.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Keluar',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#DC2626',
    cancelButtonColor: '#94A3B8',
    reverseButtons: true,
    focusCancel: true,
  });

export const swalError = (message: string, title = 'Terjadi Kesalahan') =>
  swal.fire({
    title,
    text: message,
    icon: 'error',
    confirmButtonText: 'Tutup',
    confirmButtonColor: '#0077B6',
  });
