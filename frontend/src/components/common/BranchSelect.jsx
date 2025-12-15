import { useEffect } from 'react';
import { useBranches } from '../../hooks/useBranches';
import { useAuth } from '../../contexts/AuthContext';
import Select from './Select';

const BranchSelect = ({
  value,
  onChange,
  label = 'Şube',
  required = false,
  placeholder = 'Şube seçin...',
  showOnlyActive = true,
  includeAllOption = true,
  className = '',
  ...props
}) => {
  const { user } = useAuth();
  const { data: branchesData, isLoading } = useBranches({
    limit: 100,
    isActive: showOnlyActive ? true : undefined,
  });

  const branches = branchesData?.data?.branches || [];

  // Set default branch if user has one and no value is set
  useEffect(() => {
    if (user?.branchId && !value && onChange) {
      onChange({ target: { value: user.branchId } });
    }
  }, [user, value, onChange]);

  const options = branches.map((branch) => ({
    value: branch.id,
    label: `${branch.name} (${branch.code})`,
  }));

  return (
    <Select
      label={label}
      value={value || ''}
      onChange={onChange}
      options={includeAllOption ? [{ value: '', label: 'Tümü' }, ...options] : options}
      required={required}
      placeholder={isLoading ? 'Yükleniyor...' : placeholder}
      className={className}
      disabled={isLoading}
      {...props}
    />
  );
};

export default BranchSelect;

