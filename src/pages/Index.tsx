import Dashboard from '../components/Dashboard';

const Index = () => {
  // Provide a dummy handleLogout to satisfy the required prop
  const handleLogout = () => {};
  return <Dashboard handleLogout={handleLogout} />;
};

export default Index;
