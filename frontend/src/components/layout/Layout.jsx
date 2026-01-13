import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col" style={{
      background: 'linear-gradient(135deg, #1a5f3f 0%, #2d7a52 25%, #1e6b47 50%, #2d7a52 75%, #1a5f3f 100%)'
    }}>
      <Header />
      <main className="flex-grow relative z-10">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;

