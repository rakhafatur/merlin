import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import bcrypt from 'bcryptjs';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';

type FormData = {
  username: string;
  password: string;
  nama: string;
};

function SignUpForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: FormData) => {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const { error } = await supabase.from('users').insert({
      username: data.username,
      password: hashedPassword,
      nama: data.nama,
      is_active: false,
    });

    if (error) {
      alert('❌ Gagal daftar: ' + error.message);
      return;
    }

    alert('✅ Registrasi berhasil! Akunmu sedang menunggu persetujuan admin.');
    navigate('/login');
  };

  return (
    <div className="login-page blue-gold-theme">
      <div className="login-container">
        {/* Ilustrasi kiri (desktop only) */}
        <div className="login-illustration d-none d-md-flex">
          <img
            src="/assets/bg-home.png"
            alt="MERLIN Illustration"
            className="img-fluid"
            style={{ maxWidth: '90%', borderRadius: '1rem' }}
          />
        </div>

        {/* Form kanan */}
        <div className="login-form-wrapper">
          <div className="login-card">
            <div className="text-center mb-4">
              <img
                src="../icons/logomerlin.png"
                alt="Logo MERLIN"
                className="mb-3 login-logo"
              />
              <h4 className="fw-bold">
                Daftar ke <span className="brand">MERLIN</span>
              </h4>
              <p className="text-muted">Buat akun barumu untuk melanjutkan</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Username */}
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  {...register('username', { required: true })}
                  autoFocus
                />
                {errors.username && (
                  <div className="invalid-feedback">Username wajib diisi</div>
                )}
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    {...register('password', { required: true })}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <div className="invalid-feedback">Password wajib diisi</div>
                )}
              </div>

              {/* Nama Lengkap */}
              <div className="mb-3">
                <label className="form-label">Nama Lengkap</label>
                <input
                  type="text"
                  className={`form-control ${errors.nama ? 'is-invalid' : ''}`}
                  {...register('nama', { required: true })}
                />
                {errors.nama && (
                  <div className="invalid-feedback">Nama wajib diisi</div>
                )}
              </div>

              {/* Button Submit */}
              <button type="submit" className="btn btn-gold w-100 fw-bold">
                ✨ Daftar
              </button>
            </form>

            <div className="text-center mt-3">
              <small>
                Sudah punya akun?{' '}
                <Link to="/login" className="text-gold">Kembali ke Login</Link>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpForm;
