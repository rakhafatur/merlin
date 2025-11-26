import { useEffect, useState } from 'react';
import FormInput from '../../../components/FormInput';
import { FiUser, FiPlus, FiEdit2 } from 'react-icons/fi';
import ModalWrapper from '../../../components/ModalWrapper';
import './AddUserModal.css'; // WAJIB MERLIN STYLE

type User = {
  id: string;
  username: string;
  nama: string | null;
};

type Props = {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: {
    id?: string;
    username: string;
    nama: string;
    password?: string;
    user_group_id?: string;
    is_active?: boolean;
  }) => void;
  user?: User | null;
};

const AddUserModal = ({ show, onClose, onSubmit, user }: Props) => {
  const [form, setForm] = useState({ username: '', nama: '', password: '' });
  const [readonly, setReadonly] = useState<boolean>(false);

  useEffect(() => {
    if (!show) return;

    if (user) {
      setForm({
        username: user.username,
        nama: user.nama || '',
        password: '',
      });
      setReadonly(true);
    } else {
      setForm({ username: '', nama: '', password: '' });
      setReadonly(false);
    }
  }, [show, user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.username || !form.nama)
      return alert('Username dan Nama wajib diisi');

    if (!user && !form.password)
      return alert('Password wajib diisi untuk user baru');

    const payload = {
      id: user?.id,
      username: form.username,
      nama: form.nama,
      ...(form.password ? { password: form.password } : {}),
      user_group_id: user ? undefined : '1',
      is_active: user ? undefined : true,
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <div id="addusermodal-merlin">
      <ModalWrapper
        show={show}
        onClose={onClose}
        title={
          user ? (
            <span className="d-flex align-items-center gap-2">
              <FiUser /> Detail User
            </span>
          ) : (
            <span className="d-flex align-items-center gap-2">
              <FiPlus /> Tambah User
            </span>
          )
        }
        footer={
          <>
            {readonly ? (
              <button
                className="btn merlin-btn-primary d-flex align-items-center gap-2"
                onClick={() => setReadonly(false)}
              >
                <FiEdit2 /> Edit Form
              </button>
            ) : (
              <button className="btn merlin-btn-primary" onClick={handleSubmit}>
                Simpan
              </button>
            )}
            <button className="btn merlin-btn-secondary" onClick={onClose}>
              Tutup
            </button>
          </>
        }
      >
        <>
          <FormInput
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            readOnly={readonly}
          />

          <FormInput
            label="Nama Lengkap"
            name="nama"
            value={form.nama}
            onChange={handleChange}
            readOnly={readonly}
          />

          {!readonly && (
            <FormInput
              label={user ? 'Password Baru (Opsional)' : 'Password'}
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
            />
          )}
        </>
      </ModalWrapper>
    </div>
  );
};

export default AddUserModal;
