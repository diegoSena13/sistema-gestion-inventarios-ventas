
import './MainLayout.css';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = ({ children }) => {
    return (
        <div className="app-layout">
            <Sidebar />

            <div className="main-layout">
                <Navbar />

                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
