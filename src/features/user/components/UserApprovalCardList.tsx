import { FiUser, FiType, FiCheck } from 'react-icons/fi';
import DataCardList from '../../../components/DataCardList';

export type User = {
  id: string;
  username: string;
  nama: string | null;
};

type Props = {
  users: User[];
  onApprove: (userId: string) => void;
};

const UserApprovalCardList = ({ users, onApprove }: Props) => {
  return (
    <DataCardList
      items={users}
      getId={(u) => u.id}
      renderItem={(u) => (
        <>
          {/* Username */}
          <div
            className="d-flex align-items-center mb-1"
            style={{ fontSize: '0.9rem' }}
          >
            <FiUser className="me-2" />
            {u.username}
          </div>

          {/* Nama */}
          <div
            className="d-flex align-items-center mb-2"
            style={{ fontSize: '0.9rem' }}
          >
            <FiType className="me-2" />
            {u.nama || '-'}
          </div>

          {/* Tombol Approve */}
          <button
            className="btn btn-sm merlin-btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={() => onApprove(u.id)}
          >
            <FiCheck /> Approve
          </button>
        </>
      )}
    />
  );
};

export default UserApprovalCardList;
