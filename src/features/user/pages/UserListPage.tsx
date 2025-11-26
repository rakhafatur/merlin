import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import AddUserModal from '../components/AddUserModal';
import bcrypt from 'bcryptjs';
import DataTable from '../../../components/DataTable';
import UserCardList from '../components/UserCardList';
import { useMediaQuery } from 'react-responsive';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import './userlistpage.css';

type User = {
  id: string;
  username: string;
  nama: string | null;
};

const UserListPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [userList, setUserList] = useState<User[]>([]);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [page, setPage] = useState(1);
  const limit = isMobile ? 5 : 10;
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const backdrop = document.querySelector('.sidebar-backdrop');
      setIsSidebarOpen(!!backdrop);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const fetchUsers = async () => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .range(from, to);

    if (keyword.trim() !== '') {
      query = query.or(`username.ilike.%${keyword}%,nama.ilike.%${keyword}%`);
    }

    const { data, count, error } = await query;

    if (!error) {
      setUserList(data || []);
      setTotal(count || 0);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('❗ Yakin ingin hapus user ini?')) return;

    const { error } = await supabase.from('users').delete().eq('id', id);
    if (!error) fetchUsers();
  };

  const handleSaveUser = async (data: {
    username: string;
    nama: string;
    password?: string;
  }) => {
    const hashedPassword = data.password
      ? await bcrypt.hash(data.password, 10)
      : undefined;

    if (editUser) {
      await supabase
        .from('users')
        .update({
          username: data.username,
          nama: data.nama,
          ...(hashedPassword ? { password: hashedPassword } : {}),
        })
        .eq('id', editUser.id);
    } else {
      await supabase.from('users').insert([
        {
          username: data.username,
          nama: data.nama,
          password: hashedPassword,
        },
      ]);
    }

    setEditUser(null);
    setShowForm(false);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [page, keyword, isMobile]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div id="userlist-page" className="userlist-wrapper">
      {/* MOBILE SEARCH */}
      {isMobile && (
        <div className="ul-search-mobile">
          <input
            type="text"
            placeholder="🔍 Cari user..."
            value={keyword}
            onChange={(e) => {
              setPage(1);
              setKeyword(e.target.value);
            }}
          />
        </div>
      )}

      <AddUserModal
        show={showForm}
        onClose={() => {
          setShowForm(false);
          setEditUser(null);
        }}
        onSubmit={handleSaveUser}
        user={editUser}
      />

      {/* MOBILE */}
      {isMobile ? (
        <>
          <UserCardList
            users={userList}
            onEdit={(u) => {
              setEditUser(u);
              setShowForm(true);
            }}
            onDelete={handleDelete}
          />

          {totalPages > 1 && (
            <div className="ul-pagination">
              <button onClick={() => setPage(page - 1)} disabled={page <= 1}>
                ← Sebelumnya
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                Selanjutnya →
              </button>
            </div>
          )}

          {!isSidebarOpen && (
            <button
              onClick={() => {
                setEditUser(null);
                setShowForm(true);
              }}
              className="ul-fab"
            >
              <FiPlus />
            </button>
          )}
        </>
      ) : (
        <>
          {/* DESKTOP HEADER */}
          <div className="ul-header">
            <button
              className="ul-add-btn"
              onClick={() => {
                setEditUser(null);
                setShowForm(true);
              }}
            >
              <FiPlus className="me-2" /> Tambah
            </button>

            <div className="ul-search-right">
              <input
                type="text"
                className="ul-search-desktop"
                placeholder="🔍 Cari user..."
                value={keyword}
                onChange={(e) => {
                  setPage(1);
                  setKeyword(e.target.value);
                }}
              />
            </div>
          </div>

          {/* TABLE */}
          <DataTable
            columns={[
              { key: 'username', label: 'Username' },
              { key: 'nama', label: 'Nama Lengkap' },
              {
                key: 'id',
                label: 'Aksi',
                render: (u: User) => (
                  <div className="ul-actions">
                    <button
                      className="ul-btn-edit"
                      onClick={() => {
                        setEditUser(u);
                        setShowForm(true);
                      }}
                    >
                      <FiEdit2 size={16} />
                    </button>

                    <button
                      className="ul-btn-delete"
                      onClick={() => handleDelete(u.id)}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ),
              },
            ]}
            data={userList}
          />

          {totalPages > 1 && (
            <div className="ul-pagination">
              <button onClick={() => setPage(page - 1)} disabled={page <= 1}>
                ← Sebelumnya
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                Selanjutnya →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserListPage;
