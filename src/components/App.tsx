import React, { useState, Suspense } from 'react';
const StarScene = React.lazy(() => import('./StarScene'));
import '../styles/App.css';

export const SECTION_TITLES = ['About', 'Skills', 'Projects', 'Contact'];

const App: React.FC = () => {
    const [activeSection, setActiveSection] = useState<number>(0);
    const navRef = React.useRef<HTMLElement | null>(null);

    return (
        <div className="app-root">
            <div className="canvas-wrap">
                <Suspense fallback={<div className="canvas-loading">Loading 3D scene…</div>}>
                    <StarScene activeSection={activeSection} desiredLabelScreenWidth={70}/>
                </Suspense>
            </div>

            <header className="header-bar">
                <nav ref={navRef} className="header-nav">
                    {SECTION_TITLES.map((t, i) => (
                        <button key={t} className={`nav-item ${activeSection === i ? 'active' : ''}`} onClick={() => setActiveSection(i)}>
                            {t}
                        </button>
                    ))}
                </nav>
            </header>
        </div>
    );
};

export default App;