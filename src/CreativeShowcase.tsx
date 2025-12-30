import React, { useState, useEffect } from 'react';
import { Upload, LogIn, LogOut, User, Home, Image } from 'lucide-react';

interface ImageData {
  id: number;
  data: string;
  uploadedAt: string;
}

interface UserData {
  username: string;
  password: string;
  images: ImageData[];
}

interface Users {
  [username: string]: UserData;
}

interface ImageWithUser extends ImageData {
  username: string;
}

const CreativeShowcase: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [users, setUsers] = useState<Users>({});
  const [allImages, setAllImages] = useState<ImageWithUser[]>([]);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingProfile, setViewingProfile] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setLoading(true);
      
      // Load users from localStorage
      const usersData = localStorage.getItem('creative_users');
      if (usersData) {
        const loadedUsers: Users = JSON.parse(usersData);
        setUsers(loadedUsers);
        
        // Aggregate all images for landing page
        const images: ImageWithUser[] = [];
        Object.values(loadedUsers).forEach((user: UserData) => {
          if (user.images) {
            user.images.forEach((img: ImageData) => {
              images.push({ ...img, username: user.username });
            });
          }
        });
        setAllImages(images);
      }
      
      // Check for logged in user
      const sessionData = localStorage.getItem('creative_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        setCurrentUser(session.username);
      }
    } catch (error) {
      console.log('No existing data, starting fresh');
    } finally {
      setLoading(false);
    }
  };

  const saveUsers = (updatedUsers: Users) => {
    try {
      localStorage.setItem('creative_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      
      // Update allImages
      const images: ImageWithUser[] = [];
      Object.values(updatedUsers).forEach((user: UserData) => {
        if (user.images) {
          user.images.forEach((img: ImageData) => {
            images.push({ ...img, username: user.username });
          });
        }
      });
      setAllImages(images);
    } catch (error) {
      alert('Failed to save data');
    }
  };

  const handleSignup = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      alert('Please fill in all fields');
      return;
    }
    
    if (users[formData.username]) {
      alert('Username already exists');
      return;
    }

    const newUsers: Users = {
      ...users,
      [formData.username]: {
        username: formData.username,
        password: formData.password,
        images: []
      }
    };
    
    saveUsers(newUsers);
    localStorage.setItem('creative_session', JSON.stringify({ username: formData.username }));
    setCurrentUser(formData.username);
    setCurrentPage('dashboard');
    setFormData({ username: '', password: '' });
  };

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const user = users[formData.username];
    
    if (!user || user.password !== formData.password) {
      alert('Invalid credentials');
      return;
    }
    
    localStorage.setItem('creative_session', JSON.stringify({ username: formData.username }));
    setCurrentUser(formData.username);
    setCurrentPage('dashboard');
    setFormData({ username: '', password: '' });
  };

  const handleLogout = () => {
    localStorage.removeItem('creative_session');
    setCurrentUser(null);
    setCurrentPage('landing');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitImage = () => {
    if (!uploadPreview || !currentUser) {
      alert('Please select an image first');
      return;
    }

    const newImage: ImageData = {
      id: Date.now(),
      data: uploadPreview,
      uploadedAt: new Date().toISOString()
    };

    const updatedUsers: Users = {
      ...users,
      [currentUser]: {
        ...users[currentUser],
        images: [...(users[currentUser].images || []), newImage]
      }
    };

    saveUsers(updatedUsers);
    setUploadPreview(null);
    alert('Image uploaded successfully!');
  };

  const deleteImage = (imageId: number) => {
    if (!currentUser) return;
    
    const updatedUsers: Users = {
      ...users,
      [currentUser]: {
        ...users[currentUser],
        images: users[currentUser].images.filter((img: ImageData) => img.id !== imageId)
      }
    };
    saveUsers(updatedUsers);
  };

  const viewPublicProfile = (username: string) => {
    setViewingProfile(username);
    setCurrentPage('public-profile');
  };

  // Shuffle array for random display
  const shuffleArray = (array: ImageWithUser[]): ImageWithUser[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.glassCard}>
          <h2>Loading Creative Showcase...</h2>
        </div>
      </div>
    );
  }

  // Landing Page
  if (currentPage === 'landing') {
    const displayImages = shuffleArray(allImages).slice(0, 12);
    
    return (
      <div style={styles.container}>
        <div style={styles.fullWidth}>
          <div style={styles.navbar}>
            <h1 style={styles.logo}>🎨 Creative Showcase</h1>
            <div style={styles.navButtons}>
              {currentUser ? (
                <>
                  <button style={styles.navButton} onClick={() => setCurrentPage('dashboard')}>
                    <User size={18} /> Dashboard
                  </button>
                  <button style={styles.navButton} onClick={handleLogout}>
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <button style={styles.navButton} onClick={() => setCurrentPage('login')}>
                    <LogIn size={18} /> Login
                  </button>
                  <button style={styles.navButton} onClick={() => setCurrentPage('signup')}>
                    <User size={18} /> Sign Up
                  </button>
                </>
              )}
            </div>
          </div>

          <div style={styles.glassCard}>
            <h2 style={styles.pageTitle}>Discover Amazing Artwork</h2>
            <p style={styles.subtitle}>Explore digital memories and artwork from talented artists</p>
            
            {displayImages.length === 0 ? (
              <div style={styles.emptyState}>
                <Image size={64} style={styles.emptyIcon} />
                <h3>No artwork yet</h3>
                <p>Be the first to share your creative work!</p>
                <button style={styles.button} onClick={() => setCurrentPage('signup')}>
                  Get Started
                </button>
              </div>
            ) : (
              <div style={styles.gallery}>
                {displayImages.map((img, idx) => (
                  <div key={idx} style={styles.galleryItem} onClick={() => viewPublicProfile(img.username)}>
                    <img src={img.data} alt="Artwork" style={styles.galleryImage} />
                    <div style={styles.imageOverlay}>
                      <span>@{img.username}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Sign Up Page
  if (currentPage === 'signup') {
    return (
      <div style={styles.container}>
        <div style={styles.glassCard}>
          <button style={styles.backButton} onClick={() => setCurrentPage('landing')}>
            <Home size={18} /> Back to Home
          </button>
          <h2>Create Your Account</h2>
          <div style={styles.form}>
            <input
              type="text"
              placeholder="Choose a username"
              style={styles.input}
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
            <input
              type="password"
              placeholder="Create a password"
              style={styles.input}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <button onClick={handleSignup} style={styles.button}>Sign Up</button>
          </div>
          <p style={styles.switchText}>
            Already have an account?{' '}
            <span style={styles.link} onClick={() => setCurrentPage('login')}>
              Login here
            </span>
          </p>
        </div>
      </div>
    );
  }

  // Login Page
  if (currentPage === 'login') {
    return (
      <div style={styles.container}>
        <div style={styles.glassCard}>
          <button style={styles.backButton} onClick={() => setCurrentPage('landing')}>
            <Home size={18} /> Back to Home
          </button>
          <h2>Welcome Back</h2>
          <div style={styles.form}>
            <input
              type="text"
              placeholder="Username"
              style={styles.input}
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
            <input
              type="password"
              placeholder="Password"
              style={styles.input}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <button onClick={handleLogin} style={styles.button}>Login</button>
          </div>
          <p style={styles.switchText}>
            Don't have an account?{' '}
            <span style={styles.link} onClick={() => setCurrentPage('signup')}>
              Sign up here
            </span>
          </p>
        </div>
      </div>
    );
  }

  // Dashboard
  if (currentPage === 'dashboard' && currentUser) {
    const userImages = users[currentUser]?.images || [];
    
    return (
      <div style={styles.container}>
        <div style={styles.fullWidth}>
          <div style={styles.navbar}>
            <h1 style={styles.logo}>🎨 Creative Showcase</h1>
            <div style={styles.navButtons}>
              <button style={styles.navButton} onClick={() => setCurrentPage('landing')}>
                <Home size={18} /> Home
              </button>
              <button style={styles.navButton} onClick={() => viewPublicProfile(currentUser)}>
                <User size={18} /> My Profile
              </button>
              <button style={styles.navButton} onClick={handleLogout}>
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>

          <div style={styles.glassCard}>
            <h2 style={styles.pageTitle}>Welcome, {currentUser}! 👋</h2>
            
            <div style={styles.uploadSection}>
              <h3 style={styles.sectionTitle}>
                <Upload size={20} /> Upload New Artwork
              </h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={styles.fileInput}
              />
              {uploadPreview && (
                <div style={styles.previewContainer}>
                  <img src={uploadPreview} alt="Preview" style={styles.preview} />
                  <button style={styles.button} onClick={submitImage}>
                    Publish Artwork
                  </button>
                </div>
              )}
            </div>

            <div style={styles.userGallerySection}>
              <h3 style={styles.sectionTitle}>
                Your Gallery ({userImages.length})
              </h3>
              {userImages.length === 0 ? (
                <div style={styles.emptyState}>
                  <Image size={48} style={styles.emptyIcon} />
                  <p>You haven't uploaded any artwork yet</p>
                </div>
              ) : (
                <div style={styles.gallery}>
                  {userImages.map((img) => (
                    <div key={img.id} style={styles.galleryItem}>
                      <img src={img.data} alt="Your artwork" style={styles.galleryImage} />
                      <button
                        style={styles.deleteButton}
                        onClick={() => deleteImage(img.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Public Profile Page
  if (currentPage === 'public-profile' && viewingProfile) {
    const profileUser = users[viewingProfile];
    const profileImages = profileUser?.images || [];
    
    return (
      <div style={styles.container}>
        <div style={styles.fullWidth}>
          <div style={styles.navbar}>
            <h1 style={styles.logo}>🎨 Creative Showcase</h1>
            <div style={styles.navButtons}>
              <button style={styles.navButton} onClick={() => setCurrentPage('landing')}>
                <Home size={18} /> Home
              </button>
              {currentUser && (
                <button style={styles.navButton} onClick={() => setCurrentPage('dashboard')}>
                  <User size={18} /> Dashboard
                </button>
              )}
            </div>
          </div>

          <div style={styles.glassCard}>
            <div style={styles.profileHeader}>
              <div style={styles.avatar}>{viewingProfile[0].toUpperCase()}</div>
              <div>
                <h2 style={styles.profileName}>@{viewingProfile}</h2>
                <p style={styles.imageCount}>{profileImages.length} artworks</p>
              </div>
            </div>

            {profileImages.length === 0 ? (
              <div style={styles.emptyState}>
                <Image size={48} style={styles.emptyIcon} />
                <p>No artwork shared yet</p>
              </div>
            ) : (
              <div style={styles.gallery}>
                {profileImages.map((img) => (
                  <div key={img.id} style={styles.galleryItem}>
                    <img src={img.data} alt={`${viewingProfile}'s artwork`} style={styles.galleryImage} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top left, #5f9cff, #0f2027 45%, #000)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Poppins', sans-serif",
  },
  fullWidth: {
    width: '100%',
    maxWidth: '1200px',
  },
  glassCard: {
    background: 'rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
    padding: '30px',
    color: '#fff',
    width: '100%',
    maxWidth: '450px',
    margin: '0 auto',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  logo: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  navButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  navButton: {
    padding: '10px 20px',
    borderRadius: '12px',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: '0.3s',
    fontSize: '14px',
  },
  backButton: {
    padding: '8px 16px',
    borderRadius: '10px',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.15)',
    color: '#fff',
    cursor: 'pointer',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
  },
  pageTitle: {
    textAlign: 'center',
    marginBottom: '10px',
    fontWeight: '600',
    fontSize: '28px',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.85,
    marginBottom: '30px',
    fontSize: '14px',
  },
  form: {
    marginTop: '20px',
  },
  input: {
    width: '100%',
    padding: '14px',
    margin: '12px 0',
    borderRadius: '14px',
    border: 'none',
    outline: 'none',
    background: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
    fontSize: '15px',
  },
  button: {
    width: '100%',
    padding: '14px',
    marginTop: '15px',
    borderRadius: '14px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    color: '#fff',
    background: 'linear-gradient(135deg, #6dd5fa, #2980b9)',
    transition: '0.3s',
    fontSize: '15px',
  },
  switchText: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    opacity: 0.85,
  },
  link: {
    color: '#6dd5fa',
    cursor: 'pointer',
    fontWeight: '500',
    textDecoration: 'underline',
  },
  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  galleryItem: {
    position: 'relative',
    cursor: 'pointer',
  },
  galleryImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.15)',
    transition: '0.3s',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: '8px',
    left: '8px',
    right: '8px',
    background: 'rgba(0, 0, 0, 0.7)',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '500',
  },
  uploadSection: {
    background: 'rgba(255, 255, 255, 0.08)',
    padding: '20px',
    borderRadius: '16px',
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  fileInput: {
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    border: '2px dashed rgba(255, 255, 255, 0.3)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    cursor: 'pointer',
  },
  previewContainer: {
    marginTop: '20px',
  },
  preview: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'contain',
    borderRadius: '12px',
    marginBottom: '15px',
  },
  userGallerySection: {
    marginTop: '30px',
  },
  deleteButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'rgba(255, 0, 0, 0.8)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    opacity: 0.7,
  },
  emptyIcon: {
    opacity: 0.5,
    marginBottom: '15px',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
  },
  avatar: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6dd5fa, #2980b9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '600',
  },
  profileName: {
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 5px 0',
  },
  imageCount: {
    opacity: 0.7,
    fontSize: '14px',
    margin: 0,
  },
};

export default CreativeShowcase;