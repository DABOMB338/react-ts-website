import React, { useState, Suspense, useCallback } from 'react';
const StarScene = React.lazy(() => import('./StarScene'));
import '../styles/App.css';

export const SECTION_TITLES = ['About', 'Skills', 'Projects', 'Contact'];

const App: React.FC = () => {
    const [activeSection, setActiveSection] = useState<number>(0);
    const navRef = React.useRef<HTMLElement | null>(null);
    const headerRef = React.useRef<HTMLDivElement | null>(null);
    const [headerHeight, setHeaderHeight] = useState<number>(0);
    const [hasScrolled, setHasScrolled] = useState(false);
    const [isActiveScrollable, setIsActiveScrollable] = useState(false);

    React.useEffect(() => {
        if (headerRef.current) {
            setHeaderHeight(headerRef.current.offsetHeight);
        }
        const handleResize = () => {
            if (headerRef.current) {
                setHeaderHeight(headerRef.current.offsetHeight);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Reset scroll indicator when section changes
    React.useEffect(() => {
        setHasScrolled(false);
        setIsActiveScrollable(false);
    }, [activeSection]);

    // Hide indicator on first scroll/touch
    React.useEffect(() => {
        const onScroll = () => setHasScrolled(true);
        document.addEventListener('wheel', onScroll, { passive: true, once: true });
        document.addEventListener('touchmove', onScroll, { passive: true, once: true });
        return () => {
            document.removeEventListener('wheel', onScroll);
            document.removeEventListener('touchmove', onScroll);
        };
    }, [activeSection]);

    // Keyboard navigation: left/right arrows to switch sections
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                setActiveSection(prev => (prev + 1) % SECTION_TITLES.length);
            } else if (e.key === 'ArrowLeft') {
                setActiveSection(prev => (prev - 1 + SECTION_TITLES.length) % SECTION_TITLES.length);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleScrollableChange = useCallback((sectionIndex: number, scrollable: boolean) => {
        if (sectionIndex === activeSection) {
            setIsActiveScrollable(scrollable);
        }
    }, [activeSection]);

    const rotateRight = () => {
        setActiveSection(prev => (prev - 1 + SECTION_TITLES.length) % SECTION_TITLES.length);
    };

    const rotateLeft = () => {
        setActiveSection(prev => (prev + 1) % SECTION_TITLES.length);
    };

    return (
        <div className="app-root">
            <div className="canvas-wrap">
                <Suspense fallback={<div className="canvas-loading">Loading 3D scene…</div>}>
                    <StarScene activeSection={activeSection} headerHeight={headerHeight} rotateLeft={rotateLeft} rotateRight={rotateRight} onScrollableChange={handleScrollableChange}/>
                </Suspense>
            </div>

            <header className="header-bar" ref={headerRef}>
                <div className="header-container">
                    <div className="header-name">Luke McMahon</div>
                    <nav ref={navRef} className="header-nav">
                        {SECTION_TITLES.map((t, i) => (
                            <button key={t} className={`nav-item ${activeSection === i ? 'active' : ''}`} onClick={() => setActiveSection(i)}>
                                {t}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            {isActiveScrollable && !hasScrolled && (
                <div className="scroll-indicator">
                    <div className="scroll-indicator-arrow" />
                    <span className="scroll-indicator-text">Scroll</span>
                </div>
            )}
        </div>
    );
};

export default App;