import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useMediaQuery } from 'react-responsive';
import DataTable from '../../../components/DataTable';
import { FiCheck } from 'react-icons/fi';
import UserApprovalCardList from '../components/UserApprovalCardList';

type User = {
  id: string;
  username: string;
  nama: string | null;
};

type UserGroup = {
  id: string;
  group_name: string;
};

const UserApprovalPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [userList, setUserList] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [assignModal, setAssignModal] = useState<{ id: string; show: boolean }>({
    id: '',
    show: false,
  });

  const [userGroupList, setUserGroupList] = useState<UserGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');

  const limit = isMobile ? 5 : 10;

  // Fetch pending users
  const fetchUsers = async () => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('users')
      .select('id, username, nama', { count: 'exact' })
      .eq('is_active', false)
      .range(from, to);

    if (keyword.trim()) {
      query = query.or(`username.ilike.%${keyword}%,nama.ilike.%${keyword}%`);
    }

    const { data, count } = await query;
    setUserList(data || []);
    setTotal(count || 0);
  };

  // Fetch user_group
  const fetchUserGroups = async () => {
    const { data, error } = await supabase
      .from('user_group')
      .select('id, group_name')
      .order('group_name', { ascending: true });

    if (!error) {
      setUserGroupList(data || []);
    }
  };

  const handleApproveClick = async (userId: string) => {
    setAssignModal({ id: userId, show: true });
    setSelectedGroupId('');
    fetchUserGroups();
  };

  const handleAssign = async () => {
    if (!selectedGroupId) return;

    const { error } = await supabase
      .from('users')
      .update({
        user_group_id: selectedGroupId,
        is_active: true,
      })
      .eq('id', assignModal.id);

    if (error) {
      alert('❌ Gagal assign: ' + error.message);
      return;
    }

    setSuccessMessage('✅ User berhasil diaktifkan & diberi User Group!');
    fetchUsers();

    setAssignModal({ id: '', show: false });
    setSelectedGroupId('');

    setTimeout(() => setSuccessMessage(''), 3000);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, keyword]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div
      id="userlist-page"
      className="p-4"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--merlin-bg)',
        color: 'var(--merlin-dark)',
        paddingBottom: isMobile ? '90px' : undefined,
      }}
    >
      {/* Success Alert */}
      {successMessage && (
        <div
          className="alert alert-success alert-dismissible fade show shadow-sm"
          role="alert"
          style={{
            background: '#d2f8d2',
            borderLeft: '5px solid var(--merlin-blue)',
          }}
        >
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage('')} />
        </div>
      )}

      {/* Search Bar */}
      <div className="d-flex justify-content-end mb-3 gap-2">
        <input
          type="text"
          className="form-control shadow-sm"
          placeholder="🔍 Cari user..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
          style={{
            maxWidth: 300,
            border: '1px solid var(--merlin-blue)',
          }}
        />
      </div>

      {/* Table or Cards */}
      {isMobile ? (
        <UserApprovalCardList users={userList} onApprove={handleApproveClick} />
      ) : (
        <DataTable
          columns={[
            { key: 'username', label: 'Username' },
            { key: 'nama', label: 'Nama Lengkap' },
            {
              key: 'id',
              label: 'Aksi',
              render: (u: User) => (
                <button
                  className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                  style={{ borderColor: 'var(--merlin-blue)', color: 'var(--merlin-blue)' }}
                  onClick={() => handleApproveClick(u.id)}
                >
                  <FiCheck /> Approve
                </button>
              ),
            },
          ]}
          data={userList}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <button
            className="btn btn-outline-primary"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            style={{ borderColor: 'var(--merlin-blue)', color: 'var(--merlin-blue)' }}
          >
            ← Sebelumnya
          </button>
          <button
            className="btn btn-outline-primary"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            style={{ borderColor: 'var(--merlin-blue)', color: 'var(--merlin-blue)' }}
          >
            Selanjutnya →
          </button>
        </div>
      )}

      {/* Assign Modal */}
      {assignModal.show && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow">

              <div
                className="modal-header"
                style={{ background: 'var(--merlin-blue)', color: 'white' }}
              >
                <h5 className="modal-title">Assign User Group</h5>
                <button
                  type="button"
                  className="btn-close"
                  style={{ filter: 'invert(1)' }}
                  onClick={() => setAssignModal({ id: '', show: false })}
                />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Pilih User Group</label>
                  <select
                    className="form-select"
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                  >
                    <option value="">-- Pilih User Group --</option>

                    {userGroupList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.group_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setAssignModal({ id: '', show: false })}
                >
                  Batal
                </button>

                <button
                  className="btn btn-primary"
                  disabled={!selectedGroupId}
                  onClick={handleAssign}
                  style={{ background: 'var(--merlin-blue)', borderColor: 'var(--merlin-blue)' }}
                >
                  Aktifkan
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserApprovalPage;
