import React from 'react';

export default function ProfilAdmin() {
  // Données fictives (à remplacer par des vraies données si besoin)
  const user = {
    name: 'Admin User',
    email: 'administrateur@gmail.com',
    role: 'Admin',
    avatar: '/4e00cfd7749b398faba7f21425b3b833.jpg',
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-white py-10">
      <style>{`
        .profile-card {
          background: rgba(255,255,255,0.85);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
          border-radius: 2rem;
          padding: 2.5rem 2rem 2rem 2rem;
          max-width: 370px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .profile-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #a78bfa;
          box-shadow: 0 4px 24px 0 rgba(124, 58, 237, 0.10);
          margin-bottom: 1.5rem;
          background: #fff;
        }
        .profile-name {
          font-size: 1.6rem;
          font-weight: 700;
          color: #4c1d95;
          margin-bottom: 0.3rem;
        }
        .profile-email {
          font-size: 1.05rem;
          color: #6b7280;
          margin-bottom: 1.2rem;
        }
        .profile-role {
          display: inline-block;
          background: linear-gradient(90deg, #7c3aed, #818cf8);
          color: #fff;
          font-size: 0.95rem;
          font-weight: 600;
          padding: 0.4rem 1.2rem;
          border-radius: 999px;
          box-shadow: 0 2px 8px rgba(124,58,237,0.10);
          letter-spacing: 0.04em;
        }
      `}</style>
      <div className="profile-card">
        <img src={user.avatar} alt="Avatar" className="profile-avatar" />
        <div className="profile-name">{user.name}</div>
        <div className="profile-email">{user.email}</div>
        <span className="profile-role">{user.role}</span>
      </div>
    </div>
  );
} 