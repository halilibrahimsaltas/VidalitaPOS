import { useTranslation } from 'react-i18next';

const Select = ({
  label,
  options = [],
  value,
  onChange,
  error,
  required = false,
  placeholder,
  className = '',
  ...props
}) => {
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder || t('common.select');
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value || ''}
        onChange={onChange}
        className={`input ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      >
        <option value="">{defaultPlaceholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select;

