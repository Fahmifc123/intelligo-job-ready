export default {
      users: {
        pageTitle: "Manajemen Pengguna",
        pageSubtitle: "Kelola akun pengguna, peran, dan izin",
        userCount: "Pengguna",
        deleteUser: {
          title: "Hapus Pengguna",
          description: "Secara permanen menghapus pengguna dan semua datanya. Tindakan ini tidak dapat dibatalkan. Harap konfirmasi dengan hati-hati.",
          confirmText: "Hapus",
          cancelText: "Batal",
          successMessage: "Pengguna berhasil dihapus",
          confirmationPrefix: "Apakah Anda yakin ingin menghapus pengguna ",
          confirmationSuffix: " ?"
        },
        createUser: {
          successMessage: "Pengguna berhasil dibuat"
        },
        updateUser: {
          successMessage: "Pengguna berhasil diperbarui"
        },
        updatePassword: {
          successMessage: "Kata sandi pengguna berhasil diperbarui"
        },
        errorLoading: "Kesalahan Memuat Pengguna",
        form: {
          name: {
            label: "Nama",
            placeholder: "Nama",
            required: "Nama diperlukan"
          },
          email: {
            label: "Email",
            placeholder: "Email",
            required: "Email diperlukan",
            invalid: "Email tidak valid"
          },
          password: {
            label: "Kata Sandi",
            placeholder: "Kata Sandi",
            required: "Kata sandi diperlukan",
            minLength: "Kata sandi minimal 8 karakter"
          },
          confirmPassword: {
            label: "Konfirmasi Kata Sandi",
            placeholder: "Konfirmasi Kata Sandi",
            required: "Konfirmasi kata sandi diperlukan",
            minLength: "Konfirmasi kata sandi minimal 8 karakter"
          },
          role: {
            label: "Role",
            placeholder: "Peran",
            required: "Peran diperlukan"
          },
        },
        modal: {
          addUser: {
            title: "Tambah Pengguna",
            description: "Silakan isi formulir di bawah ini untuk membuat pengguna baru."
          },
          updateUser: {
            title: "Perbarui Pengguna",
            description: "Silakan isi formulir di bawah ini untuk memperbarui pengguna."
          },
          changePassword: {
            title: "Ubah Kata Sandi",
            description: "Silakan isi formulir di bawah ini untuk memperbarui kata sandi pengguna.",
            buttonText: "Ubah Kata Sandi",
            mismatchError: "Kata sandi dan konfirmasi kata sandi harus sama"
          }
        }
      }
    }