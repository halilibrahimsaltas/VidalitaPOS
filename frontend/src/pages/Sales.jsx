import { useTranslation } from 'react-i18next';
import PageLayout from '../components/layout/PageLayout';
import SalesList from '../components/sales/SalesList';

const Sales = () => {
  const { t } = useTranslation();

  return (
    <PageLayout
      title={t('sales.title')}
      description="Tüm satışları görüntüleyin, detaylarını inceleyin ve iade/iptal işlemleri yapın"
    >
      <SalesList />
    </PageLayout>
  );
};

export default Sales;

