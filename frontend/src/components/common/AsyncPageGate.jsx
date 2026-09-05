import PageLoadTransition from './PageLoadTransition.jsx';
import PageSkeleton from './PageSkeleton.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

const AsyncPageGate = ({
  loading,
  hasContent = !loading,
  label = 'Loading...',
  skeleton,
  children,
}) => (
  <PageLoadTransition
    loading={loading && !hasContent}
    hasData={hasContent}
    skeleton={skeleton || <LoadingSpinner label={label} />}
  >
    {children}
  </PageLoadTransition>
);

export const AsyncPageSkeletonGate = ({ loading, hasContent, children }) => (
  <AsyncPageGate loading={loading} hasContent={hasContent} skeleton={<PageSkeleton />}>
    {children}
  </AsyncPageGate>
);

export default AsyncPageGate;
